import { useState } from 'react';
import { ArrowLeft, Share2, Upload, Download, FileText } from 'lucide-react';
import { PresenceAvatar } from '../ui/PresenceAvatar';

interface EditorHeaderProps {
  title: string;
  status: string;
  onBack: () => void;
  onShare: () => void;
  onRename: (newTitle: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportPdf: () => void;
}

export function EditorHeader({ title, status, onBack, onShare, onRename, onFileUpload, onExportPdf }: EditorHeaderProps) {
  const [currentTitle, setCurrentTitle] = useState(title);
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <header className="h-16 border-b border-divider bg-surface flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 transition-colors duration-200 shrink-0 gap-4">
      <div className="flex items-center gap-4 shrink-0">
        <button onClick={onBack} className="p-2 text-muted hover:bg-app rounded-full transition-colors" title="Back to Dashboard">
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg text-surface flex items-center justify-center font-bold text-xs shadow-sm">
            N
          </div>
          <input 
            type="text" 
            value={currentTitle}
            onChange={(e) => {
              setCurrentTitle(e.target.value);
              onRename(e.target.value);
            }}
            placeholder="Untitled Document"
            className="text-base font-medium text-main bg-transparent border border-transparent hover:border-divider focus:border-primary rounded px-2 py-1 w-52 truncate transition-colors outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-app border border-divider">
           <span className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-success' : 'bg-warning'}`}></span>
           <span className="text-xs font-medium text-muted capitalize">{status}</span>
        </div>

        <label className="flex items-center gap-1.5 bg-app text-main hover:bg-surface-hover border border-divider px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors" title="Upload PDF or Document">
          <Upload size={14} /> Upload
          <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={onFileUpload} className="hidden" />
        </label>

        <div className="relative">
          <button 
            onClick={() => setShowExportMenu(!showExportMenu)} 
            className="flex items-center gap-1.5 bg-app text-main hover:bg-surface-hover border border-divider px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            <Download size={14} /> Export
          </button>

          {showExportMenu && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-surface border border-divider rounded-xl shadow-hover py-1 z-50">
              <button 
                onClick={() => { onExportPdf(); setShowExportMenu(false); }}
                className="w-full text-left px-4 py-2 text-xs text-main hover:bg-app flex items-center gap-2"
              >
                <FileText size={14} className="text-primary" /> Export as PDF
              </button>
              <button 
                onClick={() => { window.print(); setShowExportMenu(false); }}
                className="w-full text-left px-4 py-2 text-xs text-main hover:bg-app flex items-center gap-2"
              >
                <FileText size={14} className="text-muted" /> Print / Save Doc
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center -space-x-2 hidden sm:flex">
          <PresenceAvatar name="User" size="sm" />
          <PresenceAvatar name="Guest" size="sm" />
        </div>

        <button onClick={onShare} className="flex items-center gap-1.5 bg-primary-light text-primary hover:bg-primary hover:text-surface px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors">
          <Share2 size={14} /> Share
        </button>
      </div>
    </header>
  );
}