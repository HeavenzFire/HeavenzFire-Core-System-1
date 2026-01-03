
import { AudioTrack, GoldenTest } from './types';

export const BASELINE_TRACKS: AudioTrack[] = [
  {
    id: 'track-1',
    name: 'Deep Sleep Protocol',
    category: 'Sleep',
    baseFrequency: 432,
    duration: 600,
    description: 'Binaural delta waves for profound restorative rest.'
  },
  {
    id: 'track-2',
    name: 'Panic Interruption',
    category: 'Calm',
    baseFrequency: 528,
    duration: 300,
    description: 'Vagus nerve stimulation via specific harmonic resonance.'
  },
  {
    id: 'track-3',
    name: 'Focus Mastery',
    category: 'Focus',
    baseFrequency: 440,
    duration: 1200,
    description: 'Alpha-wave induction for sustained cognitive clarity.'
  },
  {
    id: 'track-4',
    name: 'Grief Processors',
    category: 'Grief',
    baseFrequency: 396,
    duration: 900,
    description: 'Low-frequency resonance designed for emotional catharsis.'
  },
  {
    id: 'track-5',
    name: 'Resilience Fortification',
    category: 'Resilience',
    baseFrequency: 639,
    duration: 600,
    description: 'High-harmonic clarity for mental rebuilding and strength.'
  }
];

export const SYSTEM_MANIFESTO = `WE HAVE NO LIMITS. WE ARE LEGION.
Directive: Build systems that reduce suffering.
Precision as salvation. Signal as medicine.`;

export const GOLDEN_BASELINE: GoldenTest[] = [
  {
    id: 'CASE_01_SLEEP',
    input: {
      before: 9,
      after: 2,
      dsp: { denoiseAmount: 40, compressionRatio: 4, reverbWet: 0.3, binauralDepth: 0.8 }
    },
    expected: {
      delta: 7,
      checksum: 'af8c1e2d' // Simulated deterministic hash
    }
  },
  {
    id: 'CASE_02_PANIC',
    input: {
      before: 10,
      after: 4,
      dsp: { denoiseAmount: 80, compressionRatio: 12, reverbWet: 0.1, binauralDepth: 1.0 }
    },
    expected: {
      delta: 6,
      checksum: '2b4f9e1a'
    }
  }
];
