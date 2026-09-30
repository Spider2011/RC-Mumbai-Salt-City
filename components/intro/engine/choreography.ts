import gsap from 'gsap';
import { MONTAGE, SECTIONS, SKIP_VISIBLE_AT } from '@/lib/intro/timing';
import type { StageMeasures } from './measure';
import type { Parts } from './parts';
import type { StageState } from './state';

/**
 * The storyboard as one GSAP timeline. Every transition is a transformation:
 * the ember becomes the pen, the word becomes particles, the particles become
 * the loop, the loop becomes the portal, the last photo becomes gold light,
 * the light becomes dawn, the lockup's first letters become the monogram, and
 * the monogram's light becomes the curtain that opens onto the site.
 */
export interface Choreography {
  parts: Parts;
  state: StageState;
  measures: StageMeasures;
  perspective: number;
  /** Runs at MONTAGE.lockAt and returns the montage built from the photos that loaded. */
  montage: () => gsap.core.Timeline;
  ensureFinal: () => void;
  /** Registers late-created animations with the gsap.context so they revert on unmount. */
  track: (fn: () => void) => void;
}

type TL = gsap.core.Timeline;
const TAU = Math.PI * 2;

/** 0–2s: a single ember in the void, salt dust, the salt-pan texture surfacing. */
function stillness(tl: TL, { parts, state }: Choreography) {
  tl.to(parts.grain, { autoAlpha: 0.08, duration: 1.2, ease: 'sine.out' }, 0)
    .to(state, { dust: 1, duration: 1.8, ease: 'sine.inOut' }, 0.1)
    .to(state, { ember: 1, duration: 1.2, ease: 'expo.out' }, 0.3)
    .fromTo(parts.saltpan, { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1, duration: 2.6, ease: 'expo.out' }, 0.4)
    .to(parts.ui, { autoAlpha: 1, duration: 0.8, ease: 'power2.out' }, SKIP_VISIBLE_AT);
}

/** 2–4.5s: the ember draws the crimson circle; अन्त appears, breathes, cracks and dissolves. */
function theEnd(tl: TL, { parts, state }: Choreography) {
  const t = SECTIONS.end;
  const closed = t + 0.35 + 1.55;
  const shatter = closed + 0.2;
  tl.to(state, { emberLift: 1, duration: 0.45, ease: 'expo.inOut' }, t)
    .to(state, { ringDraw: 1, duration: 1.55, ease: 'power2.inOut' }, t + 0.35)
    .fromTo(parts.endWord, { autoAlpha: 0, y: 18, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.9, ease: 'expo.out' }, t + 0.7)
    .fromTo(parts.endLetters, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.045 }, t + 1.0)
    .to(parts.endWord, { scale: 1.04, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 1 }, t + 1.6)
    .fromTo(parts.endGlow, { autoAlpha: 0 }, { autoAlpha: 0.85, duration: 0.3, ease: 'sine.inOut', yoyo: true, repeat: 1 }, t + 1.6)
    .to(state, { flare: 1, duration: 0.16, ease: 'power2.out' }, closed - 0.02)
    .to(state, { flare: 0, duration: 0.55, ease: 'power2.in' }, closed + 0.16)
    .to(state, { crack: 1, duration: 0.24, ease: 'power3.out' }, closed + 0.02)
    .set(state, { cloudA: 1 }, shatter)
    .to([parts.endWord, ...parts.endLetters], { autoAlpha: 0, duration: 0.08, ease: 'none' }, shatter)
    .to(state, { dissolve: 1, duration: 1.0, ease: 'power2.inOut' }, shatter);
}

