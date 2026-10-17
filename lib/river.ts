/** Geometry for the homepage paper-boat river: x (viewport px) as a function of page y. */

export interface RiverStop {
  y: number;
  x: number;
}

const smoothstep = (t: number): number => t * t * (3 - 2 * t);

/**
 * One stop per section boundary, alternating between two lanes so the river
 * bends past each section. When the page loops (mirrorTop set), the stops of
 * the real content are repeated from mirrorTop onward, so the river under the
 * mirror is identical to the river under the real hero.
 */
export function buildStops(
  boundaries: readonly number[],
  lanes: readonly [number, number],
  mirrorTop?: number,
): RiverStop[] {
  const real = [...new Set([0, ...boundaries])]
    .filter((y) => y >= 0 && (mirrorTop === undefined || y < mirrorTop))
    .sort((a, b) => a - b)
    .map((y, i) => ({ y, x: lanes[i % 2] }));

  if (mirrorTop === undefined) return real;
  return [...real, ...real.map((s) => ({ y: s.y + mirrorTop, x: s.x }))];
}

export function riverX(stops: readonly RiverStop[], y: number): number {
  if (stops.length === 0) return 0;
  if (y <= stops[0].y) return stops[0].x;
  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1];
    const b = stops[i];
    if (y <= b.y) {
      const t = b.y === a.y ? 1 : (y - a.y) / (b.y - a.y);
      return a.x + (b.x - a.x) * smoothstep(t);
    }
  }
  return stops[stops.length - 1].x;
}

/** dx/dy of the river at y, for steering the boat. */
export function riverSlope(stops: readonly RiverStop[], y: number, h = 4): number {
  return (riverX(stops, y + h) - riverX(stops, y - h)) / (2 * h);
}

/** SVG path data sampled down the page, with x shifted into the SVG's own box. */
export function riverPath(
  stops: readonly RiverStop[],
  fromY: number,
  toY: number,
  offsetX: number,
  step = 24,
): string {
  const parts: string[] = [];
  for (let y = fromY; y <= toY + step; y += step) {
    const yy = Math.min(y, toY);
    parts.push(`${parts.length ? 'L' : 'M'}${(riverX(stops, yy) - offsetX).toFixed(1)} ${yy.toFixed(0)}`);
    if (yy === toY) break;
  }
  return parts.join(' ');
}
