'use client';

import { useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

/**
 * Optional ambient ocean/wind loop, muted by default.
 * Audio file is optional — gracefully no-ops if /audio/ambient.mp3 is absent.
 * TODO: add a soft ocean loop at /public/audio/ambient.mp3
 */
export function AudioToggle() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      el.volume = 0.25;
      void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={playing ? 'Mute ambient sound' : 'Play ambient sound'}
      aria-pressed={playing}
      className="inline-flex items-center gap-2 text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--accent-gold)]"
    >
      {playing ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      <span>Ambient {playing ? 'on' : 'off'}</span>
      <audio ref={audioRef} loop preload="none" src="/audio/ambient.mp3" />
    </button>
  );
}
