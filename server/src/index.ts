import express from 'express';
import http from 'http';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { Server as HocuspocusServer } from '@hocuspocus/server';
import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import { createClient } from '@supabase/supabase-js';
import { Server as SocketIOServer } from 'socket.io';

const app = express();
const expressServer = http.createServer(app);

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'notenest_secure_secret_key';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'note-files';

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// --- SOCKET.IO INITIALIZATION ---
const io = new SocketIOServer(expressServer, { cors: { origin: '*' } });

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Auth required'));
  try { 
    socket.data.user = jwt.verify(token, JWT_SECRET); 
    next(); 
  } catch (err) { 
    next(new Error('Invalid token')); 
  }
});

io.on('connection', async (socket) => {
  const userId = socket.data.user.userId;
  socket.join(`user:${userId}`);
  
  try {
    await prisma.user.update({ where: { id: userId }, data: { lastSeenAt: new Date() } });
  } catch (err) { console.error("Error updating lastSeenAt on connect", err); }
  
  socket.on('join:chat', (conversationId: string) => {
    socket.join(`chat:${conversationId}`);
  });

  socket.on('typing', ({ conversationId, recipientId }) => {
    io.to(`user:${recipientId}`).emit('typing', { conversationId, senderId: userId });
  });

  socket.on('message:send', async ({ conversationId, content, recipientId }) => {
    try {
      if (!content || content.trim().length === 0 || content.length > 2000) return;
      
      const message = await prisma.message.create({
        data: { conversationId, senderId: userId, content: content.trim() }
      });

      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
      });

      io.to(`chat:${conversationId}`).emit('message:new', message);
      io.to(`user:${recipientId}`).emit('notification:new_message', { conversationId, message });
    } catch (err) {
      console.error("Error sending message via socket:", err);
    }
  });

  socket.on('disconnect', async () => {
    try {
      await prisma.user.update({ where: { id: userId }, data: { lastSeenAt: new Date() } });
    } catch (err) { console.error("Error updating lastSeenAt on disconnect", err); }
  });
});

// --- AUTHENTICATION API ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, displayName, username } = req.body;
    let finalUsername = (username || email.split('@')[0]).toLowerCase().replace(/[^a-z0-9_]/g, '');
    let existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username: finalUsername }] } });
    
    if (existing) {
      if (existing.email === email) return res.status(400).json({ error: 'Email already exists.' });
      finalUsername = `${finalUsername}${Math.floor(Math.random() * 10000)}`;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { email, username: finalUsername, passwordHash: hashedPassword, displayName: displayName || name || finalUsername },
    });
    
    const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: newUser.id, displayName: newUser.displayName, username: newUser.username, currentStreak: 0 } });
  } catch (err) { res.status(500).json({ error: 'Server error during registration' }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(400).json({ error: 'Invalid credentials.' });
    
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date(), lastSeenAt: new Date() } });
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, displayName: user.displayName, username: user.username, currentStreak: user.currentStreak } });
  } catch (err) { res.status(500).json({ error: 'Server error during login' }); }
});

// --- FRIENDS & CHAT API ---
const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); } 
  catch (err) { res.status(401).json({ error: 'Invalid token' }); }
};

const friendRateLimit = new Map<string, { count: number, resetTime: number }>();

app.post('/api/friends/request', authMiddleware, async (req: any, res) => {
  const userId = req.user.userId;
  const { email } = req.body;
  const targetEmail = email?.trim().toLowerCase();
  
  if (!targetEmail || !targetEmail.includes('@')) return res.status(400).json({ error: 'Invalid email' });
  if (req.user.email === targetEmail) return res.status(400).json({ error: 'Cannot send request to yourself.' });

  const limit = friendRateLimit.get(userId) || { count: 0, resetTime: Date.now() + 3600000 };
  if (Date.now() > limit.resetTime) { limit.count = 0; limit.resetTime = Date.now() + 3600000; }
  if (limit.count >= 10) return res.status(429).json({ error: 'Too many requests. Try again later.' });
  limit.count++;
  friendRateLimit.set(userId, limit);

  try {
    const targetUser = await prisma.user.findUnique({ where: { email: targetEmail } });
    if (targetUser) {
      const existing = await prisma.friendship.findFirst({
        where: { OR: [ { requesterId: userId, addresseeId: targetUser.id }, { requesterId: targetUser.id, addresseeId: userId } ] }
      });
      if (!existing) {
        await prisma.friendship.create({ data: { requesterId: userId, addresseeId: targetUser.id, status: 'PENDING' } });
        io.to(`user:${targetUser.id}`).emit('friend:request', { from: req.user.email });
      }
    }
    res.json({ message: 'If an account exists for this email, a request was sent.' });
  } catch (err) { res.status(500).json({ error: 'Server error processing request' }); }
});

