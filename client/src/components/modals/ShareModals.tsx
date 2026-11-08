import { useState } from 'react';
import { X, Link as LinkIcon, UserPlus } from 'lucide-react';

export function ShareModal({ noteId, onClose }: { noteId: string, onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(`http://localhost:5173/share/${noteId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-main/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-xl shadow-hover w-full max-w-md border border-divider overflow-hidden">
        <div className="px-5 py-4 border-b border-divider flex justify-between items-center">
          <h2 className="text-sm font-semibold text-main">Share Document</h2>
          <button onClick={onClose} className="text-muted hover:text-main transition-colors duration-200"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <label className="text-xs font-medium text-main block mb-2">Add collaborators</label>
            <div className="flex gap-2">
              <input type="email" placeholder="Email address" className="flex-1 bg-app border border-divider rounded-lg px-3 py-2 text-sm outline-none focus:border-primary transition-colors duration-200 text-main" />
              <select className="bg-app border border-divider rounded-lg px-3 text-sm text-main outline-none focus:border-primary transition-colors duration-200">
                <option>Editor</option>
                <option>Viewer</option>
              </select>
              <button className="bg-primary hover:bg-primary-hover text-surface p-2 rounded-lg transition-colors duration-200"><UserPlus size={18} /></button>
            </div>
          </div>
          
          <div className="pt-4 border-t border-divider flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-app p-2 rounded-full text-muted"><LinkIcon size={16} /></div>
              <div>
                <p className="text-sm font-medium text-main">Anyone with the link</p>
                <p className="text-xs text-muted">Can view</p>
              </div>
            </div>
            <button onClick={copyLink} className="text-sm font-medium text-primary hover:text-primary-hover transition-colors duration-200">
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}