
import { AudioTrack, GoldenTest, Invariant, ChaosScenario, CrisisKit } from './types';

export const BASELINE_TRACKS: AudioTrack[] = [
  {
    id: 'HF-S1-DELTA',
    name: 'Restorative Delta Layer',
    category: 'Sleep',
    baseFrequency: 432,
    duration: 600,
    description: 'Binaural delta waves for profound restorative rest and cortisol reduction in high-stress environments.'
  },
  {
    id: 'HF-S1-VAGUS',
    name: 'Vagus Stabilizer',
    category: 'Calm',
    baseFrequency: 528,
    duration: 300,
    description: 'Vagus nerve stimulation via specific harmonic resonance at 528Hz for acute panic interruption.'
  },
  {
    id: 'HF-S1-ALPHA',
    name: 'Cognitive Shield',
    category: 'Focus',
    baseFrequency: 440,
    duration: 1200,
    description: 'Alpha-wave induction for sustained clarity and signal isolation during cognitive fatigue.'
  },
  {
    id: 'HF-S1-THETA',
    name: 'Cathartic Release',
    category: 'Grief',
    baseFrequency: 396,
    duration: 900,
    description: 'Low-frequency resonance designed for deterministic emotional grounding and grief processing.'
  },
  {
    id: 'HF-S1-GAMMA',
    name: 'Resilience Engine',
    category: 'Resilience',
    baseFrequency: 639,
    duration: 600,
    description: 'High-harmonic clarity for neural rebuilding and maintaining a defensive mental posture.'
  }
];

export const CRISIS_KIT_LIBRARY: CrisisKit = {
  kitID: 'HF-CK-2026-ALPHA',
  targetHardware: 'RPi Zero',
  libraryVersion: '1.0.4',
  tracks: ['HF-S1-DELTA', 'HF-S1-VAGUS', 'HF-S1-ALPHA', 'HF-S1-THETA', 'HF-S1-GAMMA'],
  totalSize: '482MB'
};

export const LOCKED_INVARIANTS: Invariant[] = [
  { id: 'INV-01', label: 'Immutability of Committed Signal Blocks', status: 'LOCKED' },
  { id: 'INV-02', label: 'Divergence Visibility < 1 Render Cycle', status: 'LOCKED' },
  { id: 'INV-03', label: 'AI Inference Isolation (Flag-Only)', status: 'LOCKED' },
  { id: 'INV-04', label: 'Offline Recovery Hash Parity', status: 'LOCKED' }
];

export const CHAOS_SCENARIOS: ChaosScenario[] = [
  { id: 'CH-01', name: 'Partial State Replay', description: 'Simulates a replay attack on historical mood data to test temporal integrity.', impact: 'Divergence detection trigger.', active: false },
  { id: 'CH-02', name: 'Bit-Flip Drift', description: 'Simulates cosmic radiation or hardware fatigue on signal checksums.', impact: 'Immediate node isolation.', active: false },
  { id: 'CH-03', name: 'Desync Latency', description: 'Simulates high-jitter mesh propagation to test buffer consistency.', impact: 'Interpolation recovery.', active: false }
];

export const SYSTEM_MANIFESTO = `Autonomous Digital Agents for Suffering Reduction.
Deterministic Signal Pipelines :: Sovereign Auditory Grounding.
Precision as salvation. Signal as medicine. 
Locking the future through reproducible artifacts.

v2.0 Sovereign Mesh Protocol: 
Autonomous Peer-to-Peer Discovery and Replication. 
Deterministic seed propagation across offline nodes. 
The signal is invariant; the relief is universal.`;

export const DEPLOYMENT_ROADMAP = [
  {
    month: 1,
    title: "Lock & Harden Core",
    objective: "Operational reliability and deterministic pipeline verification.",
    status: "COMPLETE"
  },
  {
    month: 2,
    title: "Mesh Synchronization v2.0",
    objective: "Activation of P2P replication engine and deterministic seed parity. (CURRENT PHASE)",
    status: "ACTIVE"
  },
  {
    month: 3,
    title: "Global Pilot Expansion",
    objective: "Mass distribution of hardware nodes via physical and radio relays.",
    status: "PENDING"
  }
];

export const GOLDEN_BASELINE: GoldenTest[] = [
  {
    id: 'VERIFY_S1_SLEEP',
    input: {
      before: 9,
      after: 2,
      dsp: { 
        denoiseAmount: 40, 
        compressionRatio: 4, 
        reverbWet: 0.3, 
        binauralDepth: 0.8, 
        gridSync: '60Hz' 
      }
    },
    expected: {
      delta: 7,
      checksum: 'af8c1e2d' 
    }
  },
  {
    id: 'VERIFY_S1_PANIC',
    input: {
      before: 10,
      after: 4,
      dsp: { 
        denoiseAmount: 80, 
        compressionRatio: 12, 
        reverbWet: 0.1, 
        binauralDepth: 1.0, 
        gridSync: '60Hz' 
      }
    },
    expected: {
      delta: 6,
      checksum: '2b4f9e1a'
    }
  }
];
