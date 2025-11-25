import { useRef, useCallback } from 'react';
import { Phase } from '../types';

// This is to satisfy TypeScript since Tone.js is loaded from a CDN
declare const Tone: any;

type SynthType = any;

const synthConfig = {
  volume: -8,
  detune: 0,
  portamento: 0,
  envelope: {
    attack: 0.05,
    attackCurve: "linear",
    decay: 0.3,
    decayCurve: "exponential",
    release: 0.8,
    releaseCurve: "exponential",
    sustain: 0.4
  },
  filter: {
    Q: 1,
    detune: 0,
    frequency: 0,
    gain: 0,
    rolloff: -12,
    type: "lowpass"
  },
  filterEnvelope: {
    attack: 0.001,
    attackCurve: "linear",
    decay: 0.7,
    decayCurve: "exponential",
    release: 0.8,
    releaseCurve: "exponential",
    sustain: 0.1,
    baseFrequency: 300,
    exponent: 2,
    octaves: 4
  },
  oscillator: {
    detune: 0,
    frequency: 440,
    partialCount: 8,
    partials: [
      1.2732395447351628,
      0,
      0.4244131815783876,
      0,
      0.25464790894703254,
      0,
      0.18189136353359467,
      0
    ],
    phase: 0,
    type: "square8"
  }
};

export const useAudio = () => {
  const synths = useRef<{ [key in Phase]?: SynthType }>({});
  const isInitialized = useRef(false);

  const initialize = useCallback(async () => {
    if (typeof Tone === 'undefined') {
        console.error("Tone.js is not loaded.");
        return;
    }

    await Tone.start();
    synths.current = {
      [Phase.INHALE]: new Tone.MonoSynth(synthConfig).toDestination(),
      [Phase.HOLD]: new Tone.MonoSynth(synthConfig).toDestination(),
      [Phase.EXHALE]: new Tone.MonoSynth(synthConfig).toDestination(),
      [Phase.WAIT]: new Tone.MonoSynth(synthConfig).toDestination(),
    };
    isInitialized.current = true;
  }, []);

  const playSound = useCallback((phase: Phase, duration: number) => {
    if (!isInitialized.current || !synths.current[phase]) return;

    const synth = synths.current[phase];
    const now = Tone.now();

    switch(phase) {
        case Phase.INHALE:
            // Increase softly: Long attack, sustain high
            synth.envelope.attack = duration;
            synth.envelope.decay = 0;
            synth.envelope.sustain = 1.0;
            synth.envelope.release = 0.5;
            synth.triggerAttackRelease('A4', duration, now);
            break;
        case Phase.HOLD:
            // Still: Fast attack, hold steady
            synth.envelope.attack = 0.1;
            synth.envelope.decay = 0;
            synth.envelope.sustain = 1.0;
            synth.envelope.release = 0.5;
            synth.triggerAttackRelease('C4', duration, now);
            break;
        case Phase.EXHALE:
            // Decrease: Fast attack, decay to silence
            synth.envelope.attack = 0.1;
            synth.envelope.decay = duration;
            synth.envelope.sustain = 0;
            synth.envelope.release = 0.5;
            synth.triggerAttackRelease('G4', duration, now);
            break;
        case Phase.WAIT:
            // Use default config for Wait or steady
            synth.envelope.attack = 0.05;
            synth.envelope.decay = 0.3;
            synth.envelope.sustain = 0.4;
            synth.envelope.release = 0.8;
            synth.triggerAttackRelease('G4', duration, now);
            break;
    }
  }, []);

  return { initialize, playSound };
};