import React, { createContext, useContext, useEffect, useState } from "react";

const STREAM_URL = "https://stream.zeno.fm/gpxvzouyhcwtv";

interface RadioContextType {
  playing: boolean;
  toggleAudio: () => void;
}

const RadioContext = createContext<RadioContextType | undefined>(undefined);

export function RadioProvider({ children }: { children: React.ReactNode }) {
  const [playing, setPlaying] = useState(false);
  const [audio] = useState<HTMLAudioElement | null>(() =>
    typeof Audio !== "undefined" ? new Audio(STREAM_URL) : null
  );

  useEffect(() => {
    return () => {
      audio?.pause();
    };
  }, [audio]);

  const toggleAudio = () => {
    if (!audio) return;
    if (audio.paused) {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  return (
    <RadioContext.Provider value={{ playing, toggleAudio }}>
      {children}
    </RadioContext.Provider>
  );
}

export function useRadio() {
  const ctx = useContext(RadioContext);
  if (!ctx) throw new Error("useRadio must be used within a RadioProvider");
  return ctx;
}
