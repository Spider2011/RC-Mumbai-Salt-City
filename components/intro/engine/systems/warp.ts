import { mulberry32 } from '@/lib/intro/random';
import { CREAM, CRIMSON, CRIMSON_LIGHT, GOLD, GOLD_LIGHT, mixRGB, rgba } from '../palette';
import type { Frame } from '../state';
import type { SpriteSet } from '../sprites';

/**
 * The tunnel behind the montage: salt-spray streaks rushing out of the
 * portal's vanishing point, crimson at first, gold as the journey warms.
 */
export interface WarpSystem {
  draw(ctx: CanvasRenderingContext2D, f: Frame): void;
}

const BUCKETS = [
  { alpha: 0.22, width: 0.6 },
  { alpha: 0.5, width: 1.1 },
  { alpha: 0.85, width: 1.8 },
] as const;

export function createWarp(count: number, sprites: SpriteSet, seed = 23): WarpSystem {
  const rand = mulberry32(seed);
  const x = new Float32Array(count);
  const y = new Float32Array(count);
  const z = new Float32Array(count);

  const respawn = (i: number, zStart: number) => {
    let a = 0;
    let b = 0;
    do {
      a = rand() * 2 - 1;
      b = rand() * 2 - 1;
    } while (a * a + b * b < 0.004);
    x[i] = a;
    y[i] = b;
    z[i] = zStart;
  };
  for (let i = 0; i < count; i++) respawn(i, 0.05 + rand() * 0.95);

  function drawCore(ctx: CanvasRenderingContext2D, f: Frame) {
    const s = f.state;
    const { cx, cy, width, height } = f.layout;
    const big = Math.max(width, height) * 1.25;
    ctx.globalAlpha = Math.min(1, s.core * 0.16 * (1 - s.tone));
    ctx.drawImage(sprites.haloCrimson, cx - big / 2, cy - big / 2, big, big);
    ctx.globalAlpha = Math.min(1, s.core * 0.2 * s.tone);
    ctx.drawImage(sprites.halo, cx - big / 2, cy - big / 2, big, big);
    const point = Math.min(width, height) * (0.2 + 0.12 * s.core);
    ctx.globalAlpha = Math.min(1, s.core * 0.7);
    ctx.drawImage(sprites.flare, cx - point / 2, cy - point / 2, point, point);
    ctx.globalAlpha = 1;
  }

  return {
    draw(ctx, f) {
      const s = f.state;
      if (s.warpAlpha <= 0.002 && s.core <= 0.002) return;
      ctx.globalCompositeOperation = 'lighter';
      if (s.core > 0.002) drawCore(ctx, f);
      if (s.warpAlpha <= 0.002) {
        ctx.globalCompositeOperation = 'source-over';
        return;
      }

      const { width, height, cx, cy } = f.layout;
      const F = Math.max(width, height) * 0.5;
      const step = s.warp * f.dt * 0.5;
      const paths = BUCKETS.map(() => new Path2D());
      for (let i = 0; i < count; i++) {
        const zPrev = z[i];
        z[i] -= step;
        if (z[i] <= 0.03) {
          respawn(i, 1);
          continue;
        }
        const k1 = F / zPrev;
        const k2 = F / z[i];
        const x2 = cx + x[i] * k2;
        const y2 = cy + y[i] * k2;
        if (x2 < -40 || x2 > width + 40 || y2 < -40 || y2 > height + 40) {
          respawn(i, 1);
          continue;
        }
        const depth = 1 - z[i];
        const path = paths[depth < 0.4 ? 0 : depth < 0.75 ? 1 : 2];
        path.moveTo(cx + x[i] * k1, cy + y[i] * k1);
        path.lineTo(x2, y2);
      }

      const color = s.tone <= 1 ? mixRGB(mixRGB(CRIMSON_LIGHT, CRIMSON, 0.3), GOLD_LIGHT, s.tone) : mixRGB(GOLD_LIGHT, CREAM, s.tone - 1);
      ctx.lineCap = 'round';
      BUCKETS.forEach((b, k) => {
        ctx.strokeStyle = rgba(k === 2 && s.tone > 0.5 ? mixRGB(color, GOLD, 0.2) : color, b.alpha * s.warpAlpha);
        ctx.lineWidth = b.width;
        ctx.stroke(paths[k]);
      });
      ctx.globalCompositeOperation = 'source-over';
    },
  };
}
