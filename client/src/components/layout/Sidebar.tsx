import { Plus, Home, FileText, Users, Star, FolderTree, Trash2, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNote: () => void;
  onLogout: () => void;
}

export function Sidebar({ isOpen, onClose, onCreateNote, onLogout }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-main/10 backdrop-blur-sm z-30 transition-opacity xl:hidden"
          onClick={onClose}
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-divider flex flex-col shadow-hover transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-divider">
          <span className="text-sm font-semibold text-muted uppercase tracking-wider pl-2">Menu</span>
          <button onClick={onClose} className="p-2 text-muted hover:bg-app rounded-full transition-colors duration-200 xl:hidden">
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          <button 
            onClick={() => { onCreateNote(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-surface px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm"
          >
            <Plus size={18} /> New Note
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-1">
          <NavItem icon={<Home size={18} />} label="Home" active />
          <NavItem icon={<FileText size={18} />} label="My Notes" />
          <NavItem icon={<Users size={18} />} label="Shared with me" />
          <NavItem icon={<Star size={18} />} label="Starred" />
          
          <div className="pt-4 pb-1">
            <p className="px-3 text-xs font-semibold text-muted uppercase tracking-wider">Workspace</p>
          </div>
          <NavItem icon={<FolderTree size={18} />} label="Folders" />
          <NavItem icon={<Trash2 size={18} />} label="Trash" />
        </nav>

        <div className="p-4 border-t border-divider">
          <button onClick={onLogout} className="w-full px-3 py-2 text-sm text-muted hover:text-main text-left rounded-lg hover:bg-app transition-colors duration-200">
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
      active ? 'bg-primary-light text-primary' : 'text-muted hover:bg-app hover:text-main'
    }`}>
      {icon}
      {label}
    </button>
  );
}