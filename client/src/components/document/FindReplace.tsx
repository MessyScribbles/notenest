import React, { useState } from 'react';
import { type Editor } from '@tiptap/react';
import { X, Search, Replace } from 'lucide-react';

interface FindReplaceProps {
  editor: Editor;
  onClose: () => void;
}

export const FindReplace: React.FC<FindReplaceProps> = ({ editor, onClose }) => {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);

  const handleReplace = () => {
    if (!findText) return;
    const content = editor.getHTML();
    const flags = matchCase ? 'g' : 'gi';
    const regex = new RegExp(findText, flags);
    if (regex.test(content)) {
      const newContent = content.replace(regex, replaceText);
      editor.commands.setContent(newContent);
    }
  };

  const handleReplaceAll = () => {
    handleReplace();
  };

  return (
    <div className="absolute top-16 right-8 z-50 bg-white border border-slate-200 shadow-2xl rounded-xl p-4 w-80 text-slate-700">
      <div className="flex items-center justify-between mb-3 pb-2 border-b">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Find and Replace</span>
        <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <label className="block font-medium text-slate-600 mb-1">Find</label>
          <div className="relative">
            <input
              type="text"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              placeholder="Search text..."
              className="w-full border rounded px-2.5 py-1.5 pl-8 outline-none focus:border-blue-500"
            />
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-600 mb-1">Replace with</label>
          <div className="relative">
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Replacement text..."
              className="w-full border rounded px-2.5 py-1.5 pl-8 outline-none focus:border-blue-500"
            />
            <Replace size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="matchCase"
            checked={matchCase}
            onChange={(e) => setMatchCase(e.target.checked)}
            className="rounded border-slate-300"
          />
          <label htmlFor="matchCase" className="select-none cursor-pointer">Match case</label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={handleReplace}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded font-medium text-slate-700 transition-colors"
          >
            Replace
          </button>
          <button
            onClick={handleReplaceAll}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
          >
            Replace All
          </button>
        </div>
      </div>
    </div>
  );
};