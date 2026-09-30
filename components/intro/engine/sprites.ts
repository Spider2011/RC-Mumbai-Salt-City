import { rgba, type RGB } from './palette';

/**
 * Pre-rendered particle sprites. Drawing a cached bitmap with drawImage is far
 * cheaper per frame than building gradients or rotated paths per particle.
 */
export type Sprite = HTMLCanvasElement;

function canvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  return [c, ctx];
}

/** Soft radial glow; `hot` adds a bright cream core (embers, flares). */
export function glowSprite(size: number, color: RGB, hot = false): Sprite {
  const [c, ctx] = canvas(size);
  const r = size / 2;
  const g = ctx.createRadialGradient(r, r, 0, r, r, r);
  if (hot) {
    g.addColorStop(0, 'rgba(255,250,235,1)');
    g.addColorStop(0.08, rgba(color, 0.95));
  } else {
    g.addColorStop(0, rgba(color, 1));
  }
  g.addColorStop(0.35, rgba(color, 0.35));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return c;
}

/**
 * A salt crystal: a tiny cube seen at an angle, a rhombus with one bright
 * facet. `turn` picks one of a few fixed orientations.
 */
export function crystalSprite(size: number, color: RGB, turn: number): Sprite {
  const [c, ctx] = canvas(size);
  const r = size / 2;
  ctx.translate(r, r);
  ctx.rotate(turn);
  const s = r * 0.62;
  ctx.fillStyle = rgba(color, 0.9);
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(s * 0.8, 0);
  ctx.lineTo(0, s);
  ctx.lineTo(-s * 0.8, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,252,242,0.95)';
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(s * 0.8, 0);
  ctx.lineTo(0, -s * 0.1);
  ctx.closePath();
  ctx.fill();
  return c;
}

export interface SpriteSet {
  dotGold: Sprite;
  dotCream: Sprite;
  dotCrimson: Sprite;
  crystals: Sprite[];
  ember: Sprite;
  halo: Sprite;
  haloCrimson: Sprite;
  flare: Sprite;
}

export function createSprites(gold: RGB, cream: RGB, crimson: RGB, goldLight: RGB): SpriteSet {
  return {
    dotGold: glowSprite(24, goldLight),
    dotCream: glowSprite(24, cream),
    dotCrimson: glowSprite(24, crimson),
    crystals: [0, 0.5, 1.1, 2.2].map((t) => crystalSprite(16, cream, t)),
    ember: glowSprite(64, goldLight, true),
    halo: glowSprite(256, gold),
    haloCrimson: glowSprite(256, crimson),
    flare: glowSprite(256, goldLight, true),
  };
}
