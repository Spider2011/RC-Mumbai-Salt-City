'use client';

import { useEffect, useRef } from 'react';
import { logout } from './actions';

/** Auto sign-out after this many minutes of no activity. */
const TIMEOUT_MS = 30 * 60 * 1000;
const WRITE_THROTTLE_MS = 5_000;
const STORAGE_KEY = 'rcmsc-portal-last-active';

/**
 * Signs a member out after a period of inactivity, regardless of tabs or the
 * browser's session-restore behaviour. Activity is shared across tabs via
 * localStorage, so being active in one tab keeps the others alive too.
 */
export function IdleLogout() {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastWrite = useRef(0);

  useEffect(() => {
    function readLast(): number {
      try {
        return Number(localStorage.getItem(STORAGE_KEY) || 0);
      } catch {
        return 0;
      }
    }

    function onTimeout() {
      // Another tab may have registered activity — only sign out if truly idle.
      const last = readLast();
      const elapsed = Date.now() - last;
      if (last && elapsed < TIMEOUT_MS) {
        timer.current = setTimeout(onTimeout, TIMEOUT_MS - elapsed + 500);
        return;
      }
      logout();
    }

    function schedule() {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(onTimeout, TIMEOUT_MS);
    }

    function markActive() {
      const now = Date.now();
      if (now - lastWrite.current > WRITE_THROTTLE_MS) {
        lastWrite.current = now;
        try {
          localStorage.setItem(STORAGE_KEY, String(now));
        } catch {
          /* ignore */
        }
        schedule();
      }
    }

    // If the portal was left idle past the limit (e.g. tab restored later), out.
    const last = readLast();
    if (last && Date.now() - last > TIMEOUT_MS) {
      logout();
      return;
    }

    lastWrite.current = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY, String(lastWrite.current));
    } catch {
      /* ignore */
    }
    schedule();

    const events: (keyof WindowEventMap)[] = [
      'mousemove',
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'click',
    ];
    events.forEach((e) => window.addEventListener(e, markActive, { passive: true }));

    function onVisible() {
      if (document.visibilityState === 'visible') {
        const l = readLast();
        if (l && Date.now() - l > TIMEOUT_MS) logout();
      }
    }
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      if (timer.current) clearTimeout(timer.current);
      events.forEach((e) => window.removeEventListener(e, markActive));
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return null;
}
