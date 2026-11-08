import React, { useState, useRef, useEffect } from 'react';
import { Workspace } from './Editor';
import { Dashboard } from './Dashboard';
import { AudioProvider, useAudioContext } from './context/AudioContext';
import { LocalAudioPlayer } from './components/dashboard/LocalAudioPlayer';
import { GripHorizontal, Headphones, X } from 'lucide-react';

const GlobalDraggableAudioPlayer: React.FC = () => {
  const { isPlayerVisible, togglePlayerVisibility } = useAudioContext();
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 110, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, input, [role="slider"], .no-drag')) return;
    setIsDragging(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, initialX: position.x, initialY: position.y };
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleGlobalPointerMove = (e: PointerEvent) => {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPosition({
        x: Math.max(10, Math.min(window.innerWidth - 230, dragRef.current.initialX + dx)),
        y: Math.max(10, Math.min(window.innerHeight - 230, dragRef.current.initialY + dy)),
      });
    };
    const handleGlobalPointerUp = () => setIsDragging(false);

    window.addEventListener('pointermove', handleGlobalPointerMove);
    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, [isDragging]);

  if (!isPlayerVisible) return null;

  return (
    <div
      style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
      className="absolute top-0 left-0 z-[100] pointer-events-auto select-none shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.5)] rounded-[2rem] border border-white/50 dark:border-white/10 bg-white/30 dark:bg-[#0D1510]/50 backdrop-blur-3xl w-[220px] p-5 transition-colors duration-500 cursor-grab active:cursor-grabbing"
      onPointerDown={handlePointerDown}
    >
      <LocalAudioPlayer onClose={togglePlayerVisibility} />
    </div>
  );
};

function MainAppContent() {
  const [token, setToken] = useState(sessionStorage.getItem('notenest_token'));
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem('notenest_user') || 'null'));
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const { isPlayerVisible, togglePlayerVisibility } = useAudioContext();

  useEffect(() => {
    if (localStorage.getItem('notenest_theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Updated port to 4000
    const endpoint = isRegistering ? 'http://localhost:4000/api/auth/register' : 'http://localhost:4000/api/auth/login';
    
    const payload: any = {
      email: formData.get('email'),
      password: formData.get('password'), // Stays as raw password
    };

    if (isRegistering) {
      payload.DisplayName = formData.get('DisplayName'); // Updated to match schema
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem('notenest_token', data.token);
        sessionStorage.setItem('notenest_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'Authentication failed');
      }
    } catch (err) {
      console.error('Network error during auth:', err);
      alert('Could not connect to the Express server.');
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    setToken(null);
    setUser(null);
    setActiveNoteId(null);
  };

  if (!token || !user) {
    return (
      <div className="min-h-screen bg-[#F4F1EB] dark:bg-[#0D1510] flex items-center justify-center p-4 font-sans text-[#1E3F2B] dark:text-[#E8E3D9]">
        <form onSubmit={handleAuth} className="bg-white/60 dark:bg-[#1A261E]/60 backdrop-blur-xl p-10 border border-white/60 dark:border-white/10 rounded-[2rem] shadow-xl w-full max-w-sm">
          <h1 className="text-3xl font-serif font-semibold mb-2 text-center tracking-tight">
            {isRegistering ? 'Create Account' : 'Sign In'}
          </h1>
          <p className="text-xs text-center text-[#5C7465] dark:text-[#A0B0A6] mb-8 font-medium">
            {isRegistering ? 'Join NoteNest to save your documents' : 'Welcome back to your workspace'}
          </p>

          {isRegistering && (
            <input 
              name="DisplayName" 
              type="text" 
              placeholder="Full Name" 
              className="w-full mb-4 px-4 py-3 bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#2A5A3D]/40 transition-all" 
              required 
            />
          )}

          <input 
            name="email" 
            type="email" 
            placeholder="Email" 
            defaultValue="a@a.com" 
            className="w-full mb-4 px-4 py-3 bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#2A5A3D]/40 transition-all" 
            required 
          />

          <input 
            name="password" 
            type="password" 
            placeholder="Password" 
            defaultValue="123" 
            className="w-full mb-6 px-4 py-3 bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#2A5A3D]/40 transition-all" 
            required 
          />

          <button 
            type="submit" 
            className="w-full bg-[#1E3F2B] dark:bg-[#E8E3D9] hover:bg-[#2A5A3D] text-[#F4F1EB] dark:text-[#1E3F2B] py-3.5 rounded-xl font-medium transition-colors shadow-lg shadow-[#1E3F2B]/20 mb-4"
          >
            {isRegistering ? 'Register' : 'Sign In'}
          </button>

          <div className="text-center">
            <button 
              type="button" 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs font-medium text-[#5C7465] dark:text-[#A0B0A6] hover:text-[#1E3F2B] dark:hover:text-white transition-colors"
            >
              {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-app relative">
      <GlobalDraggableAudioPlayer />

      {!isPlayerVisible && (
        <button
          onClick={togglePlayerVisibility}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[90] px-6 py-2.5 bg-white/60 dark:bg-[#1A261E]/80 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-[0_4px_24px_rgba(30,63,43,0.08)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] rounded-full text-sm font-medium text-[#1E3F2B] dark:text-[#E8E3D9] flex items-center gap-2 hover:bg-white/90 dark:hover:bg-[#213026] hover:scale-105 transition-all duration-300"
        >
          <Headphones size={16} className="text-[#2A5A3D] dark:text-[#8EAB99]" strokeWidth={2.5} />
          <span className="font-serif italic tracking-wide text-base pr-1">Play your tunes</span>
        </button>
      )}

      {activeNoteId ? (
        <Workspace token={token} user={user} noteId={activeNoteId} onBack={() => setActiveNoteId(null)} />
      ) : (
        <Dashboard user={user} token={token} onLogout={handleLogout} onSelectNote={setActiveNoteId} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AudioProvider>
      <MainAppContent />
    </AudioProvider>
  );
}