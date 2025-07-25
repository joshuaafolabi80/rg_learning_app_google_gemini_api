import React from 'react';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { useSound } from '../context/SoundContext';

export default function SpeakerToggle() {
  const { soundOn, toggleSound } = useSound();
  
  return (
    <button 
      onClick={toggleSound}
      className="speaker-toggle"
      aria-label={soundOn ? "Mute sound" : "Unmute sound"}
      title={soundOn ? "Mute sound" : "Unmute sound"}
    >
      {soundOn ? (
        <FaVolumeUp className="icon" />
      ) : (
        <FaVolumeMute className="icon" />
      )}
    </button>
  );
}