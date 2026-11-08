import { useEffect, useState, useRef, useMemo } from 'react';
import { HocuspocusProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';
import { DocumentEditor } from './components/document/DocumentEditor';

const cursorColors = ['#4B6359', '#3A4D45', '#52796F', '#679287'];
const getRandomColor = () => cursorColors[Math.floor(Math.random() * cursorColors.length)];

interface WorkspaceProps {
  token: string;
  user: { id: string; displayName: string; email?: string };
  noteId: string;
  onBack: () => void;
  role?: 'editor' | 'viewer';
}

export function Workspace({ token, user, noteId, onBack, role = 'editor' }: WorkspaceProps) {
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const providerRef = useRef<HocuspocusProvider | null>(null);
  const userColor = useMemo(() => getRandomColor(), []);

  useEffect(() => {
    // Clean up previous provider if noteId changes
    if (providerRef.current) {
      providerRef.current.destroy();
      providerRef.current = null;
    }

    const ydoc = new Y.Doc();
    const newProvider = new HocuspocusProvider({
      url: 'ws://localhost:4000/ws',
      name: noteId,
      document: ydoc,
      token,
    });

    providerRef.current = newProvider;
    setProvider(newProvider);
    
    return () => {
      if (providerRef.current) {
        providerRef.current.destroy();
        providerRef.current = null;
      }
    };
  }, [token, noteId]);

  if (!provider) return null;

  return (
    <div className="h-full flex flex-col bg-[var(--bg-cream)]">
      <DocumentEditor provider={provider} user={user} noteId={noteId} role={role} onBack={onBack} />
    </div>
  );
}