app.get('/api/friends', authMiddleware, async (req: any, res) => {
  try {
    const friendships = await prisma.friendship.findMany({
      where: { OR: [{ requesterId: req.user.userId }, { addresseeId: req.user.userId }] },
      include: { 
        requester: { select: { id: true, displayName: true, username: true, avatarUrl: true, lastSeenAt: true } },
        addressee: { select: { id: true, displayName: true, username: true, avatarUrl: true, lastSeenAt: true } } 
      }
    });
    
    const accepted = friendships.filter(f => f.status === 'ACCEPTED').map(f => f.requesterId === req.user.userId ? f.addressee : f.requester);
    const incoming = friendships.filter(f => f.status === 'PENDING' && f.addresseeId === req.user.userId);
    const outgoing = friendships.filter(f => f.status === 'PENDING' && f.requesterId === req.user.userId);
    
    res.json({ accepted, incoming, outgoing });
  } catch (err) { res.status(500).json({ error: 'Server error fetching friends' }); }
});

app.post('/api/friends/:id/accept', authMiddleware, async (req: any, res) => {
  try {
    const f = await prisma.friendship.updateMany({
      where: { id: req.params.id, addresseeId: req.user.userId, status: 'PENDING' },
      data: { status: 'ACCEPTED' }
    });
    
    if (f.count > 0) {
      const updated = await prisma.friendship.findUnique({ where: { id: req.params.id } });
      if (updated) {
        io.to(`user:${updated.requesterId}`).emit('friend:accepted', { from: req.user.userId });
      }
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error accepting request' }); }
});

app.delete('/api/friends/:id', authMiddleware, async (req: any, res) => {
  try {
    await prisma.friendship.deleteMany({
      where: { id: req.params.id, OR: [{ requesterId: req.user.userId }, { addresseeId: req.user.userId }] }
    });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error deleting request' }); }
});

// CHAT REST ENDPOINTS
app.get('/api/chats', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const chats = await prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      include: {
        participants: { include: { user: { select: { id: true, displayName: true, username: true, avatarUrl: true, lastSeenAt: true } } } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching chats' });
  }
});

app.post('/api/chats', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const { recipientId } = req.body;
    if (!recipientId || recipientId === userId) return res.status(400).json({ error: 'Invalid recipient' });

    const existingConvos = await prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      include: {
        participants: { include: { user: { select: { id: true, displayName: true, username: true, avatarUrl: true, lastSeenAt: true } } } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 }
      }
    });

    const existing = existingConvos.find(c => c.participants.some(p => p.userId === recipientId));
    if (existing) return res.json(existing);

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId }, { userId: recipientId }]
        }
      },
      include: {
        participants: { include: { user: { select: { id: true, displayName: true, username: true, avatarUrl: true, lastSeenAt: true } } } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 }
      }
    });

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: 'Server error creating chat' });
  }
});

app.get('/api/chats/:id/messages', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const conversationId = req.params.id;

    const isParticipant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } }
    });
    if (!isParticipant) return res.status(403).json({ error: 'Unauthorized' });

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching messages' });
  }
});

// --- TASKS API ---
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({ where: { userId: req.query.userId as string }, orderBy: { createdAt: 'desc' } });
    res.json(tasks);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch tasks' }); }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const task = await prisma.task.create({ data: { userId: req.body.userId, text: req.body.text } });
    res.json(task);
  } catch (err) { res.status(500).json({ error: 'Failed to create task' }); }
});

app.patch('/api/tasks/:id', async (req, res) => {
  try { 
    res.json(await prisma.task.update({ where: { id: req.params.id }, data: req.body })); 
  } catch (err) { res.status(500).json({ error: 'Failed to update task' }); }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try { 
    await prisma.task.delete({ where: { id: req.params.id } }); 
    res.json({ success: true }); 
  } catch (err) { res.status(500).json({ error: 'Failed to delete task' }); }
});

// --- NOTES API ---
app.get('/api/notes', async (req, res) => {
  try {
    const collabs = await prisma.collaboration.findMany({ where: { userId: req.query.userId as string }, include: { note: true }, orderBy: { note: { updatedAt: 'desc' } } });
    res.json(collabs.map(c => ({ ...c.note, isFavorite: c.isFavorite, role: c.role })));
  } catch (err) { res.status(500).json({ error: 'Failed to fetch notes' }); }
});

app.get('/api/notes/:id', async (req, res) => {
  try {
    const note = await prisma.note.findUnique({ where: { id: req.params.id }, select: { id: true, title: true, tags: true } });
    if (!note) return res.status(404).json({ error: 'Not found' });
    res.json(note);
  } catch (err) { res.status(500).json({ error: 'Error fetching note title' }); }
});

