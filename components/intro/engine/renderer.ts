import gsap from 'gsap';
import type { DeviceProfile } from './profile';
import type { SpriteSet } from './sprites';
import type { Frame, Parallax, StageLayout, StageState } from './state';
import { createDust } from './systems/dust';
import { createEmber } from './systems/ember';
import { createRing } from './systems/ring';
import { createSea } from './systems/sea';
import { createShards, type ShatterSpec } from './systems/shards';
import { createWarp } from './systems/warp';
import type { AssembleCloud } from './systems/assembleCloud';
import type { DissolveCloud } from './systems/dissolveCloud';

/**
 * Owns the two full-screen canvases. The back canvas sits behind the type and
 * photos (deep dust, the tunnel, the ring, the sea); the front canvas sits
 * above them (text particles, the ember, shards, near dust). Both redraw on
 * GSAP's ticker, right after the timeline updates the stage state.
 */
export interface Renderer {
  layout(): StageLayout;
  setLayout(layout: StageLayout): void;
  setDissolve(cloud: DissolveCloud): void;
  setAssemble(cloud: AssembleCloud): void;
  shatter(spec: ShatterSpec): void;
  parallax(): Readonly<Parallax>;
  clearTransient(): void;
  destroy(): void;
}

interface RendererOptions {
  bg: HTMLCanvasElement;
  fg: HTMLCanvasElement;
  state: StageState;
  layout: StageLayout;
  profile: DeviceProfile;
  sprites: SpriteSet;
  onParallax: (p: Readonly<Parallax>) => void;
}

const POINTER_RANGE = { x: 16, y: 10 };

function context(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas unavailable');
  return ctx;
}

export function createRenderer(o: RendererOptions): Renderer {
  const back = context(o.bg);
  const front = context(o.fg);
  const budget = (n: number) => Math.max(24, Math.round(n * o.profile.particleScale));
  const dust = createDust(budget(240), o.sprites);
  const warp = createWarp(budget(320), o.sprites);
  const ring = createRing(o.sprites);
  const sea = createSea();
  const ember = createEmber(o.sprites);
  const shards = createShards(o.sprites);
  let dissolve: DissolveCloud | null = null;
  let assemble: AssembleCloud | null = null;
  let layout = o.layout;
  let time = 0;
  const parallax: Parallax = { x: 0, y: 0 };
  const target: Parallax = { x: 0, y: 0 };

  function resize(l: StageLayout) {
    for (const c of [o.bg, o.fg]) {
      c.width = Math.round(l.width * l.dpr);
      c.height = Math.round(l.height * l.dpr);
    }
  }
  resize(layout);

  const onPointer = (e: PointerEvent) => {
    target.x = (e.clientX / layout.width - 0.5) * 2 * POINTER_RANGE.x;
    target.y = (e.clientY / layout.height - 0.5) * 2 * POINTER_RANGE.y;
  };
  if (o.profile.finePointer) window.addEventListener('pointermove', onPointer, { passive: true });

  function clear(ctx: CanvasRenderingContext2D) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.setTransform(layout.dpr, 0, 0, layout.dpr, 0, 0);
  }

  function tick(_time: number, deltaMs: number) {
    const dt = Math.min(deltaMs / 1000, 0.05);
    time += dt;
    // Slow camera drift everywhere, plus pointer parallax on mouse devices.
    const ease = 1 - Math.exp(-dt * 3);
    parallax.x += (target.x + Math.sin(time * 0.21) * 6 - parallax.x) * ease;
    parallax.y += (target.y + Math.cos(time * 0.17) * 4 - parallax.y) * ease;
    o.onParallax(parallax);

    const f: Frame = { state: o.state, layout, time, dt, parallax };
    clear(back);
    dust.draw(back, f, false);
    warp.draw(back, f);
    ring.draw(back, f);
    sea.draw(back, f);
    clear(front);
    dissolve?.draw(front, f);
    assemble?.draw(front, f);
    ember.draw(front, f);
    shards.draw(front, f);
    dust.draw(front, f, true);
  }
  gsap.ticker.add(tick);

  return {
    layout: () => layout,
    setLayout(l) {
      layout = l;
      resize(l);
    },
    setDissolve(cloud) {
      dissolve = cloud;
    },
    setAssemble(cloud) {
      assemble = cloud;
    },
    shatter: (spec) => shards.spawn(spec),
    parallax: () => parallax,
    clearTransient() {
      shards.clear();
      ember.clear();
    },
    destroy() {
      gsap.ticker.remove(tick);
      window.removeEventListener('pointermove', onPointer);
      for (const ctx of [back, front]) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }
    },
  };
}
