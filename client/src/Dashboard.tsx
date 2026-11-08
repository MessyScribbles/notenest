import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, Moon, Sun, Users, X, MoreVertical, Star, 
  LogOut, Plus, Upload, Search, Trash2, Download, 
  FileText, CheckSquare, Square, ArrowRight, Flame, UserPlus, Check, MessageSquare, Send
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface Note { id: string; title: string; tags: string[]; updatedAt: string; isFavorite: boolean; role: string; }
interface Task { id: string; text: string; completed: boolean; }
interface FriendData { id: string; displayName: string; username: string; lastSeenAt: string; }
interface RequestData { id: string; requester?: FriendData; addressee?: FriendData; }
interface Participant { user: FriendData; }
interface ChatData { id: string; participants: Participant[]; messages?: { content: string; createdAt: string; }[]; }
interface MessageData { id: string; conversationId: string; senderId: string; content: string; createdAt: string; }

interface DashboardProps {
  user: { id: string; displayName: string; email?: string; currentStreak?: number };
  token: string;
  onLogout: () => void;
  onSelectNote: (id: string) => void;
}

declare global { interface Window { __pendingImportFile?: File | null; } }

export const Dashboard: React.FC<DashboardProps> = ({ user, token, onLogout, onSelectNote }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const [isRightPanelMounted, setIsRightPanelMounted] = useState(false);
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(false);
  const [panelTab, setPanelTab] = useState<'friends' | 'requests' | 'add'>('friends');
  
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<RequestData[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<RequestData[]>([]);
  const [addEmail, setAddEmail] = useState('');
  const [addMessage, setAddMessage] = useState('');
  const [hasUnreadRequests, setHasUnreadRequests] = useState(false);

  const [activeChat, setActiveChat] = useState<ChatData | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadChatIds, setUnreadChatIds] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [isTasksExpanded, setIsTasksExpanded] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'mine' | 'shared' | 'starred'>('all');
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userInitials = user.displayName?.substring(0, 1).toUpperCase() || 'U';
  const firstName = user.displayName?.split(' ')[0] || 'User';

  const [greeting, setGreeting] = useState('Welcome');
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('notenest_theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('notenest_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    fetch(`http://localhost:4000/api/notes?userId=${user.id}`).then(r => r.json()).then(setNotes);
    fetch(`http://localhost:4000/api/tasks?userId=${user.id}`).then(r => r.json()).then(setTasks);
    fetchFriends();
  }, [user.id]);

  const fetchFriends = () => {
    fetch(`http://localhost:4000/api/friends`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        setFriends(data.accepted || []);
        setIncomingRequests(data.incoming || []);
        setOutgoingRequests(data.outgoing || []);
        if (data.incoming?.length > 0) setHasUnreadRequests(true);
      }).catch(err => console.error("Error fetching friends:", err));
  };

  useEffect(() => {
    const newSocket: Socket = io('http://localhost:4000', { auth: { token } });
    setSocket(newSocket);

    newSocket.on('friend:request', () => { setHasUnreadRequests(true); fetchFriends(); });
    newSocket.on('friend:accepted', () => fetchFriends());
    
    newSocket.on('message:new', (msg: MessageData) => {
      setMessages(prev => [...prev, msg]);
    });

    newSocket.on('notification:new_message', ({ conversationId }) => {
      if (!activeChat || activeChat.id !== conversationId) {
        setUnreadChatIds(prev => [...new Set([...prev, conversationId])]);
      }
    });

    return () => { newSocket.disconnect(); };
  }, [token, activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openChatWithFriend = async (friendId: string) => {
    try {
      const res = await fetch('http://localhost:4000/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ recipientId: friendId })
      });
      const chat = await res.json();
      setActiveChat(chat);
      setUnreadChatIds(prev => prev.filter(id => id !== chat.id));
      
      socket?.emit('join:chat', chat.id);

      const msgRes = await fetch(`http://localhost:4000/api/chats/${chat.id}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const msgs = await msgRes.json();
      setMessages(msgs);
    } catch (err) { console.error("Error opening chat:", err); }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChat || !socket) return;

    const recipient = activeChat.participants.find(p => p.user.id !== user.id)?.user;
    if (!recipient) return;

    socket.emit('message:send', {
      conversationId: activeChat.id,
      content: messageInput,
      recipientId: recipient.id
    });
    setMessageInput('');
  };

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') { e.preventDefault(); searchInputRef.current?.focus(); }
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key.toLowerCase() === 'n') { e.preventDefault(); handleCreateNote(); }
      if (e.key === 'Escape' && isRightPanelVisible) closeRightPanel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRightPanelVisible]);

  const openRightPanel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasUnreadRequests(false);
    setIsRightPanelMounted(true);
    requestAnimationFrame(() => setIsRightPanelVisible(true));
  };
  const closeRightPanel = () => { 
    setIsRightPanelVisible(false); 
    setTimeout(() => { setIsRightPanelMounted(false); setActiveChat(null); }, 180); 
  };

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddMessage('Sending...');
    try {
      const res = await fetch('http://localhost:4000/api/friends/request', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ email: addEmail })
      });
      const data = await res.json();
      setAddMessage(data.message || data.error);
      setAddEmail('');
      fetchFriends();
    } catch { setAddMessage('Error sending request.'); }
  };

  const respondToRequest = async (id: string, action: 'accept' | 'decline' | 'delete') => {
    try {
      const method = action === 'delete' ? 'DELETE' : 'POST';
      const endpoint = action === 'delete' ? `/api/friends/${id}` : `/api/friends/${id}/${action}`;
      await fetch(`http://localhost:4000${endpoint}`, { method, headers: { 'Authorization': `Bearer ${token}` } });
      fetchFriends();
    } catch (err) { console.error(err); }
  };

  const handleCreateNote = async (title = 'Untitled document') => {
    const res = await fetch('http://localhost:4000/api/notes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, title })
    });
    const newNote = await res.json();
    onSelectNote(newNote.id);
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    window.__pendingImportFile = file;
    handleCreateNote(file.name.replace(/\.[^/.]+$/, ""));
    e.target.value = '';
  };

  const handleToggleFavorite = async (e: React.MouseEvent, noteId: string, currentFav: boolean) => {
    e.stopPropagation();
    setNotes(notes.map(n => n.id === noteId ? { ...n, isFavorite: !currentFav } : n));
    await fetch(`http://localhost:4000/api/notes/${noteId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, isFavorite: !currentFav })
    });
  };

  const handleDeleteNote = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    setNotes(notes.filter(n => n.id !== noteId));
    await fetch(`http://localhost:4000/api/notes/${noteId}`, { method: 'DELETE' });
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => part.toLowerCase() === query.toLowerCase() ? <span key={i} className="bg-[var(--accent-green)]/20 text-[var(--primary-dark)] rounded px-0.5">{part}</span> : part);
  };

  const filteredNotes = notes.filter(n => {
    const match = n.title.toLowerCase().includes(debouncedSearch.toLowerCase()) || (n.tags && n.tags.some(t => t.toLowerCase().includes(debouncedSearch.toLowerCase())));
    if (!match) return false;
    if (filterMode === 'mine') return n.role === 'OWNER';
    if (filterMode === 'shared') return n.role !== 'OWNER';
    if (filterMode === 'starred') return n.isFavorite;
    return true;
  });

  const lastNote = notes.length > 0 ? [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0] : null;
  const showNewDocCard = !(debouncedSearch && filteredNotes.length === 0);
  
  const openTasks = tasks.filter(t => !t.completed);
  const visibleTasks = isTasksExpanded ? openTasks : openTasks.slice(0, 5);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden font-sans relative" onClick={() => { setUserDropdownOpen(false); setActiveDropdown(null); }}>
      <header className="h-14 flex items-center justify-between px-6 border-b border-[var(--border-light)] bg-[var(--surface-white)]/70 backdrop-blur-xl z-30 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-[var(--text-muted)] hover:bg-[var(--border-light)] rounded-lg transition-colors">
            <Menu size={20} />
          </button>
          <span className="font-serif italic text-2xl font-bold tracking-tight text-[var(--primary-dark)]" style={{ fontFamily: 'Georgia, serif' }}>
            NoteNest
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={openRightPanel} className="relative p-2 text-[var(--text-muted)] hover:bg-[var(--border-light)] rounded-lg transition-colors" aria-label="Friends Panel">
            <UserPlus size={18} />
            {hasUnreadRequests && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-[var(--surface-white)]"></span>}
          </button>

          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-[var(--text-muted)] hover:bg-[var(--border-light)] rounded-lg transition-colors">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <div className="relative ml-1">
            <button onClick={(e) => { e.stopPropagation(); setUserDropdownOpen(!userDropdownOpen); }} className="w-8 h-8 rounded-full bg-[var(--border-light)] text-[var(--primary-dark)] font-bold flex items-center justify-center hover:ring-2 ring-[var(--accent-green)]/30 transition-all">
              {userInitials}
            </button>
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[var(--surface-white)] border border-[var(--border-light)] rounded-xl shadow-lg py-1 z-50">
                <div className="px-4 py-3 border-b border-[var(--border-light)]">
                  <p className="text-sm font-bold truncate text-[var(--primary-dark)]">{user.displayName}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                </div>
                <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50/10 flex items-center gap-2"><LogOut size={16} /> Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-10">
        <aside className={`border-r border-[var(--border-light)] bg-[var(--surface-white)]/40 backdrop-blur-xl transition-all duration-300 flex flex-col overflow-hidden whitespace-nowrap ${isSidebarOpen ? 'w-56 opacity-100' : 'w-0 opacity-0 border-none'}`}>
          <nav className="p-4 space-y-1 mt-2">
            <button onClick={() => setFilterMode('all')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${filterMode === 'all' ? 'bg-[var(--border-light)] text-[var(--primary-dark)]' : 'text-[var(--text-muted)] hover:bg-[var(--border-light)]/50'}`}><FileText size={16} /> All Notes</button>
            <button onClick={() => setFilterMode('starred')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${filterMode === 'starred' ? 'bg-[var(--border-light)] text-[var(--primary-dark)]' : 'text-[var(--text-muted)] hover:bg-[var(--border-light)]/50'}`}><Star size={16} /> Favorites</button>
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto relative flex flex-col min-h-full">
          <div className="px-8 py-6 w-full flex-1 flex flex-col max-w-6xl mx-auto">
            
            <div className="flex flex-col sm:flex-row items-center justify-between bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--border-light)] shadow-sm rounded-2xl px-10 py-8 mb-8 min-h-[125px]">
              <div>
                <h1 className="text-[40px] font-serif text-[var(--primary-dark)] tracking-tight leading-none">
                  {greeting}, <span className="italic text-[var(--accent-green)]">{firstName}</span>.
                </h1>
              </div>
              {lastNote && (
                <div onClick={() => onSelectNote(lastNote.id)} className="flex items-center gap-4 bg-[var(--surface-white)] border border-[var(--border-light)] px-5 py-3 rounded-xl cursor-pointer hover:shadow-md transition-all group shrink-0 mt-4 sm:mt-0 max-w-[260px]">
                  <FileText size={24} className="text-[var(--accent-green)] shrink-0" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-base font-bold text-[var(--primary-dark)] truncate">{lastNote.title}</span>
                    <span className="text-[11px] text-[var(--text-muted)]">Continue where you left off</span>
                  </div>
                  <ArrowRight size={18} className="text-[var(--text-muted)] group-hover:translate-x-1 transition-transform ml-1 shrink-0" />
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-xl font-bold tracking-tight text-[var(--primary-dark)]">Your Documents</h2>
                <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[var(--surface-white)] border border-[var(--border-light)] rounded-lg text-sm font-medium hover:bg-[var(--bg-cream)] transition-colors cursor-pointer shadow-sm text-[var(--text-muted)] w-fit">
                  <Upload size={14} /> Import File
                  <input type="file" accept=".txt,.md,.pdf,.docx" className="hidden" onChange={handleFileImport} />
                </label>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 mb-5 bg-[var(--surface-white)] border border-[var(--border-light)] rounded-xl p-1.5 shadow-sm w-full">
                <div className="flex-1 flex items-center gap-2 px-2 w-full">
                  <Search className="text-[var(--text-muted)]" size={18} />
                  <input 
                    ref={searchInputRef} type="text" placeholder="Search notes (Ctrl+K)..." 
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm w-full text-[var(--primary-dark)] placeholder:text-[var(--text-muted)]/60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 pb-8">
                {showNewDocCard && (
                  <div onClick={() => handleCreateNote()} className="group cursor-pointer bg-[var(--surface-white)]/50 border-2 border-dashed border-[var(--border-light)] rounded-xl overflow-hidden hover:border-[var(--accent-green)]/40 hover:bg-[var(--accent-green)]/5 transition-all duration-200 flex flex-col items-center justify-center min-h-[160px] shadow-sm hover:shadow-md">
                    <div className="w-12 h-12 rounded-full bg-[var(--border-light)] group-hover:bg-[var(--accent-green)] flex items-center justify-center mb-3 transition-colors">
                      <Plus size={24} className="text-[var(--text-muted)] group-hover:text-white" />
                    </div>
                    <span className="text-sm font-bold text-[var(--text-muted)] group-hover:text-[var(--accent-green)]">New Document</span>
                  </div>
                )}
                {filteredNotes.map((doc) => (
                  <div key={doc.id} onClick={() => onSelectNote(doc.id)} className="group cursor-pointer bg-[var(--surface-white)] border border-[var(--border-light)] rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-[var(--accent-green)]/40 transition-all duration-200 flex flex-col min-h-[160px] relative">
                    <div className="h-24 bg-[var(--bg-cream)] border-b border-[var(--border-light)] flex flex-col items-center justify-center relative">
                       <FileText size={22} className="text-[var(--text-muted)]/40 mb-1" />
                       <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={(e) => handleToggleFavorite(e, doc.id, doc.isFavorite)} className={`p-1.5 rounded-lg bg-[var(--surface-white)] shadow-sm hover:bg-[var(--border-light)] ${doc.isFavorite ? 'text-yellow-500' : 'text-[var(--text-muted)]'}`}>
                           <Star size={14} fill={doc.isFavorite ? 'currentColor' : 'none'} />
                         </button>
                         <button onClick={(e) => handleDeleteNote(e, doc.id)} className="p-1.5 rounded-lg bg-[var(--surface-white)] shadow-sm hover:bg-red-50 text-red-500">
                           <Trash2 size={14} />
                         </button>
                       </div>
                    </div>
                    <div className="p-3.5 flex flex-col flex-1 justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-[var(--primary-dark)] line-clamp-1">{highlightMatch(doc.title, debouncedSearch)}</h3>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Edited {new Date(doc.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="w-6 h-6 rounded-full bg-[var(--border-light)] flex items-center justify-center text-[9px] font-bold text-[var(--primary-dark)]">{userInitials}</div>
                        {doc.isFavorite && <Star size={12} className="text-yellow-500 fill-yellow-500" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <footer className="mt-auto pt-6 pb-2 border-t border-[var(--border-light)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-medium text-[var(--text-muted)]">
              <div className="font-serif italic text-sm text-[var(--primary-dark)] opacity-70">NoteNest</div>
              <div className="flex items-center gap-4">
                <button className="hover:text-[var(--primary-dark)] transition-colors">Privacy Policy</button>
                <button className="hover:text-[var(--primary-dark)] transition-colors">Terms of Service</button>
                <span>v1.5.0</span>
              </div>
            </footer>
          </div>
        </main>
        
        <aside className="hidden xl:flex flex-col w-72 border-l border-[var(--border-light)] bg-[var(--surface-white)]/40 backdrop-blur-xl p-5 shrink-0 overflow-y-auto">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-bold text-[var(--primary-dark)] mb-2">Tasks</h3>
            <input 
              type="text" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} 
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newTaskText.trim()) {
                  const text = newTaskText.trim();
                  setNewTaskText('');
                  const tempId = Date.now().toString();
                  setTasks([{ id: tempId, text, completed: false }, ...tasks]);
                  fetch('http://localhost:4000/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, text }) })
                    .then(r => r.json()).then(realTask => setTasks(prev => prev.map(t => t.id === tempId ? realTask : t)));
                }
              }}
              placeholder="Add a task, press Enter..." 
              className="w-full bg-transparent border-b border-[var(--primary-dark)]/10 px-1 py-1.5 text-sm outline-none focus:border-[var(--accent-green)] mb-1 text-[var(--primary-dark)] placeholder:text-[var(--text-muted)]/60"
            />
            <div className="space-y-1">
              {visibleTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between group py-1.5 hover:bg-[var(--primary-dark)]/5 rounded px-1 transition-colors">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <button onClick={() => {
                      setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !task.completed } : t));
                      fetch(`http://localhost:4000/api/tasks/${task.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed: !task.completed }) });
                    }} className="text-[var(--text-muted)] hover:text-[var(--primary-dark)] shrink-0">
                      {task.completed ? <CheckSquare size={14} className="text-[var(--accent-green)]" /> : <Square size={14} />}
                    </button>
                    <span className="text-xs text-[var(--primary-dark)] truncate">{task.text}</span>
                  </div>
                  <button onClick={() => {
                    setTasks(tasks.filter(t => t.id !== task.id));
                    fetch(`http://localhost:4000/api/tasks/${task.id}`, { method: 'DELETE' });
                  }} className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-red-500 p-0.5 shrink-0"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {isRightPanelMounted && (
          <div onClick={closeRightPanel} className={`absolute inset-0 bg-black/20 z-40 transition-opacity duration-200 motion-reduce:transition-none ${isRightPanelVisible ? 'opacity-100' : 'opacity-0'}`} />
        )}

        {isRightPanelMounted && (
          <aside className={`absolute inset-y-0 right-0 w-80 bg-[var(--surface-white)] border-l border-[var(--border-light)] shadow-2xl z-50 flex flex-col transform transition-transform duration-220 ease-out motion-reduce:transition-none ${isRightPanelVisible ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="h-14 flex items-center justify-between px-6 border-b border-[var(--border-light)]">
              <h3 className="text-sm font-bold text-[var(--primary-dark)]">{activeChat ? 'Chat' : 'People'}</h3>
              <button onClick={closeRightPanel} className="text-[var(--text-muted)] hover:bg-[var(--border-light)] p-1.5 rounded-lg"><X size={16} /></button>
            </div>
            
            {!activeChat ? (
              <>
                <div className="flex p-2 bg-[var(--bg-cream)] border-b border-[var(--border-light)] gap-1">
                  <button onClick={() => setPanelTab('friends')} className={`flex-1 py-1.5 text-xs font-bold uppercase rounded transition-all ${panelTab === 'friends' ? 'bg-[var(--surface-white)] shadow-sm text-[var(--primary-dark)]' : 'text-[var(--text-muted)]'}`}>Friends</button>
                  <button onClick={() => setPanelTab('requests')} className={`relative flex-1 py-1.5 text-xs font-bold uppercase rounded transition-all ${panelTab === 'requests' ? 'bg-[var(--surface-white)] shadow-sm text-[var(--primary-dark)]' : 'text-[var(--text-muted)]'}`}>
                    Reqs {incomingRequests.length > 0 && <span className="absolute top-1 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
                  </button>
                  <button onClick={() => setPanelTab('add')} className={`flex-1 py-1.5 text-xs font-bold uppercase rounded transition-all ${panelTab === 'add' ? 'bg-[var(--surface-white)] shadow-sm text-[var(--primary-dark)]' : 'text-[var(--text-muted)]'}`}>Add</button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {panelTab === 'friends' && (
                    <div className="space-y-3">
                      {friends.map(f => (
                        <div key={f.id} className="flex items-center justify-between group p-2 hover:bg-[var(--bg-cream)] rounded-lg transition-colors cursor-pointer" onClick={() => openChatWithFriend(f.id)}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[var(--border-light)] flex items-center justify-center font-bold text-xs text-[var(--primary-dark)] relative">
                              {f.displayName.charAt(0)}
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-white rounded-full"></span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-[var(--primary-dark)]">{f.displayName}</span>
                              <span className="text-[10px] text-[var(--text-muted)]">Click to chat</span>
                            </div>
                          </div>
                          <MessageSquare size={16} className="text-[var(--text-muted)] group-hover:text-[var(--accent-green)]" />
                        </div>
                      ))}
                      {friends.length === 0 && <p className="text-xs text-[var(--text-muted)] text-center mt-4">No friends yet. Add some via email!</p>}
                    </div>
                  )}

                  {panelTab === 'requests' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-[10px] uppercase font-bold text-[var(--text-muted)] mb-2 tracking-widest">Incoming</h4>
                        {incomingRequests.length === 0 ? <p className="text-xs text-[var(--text-muted)]">No pending requests.</p> : incomingRequests.map(req => (
                          <div key={req.id} className="flex items-center justify-between bg-[var(--bg-cream)] p-2 rounded-lg mb-2 border border-[var(--border-light)]">
                            <span className="text-xs font-bold text-[var(--primary-dark)] truncate">{req.requester?.displayName}</span>
                            <div className="flex gap-1">
                              <button onClick={() => respondToRequest(req.id, 'accept')} className="bg-[var(--accent-green)] text-white p-1 rounded hover:opacity-90"><Check size={14}/></button>
                              <button onClick={() => respondToRequest(req.id, 'delete')} className="bg-red-500 text-white p-1 rounded hover:opacity-90"><X size={14}/></button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div>
                        <h4 className="text-[10px] uppercase font-bold text-[var(--text-muted)] mb-2 tracking-widest border-t border-[var(--border-light)] pt-3">Outgoing</h4>
                        {outgoingRequests.length === 0 ? <p className="text-xs text-[var(--text-muted)]">No pending requests.</p> : outgoingRequests.map(req => (
                          <div key={req.id} className="flex items-center justify-between bg-[var(--bg-cream)] p-2 rounded-lg mb-2 border border-[var(--border-light)]">
                            <span className="text-xs font-bold text-[var(--primary-dark)] truncate">{req.addressee?.displayName}</span>
                            <button onClick={() => respondToRequest(req.id, 'delete')} className="text-red-500 hover:bg-red-50 p-1 rounded"><X size={14}/></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {panelTab === 'add' && (
                    <form onSubmit={handleAddFriend} className="flex flex-col gap-3">
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">Enter an email address to send a friend request.</p>
                      <input type="email" value={addEmail} onChange={e => setAddEmail(e.target.value)} placeholder="Email address..." className="w-full border border-[var(--border-light)] bg-transparent rounded-lg px-3 py-2 text-sm focus:border-[var(--accent-green)] outline-none text-[var(--primary-dark)]" required />
                      <button type="submit" className="w-full bg-[var(--primary-dark)] text-white rounded-lg py-2 text-sm font-bold hover:bg-[var(--accent-green)] transition-colors">Send Request</button>
                      {addMessage && <p className="text-xs font-medium text-[var(--text-muted)] mt-2 bg-[var(--bg-cream)] p-2 rounded">{addMessage}</p>}
                    </form>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col bg-[var(--bg-cream)] overflow-hidden">
                <div className="p-3 bg-[var(--surface-white)] border-b border-[var(--border-light)] flex items-center gap-2">
                  <button onClick={() => setActiveChat(null)} className="text-xs font-bold text-[var(--accent-green)] hover:underline">&larr; Back</button>
                  <span className="text-xs font-bold text-[var(--primary-dark)] ml-2 truncate">
                    {activeChat.participants.find(p => p.user.id !== user.id)?.user.displayName}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map(m => {
                    const isMe = m.senderId === user.id;
                    return (
                      <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[75%] px-3 py-2 rounded-xl text-xs ${isMe ? 'bg-[var(--primary-dark)] text-white' : 'bg-[var(--surface-white)] border border-[var(--border-light)] text-[var(--primary-dark)]'}`}>
                          {m.content}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={sendMessage} className="p-3 bg-[var(--surface-white)] border-t border-[var(--border-light)] flex gap-2">
                  <input 
                    type="text" value={messageInput} onChange={e => setMessageInput(e.target.value)} 
                    placeholder="Type a message..." className="flex-1 bg-[var(--bg-cream)] border border-[var(--border-light)] rounded-lg px-3 py-1.5 text-xs outline-none text-[var(--primary-dark)]" 
                  />
                  <button type="submit" className="bg-[var(--primary-dark)] text-white p-2 rounded-lg hover:bg-[var(--accent-green)] transition-colors"><Send size={14}/></button>
                </form>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
};