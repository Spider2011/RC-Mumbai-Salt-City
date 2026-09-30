import { describe, expect, it } from 'vitest';
import {
  DENSE_THRESHOLD,
  MAX_TILT,
  accelerate,
  evenlySpacedIndices,
  fitAspect,
  isHero,
  minLaneRadius,
  planMontage,
  selectMontagePhotos,
  type Flight,
  type ManifestPhoto,
  type MontageOptions,
} from '../plan';

const photo = (i: number, landscape = i % 2 === 0): ManifestPhoto => ({
  id: String(i + 1).padStart(2, '0'),
  sm: `/sm/${i}.webp`,
  md: `/md/${i}.webp`,
  width: landscape ? 800 : 600,
  height: landscape ? 600 : 800,
});
const photos = (n: number) => Array.from({ length: n }, (_, i) => photo(i));

const desktop: MontageOptions = {
  viewport: { width: 1440, height: 900 },
  perspective: 1300,
  window: 3.2,
  allowShatter: true,
};
const phone: MontageOptions = { ...desktop, viewport: { width: 390, height: 844 }, perspective: 760 };

/** The frame centre must never sit inside a card (at z = 0 the projection is 1:1). */
const coversCentre = (f: Flight) => Math.abs(f.x) < f.w / 2 && Math.abs(f.y) < f.h / 2;

describe('evenlySpacedIndices', () => {
  it('spreads picks across the whole set, first to last', () => {
    const idx = evenlySpacedIndices(70, 15);
    expect(idx).toHaveLength(15);
    expect(idx[0]).toBe(0);
    expect(idx[14]).toBe(69);
    expect(new Set(idx).size).toBe(15);
    idx.slice(1).forEach((v, i) => expect(v).toBeGreaterThan(idx[i]));
  });

  it('returns everything when asking for more than exists', () => {
    expect(evenlySpacedIndices(4, 15)).toEqual([0, 1, 2, 3]);
  });

  it('handles empty and single picks', () => {
    expect(evenlySpacedIndices(0, 5)).toEqual([]);
    expect(evenlySpacedIndices(10, 0)).toEqual([]);
    expect(evenlySpacedIndices(9, 1)).toEqual([4]);
  });
});

describe('selectMontagePhotos', () => {
  it('excludes the final photo and caps the count (mobile)', () => {
    const picked = selectMontagePhotos(photos(70), { max: 15, excludeId: '58' });
    expect(picked).toHaveLength(15);
    expect(picked.some((p) => p.id === '58')).toBe(false);
    expect(picked.every((p) => !p.hero)).toBe(true);
  });

  it('keeps every photo on desktop and marks hero moments in dense sets', () => {
    const picked = selectMontagePhotos(photos(70), { max: Infinity, excludeId: '58' });
    expect(picked).toHaveLength(69);
    const heroes = picked.filter((p) => p.hero).length;
    expect(heroes).toBeGreaterThanOrEqual(12);
    expect(heroes).toBeLessThanOrEqual(18);
  });
});

describe('isHero', () => {
  it('only appears in dense montages, every 4th–5th photo', () => {
    expect(Array.from({ length: 20 }, (_, i) => isHero(i, 20)).some(Boolean)).toBe(false);
    expect(isHero(3, DENSE_THRESHOLD)).toBe(true);
    expect(isHero(4, 70)).toBe(true);
    expect(isHero(3, 70)).toBe(false);
  });
});

describe('accelerate', () => {
  it('is monotonic with shrinking gaps', () => {
    const pts = Array.from({ length: 11 }, (_, i) => accelerate(i / 10));
    expect(pts[0]).toBe(0);
    expect(pts[10]).toBeCloseTo(1);
    const gaps = pts.slice(1).map((v, i) => v - pts[i]);
    gaps.forEach((g) => expect(g).toBeGreaterThan(0));
    gaps.slice(1).forEach((g, i) => expect(g).toBeLessThanOrEqual(gaps[i] + 1e-12));
  });
});

