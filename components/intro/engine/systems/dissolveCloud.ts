import { mulberry32 } from '@/lib/intro/random';
import { clamp01, smooth } from '../math';
import { GOLD_LIGHT, rgba } from '../palette';
import { DEPTH, type Frame } from '../state';
import type { SpriteSet } from '../sprites';
import type { Points } from '../textSampling';

/**
 * अन्त / THE END as particles. The word cracks into shards along glowing
 * fault lines, dissolves into gold and salt crystals, and the crystals are
 * swept onto the loop where they orbit until the camera flies through.
 */
export interface DissolveCloud {
  draw(ctx: CanvasRenderingContext2D, f: Frame): void;
}

interface Bounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

const TAU = Math.PI * 2;
const RAYS = 7;
const SEGMENTS = 6;

function boundsOf(points: Points): Bounds {
  const b: Bounds = { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity };
  for (let i = 0; i < points.n; i++) {
    b.left = Math.min(b.left, points.xs[i]);
    b.right = Math.max(b.right, points.xs[i]);
    b.top = Math.min(b.top, points.ys[i]);
    b.bottom = Math.max(b.bottom, points.ys[i]);
  }
  return b;
}

/** Jagged fault lines radiating from the point of impact. */
function crackLines(origin: { x: number; y: number }, b: Bounds, a0: number, rand: () => number): Float32Array[] {
  const reach = Math.hypot(b.right - b.left, b.bottom - b.top) * 0.62;
  return Array.from({ length: RAYS }, (_, k) => {
    const angle = a0 + (k * TAU) / RAYS;
    const len = reach * (0.7 + rand() * 0.4);
    const pts = new Float32Array((SEGMENTS + 1) * 2);
    for (let j = 0; j <= SEGMENTS; j++) {
      const t = j / SEGMENTS;
      const wobble = j === 0 ? 0 : (rand() - 0.5) * 12;
      pts[j * 2] = origin.x + Math.cos(angle) * len * t - Math.sin(angle) * wobble;
      pts[j * 2 + 1] = origin.y + Math.sin(angle) * len * t + Math.cos(angle) * wobble;
    }
    return pts;
  });
}

export function createDissolveCloud(
  points: Points,
  sprites: SpriteSet,
  center: { x: number; y: number },
  seed = 5,
): DissolveCloud {
  const rand = mulberry32(seed);
  const n = points.n;
  const b = boundsOf(points);
  const origin = { x: center.x - (b.right - b.left) * 0.08, y: center.y - (b.bottom - b.top) * 0.12 };
  const a0 = rand() * TAU;
  const cracks = n > 0 ? crackLines(origin, b, a0, rand) : [];
  const span = Math.max(1, b.right - b.left);

  const shardX = new Float32Array(n);
  const shardY = new Float32Array(n);
  const dirX = new Float32Array(n);
  const dirY = new Float32Array(n);
  const drift = new Float32Array(n);
  const delay = new Float32Array(n);
  const delay2 = new Float32Array(n);
  const orbitAngle = new Float32Array(n);
  const orbitRadius = new Float32Array(n);
  const orbitSpeed = new Float32Array(n);
  const size = new Float32Array(n);
  const kind = new Uint8Array(n);
  const fade = new Float32Array(n);

  for (let i = 0; i < n; i++) {
    const px = points.xs[i];
    const py = points.ys[i];
    // Shards are the wedges between fault lines; each drifts along its bisector.
    const a = Math.atan2(py - origin.y, px - origin.x);
    const wedge = Math.floor(((((a - a0) % TAU) + TAU) % TAU) / (TAU / RAYS));
    const bisector = a0 + (wedge + 0.5) * (TAU / RAYS);
    const push = 2.5 + rand() * 3;
    shardX[i] = Math.cos(bisector) * push;
    shardY[i] = Math.sin(bisector) * push;
    const d = a + (rand() - 0.5) * 1.4;
    dirX[i] = Math.cos(d);
    dirY[i] = Math.sin(d);
    drift[i] = 14 + rand() * 46;
    delay[i] = ((px - b.left) / span) * 0.35 + rand() * 0.1; // dissolve sweeps left → right
    delay2[i] = rand() * 0.35;
    orbitAngle[i] = Math.atan2(py - center.y, px - center.x);
    orbitRadius[i] = 1 + (rand() - 0.5) * 0.18;
    orbitSpeed[i] = 0.8 + rand() * 0.5;
    size[i] = 1.1 + rand() * 1.5;
    const r = rand();
    kind[i] = r < 0.55 ? 0 : r < 0.8 ? 1 : 2;
    fade[i] = rand() < 0.35 ? 0.85 : 0;
  }

  function drawCracks(ctx: CanvasRenderingContext2D, f: Frame) {
    const s = f.state;
    const alpha = s.crack * (1 - smooth(clamp01(s.dissolve * 2.2)));
    if (alpha <= 0.002) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    cracks.forEach((pts, k) => {
      const last = Math.max(1, Math.round(SEGMENTS * clamp01(s.crack * 1.5 - k * 0.07)));
      for (const [width, a] of [
        [5, 0.18],
        [1.3, 0.95],
      ] as const) {
        ctx.strokeStyle = rgba(GOLD_LIGHT, alpha * a);
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(pts[0], pts[1]);
        for (let j = 1; j <= last; j++) ctx.lineTo(pts[j * 2], pts[j * 2 + 1]);
        ctx.stroke();
      }
    });
  }

  return {
    draw(ctx, f) {
      const s = f.state;
      ctx.globalCompositeOperation = 'lighter';
      drawCracks(ctx, f);
      if (s.cloudA <= 0.002 || n === 0) {
        ctx.globalCompositeOperation = 'source-over';
        return;
      }
      const { cx, cy, ringR } = f.layout;
      const cam = s.camera;
      const grow = 1 + (cam - 1) * 0.25;
      for (let i = 0; i < n; i++) {
        const d = smooth(clamp01((s.dissolve - delay[i]) / 0.55));
        const shard = s.crack * (1 + d * 2);
        let x = points.xs[i] + shardX[i] * shard + dirX[i] * drift[i] * d + Math.sin(f.time * 1.3 + i) * 4 * d;
        let y = points.ys[i] + shardY[i] * shard + dirY[i] * drift[i] * d - 14 * d;
        const q = smooth(clamp01((s.swirl - delay2[i]) / 0.65));
        if (q > 0) {
          const ang = orbitAngle[i] + s.orbitSpin * orbitSpeed[i];
          x += (cx + Math.cos(ang) * ringR * orbitRadius[i] - x) * q;
          y += (cy + Math.sin(ang) * ringR * orbitRadius[i] - y) * q;
        }
        const X = cx + (x - cx) * cam + f.parallax.x * DEPTH.photos;
        const Y = cy + (y - cy) * cam + f.parallax.y * DEPTH.photos;
        const a = s.cloudA * (1 - d * fade[i]) * (0.78 + 0.22 * Math.sin(f.time * 6 + i));
        if (a <= 0.01) continue;
        const k = kind[i];
        const r = size[i] * grow * (k === 2 ? 3.4 : 4.2);
        ctx.globalAlpha = a > 1 ? 1 : a;
        const sprite = k === 2 ? sprites.crystals[i & 3] : k === 1 ? sprites.dotCream : sprites.dotGold;
        ctx.drawImage(sprite, X - r / 2, Y - r / 2, r, r);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    },
  };
}
