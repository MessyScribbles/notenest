interface PresenceAvatarProps {
  name: string;
  avatarUrl?: string | null;
  status?: 'online' | 'away' | 'offline';
  size?: 'sm' | 'md';
}

export function PresenceAvatar({ name, avatarUrl, status, size = 'md' }: PresenceAvatarProps) {
  const sizeClasses = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
  
  return (
    <div className="relative inline-block">
      <div className={`${sizeClasses} rounded-full bg-primary-light text-primary flex items-center justify-center font-medium border-2 border-surface`}>
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full rounded-full object-cover" />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </div>
      {status && (
        <span 
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-surface ${
            status === 'online' ? 'bg-success' : status === 'away' ? 'bg-warning' : 'bg-muted'
          }`} 
          aria-label={status} 
        />
      )}
    </div>
  );
}