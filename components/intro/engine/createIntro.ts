import gsap from 'gsap';
import type { MontagePhoto } from '@/lib/intro/plan';
import { SECTIONS } from '@/lib/intro/timing';
import { buildMasterTimeline } from './choreography';
import { measureStage } from './measure';
import { buildMontage, ensureFinalPhoto } from './montage';
import { CREAM, CRIMSON, GOLD, GOLD_LIGHT } from './palette';
import { queryParts, type Parts } from './parts';
import type { PhotoLoader } from './photos';
import type { DeviceProfile } from './profile';
import { createRenderer } from './renderer';
import { createIntroSound } from './sound';
import { createSprites } from './sprites';
import { computeLayout, createStageState, DEPTH, type Parallax } from './state';
import { createAssembleCloud } from './systems/assembleCloud';
import { createDissolveCloud } from './systems/dissolveCloud';

export interface IntroController {
  skip(): void;
  setSound(on: boolean): void;
  destroy(): void;
}

export interface IntroOptions {
  root: HTMLElement;
  photos: readonly MontagePhoto[];
  /** Started by the component on mount, so photos load while fonts and this engine download. */
  loader: PhotoLoader;
  profile: DeviceProfile;
  onComplete: () => void;
}

/** Where Skip lands: just before the hand-off, so the identity frame settles first. */
const SKIP_TO = SECTIONS.handoff - 0.15;
/** Two full-screen canvases: cap their resolution at 4K worth of pixels each (5K displays). */
const MAX_CANVAS_PIXELS = 3840 * 2160;

function parallaxSetter(parts: Parts) {
  const layers = [
    [parts.saltpan, DEPTH.saltpan],
    [parts.photosLayer, DEPTH.photos],
    [parts.typeLayer, DEPTH.type],
  ] as const;
  const setters = layers.map(([el, depth]) => ({
    x: gsap.quickSetter(el, 'x', 'px'),
    y: gsap.quickSetter(el, 'y', 'px'),
    depth,
  }));
  return (p: Readonly<Parallax>) => {
    for (const s of setters) {
      s.x(p.x * s.depth);
      s.y(p.y * s.depth);
    }
  };
}

/** Measures the stage and builds the canvas renderer (no GSAP tweens involved). */
function buildRenderer(parts: Parts, profile: DeviceProfile) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const dpr = Math.min(profile.dpr, Math.sqrt(MAX_CANVAS_PIXELS / (width * height)));
  const base = computeLayout(width, height, dpr);
  const perspective = Math.round(Math.max(width, height) * 0.9);
  parts.root.style.setProperty('--persp', `${perspective}px`);

  const { measures, clouds } = measureStage(parts, base, profile);
  const layout = { ...base, horizonY: measures.horizonY };
  parts.root.style.setProperty('--horizon-y', `${measures.horizonY}px`);
  parts.root.style.setProperty('--bloom-x', `${measures.monoCenter.x}px`);
  parts.root.style.setProperty('--bloom-y', `${measures.monoCenter.y}px`);

  const state = createStageState();
  const sprites = createSprites(GOLD, CREAM, CRIMSON, GOLD_LIGHT);
  const renderer = createRenderer({ bg: parts.bg, fg: parts.fg, state, layout, profile, sprites, onParallax: parallaxSetter(parts) });
  try {
    renderer.setDissolve(createDissolveCloud(clouds.dissolve, sprites, { x: layout.cx, y: layout.cy }));
    renderer.setAssemble(
      createAssembleCloud({
        sources: clouds.assembleSources,
        targets: clouds.assembleTargets,
        ambient: Math.round(260 * profile.particleScale),
        viewport: layout,
        sprites,
      }),
    );
  } catch (err) {
    renderer.destroy();
    throw err;
  }
  return { renderer, state, measures, base, perspective };
}

/**
 * Boots the cinematic intro inside `root`. All GSAP work lives in one
 * gsap.context and is reverted by destroy(); the component unmounts the DOM
 * through React state only, so nothing here ever removes a node React owns.
 * Throws (after cleaning up) if the stage cannot start.
 */
export function createIntro(o: IntroOptions): IntroController {
  const parts = queryParts(o.root);
  const { renderer, state, measures, base, perspective } = buildRenderer(parts, o.profile);
  const sound = createIntroSound();
  const ctx = gsap.context(() => {}, o.root);
  let tl: gsap.core.Timeline | null = null;
  let skipping = false;
  let finished = false;
  let resizeFrame = 0;

  function finish() {
    if (finished) return;
    finished = true;
    sound.dispose();
    o.onComplete();
  }

  try {
    ctx.add(() => {
      tl = buildMasterTimeline({
        parts,
        state,
        measures,
        perspective,
        montage: () =>
          buildMontage({ parts, photos: o.photos, loader: o.loader, renderer, perspective, allowShatter: o.profile.allowShatter }),
        ensureFinal: () => ensureFinalPhoto(parts, o.loader, o.photos.length),
        track: (fn) => ctx.add(fn),
      });
      tl.eventCallback('onComplete', finish);
      tl.play(0);
    });
  } catch (err) {
    renderer.destroy();
    sound.dispose();
    ctx.revert();
    throw err;
  }

  /** Fade to void, jump to the identity frame, fade back: never a hard cut. */
  function skip() {
    const master = tl;
    if (!master || skipping || finished || master.time() >= SKIP_TO) return;
    skipping = true;
    ctx.add(() => {
      gsap
        .timeline()
        .to(parts.veil, { autoAlpha: 1, duration: 0.35, ease: 'power2.in' })
        .call(() => {
          renderer.clearTransient();
          // The film kept playing under the veil; never seek backwards.
          if (master.time() < SKIP_TO) {
            master.seek(SKIP_TO);
            sound.jump(SKIP_TO);
          }
        })
        .to(parts.veil, { autoAlpha: 0, duration: 0.55, ease: 'power2.out' });
    });
  }

  function onResize() {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setLayout({ ...renderer.layout(), width: w, height: h, cx: w / 2, cy: h / 2 });
      const rotated = h >= w !== base.portrait;
      const reshaped = Math.abs(w - base.width) / base.width > 0.12 || Math.abs(h - base.height) / base.height > 0.2;
      // Measured choreography would be stale; land on the CSS-laid-out identity frame instead.
      if (rotated || reshaped) skip();
    });
  }
  window.addEventListener('resize', onResize);

  return {
    skip,
    setSound(on) {
      if (on) sound.enable(tl?.time() ?? 0);
      else sound.disable();
    },
    destroy() {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(resizeFrame);
      renderer.destroy();
      sound.dispose();
      ctx.revert();
      // Parallax is written with quickSetters (not recorded by the context).
      gsap.set([parts.saltpan, parts.photosLayer, parts.typeLayer], { clearProps: 'transform' });
    },
  };
}
