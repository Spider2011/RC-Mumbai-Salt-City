import { applyTreatment, type Treatment } from '@/lib/intro/filters';
import type { MontagePhoto } from '@/lib/intro/plan';

/**
 * Photo loading for the montage. Loading starts the moment the intro mounts
 * and runs through the first 6.5s (which need no photos). The montage takes
 * whatever has decoded by MONTAGE.lockAt and skips the rest, so a slow
 * network shortens the montage instead of stalling the film.
 */
export interface PhotoLoader {
  isReady(index: number): boolean;
  finalReady(): boolean;
  dispose(): void;
}

interface LoadOptions {
  photos: readonly MontagePhoto[];
  imgs: readonly HTMLImageElement[];
  finalImg: HTMLImageElement;
  finalSrc: string;
  /** Use the 800px file for this photo (hero moments, large sparse cards). */
  wantsMedium: (photo: MontagePhoto) => boolean;
  concurrency: number;
}

interface Job {
  el: HTMLImageElement;
  src: string;
  index: number; // -1 = the final photo
}

export function loadPhotos(o: LoadOptions): PhotoLoader {
  const ready = new Set<number>();
  let finalDone = false;
  let disposed = false;
  // The final photo first: it is the climax and the only full-size file.
  const jobs: Job[] = [
    { el: o.finalImg, src: o.finalSrc, index: -1 },
    ...o.photos.map((p, i) => ({ el: o.imgs[i], src: o.wantsMedium(p) ? p.md : p.sm, index: i })),
  ].filter((j) => j.el);
  let next = 0;

  async function worker() {
    while (!disposed && next < jobs.length) {
      const job = jobs[next++];
      try {
        job.el.src = job.src; // React never sets src on these, so it will not fight us
        await job.el.decode();
        if (disposed) return;
        if (job.index === -1) finalDone = true;
        else ready.add(job.index);
      } catch {
        // A photo that fails to load or decode is simply left out of the montage.
      }
    }
  }
  for (let k = 0; k < o.concurrency; k++) void worker();

  return {
    isReady: (i) => ready.has(i),
    finalReady: () => finalDone,
    dispose() {
      disposed = true;
    },
  };
}

/**
 * A cover-cropped, colour-treated copy of a photo for the canvas shards,
 * matching the DOM card's CSS filter exactly (see lib/intro/filters.ts).
 */
export function tintedCrop(img: HTMLImageElement, treatment: Treatment, aspectW: number, aspectH: number): HTMLCanvasElement {
  const w = Math.max(1, Math.min(360, Math.round(aspectW)));
  const h = Math.max(1, Math.round((w * aspectH) / aspectW));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx || !img.naturalWidth) return canvas;
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * s;
  const dh = img.naturalHeight * s;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  const pixels = ctx.getImageData(0, 0, w, h);
  ctx.putImageData(new ImageData(applyTreatment(pixels.data, treatment), w, h), 0, 0);
  return canvas;
}
