import { mulberry32 } from '@/lib/intro/random';
import { easeInOutCubic, noise1 } from '../math';
import { DEPTH, type Frame, type StageState, type StageLayout } from '../state';
import type { SpriteSet } from '../sprites';

/**
 * The Prarambh Gold ember: flickers alone in the void, rises to the top of
 * the ring and becomes the pen that draws it, then the head of the loop.
 * It sheds short-lived sparks while it moves.
 */
export interface EmberSystem {
  draw(ctx: CanvasRenderingContext2D, f: Frame): void;
  clear(): void;
}

const MAX_SPARKS = 90;
const TOP = -Math.PI / 2;

/** Where the ember is, before camera/parallax, in screen px. */
export function emberHead(s: StageState, l: StageLayout): [number, number] {
  if (s.ringDraw <= 0 && s.loop <= 0) return [l.cx, l.cy - l.ringR * easeInOutCubic(s.emberLift)];
  const angle = s.loop > 0 ? TOP + s.loopSpin : TOP + Math.PI * 2 * s.ringDraw;
  return [l.cx + Math.cos(angle) * l.ringR, l.cy + Math.sin(angle) * l.ringR];
}

export function createEmber(sprites: SpriteSet, seed = 11): EmberSystem {
  const rand = mulberry32(seed);
  const sx = new Float32Array(MAX_SPARKS);
  const sy = new Float32Array(MAX_SPARKS);
  const svx = new Float32Array(MAX_SPARKS);
  const svy = new Float32Array(MAX_SPARKS);
  const age = new Float32Array(MAX_SPARKS);
  const life = new Float32Array(MAX_SPARKS);
  let cursor = 0;
  let emitDebt = 0;
  let lastX = NaN;
  let lastY = NaN;

  function emit(x: number, y: number, dirX: number, dirY: number) {
    const i = cursor;
    cursor = (cursor + 1) % MAX_SPARKS;
    const spread = (rand() - 0.5) * 60;
    sx[i] = x;
    sy[i] = y;
    svx[i] = -dirX * (20 + rand() * 40) + spread;
    svy[i] = -dirY * (20 + rand() * 40) + (rand() - 0.5) * 60 - 12;
    age[i] = 0;
    life[i] = 0.45 + rand() * 0.5;
  }

  return {
    draw(ctx, f) {
      const s = f.state;
      const { cx, cy } = f.layout;
      const [hx, hy] = emberHead(s, f.layout);
      const x = cx + (hx - cx) * s.camera + f.parallax.x * DEPTH.photos;
      const y = cy + (hy - cy) * s.camera + f.parallax.y * DEPTH.photos;

      ctx.globalCompositeOperation = 'lighter';
      const moved = Number.isFinite(lastX) ? Math.hypot(x - lastX, y - lastY) : 0;
      if (s.ember > 0.05 && moved > 0.4 && f.dt > 0) {
        emitDebt += f.dt * 70;
        const dx = (x - lastX) / (moved || 1);
        const dy = (y - lastY) / (moved || 1);
        for (; emitDebt >= 1; emitDebt -= 1) emit(x, y, dx, dy);
      }
      lastX = x;
      lastY = y;

      for (let i = 0; i < MAX_SPARKS; i++) {
        if (age[i] >= life[i]) continue;
        age[i] += f.dt;
        sx[i] += svx[i] * f.dt;
        sy[i] += svy[i] * f.dt;
        svy[i] += 18 * f.dt; // embers drift, then settle
        const k = 1 - age[i] / life[i];
        if (k <= 0) continue;
        ctx.globalAlpha = k * k * 0.9;
        const r = 2 + k * 5;
        ctx.drawImage(sprites.dotGold, sx[i] - r, sy[i] - r, r * 2, r * 2);
      }

      if (s.ember > 0.002) {
        const flicker = 0.82 + 0.18 * noise1(f.time * 9);
        const halo = (70 + 26 * noise1(f.time * 2.3 + 4)) * (1 + (s.camera - 1) * 0.2);
        ctx.globalAlpha = Math.min(1, s.ember * 0.6 * flicker);
        ctx.drawImage(sprites.ember, x - halo / 2, y - halo / 2, halo, halo);
        const core = 20 * flicker;
        ctx.globalAlpha = Math.min(1, s.ember);
        ctx.drawImage(sprites.ember, x - core / 2, y - core / 2, core, core);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    },
    clear() {
      age.fill(1);
      life.fill(0);
      lastX = NaN;
      lastY = NaN;
    },
  };
}
