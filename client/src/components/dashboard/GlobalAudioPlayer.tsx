import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Music, Volume2, VolumeX, FolderOpen, Video, Disc, Link as LinkIcon, X, Sliders } from 'lucide-react';

interface Track {
  name: string;
  type: 'local' | 'youtube' | 'spotify';
  url: string;
  embedId?: string;
}

export function GlobalAudioPlayer() {
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTrack = playlist[currentIndex];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    playlist.forEach(t => { if (t.type === 'local') URL.revokeObjectURL(t.url); });
    
    const newTracks: Track[] = files.map(file => ({
      name: file.name.replace(/\.[^/.]+$/, ""),
      type: 'local',
      url: URL.createObjectURL(file)
    }));
    
    setPlaylist(prev => [...prev, ...newTracks]);
    if (!currentTrack) setCurrentIndex(0);
    setIsPlaying(true);
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    let newTrack: Track | null = null;
    const ytMatch = urlInput.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    
    if (ytMatch) {
      newTrack = { name: `YouTube Audio (${ytMatch[1]})`, type: 'youtube', url: urlInput, embedId: ytMatch[1] };
    } else if (urlInput.includes('spotify.com')) {
      newTrack = { name: 'Spotify Stream', type: 'spotify', url: urlInput.split('?')[0] };
    }

    if (newTrack) {
      setPlaylist(prev => [...prev, newTrack]);
      if (!currentTrack) setCurrentIndex(0);
      setIsPlaying(true);
      setUrlInput('');
      setShowUrlInput(false);
    } else {
      alert('Please enter a valid YouTube or Spotify link.');
    }
  };

  useEffect(() => {
    if (currentTrack?.type === 'local' && audioRef.current) {
      if (isPlaying) audioRef.current.play().catch(() => setIsPlaying(false));
      else audioRef.current.pause();
    }
  }, [isPlaying, currentIndex, currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setProgress((current / total) * 100 || 0);
    }
  };

  return (
    <div className="relative bg-surface/80 backdrop-blur-md border border-divider rounded-xl shadow-card px-3 py-1.5 flex items-center gap-3 max-w-md w-full transition-all duration-200">
      
      {currentTrack?.type === 'spotify' && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-divider rounded-xl shadow-hover p-2 z-50">
          <iframe 
            src={`${currentTrack.url.replace('/track/', '/embed/track/').replace('/playlist/', '/embed/playlist/')}?utm_source=generator&theme=0`} 
            width="100%" height="80" frameBorder="0" allow="encrypted-media" loading="lazy"
            className="rounded-lg"
          />
        </div>
      )}

      {currentTrack?.type === 'youtube' && currentTrack.embedId && (
        <div className="hidden"><iframe src={`https://www.youtube.com/embed/${currentTrack.embedId}?autoplay=${isPlaying ? 1 : 0}`} allow="autoplay" /></div>
      )}

      {/* Track Info */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <div className="w-8 h-8 bg-app rounded-lg flex items-center justify-center text-primary shrink-0 relative overflow-hidden">
          {currentTrack?.type === 'youtube' ? <Video size={14} /> : currentTrack?.type === 'spotify' ? <Disc size={14} /> : <Music size={14} />}
          {isPlaying && <div className="absolute inset-0 bg-primary/10 animate-pulse" />}
        </div>
        <div className="min-w-0">
          <h4 className="text-xs font-semibold text-main truncate">{currentTrack ? currentTrack.name : 'Music Player'}</h4>
          <p className="text-[10px] text-muted truncate">{playlist.length > 0 ? `Track ${currentIndex + 1}/${playlist.length}` : 'Idle'}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={() => currentIndex > 0 && setCurrentIndex(prev => prev - 1)} disabled={!currentTrack || currentIndex === 0} className="p-1 text-muted hover:text-primary disabled:opacity-30">
          <SkipBack size={14} fill="currentColor" />
        </button>
        <button onClick={() => currentTrack && setIsPlaying(!isPlaying)} disabled={!currentTrack} className="w-7 h-7 bg-primary text-surface rounded-full flex items-center justify-center hover:bg-primary-hover disabled:opacity-50 shadow-sm">
          {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" className="ml-0.5" />}
        </button>
        <button onClick={() => currentIndex < playlist.length - 1 && setCurrentIndex(prev => prev + 1)} disabled={!currentTrack || currentIndex === playlist.length - 1} className="p-1 text-muted hover:text-primary disabled:opacity-30">
          <SkipForward size={14} fill="currentColor" />
        </button>
      </div>

      <div className="w-px h-5 bg-divider mx-0.5" />

      {/* Sound & Link Options */}
      <div className="flex items-center gap-1 relative">
        <button onClick={() => setShowControls(!showControls)} className="p-1.5 text-muted hover:text-main rounded-md hover:bg-app" title="Sound Control">
          <Sliders size={14} />
        </button>
        <button onClick={() => setShowUrlInput(!showUrlInput)} className="p-1.5 text-muted hover:text-main rounded-md hover:bg-app" title="Add Link">
          <LinkIcon size={14} />
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="p-1.5 text-muted hover:text-main rounded-md hover:bg-app" title="Import Local">
          <FolderOpen size={14} />
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*" multiple className="hidden" />

        {/* Sound Control Slider Popover */}
        {showControls && (
          <div className="absolute right-0 top-full mt-2 bg-surface border border-divider rounded-xl shadow-hover p-3 flex items-center gap-2 z-50 w-36">
            <button onClick={() => setIsMuted(!isMuted)} className="text-muted hover:text-main">
              {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <input 
              type="range" min="0" max="1" step="0.05" 
              value={isMuted ? 0 : volume} 
              onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }} 
              className="w-full accent-primary h-1 bg-app rounded-lg cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* URL Input Modal Drawer */}
      {showUrlInput && (
        <form onSubmit={handleAddUrl} className="absolute left-0 right-0 top-full mt-2 p-2 bg-surface border border-divider rounded-xl shadow-hover flex gap-2 items-center z-50">
          <input 
            type="text" placeholder="Paste YouTube or Spotify URL..." value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 bg-app border border-divider rounded-lg px-2 py-1 text-xs outline-none focus:border-primary text-main" autoFocus
          />
          <button type="submit" className="bg-primary text-surface px-2.5 py-1 rounded-lg text-xs font-medium">Add</button>
          <button type="button" onClick={() => setShowUrlInput(false)} className="text-muted hover:text-main"><X size={14} /></button>
        </form>
      )}

      <audio ref={audioRef} src={currentTrack?.type === 'local' ? currentTrack.url : undefined} onTimeUpdate={handleTimeUpdate} onEnded={() => currentIndex < playlist.length - 1 && setCurrentIndex(prev => prev + 1)} className="hidden" />
    </div>
  );
}