app.patch('/api/notes/:id', async (req, res) => {
  const { title, isFavorite, userId } = req.body;
  try {
    if (title !== undefined && userId) {
      const collab = await prisma.collaboration.findUnique({ where: { userId_noteId: { userId, noteId: req.params.id } } });
      if (!collab || (collab.role !== 'OWNER' && collab.role !== 'EDITOR')) return res.status(403).json({ error: 'Unauthorized.' });
      await prisma.note.update({ where: { id: req.params.id }, data: { title: title.trim().substring(0, 120) || 'Untitled document' } });
    }
    if (isFavorite !== undefined && userId) {
      await prisma.collaboration.update({ where: { userId_noteId: { userId, noteId: req.params.id } }, data: { isFavorite } });
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Error updating note' }); }
});

app.post('/api/notes', async (req, res) => {
  const { userId, title } = req.body;
  try {
    const note = await prisma.note.create({ data: { title: title?.trim() || 'Untitled document', collaborators: { create: { userId, role: 'OWNER' } } } });
    res.json(note);
  } catch (err) { res.status(500).json({ error: 'Error creating note' }); }
});

app.delete('/api/notes/:id', async (req, res) => {
  try { 
    await prisma.note.delete({ where: { id: req.params.id } }); 
    res.json({ success: true }); 
  } catch (err) { res.status(500).json({ error: 'Failed to delete task' }); }
});

// --- NOTE SYNC ENDPOINT (Safe Try/Catch to prevent P2025 errors) ---
app.post('/api/notes/:id/sync', async (req, res) => {
  try {
    const noteId = req.params.id;
    const chunks: Buffer[] = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', async () => {
      const buffer = Buffer.concat(chunks);
      if (buffer.length > 0) {
        try {
          await prisma.note.update({
            where: { id: noteId },
            data: { crdtData: buffer, updatedAt: new Date() }
          });
        } catch (dbErr) {
          // Safe catch if record was deleted or does not exist
        }
      }
      res.status(200).json({ success: true });
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to sync note state' });
  }
});

// --- IMAGE UPLOADS API ---
const validateMagicBytes = (buffer: Buffer): boolean => {
  const hex = buffer.toString('hex', 0, 4).toUpperCase();
  return hex.startsWith('89504E47') || hex.startsWith('FFD8FF') || hex.startsWith('52494646') || hex.startsWith('47494638');
};

app.post('/api/notes/:id/images', upload.single('file'), async (req, res) => {
  const noteId = req.params.id;
  const userId = req.body.userId;
  const file = req.file;

  if (!file) return res.status(400).json({ error: 'No file provided.' });
  if (!validateMagicBytes(file.buffer)) return res.status(400).json({ error: 'Invalid image format.' });

  try {
    const collab = await prisma.collaboration.findUnique({ where: { userId_noteId: { userId, noteId } } });
    if (!collab || (collab.role !== 'OWNER' && collab.role !== 'EDITOR')) return res.status(403).json({ error: 'Unauthorized.' });

    const ext = file.originalname.split('.').pop() || 'png';
    const storageKey = `${noteId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storageKey, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

    if (uploadError) throw uploadError;

    const savedFile = await prisma.file.create({
      data: { noteId, filename: file.originalname, mimeType: file.mimetype, storageKey, sizeBytes: file.size, uploaderId: userId }
    });

    const { data } = await supabase.storage.from(BUCKET).createSignedUrl(storageKey, 60 * 60 * 24 * 7);
    if (!data?.signedUrl) throw new Error("Failed to generate signed URL");

    res.json({ url: data.signedUrl, fileId: savedFile.id });
  } catch (err) {
    console.error('[Upload Error]', err);
    res.status(500).json({ error: 'Failed to process image.' });
  }
});

// --- HOCUSPOCUS WEBSOCKET PERSISTENCE API ---
const updateStreak = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;
  const now = new Date();
  if (!user.lastEditAt) {
    await prisma.user.update({ where: { id: userId }, data: { currentStreak: 1, lastEditAt: now } });
    return;
  }
  const daysDiff = Math.floor((now.getTime() - user.lastEditAt.getTime()) / (1000 * 3600 * 24));
  if (daysDiff === 1) await prisma.user.update({ where: { id: userId }, data: { currentStreak: user.currentStreak + 1, lastEditAt: now } });
  else if (daysDiff > 1) await prisma.user.update({ where: { id: userId }, data: { currentStreak: 1, lastEditAt: now } });
};

const hocuspocusServer = HocuspocusServer.configure({
  name: 'notenest-collab',
  debounce: 2000,
  maxDebounce: 10000,
  async onAuthenticate(data) {
    if (!data.token) throw new Error('Auth required');
    try { return { user: jwt.verify(data.token, JWT_SECRET) }; } 
    catch (err) { throw new Error('Invalid token'); }
  },
  async onLoadDocument(data) {
    try {
      const note = await prisma.note.findUnique({ where: { id: data.documentName } });
      const doc = new Y.Doc();
      if (note && note.crdtData) {
        Y.applyUpdate(doc, new Uint8Array(note.crdtData));
      }
      return doc;
    } catch (err) { return data.document; }
  },
  async onStoreDocument(data) {
    try {
      const update = Y.encodeStateAsUpdate(data.document);
      const buffer = Buffer.from(update);
      await prisma.note.update({ where: { id: data.documentName }, data: { crdtData: buffer } });
      const userId = data.context.user?.userId;
      if (userId) await updateStreak(userId);
    } catch (err) { console.error(`[WS] store error:`, err); }
  }
});

const wss = new WebSocketServer({ noServer: true });
expressServer.on('upgrade', (request, socket, head) => {
  if (request.url === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws: any) => hocuspocusServer.handleConnection(ws, request));
  }
});

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;
expressServer.listen(PORT, () => {
  console.log(`🚀 NoteNest Server & WebSockets listening on http://localhost:${PORT}`);
});