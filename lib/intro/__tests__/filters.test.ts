import { describe, expect, it } from 'vitest';
import { CRIMSON, GOLD, NATURAL, applyTreatment, toCssFilter, treatmentAt, type Treatment } from '../filters';

const IDENTITY: Treatment = { grayscale: 0, sepia: 0, hueRotate: 0, saturate: 1, brightness: 1, contrast: 1 };
const px = (...rgba: number[]) => new Uint8ClampedArray(rgba);

describe('treatmentAt', () => {
  it('starts crimson, passes through gold and ends natural', () => {
    expect(treatmentAt(0)).toEqual(CRIMSON);
    expect(treatmentAt(0.6)).toEqual(GOLD);
    expect(treatmentAt(1)).toEqual(NATURAL);
  });

  it('clamps out-of-range progress', () => {
    expect(treatmentAt(-1)).toEqual(CRIMSON);
    expect(treatmentAt(4)).toEqual(NATURAL);
  });

  it('interpolates between stops', () => {
    const mid = treatmentAt(0.4);
    expect(mid.hueRotate).toBeGreaterThan(CRIMSON.hueRotate);
    expect(mid.hueRotate).toBeLessThan(GOLD.hueRotate);
  });
});

describe('toCssFilter', () => {
  it('emits the same function list for every treatment so GSAP can tween it', () => {
    const shape = (s: string) => s.replace(/-?[\d.]+/g, '#');
    expect(shape(toCssFilter(CRIMSON))).toBe(shape(toCssFilter(NATURAL)));
    expect(toCssFilter(IDENTITY)).toBe(
      'brightness(1) grayscale(0) sepia(0) hue-rotate(0deg) saturate(1) contrast(1)',
    );
  });
});

describe('applyTreatment', () => {
  it('is the identity for a neutral treatment', () => {
    const src = px(12, 200, 90, 255, 250, 3, 128, 40);
    expect(Array.from(applyTreatment(src, IDENTITY))).toEqual(Array.from(src));
  });

  it('matches the CSS grayscale matrix', () => {
    const out = applyTreatment(px(255, 0, 0, 255), { ...IDENTITY, grayscale: 1 });
    expect(Array.from(out)).toEqual([54, 54, 54, 255]);
  });

  it('maps mid-grey to a deep crimson and black stays black', () => {
    const [r, g, b] = applyTreatment(px(150, 150, 150, 255), CRIMSON);
    expect(r).toBeGreaterThan(g * 2);
    expect(r).toBeGreaterThan(b * 2);
    const [dr, dg, db] = applyTreatment(px(0, 0, 0, 255), CRIMSON);
    expect(Math.max(dr, dg, db)).toBeLessThan(10);
  });

  it('warms mid-grey toward gold', () => {
    const [r, g, b] = applyTreatment(px(160, 160, 160, 255), GOLD);
    expect(r).toBeGreaterThan(b);
    expect(g).toBeGreaterThan(b);
  });

  it('preserves alpha and does not mutate the input', () => {
    const src = px(10, 20, 30, 77);
    const out = applyTreatment(src, CRIMSON);
    expect(out[3]).toBe(77);
    expect(out).not.toBe(src);
    expect(Array.from(src)).toEqual([10, 20, 30, 77]);
  });
});
