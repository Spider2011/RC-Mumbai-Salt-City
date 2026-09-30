/**
 * Brand system for the intro. CSS mirrors these in intro.module.css; canvas
 * code reads them from here. Nothing else may introduce a colour.
 */
export type RGB = readonly [number, number, number];

export const VOID: RGB = [7, 6, 10]; // Void Black
export const CRIMSON: RGB = [155, 27, 48]; // Aant Crimson
export const CRIMSON_LIGHT: RGB = [214, 58, 78]; // crimson as emitted light
export const GOLD: RGB = [212, 175, 55]; // Prarambh Gold
export const GOLD_LIGHT: RGB = [245, 217, 139]; // gold as emitted light
export const CREAM: RGB = [243, 232, 208]; // Sacred Cream

export const rgba = ([r, g, b]: RGB, a: number) => `rgba(${r},${g},${b},${a < 0 ? 0 : a > 1 ? 1 : a})`;

export const mixRGB = (a: RGB, b: RGB, t: number): RGB => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];
