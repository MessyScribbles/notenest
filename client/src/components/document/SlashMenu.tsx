import React, { useState, useEffect } from 'react';
import { type Editor } from '@tiptap/react';
import { Heading1, Heading2, Heading3, List, ListOrdered, Table, Image as ImageIcon, Minus } from 'lucide-react';

interface SlashMenuProps {
  editor: Editor;
}

export const SlashMenu: React.FC<SlashMenuProps> = ({ editor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const items = [
    { title: 'Heading 1', icon: <Heading1 size={16} />, command: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
    { title: 'Heading 2', icon: <Heading2 size={16} />, command: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { title: 'Heading 3', icon: <Heading3 size={16} />, command: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { title: 'Bullet List', icon: <List size={16} />, command: () => editor.chain().focus().toggleBulletList().run() },
    { title: 'Numbered List', icon: <ListOrdered size={16} />, command: () => editor.chain().focus().toggleOrderedList().run() },
    { title: 'Table', icon: <Table size={16} />, command: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
    { title: 'Image', icon: <ImageIcon size={16} />, command: () => {
      const url = window.prompt('Enter image URL:');
      if (url) editor.chain().focus().setImage({ src: url }).run();
    }},
    { title: 'Page Break', icon: <Minus size={16} />, command: () => editor.chain().focus().setPageBreak().run() },
  ].filter(item => item.title.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/') {
        setIsOpen(true);
        setQuery('');
        setSelectedIndex(0);
      } else if (isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % items.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + items.length) % items.length);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (items[selectedIndex]) {
            items[selectedIndex].command();
            setIsOpen(false);
          }
        } else if (e.key === 'Escape') {
          setIsOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, items]);

  if (!isOpen) return null;

  return (
    <div className="absolute z-50 bg-white border border-slate-200 shadow-xl rounded-lg w-64 p-1 max-h-60 overflow-y-auto left-1/4 top-1/3">
      <div className="text-[10px] text-slate-400 px-2 py-1 uppercase font-semibold">Insert blocks</div>
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => { item.command(); setIsOpen(false); }}
          className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded text-left ${index === selectedIndex ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-slate-50 text-slate-700'}`}
        >
          {item.icon}
          <span>{item.title}</span>
        </button>
      ))}
    </div>
  );
};