import React, { createContext, useContext, useState } from 'react';

interface AudioContextType {
  isPlayerVisible: boolean;
  togglePlayerVisibility: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Defaults to false so the music player is OFF at the start
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  const togglePlayerVisibility = () => {
    setIsPlayerVisible(prev => !prev);
  };

  return (
    <AudioContext.Provider value={{ isPlayerVisible, togglePlayerVisibility }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
};