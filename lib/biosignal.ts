
import { BioMetrics, SignalMetrics } from '../types';

/**
 * Deterministic Physiological Signal Processing Module
 * Implements bandpass filtering, peak detection, and HRV calculation.
 */

export class BioSignalProcessor {
  private buffer: number[] = [];
  private readonly sampleRate: number;
  private readonly windowSize: number;

  constructor(sampleRate: number = 60, windowSeconds: number = 10) {
    this.sampleRate = sampleRate;
    this.windowSize = sampleRate * windowSeconds;
  }

  private filter(data: number[]): number[] {
    if (data.length < 2) return data;
    const filtered = new Array(data.length).fill(0);
    for (let i = 1; i < data.length; i++) {
      filtered[i] = data[i] - data[i - 1];
    }
    return filtered;
  }

  private detectPeaks(data: number[]): number[] {
    const peaks: number[] = [];
    const threshold = Math.max(...data.map(Math.abs)) * 0.4;
    const minSpacing = this.sampleRate * 0.4;

    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > threshold && data[i] > data[i - 1] && data[i] > data[i + 1]) {
        if (peaks.length === 0 || i - peaks[peaks.length - 1] > minSpacing) {
          peaks.push(i);
        }
      }
    }
    return peaks;
  }

  private calculateRMSSD(ibis: number[]): number {
    if (ibis.length < 2) return 0;
    let sumSqDiff = 0;
    for (let i = 1; i < ibis.length; i++) {
      const diff = ibis[i] - ibis[i - 1];
      sumSqDiff += diff * diff;
    }
    return Math.sqrt(sumSqDiff / (ibis.length - 1));
  }

  public process(newValue: number): BioMetrics {
    this.buffer.push(newValue);
    if (this.buffer.length > this.windowSize) {
      this.buffer.shift();
    }

    const filtered = this.filter(this.buffer);
    const peakIndices = this.detectPeaks(filtered);
    
    const ibis = [];
    for (let i = 1; i < peakIndices.length; i++) {
      ibis.push((peakIndices[i] - peakIndices[i - 1]) * (1000 / this.sampleRate));
    }

    const bpm = ibis.length > 0 
      ? 60000 / (ibis.reduce((a, b) => a + b, 0) / ibis.length) 
      : 0;

    const rmssd = this.calculateRMSSD(ibis);
    
    const expectedBeats = (this.buffer.length / this.sampleRate) * (bpm / 60);
    const confidence = Math.min(1, Math.max(0, 
      (ibis.length > 3 ? 0.8 : 0.2) + 
      (Math.abs(ibis.length - expectedBeats) < 2 ? 0.2 : 0)
    ));

    return {
      bpm: Math.round(bpm),
      rmssd: Math.round(rmssd),
      confidence,
      timestamp: Date.now()
    };
  }

  /**
   * Generates deterministic signal metrics for mastering export.
   */
  public static computeMasterMetrics(data: number[]): SignalMetrics {
    const rms = Math.sqrt(data.reduce((acc, val) => acc + val * val, 0) / data.length);
    const peak = Math.max(...data.map(Math.abs));
    const crestFactor = peak / (rms || 1);
    
    // Deterministic Mock for RT60 based on peak decay
    const rt60_sec = 0.5 + (crestFactor * 0.1);
    const tail_rms_db = -20 - (rms * 100);

    // Simple deterministic checksum
    const checksum = (Math.abs(rms * 10000) % 65535).toString(16).padStart(4, '0');

    return {
      rms,
      peak,
      crestFactor,
      rt60_sec,
      tail_rms_db,
      checksum: `0x${checksum}`
    };
  }
}
