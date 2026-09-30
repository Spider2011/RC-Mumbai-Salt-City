'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import manifest from '@/lib/intro/photos.json';
import { selectMontagePhotos, type MontagePhoto } from '@/lib/intro/plan';
import {
  BOOT_GIVE_UP_MS,
  FONT_TIMEOUT_MS,
  INTRO_EVENT,
  REDUCED_MOTION_DURATION,
  SESSION_KEY,
  isIntroExcluded,
} from '@/lib/intro/timing';
import type { IntroController } from './engine/createIntro';
import { detectProfile, type DeviceProfile } from './engine/profile';
import { cinzel, notoSerifDevanagari, waitForIntroFonts } from './fonts';
import { IntroScene, IntroStatic } from './IntroScene';
import styles from './intro.module.css';

type Phase = 'boot' | 'cinematic' | 'static' | 'done';

interface Setup {
  profile: DeviceProfile;
  photos: MontagePhoto[];
}

function hasSeenIntro(): boolean {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function markIntroSeen(): void {
  try {
    window.sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    // Storage blocked (private mode, policy): the intro may simply play again.
  }
}

/** Don't spend the film on a background tab. */
function whenVisible(): Promise<void> {
  if (document.visibilityState === 'visible') return Promise.resolve();
  return new Promise((resolve) => document.addEventListener('visibilitychange', () => resolve(), { once: true }));
}

/**
 * The "Aant Asti Prarambh" intro overlay. The server renders a plain void
 * overlay (hidden by IntroLoader's gate script for returning visitors); the
 * client decides what to play, and unmounts itself by state when finished.
 */
export function IntroStage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<IntroController | null>(null);
  const [phase, setPhase] = useState<Phase>('boot');
  const [setup, setSetup] = useState<Setup | null>(null);
  const [soundOn, setSoundOn] = useState(false);

  // Session, motion preference and device can only be read on the client.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (hasSeenIntro() || isIntroExcluded(window.location.pathname) || performance.now() > BOOT_GIVE_UP_MS) {
      setPhase('done');
    } else if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('static');
    } else {
      const profile = detectProfile();
      const photos = selectMontagePhotos(manifest.photos, { max: profile.maxPhotos, excludeId: manifest.final.id });
      setSetup({ profile, photos });
      setPhase('cinematic');
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (phase !== 'cinematic' || !setup || !root) return;
    let cancelled = false;
    let controller: IntroController | null = null;
    void (async () => {
      try {
        // The engine (GSAP + canvas) downloads while the fonts load; returning visitors never fetch it.
        const [{ createIntro }] = await Promise.all([
          import('./engine/createIntro'),
          whenVisible().then(() => waitForIntroFonts(FONT_TIMEOUT_MS)),
        ]);
        if (cancelled) return;
        markIntroSeen();
        controller = createIntro({
          root,
          photos: setup.photos,
          finalSrc: manifest.final.src,
          profile: setup.profile,
          onComplete: () => setPhase('done'),
        });
        controllerRef.current = controller;
      } catch {
        // Engine failed to load or start (offline, no 2D canvas): never hold the site hostage.
        if (!cancelled) setPhase('done');
      }
    })();
    return () => {
      cancelled = true;
      controller?.destroy();
      controllerRef.current = null;
    };
  }, [phase, setup]);

  useEffect(() => {
    const root = rootRef.current;
    if (phase !== 'static' || !root) return;
    let cancelled = false;
    let revert: (() => void) | null = null;
    Promise.all([import('gsap'), waitForIntroFonts(600)])
      .then(([{ gsap }]) => {
        if (cancelled) return;
        markIntroSeen();
        const ctx = gsap.context(() => {
          gsap
            .timeline({ onComplete: () => setPhase('done') })
            .to('[data-part="static"]', { autoAlpha: 1, duration: 0.5, ease: 'power1.out' })
            .to(root, { autoAlpha: 0, duration: 0.5, ease: 'power1.inOut' }, REDUCED_MOTION_DURATION - 0.5);
        }, root);
        revert = () => ctx.revert();
      })
      .catch(() => {
        if (!cancelled) setPhase('done');
      });
    return () => {
      cancelled = true;
      revert?.();
    };
  }, [phase]);

  useEffect(() => {
    if (phase === 'done') window.dispatchEvent(new CustomEvent(INTRO_EVENT));
  }, [phase]);

  useEffect(() => {
    if (phase !== 'cinematic') return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') controllerRef.current?.skip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);

  const toggleSound = useCallback(() => {
    const next = !soundOn;
    controllerRef.current?.setSound(next); // inside the click: browsers allow audio to start here
    setSoundOn(next);
  }, [soundOn]);

  const skip = useCallback(() => controllerRef.current?.skip(), []);

  /** Keep keyboard focus inside the overlay while it covers the page. */
  const trapFocus = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const buttons = Array.from(e.currentTarget.querySelectorAll('button'));
    if (buttons.length === 0) return;
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  if (phase === 'done') return null;

  return (
    <div
      ref={rootRef}
      data-intro-root=""
      data-state={phase === 'boot' ? 'boot' : 'running'}
      data-lenis-prevent=""
      className={`${styles.root} ${cinzel.variable} ${notoSerifDevanagari.variable}`}
      role="dialog"
      aria-modal="true"
      aria-label="Aant Asti Prarambh: The End Is The Beginning. Rotaract Club of Mumbai Salt City, District 3141, Rotary Year 2026–27"
      onKeyDown={trapFocus}
    >
      {phase === 'static' && <IntroStatic />}
      {phase === 'cinematic' && setup && (
        <>
          <IntroScene photos={setup.photos} />
          <div data-part="ui" className={`${styles.ui} ${styles.ghost}`}>
            <button type="button" className={styles.control} onClick={toggleSound} aria-pressed={soundOn}>
              {soundOn ? <Volume2 aria-hidden className={styles.icon} /> : <VolumeX aria-hidden className={styles.icon} />}
              <span>{soundOn ? 'Sound on' : 'Sound off'}</span>
            </button>
            <button type="button" className={`${styles.control} ${styles.skip}`} onClick={skip}>
              Skip intro
            </button>
          </div>
        </>
      )}
    </div>
  );
}
