import React from 'react';
import { BubbleMenu, type Editor } from '@tiptap/react';
import { Bold, Italic, Underline, Link as LinkIcon, Highlighter } from 'lucide-react';

interface BubbleMenuBarProps {
  editor: Editor;
}

export const BubbleMenuBar: React.FC<BubbleMenuBarProps> = ({ editor }) => {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL:', previousUrl);
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

  return (
    <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex items-center gap-1 bg-slate-900 text-white px-2 py-1 rounded-lg shadow-xl text-xs">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1 rounded hover:bg-slate-800 ${editor.isActive('bold') ? 'text-blue-400' : ''}`}
        title="Bold"
      >
        <Bold size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1 rounded hover:bg-slate-800 ${editor.isActive('italic') ? 'text-blue-400' : ''}`}
        title="Italic"
      >
        <Italic size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1 rounded hover:bg-slate-800 ${editor.isActive('underline') ? 'text-blue-400' : ''}`}
        title="Underline"
      >
        <Underline size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={`p-1 rounded hover:bg-slate-800 ${editor.isActive('highlight') ? 'text-blue-400' : ''}`}
        title="Highlight"
      >
        <Highlighter size={14} />
      </button>
      <button
        onClick={setLink}
        className={`p-1 rounded hover:bg-slate-800 ${editor.isActive('link') ? 'text-blue-400' : ''}`}
        title="Link"
      >
        <LinkIcon size={14} />
      </button>
    </BubbleMenu>
  );
};