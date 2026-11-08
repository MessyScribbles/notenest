export function FriendsPanel({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="w-full h-full bg-surface border-l border-divider flex flex-col z-20 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-divider flex items-center justify-between shrink-0">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Friends & Activity</h3>
        <button onClick={onClose} className="text-muted hover:text-main text-xs">✕</button>
      </div>

      {/* Friend items list */}
      <div className="p-4 space-y-4 flex-1">
        {/* Your friends list items go here */}
      </div>
    </div>
  );
}