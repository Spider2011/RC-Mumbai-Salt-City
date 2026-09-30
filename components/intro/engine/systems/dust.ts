import { mulberry32 } from '@/lib/intro/random';
import type { Frame } from '../state';
import type { SpriteSet } from '../sprites';

/**
 * Crystalline salt dust drifting on a sea breeze. Each mote has a depth; deep
 * motes are drawn behind the type (back canvas), near ones in front, and the
 * camera push scales them by depth so the layers separate (parallax).
 */
export interface DustSystem {
  draw(ctx: CanvasRenderingContext2D, f: Frame, front: boolean): void;
}

const SPAN = 1.3; // motes live in a box 30% larger than the viewport
const HALF = SPAN / 2;
const FRONT_DEPTH = 0.95;

export function createDust(count: number, sprites: SpriteSet, seed = 7): DustSystem {
  const rand = mulberry32(seed);
  const x = new Float32Array(count);
  const y = new Float32Array(count);
  const depth = new Float32Array(count);
  const vx = new Float32Array(count);
  const vy = new Float32Array(count);
  const size = new Float32Array(count);
  const phase = new Float32Array(count);
  const crystal = new Uint8Array(count);

  for (let i = 0; i < count; i++) {
    x[i] = rand() * SPAN - HALF;
    y[i] = rand() * SPAN - HALF;
    depth[i] = 0.25 + rand() * 1.25;
    vx[i] = (0.004 + rand() * 0.012) * (rand() < 0.8 ? 1 : -1);
    vy[i] = (rand() - 0.6) * 0.006;
    size[i] = 0.5 + rand() * 1.6;
    phase[i] = rand() * Math.PI * 2;
    crystal[i] = rand() < 0.35 ? 1 : 0;
  }

  return {
    draw(ctx, f, front) {
      const master = f.state.dust;
      if (master <= 0.002) return;
      const { width, height, cx, cy } = f.layout;
      const cam = f.state.camera;
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < count; i++) {
        const d = depth[i];
        if (d > FRONT_DEPTH !== front) continue;
        x[i] += vx[i] * f.dt;
        y[i] += vy[i] * f.dt;
        if (x[i] > HALF) x[i] -= SPAN;
        else if (x[i] < -HALF) x[i] += SPAN;
        if (y[i] > HALF) y[i] -= SPAN;
        else if (y[i] < -HALF) y[i] += SPAN;

        const zoom = cam === 1 ? 1 : Math.pow(cam, 0.45 + d * 0.5);
        const px = cx + (x[i] * width + f.parallax.x * d) * zoom;
        const py = cy + (y[i] * height + f.parallax.y * d) * zoom;
        if (px < -24 || px > width + 24 || py < -24 || py > height + 24) continue;

        const twinkle = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(f.time * (0.8 + d) + phase[i]));
        const s = size[i] * (0.6 + d * 0.9) * (crystal[i] ? 2.6 : 3.4) * Math.min(zoom, 3);
        ctx.globalAlpha = Math.min(1, master * twinkle * (0.3 + 0.4 * d));
        const sprite = crystal[i] ? sprites.crystals[i & 3] : i % 5 === 0 ? sprites.dotGold : sprites.dotCream;
        ctx.drawImage(sprite, px - s / 2, py - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    },
  };
}
