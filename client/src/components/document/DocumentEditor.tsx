import React, { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Image from '@tiptap/extension-image';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import { Extension } from '@tiptap/core';
import { HocuspocusProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';
import { 
  ArrowLeft, CheckCircle2, Image as ImageIcon, X, Download,
  Bold, Italic, Strikethrough, Heading1, Heading2, 
  List, ListOrdered, Undo, Redo, AlignLeft, AlignCenter, AlignRight 
} from 'lucide-react';
import * as mammoth from 'mammoth';
import DOMPurify from 'dompurify';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'; 

import '../../styles/document.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }: { chain: any }) => {
        return chain().setMark('textStyle', { fontSize }).run();
      },
      unsetFontSize: () => ({ chain }: { chain: any }) => {
        return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
      },
    } as any;
  },
});

interface DocumentEditorProps {
  provider: HocuspocusProvider;
  user: { id: string; displayName: string; email?: string };
  noteId: string;
  role?: 'editor' | 'viewer';
  onBack?: () => void;
}

export const Toolbar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-1.5 px-6 py-2 overflow-x-auto bg-white dark:bg-[#152018] border-b border-black/10 dark:border-white/10 text-[#1E3F2B] dark:text-[#E8E3D9] text-xs z-20 shadow-sm transition-colors">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 ${editor.isActive('bold') ? 'bg-black/10 dark:bg-white/20 font-bold' : ''}`} title="Bold"><Bold size={14}/></button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 ${editor.isActive('italic') ? 'bg-black/10 dark:bg-white/20 font-bold' : ''}`} title="Italic"><Italic size={14}/></button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 ${editor.isActive('strike') ? 'bg-black/10 dark:bg-white/20 font-bold' : ''}`} title="Strikethrough"><Strikethrough size={14}/></button>
      
      <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-1"></div>

      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 ${editor.isActive('heading', { level: 1 }) ? 'bg-black/10 dark:bg-white/20' : ''}`} title="Heading 1"><Heading1 size={14}/></button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 ${editor.isActive('heading', { level: 2 }) ? 'bg-black/10 dark:bg-white/20' : ''}`} title="Heading 2"><Heading2 size={14}/></button>
      
      <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-1"></div>

      <select 
        onChange={(e) => {
          if (e.target.value) editor.chain().focus().setFontSize(e.target.value).run();
          else editor.chain().focus().unsetFontSize().run();
        }}
        defaultValue=""
        className="bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded px-2 py-1 text-xs outline-none text-[#1E3F2B] dark:text-[#E8E3D9]"
        title="Font Size"
      >
        <option value="" disabled className="dark:bg-[#152018]">Size</option>
        <option value="12px" className="dark:bg-[#152018]">Small (12px)</option>
        <option value="16px" className="dark:bg-[#152018]">Normal (16px)</option>
        <option value="20px" className="dark:bg-[#152018]">Large (20px)</option>
        <option value="28px" className="dark:bg-[#152018]">Huge (28px)</option>
      </select>

      <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-1"></div>

      <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 ${editor.isActive({ textAlign: 'left' }) ? 'bg-black/10 dark:bg-white/20' : ''}`} title="Align Left"><AlignLeft size={14}/></button>
      <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 ${editor.isActive({ textAlign: 'center' }) ? 'bg-black/10 dark:bg-white/20' : ''}`} title="Align Center"><AlignCenter size={14}/></button>
      <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 ${editor.isActive({ textAlign: 'right' }) ? 'bg-black/10 dark:bg-white/20' : ''}`} title="Align Right"><AlignRight size={14}/></button>

      <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-1"></div>

      <div className="flex items-center gap-1">
        <span className="text-[10px] uppercase font-bold opacity-60">Color</span>
        <input 
          type="color" 
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()} 
          className="w-5 h-5 rounded border border-black/10 dark:border-white/10 cursor-pointer bg-transparent p-0"
          title="Text Color"
        />
      </div>

      <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-1"></div>

      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 ${editor.isActive('bulletList') ? 'bg-black/10 dark:bg-white/20' : ''}`} title="Bullet List"><List size={14}/></button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 ${editor.isActive('orderedList') ? 'bg-black/10 dark:bg-white/20' : ''}`} title="Numbered List"><ListOrdered size={14}/></button>
      
      <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-1"></div>

      <button onClick={() => editor.chain().focus().undo().run()} className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10" title="Undo"><Undo size={14}/></button>
      <button onClick={() => editor.chain().focus().redo().run()} className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10" title="Redo"><Redo size={14}/></button>
    </div>
  );
};

export const DocumentEditor: React.FC<DocumentEditorProps> = ({ provider, user, noteId, role = 'editor', onBack }) => {
  const [status, setStatus] = useState<'connected' | 'saving' | 'offline'>('connected');
  const [docTitle, setDocTitle] = useState('');
  const [isTitleLoaded, setIsTitleLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | ''>('');
  
  const [splitViewerFile, setSplitViewerFile] = useState<File | null>(null);
  const [viewerHtml, setViewerHtml] = useState<string>('');
  const [viewerError, setViewerError] = useState('');
  
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef(docTitle);
  const initialTitleRef = useRef('');

  useEffect(() => { titleRef.current = docTitle; }, [docTitle]);

  useEffect(() => {
    document.title = isTitleLoaded ? `${docTitle} - NoteNest` : 'Loading... - NoteNest';
    return () => { document.title = 'NoteNest'; };
  }, [docTitle, isTitleLoaded]);

  const editor = useEditor({
    editable: role === 'editor',
    extensions: [
      StarterKit.configure({ history: false }),
      TextStyle,
      Color,
      FontSize,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Collaboration.configure({ document: provider.document }),
      CollaborationCursor.configure({ provider, user: { name: user.displayName, color: '#2563eb' } }),
      Image.configure({ inline: false, allowBase64: false }),
    ],
    editorProps: { 
      attributes: { class: 'document-page font-sans focus:outline-none text-black min-h-[800px]' },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer?.files?.[0]) { 
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            handleImageUpload(file); 
            return true;
          }
        }
        return false;
      }
    }
  });

  useEffect(() => {
    fetch(`http://localhost:4000/api/notes/${noteId}`)
      .then(res => res.json())
      .then(note => {
        const t = note?.title || 'Untitled document';
        setDocTitle(t);
        initialTitleRef.current = t;
        setIsTitleLoaded(true);
      })
      .catch(() => { setDocTitle('Untitled document'); setIsTitleLoaded(true); });

    if (window.__pendingImportFile && editor) {
      const file = window.__pendingImportFile;
      window.__pendingImportFile = null;
      handleImportedContentIntoEditor(file, editor);
    }
  }, [noteId, editor]);

  const handleImportedContentIntoEditor = async (file: File, ed: any) => {
    if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string || '';
        // Insert and mark dirty so Hocuspocus stores it immediately
        ed.chain().focus().setContent(`<p>${text.replace(/\n/g, '<br>')}</p>`).run();
      };
      reader.readAsText(file, 'UTF-8');
    } else if (file.name.endsWith('.docx')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const clean = DOMPurify.sanitize(result.value);
        ed.chain().focus().setContent(clean).run();
      } catch (err) {
        console.error("Failed to parse imported docx", err);
      }
    }
  };

  const flushTitleSave = async (titleToSave: string, isUnmounting = false) => {
    if (!isTitleLoaded || role !== 'editor') return;
    setSaveStatus('saving');
    const cleanTitle = titleToSave.trim().substring(0, 120) || 'Untitled document';
    
    try {
      await fetch(`http://localhost:4000/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: cleanTitle, userId: user.id }),
        keepalive: isUnmounting
      });
      if (!isUnmounting) {
        setSaveStatus('saved');
        initialTitleRef.current = cleanTitle;
        if (cleanTitle !== docTitle) setDocTitle(cleanTitle);
      }
    } catch { if (!isUnmounting) setSaveStatus('error'); }
  };

  useEffect(() => {
    if (!isTitleLoaded || docTitle === initialTitleRef.current) return;
    setSaveStatus('');
    const handler = setTimeout(() => flushTitleSave(docTitle, false), 600);
    return () => clearTimeout(handler);
  }, [docTitle, isTitleLoaded]);

  // Force immediate Yjs sync & save checkpoint on unmount
  useEffect(() => { 
    return () => { 
      if (titleRef.current !== initialTitleRef.current) flushTitleSave(titleRef.current, true); 
      try {
        if (provider) {
          const update = Y.encodeStateAsUpdate(provider.document);
          navigator.sendBeacon?.(`http://localhost:4000/api/notes/${noteId}/sync`, new Blob([update as unknown as BlobPart]));
        }
      } catch (e) {}
    }; 
  }, [provider, noteId]);

  const handleDownloadTxt = () => {
    if (!editor) return;
    const textContent = editor.getText();
    const element = document.createElement("a");
    const file = new Blob([textContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${docTitle || 'document'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleImageUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) return alert('File too large. Max 5MB.');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', user.id);
    try {
      const res = await fetch(`http://localhost:4000/api/notes/${noteId}/images`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) editor?.chain().focus().setImage({ src: data.url }).run();
    } catch { alert("Failed to upload image."); }
  };

  const handleSplitViewerFile = async (file: File) => {
    setSplitViewerFile(file);
    setViewerError('');
    setViewerHtml('');

    if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        setViewerHtml(`<pre style="white-space: pre-wrap; font-family: monospace;">${escaped}</pre>`);
      };
      reader.readAsText(file, 'UTF-8');
    } 
    else if (file.name.endsWith('.docx')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setViewerHtml(DOMPurify.sanitize(result.value));
      } catch (err) { setViewerError("Failed to parse DOCX. Ensure it is not password protected."); }
    }
    else if (file.name.endsWith('.doc')) {
      setViewerError("Legacy .doc format is not supported. Please save as .docx or PDF.");
    }
  };

  useEffect(() => {
    if (splitViewerFile?.name.endsWith('.pdf') && pdfCanvasRef.current) {
      const renderPdf = async () => {
        try {
          const arrayBuffer = await splitViewerFile.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 1.5 });
          
          const canvas = pdfCanvasRef.current;
          if (!canvas) return;
          const context = canvas.getContext('2d');
          if (!context) return;

          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
            canvas: canvas
          };
          
          await page.render(renderContext as any).promise;
        } catch (e) { setViewerError("Failed to parse PDF. The file may be corrupt or encrypted."); }
      };
      renderPdf();
    }
  }, [splitViewerFile]);

  useEffect(() => {
    const handleStatus = (event: any) => {
      if (event.status === 'connected') setStatus('connected');
      else if (event.status === 'disconnected') setStatus('offline');
      else setStatus('saving');
    };
    provider.on('status', handleStatus);
    return () => { provider.off('status', handleStatus); };
  }, [provider]);

  return (
    <div className="doc-editor-layout relative flex flex-col h-full w-full overflow-hidden bg-[#F4F1EB] dark:bg-[#0D1510] text-[#1E3F2B] dark:text-[#E8E3D9] font-sans transition-colors">
      <header className="h-14 flex items-center justify-between px-6 border-b border-black/10 dark:border-white/10 bg-white/70 dark:bg-[#152018]/80 backdrop-blur-xl z-30 shrink-0">
        <div className="flex items-center gap-4">
          {onBack && <button onClick={onBack} className="p-2 opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all"><ArrowLeft size={20} /></button>}
          <div className="flex items-center gap-2">
            <input
              type="text" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} onBlur={() => flushTitleSave(docTitle, false)}
              disabled={role === 'viewer' || !isTitleLoaded} placeholder={isTitleLoaded ? "Name your document..." : "Loading..."}
              className="font-bold text-lg px-2 py-1 rounded bg-transparent border border-transparent hover:border-black/10 dark:hover:border-white/10 focus:border-[#2A5A3D] focus:bg-white dark:focus:bg-[#1A261E] outline-none transition-all w-72 text-[#1E3F2B] dark:text-[#E8E3D9]"
            />
            {saveStatus === 'saved' && <span className="text-[10px] font-bold text-[#2A5A3D] dark:text-[#8EAB99] uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={12}/> Saved</span>}
            {saveStatus === 'saving' && <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Saving...</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          <button onClick={handleDownloadTxt} className="flex items-center gap-1.5 px-3 py-1.5 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded-lg text-xs font-bold transition-all" title="Download as TXT">
            <Download size={14} /> Download TXT
          </button>
          <label className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100 cursor-pointer transition-all" title="Insert Image">
            <ImageIcon size={18}/>
            <input type="file" accept="image/png, image/jpeg, image/webp, image/gif" className="hidden" onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])} />
          </label>
          <span className="capitalize px-3 py-1 bg-black/5 dark:bg-white/10 opacity-80 rounded-lg text-xs font-bold">{status}</span>
        </div>
      </header>

      {role === 'editor' && <Toolbar editor={editor} />}
      
      <div className="flex flex-1 overflow-hidden relative z-10">
        <main className={`flex-1 overflow-y-auto p-8 flex flex-col items-center relative ${splitViewerFile ? 'w-1/2' : 'w-full'}`}>
          <div className="page-sheet-wrapper transition-transform origin-top relative z-10" style={{ transform: `scale(1)`}}>
            <div ref={editorContainerRef} className="page-sheet bg-[#FFFFFF] text-black shadow-lg rounded ring-1 ring-black/5" style={{ minHeight: '1056px', padding: '96px', width: '816px' }}>
              <EditorContent editor={editor} />
            </div>
          </div>
        </main>

        {splitViewerFile && (
          <aside className="w-1/2 h-full border-l border-black/10 dark:border-white/10 bg-white dark:bg-[#152018] flex flex-col min-h-0">
            <div className="h-12 border-b border-black/10 dark:border-white/10 px-4 flex items-center justify-between shrink-0">
              <span className="text-sm font-bold truncate pr-4">{splitViewerFile.name}</span>
              <div className="flex items-center gap-2">
                {viewerHtml && (
                  <button onClick={() => editor?.commands.insertContent(viewerHtml)} className="bg-[#1E3F2B] dark:bg-[#E8E3D9] text-[#F4F1EB] dark:text-[#1E3F2B] px-3 py-1 rounded text-xs font-bold hover:opacity-90">
                    Insert into note
                  </button>
                )}
                <button onClick={() => setSplitViewerFile(null)} className="p-1 hover:bg-black/5 rounded text-red-500"><X size={16}/></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-[#F4F1EB] dark:bg-[#0D1510] flex flex-col items-center">
              {viewerError ? (
                <div className="text-sm font-medium text-red-500 p-4 bg-red-50 rounded border border-red-200">{viewerError}</div>
              ) : splitViewerFile.name.endsWith('.pdf') ? (
                <canvas ref={pdfCanvasRef} className="shadow-lg border border-black/10" />
              ) : (
                <div className="prose prose-sm max-w-none w-full bg-[#FFFFFF] p-6 shadow-sm border border-black/10 rounded text-black" dangerouslySetInnerHTML={{ __html: viewerHtml }} />
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};