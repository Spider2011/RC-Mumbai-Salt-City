import { Cinzel, Noto_Serif_Devanagari } from 'next/font/google';

/**
 * Display faces for the intro, self-hosted by next/font and preloaded on every
 * route (the intro can open on whichever page a visitor lands on).
 * Cormorant Garamond is already loaded by the root layout as --font-cormorant.
 */
export const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-cinzel',
  display: 'swap',
});

export const notoSerifDevanagari = Noto_Serif_Devanagari({
  subsets: ['devanagari'],
  weight: ['500'],
  variable: '--font-noto-deva',
  display: 'swap',
});

/**
 * Resolves once all three faces are ready (or after `timeoutMs`), so no text
 * is ever animated or sampled into particles in a fallback font.
 */
export async function waitForIntroFonts(timeoutMs: number): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;
  const cormorant =
    getComputedStyle(document.documentElement).getPropertyValue('--font-cormorant').trim() || "'Cormorant Garamond', serif";
  const faces: Array<[string, string]> = [
    [`400 32px ${cinzel.style.fontFamily}`, 'THE END'],
    [`600 32px ${cinzel.style.fontFamily}`, 'ROTARACT'],
    [`500 64px ${notoSerifDevanagari.style.fontFamily}`, 'अन्त अस्ति प्रारम्भः'],
    [`500 20px ${cormorant}`, 'THE BEGINNING'],
    [`italic 400 20px ${cormorant}`, 'District'],
  ];
  const loads = faces.map(([font, sample]) => document.fonts.load(font, sample).catch(() => []));
  const timeout = new Promise<void>((resolve) => window.setTimeout(resolve, timeoutMs));
  await Promise.race([Promise.all(loads).then(() => undefined), timeout]);
}
