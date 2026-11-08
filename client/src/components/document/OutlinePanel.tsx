import React, { useEffect, useState } from 'react';
import { type Editor } from '@tiptap/react';
import { X, ListTree } from 'lucide-react';

interface OutlinePanelProps {
  editor: Editor;
  onClose: () => void;
}

interface HeadingItem {
  id: string;
  level: number;
  text: string;
  pos: number;
}

export const OutlinePanel: React.FC<OutlinePanelProps> = ({ editor, onClose }) => {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);

  useEffect(() => {
    const updateOutline = () => {
      const items: HeadingItem[] = [];
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'heading') {
          items.push({
            id: `${pos}-${node.textContent}`,
            level: node.attrs.level,
            text: node.textContent || 'Untitled Heading',
            pos,
          });
        }
      });
      setHeadings(items);
    };

    updateOutline();
    editor.on('update', updateOutline);
    return () => {
      editor.off('update', updateOutline);
    };
  }, [editor]);

  const scrollToHeading = (pos: number) => {
    editor.commands.setTextSelection(pos);
    editor.commands.scrollIntoView();
  };

  return (
    <aside className="w-64 border-r bg-white flex flex-col z-20 text-slate-700">
      <div className="p-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-500">
          <ListTree size={16} /> Document Outline
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
        {headings.length === 0 ? (
          <p className="text-slate-400 italic">No headings found. Use H1, H2, or H3 to build your outline.</p>
        ) : (
          headings.map((h) => (
            <button
              key={h.id}
              onClick={() => scrollToHeading(h.pos)}
              className={`w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 truncate ${
                h.level === 1 ? 'font-bold text-slate-900' : h.level === 2 ? 'pl-4 text-slate-700' : 'pl-7 text-slate-500'
              }`}
            >
              {h.text}
            </button>
          ))
        )}
      </div>
    </aside>
  );
};