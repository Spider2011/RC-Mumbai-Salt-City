/**
 * The DOM the choreography animates. IntroScene renders elements tagged with
 * `data-part`; the engine looks them up here once, scoped to the intro root.
 * React owns these nodes: the engine only ever writes styles to them.
 */
export interface Parts {
  root: HTMLElement;
  saltpan: HTMLElement;
  bg: HTMLCanvasElement;
  fg: HTMLCanvasElement;
  photosLayer: HTMLElement;
  typeLayer: HTMLElement;
  camera: HTMLElement;
  endWord: HTMLElement;
  endGlow: HTMLElement;
  endLetters: HTMLElement[];
  isWord: HTMLElement;
  isLetters: HTMLElement[];
  cards: HTMLElement[];
  cardImgs: HTMLImageElement[];
  finalCard: HTMLElement;
  finalImg: HTMLImageElement;
  flood: HTMLElement;
  dawn: HTMLElement;
  lkAnt: HTMLElement;
  lkAsti: HTMLElement;
  lkPraMask: HTMLElement;
  lkPra: HTMLElement;
  lkLetters: HTMLElement[];
  mono: HTMLElement;
  monoGlyphs: HTMLElement[];
  monoBases: HTMLElement[];
  monoShines: HTMLElement[];
  monoDots: HTMLElement[];
  clubLetters: HTMLElement[];
  district: HTMLElement;
  grain: HTMLElement;
  bloom: HTMLElement;
  curtains: HTMLElement[];
  veil: HTMLElement;
  ui: HTMLElement;
  /** Everything that must disappear under the cream bloom before the curtains part. */
  stage: HTMLElement[];
}

export function queryParts(root: HTMLElement): Parts {
  const one = <T extends HTMLElement = HTMLElement>(name: string): T => {
    const el = root.querySelector<T>(`[data-part="${name}"]`);
    if (!el) throw new Error(`Intro element missing: ${name}`);
    return el;
  };
  const all = <T extends HTMLElement = HTMLElement>(name: string): T[] =>
    Array.from(root.querySelectorAll<T>(`[data-part="${name}"]`));

  const parts = {
    root,
    saltpan: one('saltpan'),
    bg: one<HTMLCanvasElement>('bg'),
    fg: one<HTMLCanvasElement>('fg'),
    photosLayer: one('photos-layer'),
    typeLayer: one('type-layer'),
    camera: one('camera'),
    endWord: one('end-word'),
    endGlow: one('end-glow'),
    endLetters: all('end-letter'),
    isWord: one('is-word'),
    isLetters: all('is-letter'),
    cards: all('card'),
    cardImgs: all<HTMLImageElement>('card-img'),
    finalCard: one('final-card'),
    finalImg: one<HTMLImageElement>('final-img'),
    flood: one('flood'),
    dawn: one('dawn'),
    lkAnt: one('lk-ant'),
    lkAsti: one('lk-asti'),
    lkPraMask: one('lk-pra-mask'),
    lkPra: one('lk-pra'),
    lkLetters: all('lk-letter'),
    mono: one('mono'),
    monoGlyphs: all('mono-glyph'),
    monoBases: all('mono-base'),
    monoShines: all('mono-shine'),
    monoDots: all('mono-dot'),
    clubLetters: all('club-letter'),
    district: one('district'),
    grain: one('grain'),
    bloom: one('bloom'),
    curtains: all('curtain'),
    veil: one('veil'),
    ui: one('ui'),
  };
  return {
    ...parts,
    stage: [parts.saltpan, parts.bg, parts.fg, parts.photosLayer, parts.flood, parts.dawn, parts.typeLayer, parts.grain],
  };
}
