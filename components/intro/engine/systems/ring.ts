import { CRIMSON, CRIMSON_LIGHT, GOLD, GOLD_LIGHT, mixRGB, rgba } from '../palette';
import { DEPTH, type Frame } from '../state';
import type { SpriteSet } from '../sprites';

/**
 * The Aant Crimson circle, the gold current that turns it into a loop (the
 * end touching the beginning), the flare where head meets tail, and the
 * portal of echo-rings the camera flies through.
 */
export interface RingSystem {
  draw(ctx: CanvasRenderingContext2D, f: Frame): void;
}

const TOP = -Math.PI / 2;
const TAU = Math.PI * 2;
const PASSES = [
  { color: CRIMSON, alpha: 0.2, width: 16 },
  { color: CRIMSON, alpha: 0.45, width: 5 },
  { color: CRIMSON_LIGHT, alpha: 0.95, width: 1.6 },
] as const;
const CURRENT_SEGMENTS = 40;
const ECHOES = 7;

export function createRing(sprites: SpriteSet): RingSystem {
  function drawPortal(ctx: CanvasRenderingContext2D, f: Frame, ox: number, oy: number, R: number) {
    const s = f.state;
    // Echo rings inside the loop: passing through them reads as depth.
    for (let k = 1; k <= ECHOES; k++) {
      const r = R * Math.pow(0.78, k);
      if (r < 6) break;
      ctx.strokeStyle = rgba(mixRGB(CRIMSON_LIGHT, GOLD_LIGHT, k / ECHOES), s.portal * 0.4 * Math.pow(0.82, k));
      ctx.lineWidth = Math.max(0.6, 1.4 * Math.pow(s.camera, 0.5) * Math.pow(0.85, k));
      ctx.beginPath();
      ctx.arc(ox, oy, r, 0, TAU);
      ctx.stroke();
    }
  }

  function drawCurrent(ctx: CanvasRenderingContext2D, f: Frame, ox: number, oy: number, R: number, w: number) {
    const s = f.state;
    const head = TOP + s.loopSpin;
    const len = TAU * 0.55 * s.loop;
    ctx.lineCap = 'round';
    for (let k = 0; k < CURRENT_SEGMENTS; k++) {
      const t = k / CURRENT_SEGMENTS;
      const fade = Math.pow(1 - t, 1.6);
      ctx.strokeStyle = rgba(GOLD_LIGHT, s.loop * s.ringAlpha * fade);
      ctx.lineWidth = (0.8 + 3.4 * (1 - t)) * w;
      ctx.beginPath();
      ctx.arc(ox, oy, R, head - len * ((k + 1) / CURRENT_SEGMENTS), head - len * t);
      ctx.stroke();
    }
    ctx.strokeStyle = rgba(GOLD, s.loop * s.ringAlpha * 0.22);
    ctx.lineWidth = 14 * w;
    ctx.beginPath();
    ctx.arc(ox, oy, R, head - len * 0.3, head);
    ctx.stroke();
  }

  return {
    draw(ctx, f) {
      const s = f.state;
      if (s.ringAlpha <= 0.002) return;
      const { cx, cy, ringR, width, height } = f.layout;
      const R = ringR * s.camera;
      const ox = cx + f.parallax.x * DEPTH.photos;
      const oy = cy + f.parallax.y * DEPTH.photos;
      const w = Math.pow(s.camera, 0.7);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';

      if (s.portal > 0.002) drawPortal(ctx, f, ox, oy, R);

      if (s.ringDraw > 0 && R < Math.hypot(width, height) * 1.6) {
        for (const pass of PASSES) {
          ctx.strokeStyle = rgba(pass.color, pass.alpha * s.ringAlpha);
          ctx.lineWidth = pass.width * w;
          ctx.beginPath();
          ctx.arc(ox, oy, R, TOP, TOP + TAU * s.ringDraw);
          ctx.stroke();
        }
      }
      if (s.loop > 0.002) drawCurrent(ctx, f, ox, oy, R, w);

      if (s.flare > 0.002) {
        const size = ringR * 1.5 * (0.4 + s.flare * 0.8) * w;
        ctx.globalAlpha = Math.min(1, s.flare);
        ctx.drawImage(sprites.flare, ox - size / 2, oy - R - size / 2, size, size);
        ctx.globalAlpha = 1;
      }
      ctx.globalCompositeOperation = 'source-over';
    },
  };
}
