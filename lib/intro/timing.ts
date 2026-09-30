/**
 * Master clock for the "Aant Asti Prarambh" intro. Every section of the
 * storyboard hangs off these marks, so re-timing the film happens here.
 * All values are seconds on the master GSAP timeline.
 */
export const SECTIONS = {
  stillness: 0,
  end: 2.0, // अन्त: the ember draws the crimson circle
  is: 4.5, // अस्ति: the circle becomes a loop, then a portal
  journey: 6.5, // project-photo montage
  beginning: 10.0, // प्रारम्भः rises from the gold light
  identity: 12.0, // monogram + club name
  handoff: 13.5, // hold, then the cream curtain reveals the site
  total: 15.0,
} as const;

export const MONTAGE = {
  /** Photos that are not decoded by this moment are left out of the montage. */
  lockAt: 6.3,
  start: SECTIONS.journey,
  length: SECTIONS.beginning - SECTIONS.journey, // fixed at 3.5s
  /** Regular photos must be gone by montage start + this; the final photo owns the rest. */
  flightsWindow: 3.2,
  finalZoomAt: 9.05,
  burnAt: 9.55,
} as const;

export const SKIP_VISIBLE_AT = 1.5;
export const REDUCED_MOTION_DURATION = 2.0;
export const FONT_TIMEOUT_MS = 2500;
/** If JS takes longer than this to boot, the CSS failsafe has already hidden the overlay. */
export const BOOT_GIVE_UP_MS = 11000;
export const SESSION_KEY = 'rcmsc:intro-seen';
/** Internal tools never get the intro (the director portal shares the root layout). */
export const EXCLUDED_PATH_PREFIXES = ['/director'] as const;
export const isIntroExcluded = (pathname: string) =>
  EXCLUDED_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
export const INTRO_EVENT = 'rcmsc:intro-complete';
