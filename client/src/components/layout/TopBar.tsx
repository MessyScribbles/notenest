import { Moon, Sun, Users, Bell, Menu } from 'lucide-react';
import { PresenceAvatar } from '../ui/PresenceAvatar';

interface TopBarProps {
  user: any;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  toggleFriends: () => void;
  isDark: boolean;
}

export function TopBar({ user, toggleTheme, toggleSidebar, toggleFriends, isDark }: TopBarProps) {
  return (
    <header className="h-16 border-b border-divider bg-surface flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 transition-colors duration-200 shrink-0 gap-4">
      <div className="flex items-center gap-4 shrink-0">
        <button onClick={toggleSidebar} className="p-2 text-muted hover:bg-app rounded-full transition-colors">
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-xl text-surface flex items-center justify-center font-bold text-sm shadow-sm">
            N
          </div>
          <span className="font-semibold text-main tracking-tight text-base hidden sm:inline">NoteNest</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button onClick={toggleTheme} className="p-2 text-muted hover:text-main rounded-full hover:bg-app transition-colors" title="Toggle Theme">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button onClick={toggleFriends} className="p-2 text-muted hover:text-main rounded-full hover:bg-app transition-colors" title="Toggle Friends Panel">
          <Users size={18} />
        </button>
        <button className="p-2 text-muted hover:text-main rounded-full hover:bg-app transition-colors hidden sm:block" title="Notifications">
          <Bell size={18} />
        </button>
        <div className="w-px h-6 bg-divider mx-1" />
        <PresenceAvatar name={user?.name || 'User'} size="sm" />
      </div>
    </header>
  );
}