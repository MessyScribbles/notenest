import { FileText } from 'lucide-react';

export function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-divider rounded-xl bg-surface">
      <div className="w-16 h-16 bg-app rounded-full flex items-center justify-center mb-4 text-muted">
        <FileText size={32} />
      </div>
      <h3 className="text-sm font-medium text-main mb-1">No documents yet</h3>
      <p className="text-xs text-muted max-w-xs mb-6">Create a blank document or use a template to start building your workspace.</p>
      <button onClick={onCreate} className="bg-primary hover:bg-primary-hover text-surface px-5 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
        Create a Note
      </button>
    </div>
  );
}