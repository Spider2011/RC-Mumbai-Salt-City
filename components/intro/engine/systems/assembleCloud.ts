import { mulberry32 } from '@/lib/intro/random';
import { clamp01, easeInOutCubic } from '../math';
import { DEPTH, type Frame } from '../state';
import type { SpriteSet } from '../sprites';
import type { Points } from '../textSampling';

/**
 * The lockup's remaining letters (and the ambient salt dust) stream along
 * curling paths and settle onto the monogram, gilding it before the DOM
 * emboss takes over.
 */
export interface AssembleCloud {
  draw(ctx: CanvasRenderingContext2D, f: Frame): void;
}

interface AssembleOptions {
  sources: Points;
  targets: Points;
  /** Extra particles that start as ambient dust around the frame. */
  ambient: number;
  viewport: { width: number; height: number };
  sprites: SpriteSet;
  seed?: number;
}

const TRAVEL = 0.6;

export function createAssembleCloud({ sources, targets, ambient, viewport, sprites, seed = 9 }: AssembleOptions): AssembleCloud {
  const rand = mulberry32(seed);
  const n = targets.n === 0 ? 0 : sources.n + ambient;
  const sx = new Float32Array(n);
  const sy = new Float32Array(n);
  const tx = new Float32Array(n);
  const ty = new Float32Array(n);
  const curlX = new Float32Array(n);
  const curlY = new Float32Array(n);
  const delay = new Float32Array(n);
  const startAlpha = new Float32Array(n);
  const size = new Float32Array(n);
  const kind = new Uint8Array(n);

  for (let i = 0; i < n; i++) {
    const fromText = i < sources.n;
    sx[i] = fromText ? sources.xs[i] : rand() * viewport.width;
    sy[i] = fromText ? sources.ys[i] : viewport.height * (0.2 + rand() * 0.8);
    // Spatially ordered sources map onto spatially ordered targets: a flowing morph, not a scramble.
    const t = Math.min(targets.n - 1, Math.floor((i / n) * targets.n + rand() * 3));
    tx[i] = targets.xs[t] + (rand() - 0.5) * 1.5;
    ty[i] = targets.ys[t] + (rand() - 0.5) * 1.5;
    const dx = tx[i] - sx[i];
    const dy = ty[i] - sy[i];
    const len = Math.hypot(dx, dy) || 1;
    const curl = (rand() - 0.5) * Math.min(len * 0.9, 320);
    curlX[i] = (-dy / len) * curl;
    curlY[i] = (dx / len) * curl;
    delay[i] = rand() * 0.35 + (fromText ? 0 : 0.05);
    startAlpha[i] = fromText ? 1 : 0;
    size[i] = 1 + rand() * 1.4;
    kind[i] = rand() < 0.2 ? 2 : rand() < 0.6 ? 0 : 1;
  }

  return {
    draw(ctx, f) {
      const s = f.state;
      if (s.cloudB <= 0.002 || n === 0) return;
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < n; i++) {
        const t = clamp01((s.assemble - delay[i]) / TRAVEL);
        const e = easeInOutCubic(t);
        const mx = (sx[i] + tx[i]) / 2 + curlX[i];
        const my = (sy[i] + ty[i]) / 2 + curlY[i];
        const u = 1 - e;
        const x = u * u * sx[i] + 2 * u * e * mx + e * e * tx[i] + f.parallax.x * DEPTH.type;
        const y = u * u * sy[i] + 2 * u * e * my + e * e * ty[i] + f.parallax.y * DEPTH.type;
        const appear = startAlpha[i] + (1 - startAlpha[i]) * Math.min(1, t * 4);
        const settle = t > 0.8 ? 1 - ((t - 0.8) / 0.2) * 0.8 : 1;
        const a = s.cloudB * appear * settle * (0.75 + 0.25 * Math.sin(f.time * 7 + i));
        if (a <= 0.01) continue;
        const k = kind[i];
        const r = size[i] * (k === 2 ? 3.2 : 4) * (1 + Math.sin(Math.PI * t) * 0.6);
        ctx.globalAlpha = a > 1 ? 1 : a;
        const sprite = k === 2 ? sprites.crystals[i & 3] : k === 1 ? sprites.dotCream : sprites.dotGold;
        ctx.drawImage(sprite, x - r / 2, y - r / 2, r, r);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    },
  };
}
