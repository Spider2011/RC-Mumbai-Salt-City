import { clamp, lerp, smoothstep } from './random';

/**
 * Photo colour treatment for the montage: Aant Crimson duotone (the past)
 * → Prarambh Gold → natural colour (the beginning).
 *
 * The DOM photos get this as a CSS `filter` string. Shattering photos are
 * redrawn on canvas, so `applyTreatment` re-implements the exact CSS filter
 * matrices (Filter Effects Level 1, sRGB, clamped per step) in JS to make the
 * canvas shards match the DOM photo pixel-for-pixel, in every browser.
 */
export interface Treatment {
  grayscale: number;
  sepia: number;
  hueRotate: number; // degrees
  saturate: number;
  brightness: number;
  contrast: number;
}

export const CRIMSON: Treatment = { grayscale: 1, sepia: 1, hueRotate: -55, saturate: 3.6, brightness: 0.5, contrast: 1.35 };
export const GOLD: Treatment = { grayscale: 1, sepia: 1, hueRotate: -2, saturate: 1.6, brightness: 0.95, contrast: 1.1 };
export const NATURAL: Treatment = { grayscale: 0, sepia: 0, hueRotate: 0, saturate: 1.04, brightness: 1, contrast: 1.03 };

const STOPS: ReadonlyArray<readonly [number, Treatment]> = [
  [0, CRIMSON],
  [0.28, CRIMSON],
  [0.52, GOLD],
  [0.66, GOLD],
  [0.88, NATURAL],
  [1, NATURAL],
];

const KEYS = Object.keys(NATURAL) as Array<keyof Treatment>;

function mix(a: Treatment, b: Treatment, t: number): Treatment {
  return KEYS.reduce((out, k) => ({ ...out, [k]: lerp(a[k], b[k], t) }), {} as Treatment);
}

/** Treatment for a photo at montage progress `t` (0 = first photo, 1 = last). */
export function treatmentAt(t: number): Treatment {
  const p = clamp(t, 0, 1);
  for (let i = 1; i < STOPS.length; i++) {
    const [pos, tr] = STOPS[i];
    if (p <= pos) {
      const [prevPos, prevTr] = STOPS[i - 1];
      const span = pos - prevPos;
      return mix(prevTr, tr, span > 0 ? smoothstep((p - prevPos) / span) : 1);
    }
  }
  return NATURAL;
}

const r3 = (n: number) => Math.round(n * 1000) / 1000;

export function toCssFilter(tr: Treatment): string {
  return (
    `brightness(${r3(tr.brightness)}) grayscale(${r3(tr.grayscale)}) sepia(${r3(tr.sepia)}) ` +
    `hue-rotate(${r3(tr.hueRotate)}deg) saturate(${r3(tr.saturate)}) contrast(${r3(tr.contrast)})`
  );
}

type Matrix = readonly [number, number, number, number, number, number, number, number, number];

function grayscaleMatrix(amount: number): Matrix {
  const a = 1 - clamp(amount, 0, 1);
  return [
    0.2126 + 0.7874 * a, 0.7152 - 0.7152 * a, 0.0722 - 0.0722 * a,
    0.2126 - 0.2126 * a, 0.7152 + 0.2848 * a, 0.0722 - 0.0722 * a,
    0.2126 - 0.2126 * a, 0.7152 - 0.7152 * a, 0.0722 + 0.9278 * a,
  ];
}

function sepiaMatrix(amount: number): Matrix {
  const a = 1 - clamp(amount, 0, 1);
  return [
    0.393 + 0.607 * a, 0.769 - 0.769 * a, 0.189 - 0.189 * a,
    0.349 - 0.349 * a, 0.686 + 0.314 * a, 0.168 - 0.168 * a,
    0.272 - 0.272 * a, 0.534 - 0.534 * a, 0.131 + 0.869 * a,
  ];
}

function saturateMatrix(s: number): Matrix {
  return [
    0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s,
    0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s,
    0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s,
  ];
}

function hueRotateMatrix(deg: number): Matrix {
  const rad = (deg * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return [
    0.213 + c * 0.787 - s * 0.213, 0.715 - c * 0.715 - s * 0.715, 0.072 - c * 0.072 + s * 0.928,
    0.213 - c * 0.213 + s * 0.143, 0.715 + c * 0.285 + s * 0.14, 0.072 - c * 0.072 - s * 0.283,
    0.213 - c * 0.213 - s * 0.787, 0.715 - c * 0.715 + s * 0.715, 0.072 + c * 0.928 + s * 0.072,
  ];
}

const unit = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Multiplies the pixel held in `px` by `m` in place, clamping like the spec. */
function applyMatrix(m: Matrix, px: Float64Array) {
  const r = px[0];
  const g = px[1];
  const b = px[2];
  px[0] = unit(m[0] * r + m[1] * g + m[2] * b);
  px[1] = unit(m[3] * r + m[4] * g + m[5] * b);
  px[2] = unit(m[6] * r + m[7] * g + m[8] * b);
}

function applyLinear(slope: number, intercept: number, px: Float64Array) {
  px[0] = unit(px[0] * slope + intercept);
  px[1] = unit(px[1] * slope + intercept);
  px[2] = unit(px[2] * slope + intercept);
}

/** Returns a new RGBA buffer with the treatment applied (alpha untouched). */
export function applyTreatment(src: Uint8ClampedArray, tr: Treatment): Uint8ClampedArray<ArrayBuffer> {
  const matrices = [
    grayscaleMatrix(tr.grayscale),
    sepiaMatrix(tr.sepia),
    hueRotateMatrix(tr.hueRotate),
    saturateMatrix(tr.saturate),
  ];
  const contrastIntercept = 0.5 - 0.5 * tr.contrast;
  const px = new Float64Array(3); // scratch pixel: no per-pixel allocations
  const out = new Uint8ClampedArray(src.length);
  for (let i = 0; i < src.length; i += 4) {
    px[0] = src[i] / 255;
    px[1] = src[i + 1] / 255;
    px[2] = src[i + 2] / 255;
    applyLinear(tr.brightness, 0, px);
    for (const m of matrices) applyMatrix(m, px);
    applyLinear(tr.contrast, contrastIntercept, px);
    out[i] = Math.round(px[0] * 255);
    out[i + 1] = Math.round(px[1] * 255);
    out[i + 2] = Math.round(px[2] * 255);
    out[i + 3] = src[i + 3];
  }
  return out;
}
