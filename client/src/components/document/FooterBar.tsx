import React from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface FooterBarProps {
  wordCount: number;
  charCount: number;
  currentPage: number;
  pageCount: number;
  zoom: number;
  setZoom: (zoom: number | ((z: number) => number)) => void;
}

export const FooterBar: React.FC<FooterBarProps> = ({ wordCount, charCount, currentPage, pageCount, zoom, setZoom }) => {
  return (
    <footer className="h-8 border-t bg-white px-4 flex items-center justify-between text-xs text-slate-500 z-30">
      <div className="flex items-center gap-4">
        <span>Page {currentPage} of {pageCount}</span>
        <span>{wordCount} words</span>
        <span>{charCount} characters</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setZoom(z => Math.max(50, z - 10))}
          className="p-1 rounded hover:bg-slate-100"
          title="Zoom Out"
        >
          <ZoomOut size={14} />
        </button>
        <span className="w-12 text-center font-medium">{zoom}%</span>
        <button
          onClick={() => setZoom(z => Math.min(200, z + 10))}
          className="p-1 rounded hover:bg-slate-100"
          title="Zoom In"
        >
          <ZoomIn size={14} />
        </button>
      </div>
    </footer>
  );
};