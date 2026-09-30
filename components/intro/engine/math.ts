/** Tiny numeric helpers shared by the canvas systems (hot paths, no allocation). */
export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Cheap smooth 1D noise in [-1, 1]: a few incommensurate sines. */
export const noise1 = (x: number) =>
  (Math.sin(x * 1.7) + Math.sin(x * 3.11 + 1.3) * 0.5 + Math.sin(x * 5.37 + 2.1) * 0.25) / 1.75;
