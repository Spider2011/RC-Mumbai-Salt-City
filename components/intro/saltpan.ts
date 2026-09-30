import { mulberry32 } from '@/lib/intro/random';

/**
 * Aerial salt-pan geometry: a patchwork of rectangular evaporation pans split
 * by bunds, like the salt fields around Mumbai. Deterministic (seeded) so the
 * server and client render the same SVG.
 */
export const SALT_PAN_VIEWBOX = { width: 1600, height: 1000 } as const;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function split(rect: Rect, depth: number, rand: () => number): Rect[] {
  const tooSmall = rect.w < 90 || rect.h < 70;
  if (depth === 0 || tooSmall || (depth < 3 && rand() < 0.22)) return [rect];
  const vertical = rect.w / rect.h > 1.25 ? true : rect.h / rect.w > 1.25 ? false : rand() < 0.5;
  const t = 0.3 + rand() * 0.4;
  const [a, b]: [Rect, Rect] = vertical
    ? [
        { ...rect, w: rect.w * t },
        { ...rect, x: rect.x + rect.w * t, w: rect.w * (1 - t) },
      ]
    : [
        { ...rect, h: rect.h * t },
        { ...rect, y: rect.y + rect.h * t, h: rect.h * (1 - t) },
      ];
  return [...split(a, depth - 1, rand), ...split(b, depth - 1, rand)];
}

export function saltPanPath(seed = 3141): string {
  const rand = mulberry32(seed);
  const pans = split({ x: 0, y: 0, w: SALT_PAN_VIEWBOX.width, h: SALT_PAN_VIEWBOX.height }, 7, rand);
  const bund = 7;
  return pans
    .map(({ x, y, w, h }) => {
      const r = (n: number) => Math.round(n);
      return `M${r(x + bund)} ${r(y + bund)}h${r(w - bund * 2)}v${r(h - bund * 2)}h${r(-(w - bund * 2))}z`;
    })
    .join('');
}
