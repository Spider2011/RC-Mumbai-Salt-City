/**
 * The single source of truth the canvas renders from. GSAP tweens these plain
 * numbers on the master timeline; the renderer reads them every frame. Because
 * everything visual is a function of this state, seeking the timeline (Skip)
 * lands on a correct frame without replaying anything.
 */
export interface StageState {
  // 0–2s stillness
  dust: number;
  ember: number;
  emberLift: number; // 0 = centre → 1 = top of the ring
  // 2–4.5s अन्त
  ringDraw: number; // fraction of the circle drawn
  ringAlpha: number;
  crack: number;
  dissolve: number;
  cloudA: number; // visibility of the particles born from अन्त / THE END
  // 4.5–6.5s अस्ति
  swirl: number; // particles pulled onto the loop
  orbitSpin: number; // radians
  loop: number; // gold current chasing the crimson tail
  loopSpin: number; // radians travelled by the loop's head
  flare: number; // where the loop meets itself
  camera: number; // push-in zoom
  portal: number;
  // 6.5–10s journey
  warp: number; // tunnel speed
  warpAlpha: number;
  tone: number; // 0 crimson → 1 gold
  core: number; // vanishing-point glow photos stream out of
  // 10–13.5s beginning / identity
  sea: number;
  assemble: number;
  cloudB: number;
}

export const createStageState = (): StageState => ({
  dust: 0,
  ember: 0,
  emberLift: 0,
  ringDraw: 0,
  ringAlpha: 1,
  crack: 0,
  dissolve: 0,
  cloudA: 0,
  swirl: 0,
  orbitSpin: 0,
  loop: 0,
  loopSpin: 0,
  flare: 0,
  camera: 1,
  portal: 0,
  warp: 0,
  warpAlpha: 0,
  tone: 0,
  core: 0,
  sea: 0,
  assemble: 0,
  cloudB: 0,
});

/** Screen geometry shared by the canvas and the choreography (CSS px). */
export interface StageLayout {
  width: number;
  height: number;
  cx: number;
  cy: number;
  ringR: number;
  horizonY: number;
  portrait: boolean;
  dpr: number;
}

export function computeLayout(width: number, height: number, dpr: number, horizonY?: number): StageLayout {
  const portrait = height >= width;
  return {
    width,
    height,
    cx: width / 2,
    cy: height / 2,
    ringR: Math.min(width, height) * (portrait ? 0.36 : 0.27),
    horizonY: horizonY ?? height * 0.6,
    portrait,
    dpr,
  };
}

/**
 * Parallax depth of each layer. Canvas systems use the same factor as the DOM
 * layer they must line up with (ring ↔ अस्ति, particles ↔ the type they replace).
 */
export const DEPTH = { saltpan: 0.35, photos: 0.6, type: 0.75 } as const;

/** Parallax offset (px) applied per depth layer; updated by the renderer. */
export interface Parallax {
  x: number;
  y: number;
}

/** Everything a canvas system needs for one frame. */
export interface Frame {
  state: StageState;
  layout: StageLayout;
  time: number; // seconds since the renderer started
  dt: number; // seconds since the previous frame (capped)
  parallax: Parallax;
}
