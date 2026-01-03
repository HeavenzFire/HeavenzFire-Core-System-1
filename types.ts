
export interface AudioTrack {
  id: string;
  name: string;
  category: 'Sleep' | 'Calm' | 'Focus' | 'Grief' | 'Resilience' | 'Wonder';
  baseFrequency: number;
  duration: number; // in seconds
  description: string;
}

export type GridFrequency = '50Hz' | '60Hz';
export type SignalLocale = 'EN' | 'ES' | 'AR' | 'ZH' | 'HI';

export interface MicroModulationParams {
  lfoFreq: number; // 0.1 - 0.3 Hz
  depth: number; // 0 - 0.01
  phaseShift: number; // 0 - 2pi
  deterministicSeed: number;
}

export interface DSPConfig {
  denoiseAmount: number; // 0-100
  compressionRatio: number; // 1-20
  reverbWet: number; // 0-1
  binauralDepth: number; // 0-1
  gridSync: GridFrequency;
  microModulation?: MicroModulationParams;
}

export interface BioMetrics {
  bpm: number;
  rmssd: number; // HRV metric
  confidence: number; // 0-1
  timestamp: number;
}

export interface SignalMetrics {
  rms: number;
  peak: number;
  crestFactor: number;
  rt60_sec: number;
  tail_rms_db: number;
  checksum: string;
  hrvModulationDepth?: number;
}

export interface MeshBundle {
  bundleID: string;
  checksum: string;
  timestamp: string;
  identity: string;
  protocol: string;
  track: AudioTrack;
  dsp: DSPConfig;
  metrics: SignalMetrics;
  affirmations: Array<{ locale: SignalLocale; content: string }>;
  replicationLog: Array<{ nodeID: string; received: string }>;
}

export interface NodeManifest {
  nodeID: string;
  version: string;
  timestamp: number;
  capabilities: string[];
  activeBundles: string[]; // List of MeshBundle IDs
  deterministicSeed: number;
  meshChecksum: string;
}

export interface CrisisKit {
  kitID: string;
  targetHardware: 'RPi Zero' | 'Mobile' | 'Generic Media Player';
  libraryVersion: string;
  tracks: string[]; // IDs
  totalSize: string;
}

export interface PeerNode {
  id: string;
  status: 'ONLINE' | 'OFFLINE' | 'SYNCING';
  latency: number;
  bundleCount: number;
  lastSeen: string;
}

export interface WonderArtifact {
  version: string;
  sessionID: string;
  timestamp: number;
  metrics: {
    avgBpm: number;
    peakRmssd: number;
    signalTrust: number;
    sufferingDelta: number;
    signal?: SignalMetrics;
  };
  config: {
    track: AudioTrack;
    dsp: DSPConfig;
  };
}

export interface MoodEntry {
  id: string;
  timestamp: number;
  scoreBefore: number; // 0-10
  scoreAfter?: number; // 0-10
  notes: string;
  trackId?: string;
  sentiment?: string;
  dspSnapshot?: DSPConfig;
  bioSnapshot?: BioMetrics;
  artifact?: WonderArtifact;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  LAB = 'LAB',
  JOURNAL = 'JOURNAL',
  ANALYTICS = 'ANALYTICS',
  HARNESS = 'HARNESS',
  INTELLIGENCE = 'INTELLIGENCE',
  REPLICATION = 'REPLICATION',
  SECURITY = 'SECURITY'
}

export interface ChaosScenario {
  id: string;
  name: string;
  description: string;
  impact: string;
  active: boolean;
}

export interface Invariant {
  id: string;
  label: string;
  status: 'LOCKED' | 'BREACHED' | 'PENDING';
}

export interface GoldenTest {
  id: string;
  input: {
    before: number;
    after: number;
    dsp: DSPConfig;
  };
  expected: {
    delta: number;
    checksum: string;
  };
}

export interface VerificationStatus {
  lastRun: number;
  passed: boolean;
  results: Record<string, boolean>;
}

export interface GroundingSource {
  title?: string;
  uri?: string;
}
