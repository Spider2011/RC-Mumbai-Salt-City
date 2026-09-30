import { clamp, lerp, mulberry32 } from './random';

/**
 * Pure planning for the project-photo montage. No DOM here: given the photos
 * that are ready and the viewport, decide when each photo flies, along which
 * lane, how big, how it is tilted and coloured, and whether it shatters.
 */

export interface ManifestPhoto {
  id: string;
  sm: string;
  md: string;
  width: number;
  height: number;
}

export interface MontagePhoto extends ManifestPhoto {
  hero: boolean;
}

export interface Viewport {
  width: number;
  height: number;
}

export type FlightKind = 'flight' | 'tunnel' | 'hero';

export interface Flight {
  /** Index into the photo list passed to `planMontage`. */
  photo: number;
  kind: FlightKind;
  /** Seconds relative to the montage start. */
  start: number;
  duration: number;
  /** World offset from the frame centre at z = 0, in px. */
  x: number;
  y: number;
  /** World size at z = 0, in px. */
  w: number;
  h: number;
  zFrom: number;
  /** Where the flight ends; for a shattering photo this is the shatter point. */
  zTo: number;
  rotation: number;
  rotationX: number;
  rotationY: number;
  /** 0 = crimson duotone … 1 = natural colour. */
  treatment: number;
  shatter: boolean;
}

export interface MontageOptions {
  viewport: Viewport;
  /** CSS perspective of the montage scene, in px. */
  perspective: number;
  /** Seconds available; every flight ends by this time. */
  window: number;
  allowShatter: boolean;
  seed?: number;
}

/** At or above this many photos the montage becomes a dense tunnel with hero moments. */
export const DENSE_THRESHOLD = 25;
/** Hero moments pause at z = 0 for [enter, hold) of their duration. */
export const HERO_PHASES = { enter: 0.38, hold: 0.72 } as const;
export const MAX_TILT = 8;

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export function evenlySpacedIndices(total: number, count: number): number[] {
  if (count <= 0 || total <= 0) return [];
  if (count >= total) return Array.from({ length: total }, (_, i) => i);
  if (count === 1) return [Math.floor((total - 1) / 2)];
  return Array.from({ length: count }, (_, i) => Math.round((i * (total - 1)) / (count - 1)));
}

export function heroEveryFor(count: number): number {
  return count >= 45 ? 5 : 4;
}

export function isHero(index: number, count: number): boolean {
  if (count < DENSE_THRESHOLD) return false;
  const every = heroEveryFor(count);
  return index % every === every - 1;
}

/** Montage photos: everything except the final photo, thinned evenly to `max`. */
export function selectMontagePhotos(
  photos: readonly ManifestPhoto[],
  { max, excludeId }: { max: number; excludeId?: string },
): MontagePhoto[] {
  const pool = photos.filter((p) => p.id !== excludeId);
  const picked = evenlySpacedIndices(pool.length, Math.min(max, pool.length)).map((i) => pool[i]);
  return picked.map((p, i) => ({ ...p, hero: isHero(i, picked.length) }));
}

/** Rhythm curve: gaps between photos shrink as the montage goes on. */
export function accelerate(u: number, power = 1.8, linearMix = 0.3): number {
  const t = clamp(u, 0, 1);
  return (1 - linearMix) * (1 - Math.pow(1 - t, power)) + linearMix * t;
}

/** Card size for a photo whose long side is `longSide`; extreme crops are clamped (the image covers). */
export function fitAspect(width: number, height: number, longSide: number, minRatio = 0.56) {
  const ratio = width / height;
  if (ratio >= 1) return { w: longSide, h: longSide * Math.max(1 / ratio, minRatio) };
  return { w: longSide * Math.max(ratio, minRatio), h: longSide };
}

export function fitInside(width: number, height: number, maxW: number, maxH: number) {
  const s = Math.min(maxW / width, maxH / height);
  return { w: width * s, h: height * s };
}

/**
 * Smallest lane radius along `angle` that keeps a w×h card (plus margin)
 * clear of the frame centre, given lane stretch sx/sy.
 */
export function minLaneRadius(angle: number, w: number, h: number, sx: number, sy: number, margin: number) {
  const cx = Math.abs(Math.cos(angle)) * sx;
  const cy = Math.abs(Math.sin(angle)) * sy;
  const rx = cx > 1e-6 ? (w / 2 + margin) / cx : Infinity;
  const ry = cy > 1e-6 ? (h / 2 + margin) / cy : Infinity;
  return Math.min(rx, ry);
}

function geometry({ width, height }: Viewport) {
  const vmin = Math.min(width, height);
  return {
    vmin,
    portrait: height > width,
    sx: clamp(width / vmin, 1, 1.6),
    sy: clamp(height / vmin, 1, 1.6),
  };
}

const tilt = (rand: () => number, max = MAX_TILT) => (rand() * 2 - 1) * max;
const lean = (rand: () => number, sign: number) => -Math.sign(sign || 1) * (2 + rand() * (MAX_TILT - 2));

interface LaneSpec {
  longSide: number;
  radius: number; // preferred radius as a fraction of vmin
  radiusJitter: number;
}

function laneFor(
  photo: { width: number; height: number },
  angle: number,
  spec: LaneSpec,
  geo: ReturnType<typeof geometry>,
  rand: () => number,
) {
  const { w, h } = fitAspect(photo.width, photo.height, spec.longSide);
  const margin = geo.vmin * 0.05 + Math.max(w, h) * 0.08;
  const rMin = minLaneRadius(angle, w, h, geo.sx, geo.sy, margin);
  const radius = Math.max(rMin * 1.04, geo.vmin * (spec.radius + rand() * spec.radiusJitter));
  return { w, h, x: Math.cos(angle) * radius * geo.sx, y: Math.sin(angle) * radius * geo.sy };
}

