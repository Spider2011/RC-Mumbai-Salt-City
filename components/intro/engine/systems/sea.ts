import { GOLD_LIGHT, rgba } from '../palette';
import type { Frame } from '../state';

/**
 * The Arabian Sea at dawn: a thin gold horizon and rows of glinting wave
 * dashes, brightest in the sun's reflection column beneath प्रारम्भः.
 */
export interface SeaSystem {
  draw(ctx: CanvasRenderingContext2D, f: Frame): void;
}

const ROWS = 26;

export function createSea(): SeaSystem {
  return {
    draw(ctx, f) {
      const a = f.state.sea;
      if (a <= 0.002) return;
      const { width, height, cx, horizonY } = f.layout;
      const depth = Math.max(1, height - horizonY);
      ctx.globalCompositeOperation = 'lighter';

      const line = ctx.createLinearGradient(0, 0, width, 0);
      line.addColorStop(0, rgba(GOLD_LIGHT, 0));
      line.addColorStop(0.5, rgba(GOLD_LIGHT, 0.85 * a));
      line.addColorStop(1, rgba(GOLD_LIGHT, 0));
      ctx.fillStyle = line;
      ctx.fillRect(0, horizonY - 0.5, width, 1);

      ctx.lineCap = 'round';
      for (let r = 0; r < ROWS; r++) {
        const t = (r + 1) / ROWS;
        const y = horizonY + depth * Math.pow(t, 1.9);
        const spacing = 10 + t * 46;
        const dash = spacing * 0.55;
        const column = width * (0.05 + t * 0.22); // reflection widens toward the viewer
        const offset = (f.time * (8 + t * 22) + r * 37) % spacing;
        const bright = new Path2D();
        const dim = new Path2D();
        for (let x = offset - spacing; x < width; x += spacing) {
          const dx = (x + dash / 2 - cx) / column;
          const glint = Math.exp(-dx * dx);
          const flick = 0.5 + 0.5 * Math.sin(f.time * 2.3 + r * 1.7 + x * 0.05);
          const level = (0.05 + 0.75 * glint * flick) * (1 - t * 0.45);
          if (level < 0.03) continue;
          const path = level > 0.3 ? bright : dim;
          path.moveTo(x, y);
          path.lineTo(x + dash * (0.4 + 0.6 * glint), y);
        }
        ctx.lineWidth = 0.8 + t * 1.6;
        ctx.strokeStyle = rgba(GOLD_LIGHT, a * 0.8);
        ctx.stroke(bright);
        ctx.strokeStyle = rgba(GOLD_LIGHT, a * 0.22);
        ctx.stroke(dim);
      }
      ctx.globalCompositeOperation = 'source-over';
    },
  };
}
