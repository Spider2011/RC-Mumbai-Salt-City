import { memo } from 'react';
import type { MontagePhoto } from '@/lib/intro/plan';
import { SALT_PAN_VIEWBOX, saltPanPath } from './saltpan';
import styles from './intro.module.css';

/**
 * Pure markup for the cinematic intro. Every animated element carries a
 * `data-part` the engine looks up; elements start hidden (`ghost`) so nothing
 * flashes before the timeline takes over. Layer order = stacking order.
 */
const SALT_PANS = saltPanPath();

const ghost = (...classes: string[]) => [...classes, styles.ghost].join(' ');

interface LettersProps {
  text: string;
  part: string;
}

/** Latin text split into letters (for staggers and particle sampling), kept in words so it wraps. */
function Letters({ text, part }: LettersProps) {
  return (
    <>
      {text.split(' ').map((word, w) => (
        <span key={w}>
          {w > 0 && ' '}
          <span className={styles.word}>
            {Array.from(word).map((ch, i) => (
              <span key={i} data-part={part} className={ghost(styles.letter)}>
                {ch}
              </span>
            ))}
          </span>
        </span>
      ))}
    </>
  );
}

function MonoGlyph({ glyph }: { glyph: string }) {
  return (
    <span data-part="mono-glyph" className={ghost(styles.monoGlyph)}>
      <span data-part="mono-base" className={`${styles.monoBase} ${styles.gold}`}>
        {glyph}
      </span>
      <span data-part="mono-shine" className={ghost(styles.monoShine)} aria-hidden>
        {glyph}
      </span>
    </span>
  );
}

const MonoDot = () => <span data-part="mono-dot" className={ghost(styles.monoDot)} aria-hidden />;

interface IntroSceneProps {
  photos: readonly MontagePhoto[];
}

export const IntroScene = memo(function IntroScene({ photos }: IntroSceneProps) {
  return (
    <>
      <div data-part="saltpan" className={ghost(styles.saltpan)} aria-hidden>
        <svg viewBox={`0 0 ${SALT_PAN_VIEWBOX.width} ${SALT_PAN_VIEWBOX.height}`} preserveAspectRatio="xMidYMid slice">
          <path d={SALT_PANS} />
        </svg>
      </div>
      <canvas data-part="bg" className={styles.canvas} aria-hidden />

      <div data-part="photos-layer" className={styles.layer} aria-hidden>
        <div className={styles.scene}>
          <div className={styles.world}>
            {photos.map((p) => (
              <div key={p.id} data-part="card" className={ghost(styles.card)}>
                {/* src is assigned by the engine's loader, in priority order */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img data-part="card-img" alt="" decoding="async" draggable={false} className={styles.cardImg} />
              </div>
            ))}
            <div data-part="final-card" className={ghost(styles.finalCard)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img data-part="final-img" alt="" decoding="async" draggable={false} className={styles.finalImg} />
            </div>
          </div>
        </div>

        <div data-part="camera" className={styles.camera}>
          <div className={styles.endGroup}>
            <span className={styles.endWordWrap}>
              <span data-part="end-glow" className={ghost(styles.endGlow)} lang="sa">
                अन्त
              </span>
              <span data-part="end-word" className={ghost(styles.endWord)} lang="sa">
                अन्त
              </span>
            </span>
            <span className={styles.endLatin}>
              <Letters text="THE END" part="end-letter" />
            </span>
          </div>
          <div className={styles.isGroup}>
            <span data-part="is-word" className={ghost(styles.isWord, styles.gold)} lang="sa">
              अस्ति
            </span>
            <span className={styles.isLatin}>
              <Letters text="IS" part="is-letter" />
            </span>
          </div>
        </div>
      </div>

      <div data-part="flood" className={ghost(styles.flood)} aria-hidden />
      <div data-part="dawn" className={ghost(styles.dawn)} aria-hidden />

      <div data-part="type-layer" className={styles.layer} aria-hidden>
        <div className={styles.lockup}>
          <div className={styles.lockupWords} lang="sa">
            <span data-part="lk-ant" className={ghost(styles.lkWord, styles.gold)}>
              अन्त
            </span>
            <span data-part="lk-asti" className={ghost(styles.lkWord, styles.gold)}>
              अस्ति
            </span>
            <span data-part="lk-pra-mask" className={styles.lkMask}>
              <span data-part="lk-pra" className={ghost(styles.lkWord, styles.gold)}>
                प्रारम्भः
              </span>
            </span>
          </div>
          <p className={styles.lkLatin}>
            <Letters text="THE END IS THE BEGINNING" part="lk-letter" />
          </p>
        </div>

        <div className={styles.identity}>
          <div data-part="mono" className={styles.mono} lang="sa">
            <MonoGlyph glyph="अ" />
            <MonoDot />
            <MonoGlyph glyph="अ" />
            <MonoDot />
            <MonoGlyph glyph="प्र" />
          </div>
          <p className={styles.club}>
            <Letters text="ROTARACT CLUB OF MUMBAI SALT CITY" part="club-letter" />
          </p>
          <p data-part="district" className={ghost(styles.district)}>
            District 3141 <span className={styles.sep}>·</span> Rotary Year 2026–27
          </p>
        </div>
      </div>

      <canvas data-part="fg" className={styles.canvas} aria-hidden />
      <div data-part="grain" className={ghost(styles.grain)} aria-hidden />
      <div className={styles.vignette} aria-hidden />
      <div data-part="bloom" className={ghost(styles.bloom)} aria-hidden />
      <div data-part="curtain" className={ghost(styles.curtain, styles.curtainLeft)} aria-hidden />
      <div data-part="curtain" className={ghost(styles.curtain, styles.curtainRight)} aria-hidden />
      <div data-part="veil" className={ghost(styles.veil)} aria-hidden />
    </>
  );
});

/** prefers-reduced-motion: a still title card, faded in and out over two seconds. */
export function IntroStatic() {
  return (
    <div data-part="static" className={ghost(styles.static)}>
      <div className={`${styles.mono} ${styles.monoStatic}`} role="img" aria-label="अ.अ.प्र" lang="sa">
        <span className={styles.gold}>अ</span>
        <span className={styles.staticDot} aria-hidden />
        <span className={styles.gold}>अ</span>
        <span className={styles.staticDot} aria-hidden />
        <span className={styles.gold}>प्र</span>
      </div>
      <p className={`${styles.staticLockup} ${styles.gold}`} lang="sa">
        अन्त अस्ति प्रारम्भः
      </p>
      <p className={styles.lkLatin}>The End Is The Beginning</p>
    </div>
  );
}