function planSparse(photos: readonly { width: number; height: number }[], opts: MontageOptions, rand: () => number) {
  const geo = geometry(opts.viewport);
  const n = photos.length;
  const P = opts.perspective;
  const dFirst = clamp(4.6 / Math.sqrt(n), 1.05, 1.9);
  const dLast = dFirst * 0.6;
  const span = Math.max(0, opts.window - dLast);
  const spec: LaneSpec = { longSide: geo.vmin * (geo.portrait ? 0.56 : 0.46), radius: 0.3, radiusJitter: 0.18 };
  const theta0 = rand() * Math.PI * 2;

  return photos.map((photo, i): Flight => {
    const u = n === 1 ? 0 : i / (n - 1);
    const start = span * accelerate(u);
    const duration = Math.min(lerp(dFirst, dLast, u), opts.window - start);
    const lane = laneFor(photo, theta0 + i * GOLDEN_ANGLE + (rand() - 0.5) * 0.35, spec, geo, rand);
    const treatment = span > 0 ? start / span : 1;
    const shatter = opts.allowShatter && treatment >= 0.45 && i % 3 === 2;
    return {
      photo: i,
      kind: 'flight',
      start,
      duration,
      ...lane,
      zFrom: -P * 2.6,
      zTo: shatter ? P * 0.3 : P * 0.62,
      rotation: tilt(rand),
      rotationX: shatter ? 0 : lean(rand, -lane.y) * 0.8,
      rotationY: shatter ? 0 : lean(rand, lane.x),
      treatment,
      shatter,
    };
  });
}

function planTunnel(
  photos: readonly { width: number; height: number }[],
  indices: readonly number[],
  opts: MontageOptions,
  rand: () => number,
): Flight[] {
  const geo = geometry(opts.viewport);
  const P = opts.perspective;
  const n = indices.length;
  const dFirst = 1.15;
  const dLast = 0.55;
  const span = Math.max(0, opts.window - dLast);
  const theta0 = rand() * Math.PI * 2;

  return indices.map((photo, k): Flight => {
    const u = n === 1 ? 0 : k / (n - 1);
    const start = span * accelerate(u, 1.6);
    const duration = Math.min(lerp(dFirst, dLast, u), opts.window - start);
    const spec: LaneSpec = { longSide: geo.vmin * (0.24 + rand() * 0.06), radius: 0.5, radiusJitter: 0.16 };
    const lane = laneFor(photos[photo], theta0 + k * GOLDEN_ANGLE + (rand() - 0.5) * 0.3, spec, geo, rand);
    return {
      photo,
      kind: 'tunnel',
      start,
      duration,
      ...lane,
      zFrom: -P * 3.2,
      zTo: P * 0.5,
      rotation: tilt(rand),
      rotationX: lean(rand, -lane.y) * 0.6,
      rotationY: lean(rand, lane.x),
      treatment: span > 0 ? start / span : 1,
      shatter: false,
    };
  });
}

function planHeroes(
  photos: readonly { width: number; height: number }[],
  indices: readonly number[],
  opts: MontageOptions,
  rand: () => number,
): Flight[] {
  const { width, height } = opts.viewport;
  const geo = geometry(opts.viewport);
  const P = opts.perspective;
  const n = indices.length;
  const offset = 0.12;
  const dFirst = 1.0;
  const dLast = 0.55;
  const span = Math.max(0, opts.window - dLast - offset);
  const gap = geo.vmin * 0.05;
  const edge = geo.vmin * 0.03;
  const landscape = width >= height;
  const maxW = landscape ? width / 2 - gap - edge : width * 0.86;
  const maxH = landscape ? height * 0.78 : height / 2 - gap - edge;

  return indices.map((photo, k): Flight => {
    const u = n === 1 ? 0 : k / (n - 1);
    const start = offset + span * accelerate(u, 1.6, 0.5);
    const duration = Math.min(lerp(dFirst, dLast, u), opts.window - start);
    const side = k % 2 === 0 ? -1 : 1; // alternate halves so the centre stays open
    const { w, h } = fitInside(photos[photo].width, photos[photo].height, maxW, maxH);
    const drift = (rand() - 0.5) * geo.vmin * 0.06;
    const x = landscape ? side * (w / 2 + gap) : drift;
    const y = landscape ? drift : side * (h / 2 + gap);
    const treatment = span > 0 ? (start - offset) / span : 1;
    const shatter = opts.allowShatter && treatment >= 0.4 && k % 2 === 1;
    return {
      photo,
      kind: 'hero',
      start,
      duration,
      x,
      y,
      w,
      h,
      zFrom: -P * 2.2,
      zTo: shatter ? P * 0.22 : P * 0.7,
      rotation: tilt(rand, 4),
      rotationX: 0,
      rotationY: shatter ? 0 : landscape ? side * (2 + rand() * 3) : 0,
      treatment,
      shatter,
    };
  });
}

export function planMontage(photos: readonly { width: number; height: number; hero?: boolean }[], opts: MontageOptions): Flight[] {
  if (photos.length === 0) return [];
  const rand = mulberry32(opts.seed ?? 3141);
  if (photos.length < DENSE_THRESHOLD) return planSparse(photos, opts, rand);

  const heroes: number[] = [];
  const tunnel: number[] = [];
  photos.forEach((p, i) => (p.hero ? heroes : tunnel).push(i));
  return [...planTunnel(photos, tunnel, opts, rand), ...planHeroes(photos, heroes, opts, rand)].sort(
    (a, b) => a.start - b.start,
  );
}
