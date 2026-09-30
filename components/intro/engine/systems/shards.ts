import { mulberry32 } from '@/lib/intro/random';
import { CREAM, rgba } from '../palette';
import type { Frame } from '../state';
import type { SpriteSet } from '../sprites';

/**
 * A photo passing the camera shatters into faceted salt-crystal shards. The
 * DOM card is hidden on the same frame and these shards take over at exactly
 * its projected position, carrying its colour treatment and momentum.
 */
export interface ShatterSpec {
  /** Tinted image, already cover-cropped to the card's aspect. */
  image: CanvasImageSource;
  cx: number;
  cy: number;
  w: number;
  h: number;
  rotation: number; // radians
  vx: number;
  vy: number;
}

export interface ShardSystem {
  spawn(spec: ShatterSpec): void;
  draw(ctx: CanvasRenderingContext2D, f: Frame): void;
  clear(): void;
}

interface Shard {
  verts: Float32Array; // 3 vertices relative to the shard centroid (card space)
  cx: number; // centroid in card space
  cy: number;
  vx: number;
  vy: number;
  spin: number;
}

interface Burst {
  spec: ShatterSpec;
  shards: Shard[];
  age: number;
}

const LIFE = 0.8;
const MAX_SPARKS = 160;

function triangulate(spec: ShatterSpec, rand: () => number): Shard[] {
  const cols = spec.w >= spec.h ? 4 : 3;
  const rows = spec.w >= spec.h ? 3 : 4;
  const vx = (c: number, r: number) => {
    const edge = c === 0 || c === cols || r === 0 || r === rows;
    return (c / cols - 0.5) * spec.w + (edge ? 0 : (rand() - 0.5) * (spec.w / cols) * 0.7);
  };
  const vy = (c: number, r: number) => {
    const edge = c === 0 || c === cols || r === 0 || r === rows;
    return (r / rows - 0.5) * spec.h + (edge ? 0 : (rand() - 0.5) * (spec.h / rows) * 0.7);
  };
  const grid = Array.from({ length: rows + 1 }, (_, r) => Array.from({ length: cols + 1 }, (_, c) => [vx(c, r), vy(c, r)]));
  const shards: Shard[] = [];
  const make = (a: number[], b: number[], c: number[]) => {
    const gx = (a[0] + b[0] + c[0]) / 3;
    const gy = (a[1] + b[1] + c[1]) / 3;
    const dist = Math.hypot(gx, gy) || 1;
    const speed = 90 + rand() * 220;
    shards.push({
      verts: Float32Array.from([a[0] - gx, a[1] - gy, b[0] - gx, b[1] - gy, c[0] - gx, c[1] - gy]),
      cx: gx,
      cy: gy,
      vx: (gx / dist) * speed,
      vy: (gy / dist) * speed,
      spin: (rand() - 0.5) * 7,
    });
  };
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const [p00, p10, p01, p11] = [grid[r][c], grid[r][c + 1], grid[r + 1][c], grid[r + 1][c + 1]];
      if (rand() < 0.5) {
        make(p00, p10, p11);
        make(p00, p11, p01);
      } else {
        make(p00, p10, p01);
        make(p10, p11, p01);
      }
    }
  }
  return shards;
}

export function createShards(sprites: SpriteSet, seed = 31): ShardSystem {
  const rand = mulberry32(seed);
  let bursts: Burst[] = [];
  const px = new Float32Array(MAX_SPARKS);
  const py = new Float32Array(MAX_SPARKS);
  const pvx = new Float32Array(MAX_SPARKS);
  const pvy = new Float32Array(MAX_SPARKS);
  const age = new Float32Array(MAX_SPARKS).fill(1);
  let cursor = 0;

  function sparkle(spec: ShatterSpec) {
    for (let k = 0; k < 40; k++) {
      const i = cursor;
      cursor = (cursor + 1) % MAX_SPARKS;
      const lx = (rand() - 0.5) * spec.w;
      const ly = (rand() - 0.5) * spec.h;
      px[i] = spec.cx + lx;
      py[i] = spec.cy + ly;
      const speed = 160 + rand() * 360;
      const d = Math.hypot(lx, ly) || 1;
      pvx[i] = (lx / d) * speed + spec.vx * 0.4;
      pvy[i] = (ly / d) * speed + spec.vy * 0.4;
      age[i] = 0;
    }
  }

  function drawBurst(ctx: CanvasRenderingContext2D, b: Burst) {
    const { spec } = b;
    const t = b.age / LIFE;
    const grow = 1 + t * 0.6; // shards keep coming toward the camera
    const alpha = Math.pow(1 - t, 1.4);
    const cos = Math.cos(spec.rotation);
    const sin = Math.sin(spec.rotation);
    for (const s of b.shards) {
      const x = spec.cx + (cos * s.cx - sin * s.cy) * grow + (s.vx + spec.vx * 0.35) * b.age;
      const y = spec.cy + (sin * s.cx + cos * s.cy) * grow + (s.vy + spec.vy * 0.35) * b.age;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(spec.rotation + s.spin * b.age);
      ctx.scale(grow, grow);
      ctx.beginPath();
      ctx.moveTo(s.verts[0], s.verts[1]);
      ctx.lineTo(s.verts[2], s.verts[3]);
      ctx.lineTo(s.verts[4], s.verts[5]);
      ctx.closePath();
      ctx.globalAlpha = alpha;
      ctx.save();
      ctx.clip();
      ctx.drawImage(spec.image, -spec.w / 2 - s.cx, -spec.h / 2 - s.cy, spec.w, spec.h);
      ctx.restore();
      ctx.strokeStyle = rgba(CREAM, 0.6 * alpha);
      ctx.lineWidth = 1 / grow;
      ctx.stroke();
      ctx.restore();
    }
  }

  return {
    spawn(spec) {
      bursts = [...bursts, { spec, shards: triangulate(spec, rand), age: 0 }];
      sparkle(spec);
    },
    draw(ctx, f) {
      if (bursts.length) {
        for (const b of bursts) b.age += f.dt;
        bursts = bursts.filter((b) => b.age < LIFE);
        for (const b of bursts) drawBurst(ctx, b);
      }
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < MAX_SPARKS; i++) {
        if (age[i] >= 0.7) continue;
        age[i] += f.dt;
        px[i] += pvx[i] * f.dt;
        py[i] += pvy[i] * f.dt;
        const k = 1 - age[i] / 0.7;
        if (k <= 0) continue;
        ctx.globalAlpha = k;
        const r = 3 + k * 5;
        ctx.drawImage(sprites.crystals[i & 3], px[i] - r / 2, py[i] - r / 2, r, r);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    },
    clear() {
      bursts = [];
      age.fill(1);
    },
  };
}
