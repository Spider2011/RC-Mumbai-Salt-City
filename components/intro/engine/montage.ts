import gsap from 'gsap';
import { toCssFilter, treatmentAt, type Treatment } from '@/lib/intro/filters';
import { HERO_PHASES, planMontage, type Flight, type MontagePhoto } from '@/lib/intro/plan';
import { MONTAGE } from '@/lib/intro/timing';
import type { Parts } from './parts';
import { tintedCrop, type PhotoLoader } from './photos';
import type { Renderer } from './renderer';
import { DEPTH } from './state';

/**
 * Builds the photo montage at MONTAGE.lockAt from the photos that are ready.
 * Cards fly out of the portal in CSS 3D (depth-sorted by preserve-3d), carry
 * their colour treatment as a static CSS filter, and some hand over to the
 * canvas to shatter as they pass the camera.
 */
export interface MontageDeps {
  parts: Parts;
  photos: readonly MontagePhoto[];
  loader: PhotoLoader;
  renderer: Renderer;
  perspective: number;
  allowShatter: boolean;
}

const DEG = Math.PI / 180;
const MAX_SHARD_VELOCITY = 1600;
const EXPO_IN_END_SLOPE = 10 * Math.LN2; // d/dt of expo.in at t = 1

function addFlight(mt: gsap.core.Timeline, card: HTMLElement, f: Flight) {
  mt.to(card, { z: f.zTo, duration: f.duration, ease: 'power2.in' }, f.start);
  mt.to(card, { autoAlpha: 1, duration: f.duration * 0.25, ease: 'power1.out' }, f.start);
  if (!f.shatter) mt.to(card, { autoAlpha: 0, duration: f.duration * 0.18, ease: 'power1.in' }, f.start + f.duration * 0.82);
}

/** Hero moment: rush in, hold at full size for a beat, then fly past. */
function addHero(mt: gsap.core.Timeline, card: HTMLElement, f: Flight, perspective: number) {
  const enter = f.duration * HERO_PHASES.enter;
  const hold = f.duration * (HERO_PHASES.hold - HERO_PHASES.enter);
  const exit = f.duration - enter - hold;
  mt.to(card, { z: 0, duration: enter, ease: 'expo.out' }, f.start);
  mt.to(card, { z: perspective * 0.06, duration: hold, ease: 'none' }, f.start + enter);
  mt.to(card, { z: f.zTo, duration: exit, ease: 'expo.in' }, f.start + enter + hold);
  mt.to(card, { autoAlpha: 1, duration: enter * 0.6, ease: 'power1.out' }, f.start);
  if (!f.shatter) mt.to(card, { autoAlpha: 0, duration: exit * 0.4, ease: 'power1.in' }, f.start + f.duration - exit * 0.4);
}

/** Speed (px/s along z) at the moment a flight ends, from its easing. */
function endSpeed(f: Flight, perspective: number): number {
  if (f.kind !== 'hero') return (2 * (f.zTo - f.zFrom)) / f.duration;
  const exit = f.duration * (1 - HERO_PHASES.hold);
  return (EXPO_IN_END_SLOPE * (f.zTo - perspective * 0.06)) / exit;
}

function addShatter(mt: gsap.core.Timeline, d: MontageDeps, card: HTMLElement, img: HTMLImageElement, f: Flight, treatment: Treatment) {
  let tinted: HTMLCanvasElement | null = null;
  const prepare = () => {
    tinted ??= tintedCrop(img, treatment, f.w, f.h);
    return tinted;
  };
  const end = f.start + f.duration;
  mt.call(prepare, [], f.start + f.duration * 0.4); // do the pixel work before the moment of impact
  mt.call(
    () => {
      const P = d.perspective;
      const k = P / (P - f.zTo);
      const radial = ((k * k) / P) * endSpeed(f, P);
      const clampV = (v: number) => Math.max(-MAX_SHARD_VELOCITY, Math.min(MAX_SHARD_VELOCITY, v));
      const { cx, cy } = d.renderer.layout();
      const p = d.renderer.parallax();
      d.renderer.shatter({
        image: prepare(),
        cx: cx + f.x * k + p.x * DEPTH.photos,
        cy: cy + f.y * k + p.y * DEPTH.photos,
        w: f.w * k,
        h: f.h * k,
        rotation: f.rotation * DEG,
        vx: clampV(f.x * radial),
        vy: clampV(f.y * radial),
      });
    },
    [],
    end,
  );
  mt.set(card, { autoAlpha: 0 }, end);
}

export function buildMontage(d: MontageDeps): gsap.core.Timeline {
  const ready = d.photos.map((_, i) => i).filter((i) => d.loader.isReady(i));
  const plan = planMontage(
    ready.map((i) => d.photos[i]),
    {
      viewport: d.renderer.layout(),
      perspective: d.perspective,
      window: MONTAGE.flightsWindow,
      allowShatter: d.allowShatter,
    },
  );
  const mt = gsap.timeline();
  for (const f of plan) {
    const index = ready[f.photo];
    const card = d.parts.cards[index];
    const img = d.parts.cardImgs[index];
    const treatment = treatmentAt(f.treatment);
    gsap.set(card, {
      width: f.w,
      height: f.h,
      xPercent: -50,
      yPercent: -50,
      x: f.x,
      y: f.y,
      z: f.zFrom,
      rotation: f.rotation,
      rotationX: f.rotationX,
      rotationY: f.rotationY,
      autoAlpha: 0,
    });
    gsap.set(img, { filter: toCssFilter(treatment) });
    if (f.kind === 'hero') addHero(mt, card, f, d.perspective);
    else addFlight(mt, card, f);
    if (f.shatter) addShatter(mt, d, card, img, f, treatment);
  }
  return mt;
}

/** If the full-size final photo is not ready, burn the last ready montage photo instead. */
export function ensureFinalPhoto(parts: Parts, loader: PhotoLoader, count: number): void {
  if (loader.finalReady()) return;
  for (let i = count - 1; i >= 0; i--) {
    if (loader.isReady(i)) {
      parts.finalImg.src = parts.cardImgs[i].src;
      return;
    }
  }
  gsap.set(parts.finalCard, { display: 'none' });
}
