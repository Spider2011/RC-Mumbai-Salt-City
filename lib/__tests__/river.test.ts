import { describe, expect, it } from 'vitest';
import { buildStops, riverPath, riverSlope, riverX } from '../river';

const LANES: [number, number] = [1400, 1360];

describe('buildStops', () => {
  it('alternates lanes at each boundary, starting at the top of the page', () => {
    expect(buildStops([900, 1800, 2600], LANES)).toEqual([
      { y: 0, x: 1400 },
      { y: 900, x: 1360 },
      { y: 1800, x: 1400 },
      { y: 2600, x: 1360 },
    ]);
  });

  it('dedupes and sorts boundaries', () => {
    expect(buildStops([1800, 900, 900, 0], LANES).map((s) => s.y)).toEqual([0, 900, 1800]);
  });

  it('repeats the real stops after the mirror so the loop is seamless', () => {
    const stops = buildStops([900, 1800, 2600, 3200], LANES, 3200);
    for (const y of [0, 120, 450, 899, 900, 1300]) {
      expect(riverX(stops, y + 3200)).toBeCloseTo(riverX(stops, y), 6);
    }
  });
});

describe('riverX', () => {
  const stops = buildStops([1000], LANES);

  it('sits on the lane exactly at a stop', () => {
    expect(riverX(stops, 0)).toBe(1400);
    expect(riverX(stops, 1000)).toBe(1360);
  });

  it('eases between stops and holds beyond the ends', () => {
    expect(riverX(stops, 500)).toBeCloseTo(1380, 6);
    expect(riverX(stops, -50)).toBe(1400);
    expect(riverX(stops, 5000)).toBe(1360);
  });

  it('is flat at the stops and steepest halfway between them', () => {
    expect(riverSlope(stops, 0)).toBeCloseTo(0, 2);
    expect(Math.abs(riverSlope(stops, 500))).toBeGreaterThan(Math.abs(riverSlope(stops, 100)));
  });

  it('returns 0 with no stops', () => {
    expect(riverX([], 100)).toBe(0);
  });
});

describe('riverPath', () => {
  it('samples from top to bottom in the SVG box', () => {
    const d = riverPath(buildStops([1000], LANES), 0, 1000, 1300, 250);
    expect(d.startsWith('M100.0 0')).toBe(true);
    expect(d.endsWith('L60.0 1000')).toBe(true);
    expect(d.split('L')).toHaveLength(5);
  });
});