describe('fitAspect / minLaneRadius', () => {
  it('keeps the long side and clamps extreme crops', () => {
    expect(fitAspect(800, 600, 400)).toEqual({ w: 400, h: 300 });
    expect(fitAspect(600, 800, 400)).toEqual({ w: 300, h: 400 });
    expect(fitAspect(300, 1280, 400).w).toBeCloseTo(400 * 0.56);
  });

  it('pushes horizontal lanes past half the card width', () => {
    expect(minLaneRadius(0, 400, 300, 1, 1, 10)).toBeCloseTo(210);
    expect(minLaneRadius(Math.PI / 2, 400, 300, 1, 1, 10)).toBeCloseTo(160);
  });
});

describe('planMontage', () => {
  it('returns nothing for no photos and one flight for one photo', () => {
    expect(planMontage([], desktop)).toEqual([]);
    const [only] = planMontage([photo(0)], desktop);
    expect(only.start).toBe(0);
    expect(only.start + only.duration).toBeLessThanOrEqual(desktop.window + 1e-9);
  });

  for (const [name, opts, count] of [
    ['sparse desktop', desktop, 12],
    ['sparse phone (15 cap)', phone, 15],
    ['dense desktop', desktop, 69],
  ] as const) {
    describe(name, () => {
      const list = selectMontagePhotos(photos(count + 1), { max: count, excludeId: String(count + 1) });
      const plan = planMontage(list, opts);

      it('schedules every photo inside the fixed window', () => {
        expect(plan).toHaveLength(count);
        expect(new Set(plan.map((f) => f.photo)).size).toBe(count);
        plan.forEach((f) => {
          expect(f.start).toBeGreaterThanOrEqual(0);
          expect(f.duration).toBeGreaterThan(0.3);
          expect(f.start + f.duration).toBeLessThanOrEqual(opts.window + 1e-9);
        });
      });

      it('never covers the centre of the frame', () => {
        plan.forEach((f) => expect(coversCentre(f)).toBe(false));
      });

      it('keeps tilt within ±8°', () => {
        plan.forEach((f) => {
          expect(Math.abs(f.rotation)).toBeLessThanOrEqual(MAX_TILT);
          expect(Math.abs(f.rotationX)).toBeLessThanOrEqual(MAX_TILT);
          expect(Math.abs(f.rotationY)).toBeLessThanOrEqual(MAX_TILT);
        });
      });

      it('warms from crimson to natural colour over time', () => {
        const byStart = [...plan].sort((a, b) => a.start - b.start);
        expect(byStart[0].treatment).toBeLessThan(0.1);
        expect(byStart[byStart.length - 1].treatment).toBeGreaterThan(0.9);
      });

      it('only shatters flat photos, late in the montage', () => {
        plan
          .filter((f) => f.shatter)
          .forEach((f) => {
            expect(f.rotationX).toBe(0);
            expect(f.rotationY).toBe(0);
            expect(f.treatment).toBeGreaterThanOrEqual(0.4);
          });
      });
    });
  }

  it('accelerates: gaps between sparse photos shrink', () => {
    const plan = planMontage(photos(12), desktop);
    const gaps = plan.slice(1).map((f, i) => f.start - plan[i].start);
    gaps.slice(1).forEach((g, i) => expect(g).toBeLessThanOrEqual(gaps[i] + 1e-9));
  });

  it('mixes tunnel frames with hero moments when dense', () => {
    const list = selectMontagePhotos(photos(70), { max: Infinity, excludeId: '58' });
    const plan = planMontage(list, desktop);
    const heroes = plan.filter((f) => f.kind === 'hero');
    expect(heroes.length).toBe(list.filter((p) => p.hero).length);
    expect(plan.filter((f) => f.kind === 'tunnel').length).toBe(list.length - heroes.length);
    // Hero moments are big: at least 40% of the short viewport side.
    heroes.forEach((f) => expect(Math.max(f.w, f.h)).toBeGreaterThan(900 * 0.4));
  });

  it('does not shatter when disabled (low-end devices)', () => {
    const plan = planMontage(photos(69), { ...desktop, allowShatter: false });
    expect(plan.some((f) => f.shatter)).toBe(false);
  });

  it('is deterministic for a given seed', () => {
    expect(planMontage(photos(20), desktop)).toEqual(planMontage(photos(20), desktop));
  });
});
