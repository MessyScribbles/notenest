import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Star, FileText } from 'lucide-react';
import { PresenceAvatar } from '../ui/PresenceAvatar';

interface NoteCardProps {
  id: string;
  title: string;
  updatedAt: string;
  previewText?: string;
  onSelect: (id: string) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onShare: (e: React.MouseEvent, id: string) => void;
}

export function NoteCard({ id, title, updatedAt, previewText = "No additional text...", onSelect, onDelete, onShare }: NoteCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className="group bg-surface border border-divider rounded-xl overflow-hidden shadow-card hover:shadow-hover hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col h-60 relative"
      onClick={() => onSelect(id)}
    >
      {/* Document Preview Snippet */}
      <div className="h-28 bg-app border-b border-divider p-4 flex flex-col justify-between text-muted overflow-hidden relative">
        <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
          <FileText size={14} /> Document Preview
        </div>
        <p className="text-[11px] text-muted line-clamp-2 leading-relaxed opacity-80">
          {previewText}
        </p>
      </div>
      
      <div className="p-4 flex-1 flex flex-col justify-between bg-surface relative">
        <div>
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-sm font-medium text-main truncate pr-6">{title}</h3>
            
            {/* 3-Dots Menu Trigger */}
            <div className="absolute right-3 top-3" ref={menuRef}>
              <button 
                onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                className="p-1.5 text-muted hover:text-main hover:bg-app rounded-lg transition-colors"
              >
                <MoreVertical size={16} />
              </button>
              
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-surface border border-divider rounded-xl shadow-hover py-1 z-20">
                  <button 
                    onClick={(e) => { setMenuOpen(false); onShare(e, id); }} 
                    className="w-full text-left px-4 py-2 text-xs text-main hover:bg-app transition-colors"
                  >
                    Share Note
                  </button>
                  <button 
                    onClick={(e) => { setMenuOpen(false); onDelete(e, id); }} 
                    className="w-full text-left px-4 py-2 text-xs text-danger hover:bg-app transition-colors"
                  >
                    Delete Note
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-muted">Opened {new Date(updatedAt).toLocaleDateString()}</p>
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex -space-x-2">
            {/* TODO: connect to backend for live viewer avatars */}
            <PresenceAvatar name="User" size="sm" />
            <PresenceAvatar name="Guest" size="sm" />
          </div>
          <button className="text-muted hover:text-warning transition-colors" onClick={(e) => e.stopPropagation()}>
            <Star size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}