/** 4.5–6.5s: particles become the loop, अस्ति appears where it meets itself, the camera flies through. */
function itIs(tl: TL, { parts, state }: Choreography) {
  const t = SECTIONS.is;
  const push = t + 1.35;
  tl.to(state, { swirl: 1, duration: 1.1, ease: 'power3.inOut' }, t - 0.15)
    .to(state, { orbitSpin: TAU * 1.5, duration: 2.1, ease: 'power1.inOut' }, t)
    .to(state, { loop: 1, duration: 0.9, ease: 'sine.inOut' }, t)
    .to(state, { loopSpin: TAU, duration: 1.0, ease: 'power2.inOut' }, t)
    .to(state, { flare: 1, duration: 0.15, ease: 'power2.out' }, t + 0.95)
    .to(state, { flare: 0.3, duration: 0.5, ease: 'power2.inOut' }, t + 1.1)
    .fromTo(parts.isWord, { autoAlpha: 0, y: 14, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'expo.out' }, t + 0.85)
    .fromTo(parts.isLetters, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'expo.out', stagger: 0.06 }, t + 1.0)
    .to(parts.isWord, { scale: 1.05, duration: 0.22, ease: 'sine.inOut', yoyo: true, repeat: 1 }, t + 1.2)
    .to(state, { camera: 14, duration: 0.85, ease: 'expo.in' }, push)
    .to(parts.camera, { scale: 14, duration: 0.85, ease: 'expo.in' }, push)
    .to(parts.camera, { autoAlpha: 0, duration: 0.3, ease: 'power1.in' }, push + 0.38)
    .to(parts.saltpan, { scale: 1.3, autoAlpha: 0.3, duration: 0.85, ease: 'expo.in' }, push)
    .to(state, { portal: 1, duration: 0.55, ease: 'power2.in' }, push)
    .to(state, { portal: 0, duration: 0.45, ease: 'power2.out' }, push + 0.6)
    .to(state, { ember: 0, duration: 0.3 }, push)
    .to(state, { dust: 0, duration: 0.5, ease: 'power2.in' }, push + 0.1)
    .to(state, { cloudA: 0, duration: 0.35 }, push + 0.45)
    .set(state, { ringAlpha: 0, camera: 1, flare: 0, loop: 0 }, push + 1.05);
}

/** 6.5–10s: the tunnel, the montage (built at lock time) and the final photo burning to gold. */
function journey(tl: TL, c: Choreography) {
  const { parts, state, perspective: P } = c;
  tl.to(state, { core: 1, duration: 0.8, ease: 'power2.out' }, MONTAGE.start - 0.25)
    .to(state, { warpAlpha: 1, duration: 0.6, ease: 'power2.out' }, MONTAGE.start - 0.15)
    .fromTo(state, { warp: 0.25 }, { warp: 2.6, duration: 3.1, ease: 'power2.in' }, MONTAGE.start - 0.15)
    .to(state, { tone: 1, duration: 2.6, ease: 'sine.inOut' }, MONTAGE.start + 0.1)
    .call(() => c.track(() => tl.add(c.montage(), MONTAGE.start)), [], MONTAGE.lockAt)
    .call(c.ensureFinal, [], MONTAGE.finalZoomAt - 0.15)
    .fromTo(parts.finalCard, { z: -P * 4 }, { z: P * 0.05, duration: 0.7, ease: 'expo.inOut' }, MONTAGE.finalZoomAt)
    .to(parts.finalCard, { autoAlpha: 1, duration: 0.25, ease: 'power1.out' }, MONTAGE.finalZoomAt)
    .to(state, { core: 0, tone: 1.6, duration: 0.5, ease: 'power2.in' }, MONTAGE.finalZoomAt + 0.25)
    .fromTo(
      parts.finalImg,
      { filter: 'brightness(1) sepia(0) saturate(1) contrast(1)' },
      { filter: 'brightness(2.8) sepia(1) saturate(2.2) contrast(0.8)', duration: 0.5, ease: 'power2.in' },
      MONTAGE.burnAt,
    )
    .to(parts.flood, { autoAlpha: 1, duration: 0.45, ease: 'power2.in' }, MONTAGE.burnAt + 0.05)
    .to(state, { warpAlpha: 0, duration: 0.35 }, MONTAGE.burnAt + 0.25)
    .set(parts.finalCard, { autoAlpha: 0 }, SECTIONS.beginning + 0.06);
}

/** 10–12s: gold light settles into dawn over the sea; प्रारम्भः rises, the lockup forms. */
function beginning(tl: TL, { parts, state, measures }: Choreography) {
  const t = SECTIONS.beginning;
  tl.fromTo(parts.dawn, { autoAlpha: 0, scaleX: 2.6, scaleY: 6 }, { autoAlpha: 1, scaleX: 1, scaleY: 1, duration: 1.3, ease: 'expo.out' }, t - 0.05)
    .to(parts.flood, { autoAlpha: 0, duration: 0.9, ease: 'power2.out' }, t + 0.05)
    .to(state, { sea: 1, duration: 1.1, ease: 'power2.out' }, t + 0.1)
    .to(state, { dust: 0.6, duration: 1.2, ease: 'sine.inOut' }, t + 0.3)
    .to(parts.saltpan, { autoAlpha: 0.6, scale: 1, duration: 1.4, ease: 'expo.out' }, t)
    .set(parts.lkPra, { autoAlpha: 1 }, t + 0.1)
    .fromTo(parts.lkPra, { yPercent: 108 }, { yPercent: 0, duration: 1.0, ease: 'expo.out' }, t + 0.1)
    .fromTo(parts.lkPraMask, { x: measures.praRise.x, y: measures.praRise.y }, { x: 0, y: 0, duration: 0.85, ease: 'expo.inOut' }, t + 0.95)
    // Both reveals must finish before the morph at identity + 0.05, or their tweens would re-show hidden letters.
    .fromTo([parts.lkAnt, parts.lkAsti], { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.75, ease: 'expo.out', stagger: 0.12 }, t + 1.1)
    .fromTo(parts.lkLetters, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: { amount: 0.22 } }, t + 1.15)
    .to([parts.lkAnt, parts.lkAsti, parts.lkPra], { scale: 1.03, duration: 0.25, ease: 'sine.inOut', yoyo: true, repeat: 1, stagger: 0.04 }, t + 1.45);
}

