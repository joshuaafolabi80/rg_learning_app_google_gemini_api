// src/context/SoundContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Howl, Howler } from 'howler';

const SoundContext = createContext();

const DEFAULT_SOUND_PATHS = {
  background: 'background/calm-background-music.mp3',
  click: 'click/click.wav',
  correct: 'correct/correct.mp3',
  wrong: 'wrong/wrong.mp3',
};

const DEFAULT_SOUND_CONTROLS = {
  isMuted: false,
  volume: 0.5,
};

export const SoundProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(() => {
    try {
      const storedMute = localStorage.getItem('sound_isMuted');
      return storedMute ? JSON.parse(storedMute) : DEFAULT_SOUND_CONTROLS.isMuted;
    } catch (e) {
      console.error("Failed to read isMuted from localStorage:", e);
      return DEFAULT_SOUND_CONTROLS.isMuted;
    }
  });

  const [volume, setVolumeState] = useState(() => {
    try {
      const storedVolume = localStorage.getItem('sound_volume');
      return storedVolume ? parseFloat(storedVolume) : DEFAULT_SOUND_CONTROLS.volume * 100;
    } catch (e) {
      console.error("Failed to read volume from localStorage:", e);
      return DEFAULT_SOUND_CONTROLS.volume * 100;
    }
  });

  const [soundSettings, setSoundSettings] = useState(() => {
    const savedSettings = {};
    for (const type of Object.keys(DEFAULT_SOUND_PATHS)) {
      savedSettings[type] = localStorage.getItem(`sound_setting_${type}`) || DEFAULT_SOUND_PATHS[type];
    }
    return savedSettings;
  });

  const bgHowlRef = useRef(null);
  const loadedEffectHowlsRef = useRef({});

  const allAvailableSounds = {
    background: [
      { name: 'Calm Music', file: 'background/calm-background-music.mp3' },
      { name: 'Documentary', file: 'background/documentary-background-music.mp3' },
      { name: 'Relaxing Loop', file: 'background/relaxing-light-background-loop.wav' },
    ],
    click: [
      { name: 'Click (wav)', file: 'click/click.wav' },
      { name: 'Standard Click (mp3)', file: 'click/standard-click.mp3' },
    ],
    correct: [
      { name: 'Correct (mp3)', file: 'correct/correct.mp3' },
      { name: 'Chime', file: 'correct/chime.mp3' },
    ],
    wrong: [
      { name: 'Wrong (mp3)', file: 'wrong/wrong.mp3' },
      { name: 'Fail', file: 'wrong/fail.mp3' },
    ],
  };

  useEffect(() => {
    Howler.volume(volume / 100);
  }, [volume]);

  useEffect(() => {
    localStorage.setItem('sound_isMuted', JSON.stringify(isMuted));
    Howler.mute(isMuted);
  }, [isMuted]);

  useEffect(() => {
    localStorage.setItem('sound_volume', volume.toString());
  }, [volume]);

  useEffect(() => {
    Object.keys(soundSettings).forEach(type => {
      localStorage.setItem(`sound_setting_${type}`, soundSettings[type]);
    });
  }, [soundSettings]);

  useEffect(() => {
    Object.values(loadedEffectHowlsRef.current).forEach(howl => howl.unload());
    loadedEffectHowlsRef.current = {};

    Object.keys(soundSettings).forEach(type => {
      if (type === 'background') return;

      const selectedFile = soundSettings[type];
      if (selectedFile) {
        const filePath = `/sounds/${selectedFile}`;
        loadedEffectHowlsRef.current[type] = new Howl({
          src: [filePath],
          html5: true,
          preload: true,
          volume: volume / 100,
          onloaderror: (id, error) => console.error(`Failed to load effect sound ${filePath}:`, error),
        });
      }
    });

    return () => {
      Object.values(loadedEffectHowlsRef.current).forEach(howl => howl.unload());
    };
  }, [soundSettings, volume]);

  useEffect(() => {
    if (bgHowlRef.current) {
      bgHowlRef.current.stop();
      bgHowlRef.current.unload();
    }

    const selectedBgFile = soundSettings.background;
    if (selectedBgFile) {
      const filePath = `/sounds/${selectedBgFile}`;
      const newBgHowl = new Howl({
        src: [filePath],
        html5: true,
        preload: true,
        loop: true,
        volume: volume / 100,
        onloaderror: (id, error) => console.error(`Failed to load background music ${filePath}:`, error),
        onload: function() {
          if (!isMuted && !this.playing()) {
            this.play();
          }
        }
      });
      bgHowlRef.current = newBgHowl;
    }

    return () => {
      if (bgHowlRef.current) {
        bgHowlRef.current.stop();
        bgHowlRef.current.unload();
      }
    };
  }, [soundSettings.background, volume]);

  useEffect(() => {
    if (bgHowlRef.current) {
      if (isMuted) {
        bgHowlRef.current.pause();
      } else {
        if (!bgHowlRef.current.playing()) {
          bgHowlRef.current.play();
        }
      }
    }
  }, [isMuted]);

  const playSound = useCallback((type) => {
    if (isMuted) return;

    const howl = loadedEffectHowlsRef.current[type];
    if (howl) {
      howl.stop();
      howl.play();
    } else {
      console.warn(`Sound effect '${type}' not loaded or found. Check path: /sounds/${soundSettings[type]}`);
    }
  }, [isMuted, soundSettings]);

  const toggleSound = useCallback(() => {
    if (!isMuted) {
      playSound('click');
    }
    setIsMuted(prev => !prev);
  }, [isMuted, playSound]);

  const updateSoundSetting = useCallback((type, file) => {
    setSoundSettings(prev => ({ ...prev, [type]: file }));
  }, []);

  const setVolume = useCallback((newVolume) => {
    setVolumeState(newVolume);
  }, []);

  const playBgSound = useCallback(() => {
    if (bgHowlRef.current && !isMuted && !bgHowlRef.current.playing()) {
      bgHowlRef.current.play();
    }
  }, [isMuted]);

  const stopBgSound = useCallback(() => {
    if (bgHowlRef.current) {
      bgHowlRef.current.stop();
    }
  }, []);

  return (
    <SoundContext.Provider value={{
      soundOn: !isMuted,
      toggleSound,
      volume,
      setVolume,
      soundSettings,
      updateSoundSetting,
      availableSounds: allAvailableSounds,
      playSound,
      playBgSound,
      stopBgSound,
    }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};