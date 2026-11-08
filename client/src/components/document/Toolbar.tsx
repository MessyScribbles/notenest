import React from 'react';
import { type Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline, Strikethrough, Code, Subscript, Superscript,
  Heading1, Heading2, Heading3, List, ListOrdered, Quote,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Undo, Redo,
  Table as TableIcon, Image as ImageIcon, Link as LinkIcon, Minus, Search
} from 'lucide-react';

interface ToolbarProps {
  editor: Editor | null;
  onOpenFind: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ editor, onOpenFind }) => {
  if (!editor) return null;

  const setFontFamily = (font: string) => {
    if (font === 'default') {
      editor.chain().focus().unsetMark('textStyle').run();
    } else {
      (editor.chain().focus() as any).setFontFamily(font).run();
    }
  };

  const setFontSize = (size: string) => {
    if (size === 'default') {
      (editor.chain().focus() as any).unsetFontSize().run();
    } else {
      (editor.chain().focus() as any).setFontSize(size).run();
    }
  };

  const setLineHeight = (height: string) => {
    (editor.chain().focus() as any).setLineHeight(height).run();
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL (png, jpeg, webp, gif only, max 5MB):');
    if (!url) return;
    if (!/\.(png|jpeg|jpg|webp|gif)$/i.test(url) && !url.startsWith('data:image/')) {
      alert('Invalid image format. Allowed: png, jpeg, webp, gif.');
      return;
    }
    editor.chain().focus().setImage({ src: url }).run();
  };

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL (http, https, mailto only):', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    if (!/^(https?:\/\/|mailto:)/i.test(url)) {
      alert('Only http, https, and mailto links are allowed.');
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="border-b bg-white px-3 py-1.5 flex flex-wrap items-center gap-1 shadow-sm sticky top-12 z-20 text-slate-700 select-none">
      
      {/* Undo / Redo */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30"
        title="Undo"
      >
        <Undo size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30"
        title="Redo"
      >
        <Redo size={16} />
      </button>

      <div className="w-[1px] h-5 bg-slate-200 mx-1" />

      {/* Font Family */}
      <select
        onChange={(e) => setFontFamily(e.target.value)}
        className="text-xs border rounded px-1.5 py-1 bg-slate-50 outline-none hover:border-slate-400"
        defaultValue="Inter"
      >
        <option value="Inter">Inter</option>
        <option value="Arial">Arial</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Georgia">Georgia</option>
        <option value="Courier New">Courier New</option>
      </select>

      {/* Font Size */}
      <select
        onChange={(e) => setFontSize(e.target.value)}
        className="text-xs border rounded px-1.5 py-1 bg-slate-50 outline-none hover:border-slate-400 w-16"
        defaultValue="16px"
      >
        {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72].map((s) => (
          <option key={s} value={`${s}px`}>{s} pt</option>
        ))}
      </select>

      <div className="w-[1px] h-5 bg-slate-200 mx-1" />

      {/* Basic Formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded hover:bg-slate-100 font-bold ${editor.isActive('bold') ? 'bg-slate-200 text-blue-600' : ''}`}
        title="Bold (Ctrl+B)"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded hover:bg-slate-100 italic ${editor.isActive('italic') ? 'bg-slate-200 text-blue-600' : ''}`}
        title="Italic (Ctrl+I)"
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded hover:bg-slate-100 underline ${editor.isActive('underline') ? 'bg-slate-200 text-blue-600' : ''}`}
        title="Underline (Ctrl+U)"
      >
        <Underline size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded hover:bg-slate-100 line-through ${editor.isActive('strike') ? 'bg-slate-200 text-blue-600' : ''}`}
        title="Strikethrough"
      >
        <Strikethrough size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive('code') ? 'bg-slate-200 text-blue-600' : ''}`}
        title="Inline Code"
      >
        <Code size={16} />
      </button>

      {/* Sub / Super */}
      <button
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive('subscript') ? 'bg-slate-200 text-blue-600' : ''}`}
        title="Subscript"
      >
        <Subscript size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive('superscript') ? 'bg-slate-200 text-blue-600' : ''}`}
        title="Superscript"
      >
        <Superscript size={16} />
      </button>

      {/* Text Color / Highlight */}
      <input
        type="color"
        onChange={(e) => (editor.chain().focus() as any).setColor(e.target.value).run()}
        className="w-6 h-6 border rounded cursor-pointer p-0 bg-transparent"
        title="Text Color"
      />
      <input
        type="color"
        onChange={(e) => (editor.chain().focus() as any).toggleHighlight({ color: e.target.value }).run()}
        className="w-6 h-6 border rounded cursor-pointer p-0 bg-transparent"
        title="Highlight Color"
      />

      <div className="w-[1px] h-5 bg-slate-200 mx-1" />

      {/* Headings */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1.5 rounded hover:bg-slate-100 text-xs font-bold ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-200 text-blue-600' : ''}`}
        title="Heading 1"
      >
        <Heading1 size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded hover:bg-slate-100 text-xs font-bold ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 text-blue-600' : ''}`}
        title="Heading 2"
      >
        <Heading2 size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-1.5 rounded hover:bg-slate-100 text-xs font-bold ${editor.isActive('heading', { level: 3 }) ? 'bg-slate-200 text-blue-600' : ''}`}
        title="Heading 3"
      >
        <Heading3 size={16} />
      </button>

      <div className="w-[1px] h-5 bg-slate-200 mx-1" />

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive('bulletList') ? 'bg-slate-200 text-blue-600' : ''}`}
        title="Bullet List"
      >
        <List size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive('orderedList') ? 'bg-slate-200 text-blue-600' : ''}`}
        title="Numbered List"
      >
        <ListOrdered size={16} />
      </button>

      <div className="w-[1px] h-5 bg-slate-200 mx-1" />

      {/* Alignment */}
      <button
        onClick={() => (editor.chain().focus() as any).setTextAlign('left').run()}
        className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive({ textAlign: 'left' }) ? 'bg-slate-200 text-blue-600' : ''}`}
        title="Align Left"
      >
        <AlignLeft size={16} />
      </button>
      <button
        onClick={() => (editor.chain().focus() as any).setTextAlign('center').run()}
        className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive({ textAlign: 'center' }) ? 'bg-slate-200 text-blue-600' : ''}`}
        title="Align Center"
      >
        <AlignCenter size={16} />
      </button>
      <button
        onClick={() => (editor.chain().focus() as any).setTextAlign('right').run()}
        className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive({ textAlign: 'right' }) ? 'bg-slate-200 text-blue-600' : ''}`}
        title="Align Right"
      >
        <AlignRight size={16} />
      </button>
      <button
        onClick={() => (editor.chain().focus() as any).setTextAlign('justify').run()}
        className={`p-1.5 rounded hover:bg-slate-100 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-slate-200 text-blue-600' : ''}`}
        title="Justify"
      >
        <AlignJustify size={16} />
      </button>

      <div className="w-[1px] h-5 bg-slate-200 mx-1" />

      {/* Line Spacing */}
      <select
        onChange={(e) => setLineHeight(e.target.value)}
        className="text-xs border rounded px-1.5 py-1 bg-slate-50 outline-none hover:border-slate-400"
        title="Line Spacing"
        defaultValue="1.15"
      >
        <option value="1.0">1.0</option>
        <option value="1.15">1.15</option>
        <option value="1.5">1.5</option>
        <option value="2.0">2.0</option>
      </select>

      <div className="w-[1px] h-5 bg-slate-200 mx-1" />

      {/* Inserts */}
      <button onClick={addLink} className="p-1.5 rounded hover:bg-slate-100" title="Insert Link (Ctrl+K)">
        <LinkIcon size={16} />
      </button>
      <button onClick={addImage} className="p-1.5 rounded hover:bg-slate-100" title="Insert Image">
        <ImageIcon size={16} />
      </button>
      <button onClick={addTable} className="p-1.5 rounded hover:bg-slate-100" title="Insert Table">
        <TableIcon size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="p-1.5 rounded hover:bg-slate-100"
        title="Horizontal Rule"
      >
        <Minus size={16} />
      </button>
      <button
        onClick={() => (editor.chain().focus() as any).setPageBreak().run()}
        className="p-1.5 rounded hover:bg-slate-100 text-xs font-bold"
        title="Page Break"
      >
        PB
      </button>

      <div className="w-[1px] h-5 bg-slate-200 mx-1" />

      <button onClick={onOpenFind} className="p-1.5 rounded hover:bg-slate-100 flex items-center gap-1 text-xs font-medium" title="Find & Replace (Ctrl+F)">
        <Search size={16} /> Find
      </button>

      <button
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        className="p-1.5 rounded hover:bg-slate-100 text-xs font-semibold text-slate-500"
        title="Clear Formatting"
      >
        Clear
      </button>
    </div>
  );
};