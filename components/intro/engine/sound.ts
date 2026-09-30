import { SECTIONS } from '@/lib/intro/timing';

/**
 * Optional cinematic sound bed, synthesised with WebAudio (no files):
 * a low drone that opens up and rises through the montage, cut by a single
 * temple-bell strike when the photo burns to gold. Muted until the viewer
 * turns it on; browsers only allow audio after that gesture anyway.
 */
export interface IntroSound {
  /** Call from the click handler. `at` is the current timeline time. */
  enable(at: number): void;
  disable(): void;
  /** Re-sync after a skip. */
  jump(at: number): void;
  dispose(): void;
}

// [timeline time, drone gain, lowpass cutoff Hz, detune cents]
const DRONE_KEYS: ReadonlyArray<readonly [number, number, number, number]> = [
  [0, 0, 160, 0],
  [2, 0.05, 180, 0],
  [SECTIONS.journey, 0.1, 240, 0],
  [SECTIONS.beginning - 0.1, 0.3, 1600, 500],
  [SECTIONS.beginning + 0.15, 0, 400, 500],
];
const BELL_PARTIALS: ReadonlyArray<readonly [number, number, number]> = [
  // [ratio, amplitude, decay seconds]
  [0.5, 0.5, 6],
  [1, 1, 4.5],
  [1.183, 0.45, 3.2],
  [1.506, 0.35, 2.6],
  [2, 0.3, 2.2],
  [2.514, 0.18, 1.6],
  [3.011, 0.12, 1.2],
  [4.166, 0.08, 0.8],
];

function interpolate(at: number, index: 1 | 2 | 3): number {
  if (at <= DRONE_KEYS[0][0]) return DRONE_KEYS[0][index];
  for (let i = 1; i < DRONE_KEYS.length; i++) {
    const [t, ...v] = DRONE_KEYS[i];
    const [t0, ...v0] = DRONE_KEYS[i - 1];
    if (at <= t) return v0[index - 1] + ((v[index - 1] - v0[index - 1]) * (at - t0)) / (t - t0);
  }
  return DRONE_KEYS[DRONE_KEYS.length - 1][index];
}

type AudioCtor = typeof AudioContext;

export function createIntroSound(): IntroSound {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let droneGain: GainNode | null = null;
  let filter: BiquadFilterNode | null = null;
  let oscs: OscillatorNode[] = [];
  let bell: OscillatorNode[] = [];
  let enabled = false;

  function build(): AudioContext | null {
    if (ctx) return ctx;
    const Ctor = (window.AudioContext ?? (window as Window & { webkitAudioContext?: AudioCtor }).webkitAudioContext) as AudioCtor | undefined;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 0.8;
    droneGain = ctx.createGain();
    droneGain.gain.value = 0;
    filter.connect(droneGain).connect(master);
    const voices: Array<[OscillatorType, number, number]> = [
      ['sine', 55, 0.9],
      ['sawtooth', 55.35, 0.28],
      ['triangle', 82.41, 0.35],
      ['sine', 110, 0.22],
    ];
    oscs = voices.map(([type, freq, level]) => {
      const osc = ctx!.createOscillator();
      const g = ctx!.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.value = level;
      osc.connect(g).connect(filter!);
      osc.start();
      return osc;
    });
    return ctx;
  }

  function stopBell() {
    bell.forEach((o) => {
      try {
        o.stop();
      } catch {
        // already stopped
      }
    });
    bell = [];
  }

  function strike(when: number, base: number, level: number) {
    if (!ctx || !master) return;
    bell = BELL_PARTIALS.map(([ratio, amp, decay]) => {
      const osc = ctx!.createOscillator();
      const g = ctx!.createGain();
      osc.frequency.value = base * ratio * (1 + (Math.random() - 0.5) * 0.002);
      g.gain.setValueAtTime(0, when);
      g.gain.linearRampToValueAtTime(amp * level, when + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, when + decay);
      osc.connect(g).connect(master!);
      osc.start(when);
      osc.stop(when + decay + 0.1);
      return osc;
    });
  }

  function schedule(at: number) {
    if (!ctx || !droneGain || !filter) return;
    const now = ctx.currentTime;
    const toAudio = (t: number) => now + Math.max(0, t - at);
    const params: Array<[AudioParam, 1 | 2 | 3]> = [
      [droneGain.gain, 1],
      [filter.frequency, 2],
      ...oscs.map((o): [AudioParam, 3] => [o.detune, 3]),
    ];
    for (const [param, index] of params) {
      param.cancelScheduledValues(now);
      param.setValueAtTime(interpolate(at, index), now);
      for (const key of DRONE_KEYS) if (key[0] > at) param.linearRampToValueAtTime(key[index], toAudio(key[0]));
    }
    stopBell();
    // The bell rings as the photo burns to gold; if that moment has passed, it greets the reveal.
    if (at < SECTIONS.beginning) strike(toAudio(SECTIONS.beginning), 220, 0.16);
    else if (at < SECTIONS.handoff + 0.5) strike(toAudio(SECTIONS.handoff + 0.5), 294, 0.1);
  }

  return {
    enable(at) {
      const audio = build();
      if (!audio || !master) return;
      enabled = true;
      void audio.resume();
      master.gain.cancelScheduledValues(audio.currentTime);
      master.gain.setTargetAtTime(0.9, audio.currentTime, 0.15);
      schedule(at);
    },
    disable() {
      enabled = false;
      if (!ctx || !master) return;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
      stopBell();
    },
    jump(at) {
      if (enabled) schedule(at);
    },
    dispose() {
      const audio = ctx;
      if (!audio || !master) return;
      master.gain.cancelScheduledValues(audio.currentTime);
      master.gain.setTargetAtTime(0, audio.currentTime, 0.4);
      // Let the bell ring out under the reveal, then release the audio device.
      window.setTimeout(() => {
        oscs.forEach((o) => o.stop());
        void audio.close();
      }, 2000);
      ctx = null;
      enabled = false;
    },
  };
}
