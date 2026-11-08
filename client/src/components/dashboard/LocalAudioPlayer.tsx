import React, { useState, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, X, Music2 } from 'lucide-react';

export const LocalAudioPlayer: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) audioRef.current.currentTime = time;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setFileName(file.name.replace(/\.[^/.]+$/, ""));
      setIsPlaying(true);
      setTimeout(() => audioRef.current?.play(), 100);
    }
  };

  return (
    <div className="flex flex-col text-[#1E3F2B] dark:text-[#E8E3D9]">
      
      {/* Hidden Audio Elements */}
      <audio 
        ref={audioRef} 
        src={audioUrl || undefined}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      <input type="file" accept="audio/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />

      {/* Top Row: Album Art & Close Button */}
      <div className="flex justify-between items-start">
        {/* Album Art Square (Acts as Upload Button) */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="no-drag w-14 h-14 rounded-2xl bg-white/50 dark:bg-white/10 shadow-inner border border-white/60 dark:border-white/5 flex items-center justify-center cursor-pointer hover:bg-white/80 dark:hover:bg-white/20 transition-all"
          title="Upload audio"
        >
          <Music2 size={20} className="opacity-40 dark:opacity-60" />
        </div>
        
        {/* Subtle Close Button (replacing the heart for functionality) */}
        <button 
          onClick={onClose} 
          className="text-black/30 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors p-1"
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Track Info */}
      <div className="mt-4 flex flex-col">
        <h3 className="font-bold text-[17px] leading-tight truncate">
          {fileName || 'Track title'}
        </h3>
        <p className="text-[12px] font-medium text-black/50 dark:text-white/50 mt-0.5 truncate tracking-wide">
          {fileName ? 'Local Audio' : 'Artist • Album'}
        </p>
      </div>

      {/* Sleek Draggable Progress Line */}
      <div className="relative flex items-center h-2 mt-4 cursor-pointer group no-drag">
        {/* Custom CSS to hide the default bulky thumb dot */}
        <style>{`
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none; appearance: none; width: 0; height: 0;
          }
        `}</style>
        
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          disabled={!audioUrl}
          className="absolute w-full h-1 rounded-full appearance-none bg-black/10 dark:bg-white/10 outline-none z-10 cursor-pointer"
        />
        <div 
          className="absolute h-1 rounded-full bg-[#1E3F2B] dark:bg-[#E8E3D9] pointer-events-none"
          style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
        />
      </div>

      {/* Solid Playback Controls */}
      <div className="flex items-center justify-between px-3 mt-4">
        <button disabled={!audioUrl} className="disabled:opacity-30 hover:scale-110 transition-transform text-[#1E3F2B] dark:text-[#E8E3D9]">
          <SkipBack size={22} fill="currentColor" />
        </button>
        <button disabled={!audioUrl} onClick={togglePlay} className="disabled:opacity-30 hover:scale-110 transition-transform text-[#1E3F2B] dark:text-[#E8E3D9]">
          {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
        </button>
        <button disabled={!audioUrl} className="disabled:opacity-30 hover:scale-110 transition-transform text-[#1E3F2B] dark:text-[#E8E3D9]">
          <SkipForward size={22} fill="currentColor" />
        </button>
      </div>

    </div>
  );
};