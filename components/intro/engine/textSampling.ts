/**
 * Turns DOM text into particle positions. We render the same string, in the
 * same (already loaded) font, at the same baseline into an offscreen canvas and
 * sample its pixels, so a particle cloud can replace the live type seamlessly.
 */
export interface TextEntry {
  text: string;
  font: string;
  x: number; // left edge, viewport px
  baseline: number; // viewport px
}

export interface Points {
  xs: Float32Array;
  ys: Float32Array;
  n: number;
}

let scratch: CanvasRenderingContext2D | null = null;
function measureCtx(): CanvasRenderingContext2D {
  if (!scratch) {
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) throw new Error('2D canvas unavailable');
    scratch = ctx;
  }
  return scratch;
}

export function fontOf(el: Element): string {
  const cs = getComputedStyle(el);
  return `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
}

function fontMetrics(font: string) {
  const ctx = measureCtx();
  ctx.font = font;
  const m = ctx.measureText('अन्तHg');
  return {
    ascent: m.fontBoundingBoxAscent ?? m.actualBoundingBoxAscent,
    descent: m.fontBoundingBoxDescent ?? m.actualBoundingBoxDescent,
  };
}

export function textWidth(text: string, font: string): number {
  const ctx = measureCtx();
  ctx.font = font;
  return ctx.measureText(text).width;
}

/**
 * Entry for a single-line inline-block whose box height equals its
 * line-height. The browser centres the font's content area in the line box,
 * which gives us the baseline.
 */
export function entryFor(el: HTMLElement, text = el.textContent ?? ''): TextEntry {
  const rect = el.getBoundingClientRect();
  const font = fontOf(el);
  const { ascent, descent } = fontMetrics(font);
  return { text, font, x: rect.left, baseline: rect.top + (rect.height - (ascent + descent)) / 2 + ascent };
}

interface SampleOptions {
  step: number;
  max: number;
  /** Glyphs to cut out of the sampled text (e.g. the initials that stay behind). */
  erase?: readonly TextEntry[];
  seed?: number;
}

export function sampleText(entries: readonly TextEntry[], { step, max, erase = [], seed = 1 }: SampleOptions): Points {
  const empty: Points = { xs: new Float32Array(0), ys: new Float32Array(0), n: 0 };
  if (entries.length === 0) return empty;
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const e of entries) {
    const { ascent, descent } = fontMetrics(e.font);
    left = Math.min(left, e.x - 4);
    right = Math.max(right, e.x + textWidth(e.text, e.font) + 4);
    top = Math.min(top, e.baseline - ascent * 1.25);
    bottom = Math.max(bottom, e.baseline + descent * 1.25);
  }
  const w = Math.min(4096, Math.ceil(right - left));
  const h = Math.min(2048, Math.ceil(bottom - top));
  if (w <= 0 || h <= 0) return empty;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return empty;
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#fff';
  for (const e of entries) {
    ctx.font = e.font;
    ctx.fillText(e.text, e.x - left, e.baseline - top);
  }
  if (erase.length) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 2.5;
    for (const e of erase) {
      ctx.font = e.font;
      ctx.fillText(e.text, e.x - left, e.baseline - top);
      ctx.strokeText(e.text, e.x - left, e.baseline - top);
    }
  }

  const data = ctx.getImageData(0, 0, w, h).data;
  const xs: number[] = [];
  const ys: number[] = [];
  let r = seed >>> 0;
  const jitter = () => {
    r = (Math.imul(r, 1664525) + 1013904223) >>> 0;
    return (r / 4294967296 - 0.5) * step * 0.8;
  };
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      if (data[(y * w + x) * 4 + 3] > 110) {
        xs.push(x + left + jitter());
        ys.push(y + top + jitter());
      }
    }
  }
  const stride = Math.max(1, Math.ceil(xs.length / max));
  const n = Math.ceil(xs.length / stride);
  const out: Points = { xs: new Float32Array(n), ys: new Float32Array(n), n };
  for (let i = 0, j = 0; i < xs.length; i += stride, j++) {
    out.xs[j] = xs[i];
    out.ys[j] = ys[i];
  }
  return out;
}

/** Points scattered over a rectangle (used for the monogram's crystal dots). */
export function sampleRect(rect: DOMRect, step: number): Points {
  const xs: number[] = [];
  const ys: number[] = [];
  for (let y = rect.top; y <= rect.bottom; y += step) {
    for (let x = rect.left; x <= rect.right; x += step) {
      xs.push(x);
      ys.push(y);
    }
  }
  return { xs: Float32Array.from(xs), ys: Float32Array.from(ys), n: xs.length };
}

export function concatPoints(...sets: Points[]): Points {
  const n = sets.reduce((s, p) => s + p.n, 0);
  const out: Points = { xs: new Float32Array(n), ys: new Float32Array(n), n };
  let o = 0;
  for (const p of sets) {
    out.xs.set(p.xs.subarray(0, p.n), o);
    out.ys.set(p.ys.subarray(0, p.n), o);
    o += p.n;
  }
  return out;
}
