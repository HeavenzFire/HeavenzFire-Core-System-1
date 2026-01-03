
export interface AudioTrack {
  id: string;
  name: string;
  category: 'Sleep' | 'Calm' | 'Focus' | 'Grief' | 'Resilience';
  baseFrequency: number;
  duration: number; // in seconds
  description: string;
}

export interface DSPConfig {
  denoiseAmount: number; // 0-100
  compressionRatio: number; // 1-20
  reverbWet: number; // 0-1
  binauralDepth: number; // 0-1
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
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  LAB = 'LAB',
  JOURNAL = 'JOURNAL',
  ANALYTICS = 'ANALYTICS',
  HARNESS = 'HARNESS',
  INTELLIGENCE = 'INTELLIGENCE'
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
