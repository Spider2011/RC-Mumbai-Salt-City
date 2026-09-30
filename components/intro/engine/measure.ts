import type { Parts } from './parts';
import type { DeviceProfile } from './profile';
import type { StageLayout } from './state';
import { concatPoints, entryFor, sampleRect, sampleText, type Points } from './textSampling';

/**
 * Reads the laid-out (still invisible) DOM once, before any animation writes a
 * transform, and derives everything the choreography needs: where प्रारम्भः
 * rises, where the horizon sits, how each monogram initial maps back onto its
 * word in the lockup, and the particle clouds for both text transformations.
 */
export interface Flip {
  x: number;
  y: number;
  scale: number;
  origin: string;
}

export interface StageMeasures {
  horizonY: number;
  /** Offset that parks प्रारम्भः at centre stage while it rises. */
  praRise: { x: number; y: number };
  /** Per monogram initial: the transform that puts it on its word's first akshara. */
  monoFlip: Flip[];
  monoCenter: { x: number; y: number };
}

export interface MeasuredClouds {
  dissolve: Points;
  assembleSources: Points;
  assembleTargets: Points;
}

/** The first akshara of each lockup word becomes a letter of the monogram अ.अ.प्र */
const INITIALS = ['अ', 'अ', 'प्र'] as const;

export function measureStage(parts: Parts, layout: StageLayout, profile: DeviceProfile) {
  const step = profile.mobile ? 3 : 2;
  const budget = (n: number) => Math.max(200, Math.round(n * profile.particleScale));

  const dissolve = sampleText([entryFor(parts.endWord), ...parts.endLetters.map((l) => entryFor(l))], {
    step,
    max: budget(2400),
    seed: 3,
  });

  const praRect = parts.lkPra.getBoundingClientRect();
  const maskRect = parts.lkPraMask.getBoundingClientRect();
  const praRise = layout.portrait ? { x: 0, y: 0 } : { x: layout.cx - (praRect.left + praRect.width / 2), y: 0 };

  const words = [parts.lkAnt, parts.lkAsti, parts.lkPra].map((el) => entryFor(el));
  const initials = words.map((w, i) => ({ ...w, text: INITIALS[i] }));
  const glyphs = parts.monoBases.map((el) => entryFor(el));
  const scale = parseFloat(getComputedStyle(parts.lkPra).fontSize) / parseFloat(getComputedStyle(parts.monoBases[0]).fontSize);
  const monoFlip = glyphs.map((g, i): Flip => {
    const box = parts.monoGlyphs[i].getBoundingClientRect();
    return {
      x: initials[i].x - g.x,
      y: initials[i].baseline - g.baseline,
      scale,
      origin: `0px ${g.baseline - box.top}px`,
    };
  });
  const monoRect = parts.mono.getBoundingClientRect();

  const rest = sampleText(words, { step, max: budget(1500), erase: initials, seed: 7 });
  const latin = sampleText(
    parts.lkLetters.map((l) => entryFor(l)),
    { step: Math.max(1, step - 1), max: budget(500), seed: 8 },
  );
  const targets = concatPoints(
    sampleText(glyphs, { step, max: budget(1800), seed: 9 }),
    ...parts.monoDots.map((d) => sampleRect(d.getBoundingClientRect(), 2)),
  );

  const measures: StageMeasures = {
    horizonY: maskRect.bottom,
    praRise,
    monoFlip,
    monoCenter: { x: monoRect.left + monoRect.width / 2, y: monoRect.top + monoRect.height / 2 },
  };
  const clouds: MeasuredClouds = {
    dissolve,
    assembleSources: concatPoints(rest, latin),
    assembleTargets: targets,
  };
  return { measures, clouds };
}
