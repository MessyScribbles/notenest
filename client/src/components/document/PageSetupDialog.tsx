import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { PageSettings } from '../../lib/pageSettings';

interface PageSetupDialogProps {
  settings: PageSettings;
  onClose: () => void;
}

export const PageSetupDialog: React.FC<PageSetupDialogProps> = ({ settings, onClose }) => {
  const [size, setSize] = useState(settings.size);
  const [orientation, setOrientation] = useState(settings.orientation);
  const [margin, setMargin] = useState(settings.marginType);
  const [numberHeadings, setNumberHeadings] = useState(settings.numberHeadings);

  const handleSave = () => {
    settings.update({ size, orientation, marginType: margin, numberHeadings });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-md p-6 text-slate-700">
        <div className="flex items-center justify-between mb-4 pb-2 border-b">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">Page Setup</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-600 mb-1">Paper Size</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value as any)}
              className="w-full border rounded px-3 py-2 bg-slate-50 outline-none focus:border-blue-500"
            >
              <option value="A4">A4 (794 × 1123 px)</option>
              <option value="Letter">US Letter (816 × 1056 px)</option>
              <option value="Legal">US Legal (816 × 1344 px)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-600 mb-1">Orientation</label>
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as any)}
              className="w-full border rounded px-3 py-2 bg-slate-50 outline-none focus:border-blue-500"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-600 mb-1">Margins</label>
            <select
              value={margin}
              onChange={(e) => setMargin(e.target.value as any)}
              className="w-full border rounded px-3 py-2 bg-slate-50 outline-none focus:border-blue-500"
            >
              <option value="narrow">Narrow (48 px)</option>
              <option value="normal">Normal (96 px)</option>
              <option value="wide">Wide (144 px)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="numHeadings"
              checked={numberHeadings}
              onChange={(e) => setNumberHeadings(e.target.checked)}
              className="rounded border-slate-300"
            />
            <label htmlFor="numHeadings" className="select-none cursor-pointer font-medium text-slate-600">
              Auto-number headings (1., 1.1, 1.1.1)
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded font-medium text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
            >
              Apply Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};