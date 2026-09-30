/**
 * One-time device read that scales the intro to the hardware: particle counts,
 * canvas resolution, montage size and whether photos may shatter.
 */
export interface DeviceProfile {
  mobile: boolean;
  portrait: boolean;
  lowEnd: boolean;
  saveData: boolean;
  finePointer: boolean;
  dpr: number;
  /** Multiplier on every particle budget. */
  particleScale: number;
  maxPhotos: number;
  allowShatter: boolean;
}

interface NavigatorHints {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
}

export function detectProfile(): DeviceProfile {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const nav = navigator as Navigator & NavigatorHints;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const mobile = Math.min(w, h) < 600 || (!finePointer && Math.max(w, h) < 1100);
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 8;
  const lowEnd = cores <= 4 || memory <= 4;
  const saveData = Boolean(nav.connection?.saveData) || /(^|-)2g$/.test(nav.connection?.effectiveType ?? '');

  return {
    mobile,
    portrait: h >= w,
    lowEnd,
    saveData,
    finePointer,
    dpr: Math.min(window.devicePixelRatio || 1, lowEnd ? 1.5 : 2),
    particleScale: mobile ? (lowEnd ? 0.35 : 0.55) : lowEnd ? 0.6 : 1,
    maxPhotos: saveData ? 10 : mobile ? 15 : Infinity,
    allowShatter: !lowEnd,
  };
}