/** 12–13.5s: the lockup keeps only its first letters, which become अ.अ.प्र as the rest turns to gold dust. */
function identity(tl: TL, { parts, state, measures }: Choreography) {
  const t = SECTIONS.identity;
  const morph = t + 0.05;
  tl.to(parts.dawn, { autoAlpha: 0, duration: 0.9, ease: 'power2.inOut' }, t)
    .to(state, { sea: 0, duration: 0.8, ease: 'power2.in' }, t)
    .to(parts.saltpan, { autoAlpha: 1, duration: 1 }, t)
    .set(state, { cloudB: 1 }, morph)
    .set([parts.lkAnt, parts.lkAsti, parts.lkPra, ...parts.lkLetters], { autoAlpha: 0 }, morph)
    .set(parts.monoGlyphs, { autoAlpha: 1 }, morph)
    .to(state, { assemble: 1, duration: 1.1, ease: 'none' }, morph);
  parts.monoGlyphs.forEach((glyph, i) => {
    const flip = measures.monoFlip[i];
    gsap.set(glyph, { transformOrigin: flip.origin });
    tl.fromTo(glyph, { x: flip.x, y: flip.y, scale: flip.scale }, { x: 0, y: 0, scale: 1, duration: 0.85, ease: 'expo.inOut' }, morph + 0.05 + i * 0.06);
  });
  tl.fromTo(parts.monoDots, { autoAlpha: 0, scale: 0, rotation: 0 }, { autoAlpha: 1, scale: 1, rotation: 45, duration: 0.5, ease: 'back.out(3)', stagger: 0.08 }, t + 0.7)
    .fromTo(parts.monoShines, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'power2.out', stagger: 0.05 }, t + 0.85)
    .to(parts.monoShines, { autoAlpha: 0.25, duration: 0.6, ease: 'power2.inOut', stagger: 0.05 }, t + 1.2)
    .to(state, { cloudB: 0, duration: 0.45, ease: 'power2.in' }, t + 1.1)
    .fromTo(parts.clubLetters, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: { amount: 0.4 } }, t + 0.75)
    .fromTo(parts.district, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'expo.out' }, t + 1.05);
}

/** 13.5–15s: a held beat, then cream light blooms from the monogram and parts like a curtain. */
function handoff(tl: TL, { parts, state }: Choreography) {
  const t = SECTIONS.handoff;
  const open = t + 0.95;
  const [left, right] = parts.curtains;
  tl.to(parts.mono, { scale: 1.025, duration: 0.45, ease: 'sine.inOut', yoyo: true, repeat: 1 }, t)
    .to(parts.ui, { autoAlpha: 0, duration: 0.35, ease: 'power1.out' }, t)
    .to(state, { dust: 0, duration: 0.4 }, t + 0.5)
    .fromTo(parts.bloom, { autoAlpha: 0, scale: 0.03 }, { autoAlpha: 1, scale: 4, duration: 0.5, ease: 'expo.in' }, t + 0.45)
    .set([...parts.stage, parts.bloom], { autoAlpha: 0 }, open)
    .set(parts.root, { backgroundColor: 'transparent' }, open)
    .set(parts.curtains, { autoAlpha: 1 }, open)
    .to(left, { xPercent: -100, duration: 0.55, ease: 'expo.inOut' }, open)
    .to(right, { xPercent: 100, duration: 0.55, ease: 'expo.inOut' }, open)
    .to(parts.curtains, { autoAlpha: 0, duration: 0.5, ease: 'power1.in' }, open + 0.05);
}

export function buildMasterTimeline(c: Choreography): TL {
  const tl = gsap.timeline({ paused: true });
  for (const section of [stillness, theEnd, itIs, journey, beginning, identity, handoff]) section(tl, c);
  return tl;
}
