import { type Editor } from '@tiptap/react';
import { 
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3, 
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Undo, Redo 
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  return (
    <div className="border-b border-divider bg-surface px-4 py-2 flex flex-wrap items-center gap-1.5 sticky top-16 z-20 shadow-sm">
      
      {/* Font Family Selector */}
      <select 
        onChange={(e) => (editor.chain().focus() as any).setFontFamily(e.target.value).run()}
        className="bg-app border border-divider rounded-lg px-2 py-1 text-xs text-main outline-none focus:border-primary cursor-pointer mr-2"
        defaultValue=""
      >
        <option value="" disabled>Font Family</option>
        <option value="Inter">Inter</option>
        <option value="Arial">Arial</option>
        <option value="Georgia">Georgia</option>
        <option value="Monospace">Monospace</option>
        <option value="Courier New">Courier New</option>
      </select>

      <div className="w-px h-5 bg-divider mx-1" />

      {/* Headings */}
      <button 
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-primary-light text-primary' : 'text-muted hover:bg-app hover:text-main'}`}
        title="Heading 1"
      >
        <Heading1 size={16} />
      </button>
      <button 
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-primary-light text-primary' : 'text-muted hover:bg-app hover:text-main'}`}
        title="Heading 2"
      >
        <Heading2 size={16} />
      </button>
      <button 
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-primary-light text-primary' : 'text-muted hover:bg-app hover:text-main'}`}
        title="Heading 3"
      >
        <Heading3 size={16} />
      </button>

      <div className="w-px h-5 bg-divider mx-1" />

      {/* Formatting (Bold, Italic, Strikethrough) */}
      <button 
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('bold') ? 'bg-primary-light text-primary' : 'text-muted hover:bg-app hover:text-main'}`}
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button 
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('italic') ? 'bg-primary-light text-primary' : 'text-muted hover:bg-app hover:text-main'}`}
        title="Italic"
      >
        <Italic size={16} />
      </button>
      <button 
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('strike') ? 'bg-primary-light text-primary' : 'text-muted hover:bg-app hover:text-main'}`}
        title="Strikethrough"
      >
        <Strikethrough size={16} />
      </button>
      <button 
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('code') ? 'bg-primary-light text-primary' : 'text-muted hover:bg-app hover:text-main'}`}
        title="Inline Code"
      >
        <Code size={16} />
      </button>

      <div className="w-px h-5 bg-divider mx-1" />

      {/* Alignment */}
      <button 
        onClick={() => (editor.chain().focus() as any).setTextAlign('left').run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-primary-light text-primary' : 'text-muted hover:bg-app hover:text-main'}`}
        title="Align Left"
      >
        <AlignLeft size={16} />
      </button>
      <button 
        onClick={() => (editor.chain().focus() as any).setTextAlign('center').run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-primary-light text-primary' : 'text-muted hover:bg-app hover:text-main'}`}
        title="Align Center"
      >
        <AlignCenter size={16} />
      </button>
      <button 
        onClick={() => (editor.chain().focus() as any).setTextAlign('right').run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-primary-light text-primary' : 'text-muted hover:bg-app hover:text-main'}`}
        title="Align Right"
      >
        <AlignRight size={16} />
      </button>
      <button 
        onClick={() => (editor.chain().focus() as any).setTextAlign('justify').run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive({ textAlign: 'justify' }) ? 'bg-primary-light text-primary' : 'text-muted hover:bg-app hover:text-main'}`}
        title="Justify"
      >
        <AlignJustify size={16} />
      </button>

      <div className="w-px h-5 bg-divider mx-1" />

      {/* Lists */}
      <button 
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('bulletList') ? 'bg-primary-light text-primary' : 'text-muted hover:bg-app hover:text-main'}`}
        title="Bullet List"
      >
        <List size={16} />
      </button>
      <button 
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('orderedList') ? 'bg-primary-light text-primary' : 'text-muted hover:bg-app hover:text-main'}`}
        title="Numbered List"
      >
        <ListOrdered size={16} />
      </button>

      <div className="w-px h-5 bg-divider mx-1" />

      {/* Undo / Redo */}
      <button 
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-1.5 rounded-lg text-muted hover:bg-app hover:text-main disabled:opacity-30 transition-colors"
        title="Undo"
      >
        <Undo size={16} />
      </button>
      <button 
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-1.5 rounded-lg text-muted hover:bg-app hover:text-main disabled:opacity-30 transition-colors"
        title="Redo"
      >
        <Redo size={16} />
      </button>

    </div>
  );
}