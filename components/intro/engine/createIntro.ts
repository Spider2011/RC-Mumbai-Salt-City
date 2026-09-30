import gsap from 'gsap';
import { DENSE_THRESHOLD, type MontagePhoto } from '@/lib/intro/plan';
import { SECTIONS } from '@/lib/intro/timing';
import { buildMasterTimeline } from './choreography';
import { measureStage } from './measure';
import { buildMontage, ensureFinalPhoto } from './montage';
import { CREAM, CRIMSON, GOLD, GOLD_LIGHT } from './palette';
import { queryParts, type Parts } from './parts';
import { loadPhotos } from './photos';
import type { DeviceProfile } from './profile';
import { createRenderer, type Renderer } from './renderer';
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
  finalSrc: string;
  profile: DeviceProfile;
  onComplete: () => void;
}

/** Above this many device pixels on the long side, a card gets the 800px file. */
const MEDIUM_THRESHOLD_PX = 560;
/** Where Skip lands: just before the hand-off, so the identity frame settles first. */
const SKIP_TO = SECTIONS.handoff - 0.15;

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

/**
 * Boots the cinematic intro inside `root`. All GSAP work lives in one
 * gsap.context and is reverted by destroy(); the component unmounts the DOM
 * through React state only, so nothing here ever removes a node React owns.
 */
export function createIntro(o: IntroOptions): IntroController {
  const parts = queryParts(o.root);
  const state = createStageState();
  const base = computeLayout(window.innerWidth, window.innerHeight, o.profile.dpr);
  const perspective = Math.round(Math.max(base.width, base.height) * 0.9);
  o.root.style.setProperty('--ring-r', `${base.ringR}px`);
  o.root.style.setProperty('--persp', `${perspective}px`);

  const sparseCard = Math.min(base.width, base.height) * (base.portrait ? 0.56 : 0.46) * Math.min(o.profile.dpr, 2);
  const loader = loadPhotos({
    photos: o.photos,
    imgs: parts.cardImgs,
    finalImg: parts.finalImg,
    finalSrc: o.finalSrc,
    wantsMedium: (p) => p.hero || (o.photos.length < DENSE_THRESHOLD && sparseCard > MEDIUM_THRESHOLD_PX),
    concurrency: o.profile.mobile ? 4 : 6,
  });
  const sound = createIntroSound();
  const ctx = gsap.context(() => {}, o.root);
  let renderer: Renderer | null = null;
  let tl: gsap.core.Timeline | null = null;
  let skipping = false;
  let finished = false;

  function finish() {
    if (finished) return;
    finished = true;
    sound.dispose();
    o.onComplete();
  }

  ctx.add(() => {
    const { measures, clouds } = measureStage(parts, base, o.profile);
    const layout = { ...base, horizonY: measures.horizonY };
    o.root.style.setProperty('--horizon-y', `${measures.horizonY}px`);
    o.root.style.setProperty('--bloom-x', `${measures.monoCenter.x}px`);
    o.root.style.setProperty('--bloom-y', `${measures.monoCenter.y}px`);

    const sprites = createSprites(GOLD, CREAM, CRIMSON, GOLD_LIGHT);
    const r = createRenderer({ bg: parts.bg, fg: parts.fg, state, layout, profile: o.profile, sprites, onParallax: parallaxSetter(parts) });
    r.setDissolve(createDissolveCloud(clouds.dissolve, sprites, { x: layout.cx, y: layout.cy }));
    r.setAssemble(
      createAssembleCloud({
        sources: clouds.assembleSources,
        targets: clouds.assembleTargets,
        ambient: Math.round(260 * o.profile.particleScale),
        viewport: layout,
        sprites,
      }),
    );
    renderer = r;

    tl = buildMasterTimeline({
      parts,
      state,
      measures,
      perspective,
      montage: () => buildMontage({ parts, photos: o.photos, loader, renderer: r, perspective, allowShatter: o.profile.allowShatter }),
      ensureFinal: () => ensureFinalPhoto(parts, loader, o.photos.length),
      track: (fn) => ctx.add(fn),
    });
    tl.eventCallback('onComplete', finish);
    tl.play(0);
  });

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
          renderer?.clearTransient();
          master.seek(SKIP_TO);
          sound.jump(SKIP_TO);
        })
        .to(parts.veil, { autoAlpha: 0, duration: 0.55, ease: 'power2.out' });
    });
  }

  function onResize() {
    if (!renderer) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setLayout({ ...renderer.layout(), width: w, height: h, cx: w / 2, cy: h / 2 });
    const rotated = h >= w !== base.portrait;
    const reshaped = Math.abs(w - base.width) / base.width > 0.12 || Math.abs(h - base.height) / base.height > 0.2;
    // Measured choreography would be stale; land on the CSS-laid-out identity frame instead.
    if (rotated || reshaped) skip();
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
      loader.dispose();
      renderer?.destroy();
      sound.dispose();
      ctx.revert();
      // Parallax is written with quickSetters (not recorded by the context).
      gsap.set([parts.saltpan, parts.photosLayer, parts.typeLayer], { clearProps: 'transform' });
    },
  };
}
