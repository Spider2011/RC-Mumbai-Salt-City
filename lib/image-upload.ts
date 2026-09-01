'use client';

export interface CompressedImage {
  /** Base64 payload WITHOUT the `data:` prefix — ready for the Apps Script. */
  base64: string;
  type: string;
  name: string;
  /** Full data URL for an inline preview thumbnail. */
  dataUrl: string;
}

/**
 * Reads an image File, downsizes it to `maxSize` on its longest edge, and
 * re-encodes it as a JPEG so the base64 payload stays small enough to POST to
 * the Google Apps Script (which then stores it in Drive). Client-side only.
 */
export async function compressImage(
  file: File,
  maxSize = 1600,
  quality = 0.82
): Promise<CompressedImage> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the image.'));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not load the image.'));
    image.src = dataUrl;
  });

  let { width, height } = img;
  const longest = Math.max(width, height);
  if (longest > maxSize) {
    const scale = maxSize / longest;
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported.');
  ctx.drawImage(img, 0, 0, width, height);

  const outUrl = canvas.toDataURL('image/jpeg', quality);
  const base64 = outUrl.split(',')[1] ?? '';
  const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
  return { base64, type: 'image/jpeg', name, dataUrl: outUrl };
}
