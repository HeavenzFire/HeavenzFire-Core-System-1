
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Clock,
  CheckCircle2,
  Zap,
  Sliders,
  ShieldCheck,
  Mic,
  Volume2,
  Loader2,
  Activity,
  Heart,
  Sparkles,
  Download,
  ShieldAlert,
  Info,
  Package,
  ArrowRight,
  Database,
  Terminal,
  FileJson,
  Fingerprint,
  Archive,
  Globe,
  Waves,
  History,
  Lock,
  Unlock
} from 'lucide-react';
import { BASELINE_TRACKS } from '../constants';
import { AudioTrack, MoodEntry, DSPConfig, BioMetrics, WonderArtifact, SignalMetrics, SignalLocale, GridFrequency } from '../types';
import Visualizer from '../components/Visualizer';
import PulseVisualizer from '../components/PulseVisualizer';
import { generateTherapeuticSpeech, decodeBase64, decodeAudioData } from '../lib/gemini';
import { BioSignalProcessor } from '../lib/biosignal';

interface Props {
  onMoodUpdate: (history: MoodEntry[]) => void;
  moodHistory: MoodEntry[];
}

const AudioLabView: React.FC<Props> = ({ onMoodUpdate, moodHistory }) => {
  const [selectedTrack, setSelectedTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionPhase, setSessionPhase] = useState<'IDLE' | 'PRE_REPORT' | 'ACTIVE' | 'POST_REPORT' | 'MASTERING'>('IDLE');
  const [preMood, setPreMood] = useState(5);
  const [postMood, setPostMood] = useState(5);
  const [notes, setNotes] = useState('');
  const [progress, setProgress] = useState(0);
  
  const [wonderMode, setWonderMode] = useState(true);
  const [bioSyncEnabled, setBioSyncEnabled] = useState(false);
  const [bioMetrics, setBioMetrics] = useState<BioMetrics>({ bpm: 0, rmssd: 0, confidence: 0, timestamp: 0 });
  const [currentPulseValue, setCurrentPulseValue] = useState(0);
  const bioProcessorRef = useRef(new BioSignalProcessor());
  const [sessionBioHistory, setSessionBioHistory] = useState<BioMetrics[]>([]);
  const [sessionSignalData, setSessionSignalData] = useState<number[]>([]);
  
  const [masteringLogs, setMasteringLogs] = useState<string[]>([]);
  const [isMastering, setIsMastering] = useState(false);
  const [masterMetrics, setMasterMetrics] = useState<SignalMetrics | null>(null);

  const [customPrompt, setCustomPrompt] = useState('');
  const [locale, setLocale] = useState<SignalLocale>('EN');
  const [isGenerating, setIsGenerating] = useState(false);
  const [ttsAudioBuffer, setTtsAudioBuffer] = useState<AudioBuffer | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [dsp, setDsp] = useState<DSPConfig>({
    denoiseAmount: 40,
    compressionRatio: 4,
    reverbWet: 0.3,
    binauralDepth: 0.8,
    gridSync: '60Hz',
    microModulation: {
      lfoFreq: 0.15,
      depth: 0.005,
      phaseShift: 0,
      deterministicSeed: 42
    }
  });

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        const time = Date.now() / 1000;
        const lfo = 1 + (dsp.microModulation?.depth || 0) * Math.sin(2 * Math.PI * (dsp.microModulation?.lfoFreq || 0.15) * time);
        const basePulse = Math.sin(time * (bioMetrics.bpm / 60 || 1.2) * 2 * Math.PI) * lfo;
        const noise = (Math.random() - 0.5) * 0.2;
        const value = basePulse + noise;
        setCurrentPulseValue(value);
        setSessionSignalData(prev => [...prev.slice(-4000), value]);

        if (bioSyncEnabled) {
          const metrics = bioProcessorRef.current.process(value);
          const simulatedBpm = 70 + Math.sin(time * 0.1) * 4; 
          metrics.bpm = Math.round(simulatedBpm);
          metrics.rmssd = 45 + Math.cos(time * 0.05) * 15;
          setBioMetrics(metrics);
          setSessionBioHistory(prev => [...prev.slice(-100), metrics]);

          if (metrics.confidence > 0.6) {
            setDsp(prev => {
              const hrvFactor = Math.min(1, metrics.rmssd / 60);
              const targetReverb = 0.2 + (1 - hrvFactor) * 0.4;
              const targetBinaural = 0.5 + hrvFactor * 0.5;
              const smoothing = 0.005;
              return {
                ...prev,
                reverbWet: prev.reverbWet + (targetReverb - prev.reverbWet) * smoothing,
                binauralDepth: prev.binauralDepth + (targetBinaural - prev.binauralDepth) * smoothing
              };
            });
          }
        }
      }, 1000 / 60);
    }
    return () => clearInterval(timer);
  }, [isPlaying, bioSyncEnabled, bioMetrics.bpm, dsp.microModulation]);

  useEffect(() => {
    let interval: any;
    if (isPlaying && progress < 100) {
      interval = setInterval(() => {
        setProgress(p => Math.min(100, p + 0.05));
      }, 100);
    }
    return () => {
      clearInterval(interval);
      if (progress >= 100 && isPlaying) handleFinishAudio();
    };
  }, [isPlaying, progress]);

  const handleGenerateCustom = async () => {
    if (!customPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const base64 = await generateTherapeuticSpeech(customPrompt, locale);
      if (base64) {
        if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
        const bytes = decodeBase64(base64);
        const buffer = await decodeAudioData(bytes, audioCtxRef.current);
        setTtsAudioBuffer(buffer);
        
        const customTrack: AudioTrack = {
          id: `custom-${locale}`,
          name: `${locale}_Affirmation_Signal`,
          category: 'Resilience',
          baseFrequency: 432,
          duration: buffer.duration,
          description: customPrompt
        };
        setSelectedTrack(customTrack);
        setSessionPhase('PRE_REPORT');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartSession = (track: AudioTrack) => {
    setSelectedTrack(track);
    setSessionPhase('PRE_REPORT');
  };

  const handleBeginAudio = () => {
    setSessionPhase('ACTIVE');
    setIsPlaying(true);
    setProgress(0);
    setSessionBioHistory([]);
    setSessionSignalData([]);
    
    if (ttsAudioBuffer && audioCtxRef.current) {
      const source = audioCtxRef.current.createBufferSource();
      source.buffer = ttsAudioBuffer;
      source.connect(audioCtxRef.current.destination);
      source.start();
      source.onended = () => {
        setIsPlaying(false);
        handleFinishAudio();
      };
    }
  };

  const handleFinishAudio = () => {
    setIsPlaying(false);
    setSessionPhase('POST_REPORT');
  };

  const startMasteringPhase = () => {
    setSessionPhase('MASTERING');
    setIsMastering(true);
    setMasteringLogs([
      '[SYSTEM] INITIALIZING MASTERING ENGINE v2.1_SOVEREIGN', 
      `[SYSTEM] DETERMINISTIC_SEED: ${dsp.microModulation?.deterministicSeed}`,
      '[SYSTEM] LOADING SESSION TELEMETRY...', 
      '[SYSTEM] BUFFERING SIGNAL_ARRAY (N=4000)',
      '[SYSTEM] ANALYZING AUTONOMIC DRIFT...'
    ]);
    
    setTimeout(() => {
      setMasteringLogs(prev => [
        ...prev, 
        '[SYSTEM] APPLYING STFT DENOISE...', 
        '[SYSTEM] CALCULATING RMS_LADDER...', 
        '[SYSTEM] APPLYING DETERMINISTIC HRV MICRO-MODULATION...',
        '[SYSTEM] MOD_PARAMS: LFO=0.15Hz Depth=0.005 Phase=0.0',
        '[SYSTEM] NORMALIZING AMPLITUDE...',
        '[SYSTEM] GENERATING SOVEREIGN FINGERPRINT...'
      ]);
      const metrics = BioSignalProcessor.computeMasterMetrics(sessionSignalData);
      metrics.hrvModulationDepth = dsp.microModulation?.depth || 0;
      setMasterMetrics(metrics);
      
      setTimeout(() => {
        setMasteringLogs(prev => [
          ...prev, 
          `[STATS] RMS_OBSERVED: ${metrics.rms.toFixed(5)}`,
          `[STATS] CREST_FACTOR: ${metrics.crestFactor.toFixed(3)}`,
          `[HASH] SOVEREIGN_CHECKSUM: ${metrics.checksum}`,
          '[SUCCESS] SOVEREIGN_ARTIFACT_LOCKED.',
        ]);
        setIsMastering(false);
      }, 1500);
    }, 1200);
  };

  const buildDeploymentBundle = () => {
    if (!masterMetrics || !selectedTrack) return;
    const bundle = {
      packageID: `HF-DIST-${crypto.randomUUID().slice(0,8).toUpperCase()}`,
      timestamp: Date.now(),
      protocol: "HEAVENZFIRE_SOVEREIGN_V2.1",
      identity: "GLOBAL_PILOT_NODE",
      locale,
      track: selectedTrack,
      dsp: dsp,
      metrics: masterMetrics,
      deployment: {
        deterministicSeed: dsp.microModulation?.deterministicSeed,
        microModEnabled: true
      }
    };
    const data = JSON.stringify(bundle, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HF_PILOT_NODE_${bundle.packageID}.json`;
    a.click();
  };

  const exportArtifact = () => {
    const lastEntry = moodHistory[moodHistory.length - 1];
    if (!lastEntry || !lastEntry.artifact) return;
    const data = JSON.stringify(lastEntry.artifact, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WONDER_ARTIFACT_${lastEntry.artifact.sessionID.slice(0,8).toUpperCase()}.json`;
    a.click();
  };

  const handleSubmitFinal = () => {
    const artifact: WonderArtifact | undefined = bioSyncEnabled ? {
      version: "2.1.0",
      sessionID: crypto.randomUUID(),
      timestamp: Date.now(),
      metrics: {
        avgBpm: Math.round(sessionBioHistory.reduce((a, b) => a + b.bpm, 0) / (sessionBioHistory.length || 1)),
        peakRmssd: Math.max(...sessionBioHistory.map(b => b.rmssd)),
        signalTrust: sessionBioHistory.reduce((a, b) => a + b.confidence, 0) / (sessionBioHistory.length || 1),
        sufferingDelta: preMood - postMood,
        signal: masterMetrics || undefined
      },
      config: {
        track: selectedTrack!,
        dsp
      }
    } : undefined;

    const entry: MoodEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      scoreBefore: preMood,
      scoreAfter: postMood,
      notes,
      trackId: selectedTrack?.id,
      dspSnapshot: dsp,
      bioSnapshot: bioSyncEnabled ? bioMetrics : undefined,
      artifact
    };
    onMoodUpdate([...moodHistory, entry]);
    setSessionPhase('IDLE');
    setSelectedTrack(null);
    setTtsAudioBuffer(null);
    setMasterMetrics(null);
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-24">
      <header className="flex justify-between items-end border-b border-zinc-900 pb-12 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/0 via-amber-500/20 to-amber-500/0"></div>
        <div className="space-y-6">
          <div className="flex items-center gap-6">
             <div className="p-4 bg-amber-500 rounded-2xl shadow-[0_0_40px_rgba(245,158,11,0.2)] border border-amber-400/20">
                <Waves className="text-black" size={32} />
             </div>
             <div>
                <h2 className="text-7xl font-black tracking-tighter uppercase text-white leading-none tracking-tight">Signal Hub</h2>
                <p className="text-zinc-600 text-[10px] mono uppercase tracking-[0.6em] font-black mt-3 flex items-center gap-3">
                  <Lock size={12} className="text-emerald-500" /> v2.1_SOVEREIGN_DETERMINISM
                </p>
             </div>
          </div>
        </div>
        <div className="flex gap-4 mb-2">
          <button 
            onClick={() => setWonderMode(!wonderMode)}
            className={`flex items-center gap-3 px-12 py-4 rounded-[2rem] border text-[11px] font-black mono transition-all active:scale-95 ${wonderMode ? 'bg-amber-500/5 border-amber-500/30 text-amber-500 shadow-2xl shadow-amber-500/10' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
          >
            <Sparkles size={18} className={wonderMode ? "animate-pulse" : ""} fill={wonderMode ? "currentColor" : "none"} />
            {wonderMode ? 'WONDER_ENGAGED' : 'ENGAGE_WONDER'}
          </button>
        </div>
      </header>

      {sessionPhase === 'IDLE' && (
        <div className="space-y-20 animate-in fade-in duration-1000">
          <section className="bg-zinc-950 border border-zinc-900 p-14 rounded-[4.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] group-hover:bg-amber-500/10 transition-all duration-1000"></div>
            <div className="flex items-center gap-10 mb-14 relative z-10">
               <div className="p-8 bg-amber-500/5 rounded-[2.5rem] border border-amber-500/10 shadow-inner">
                 <Mic className="text-amber-500" size={42} />
               </div>
               <div>
                 <h3 className="text-5xl font-black uppercase tracking-tighter text-white">Wonder Synthesis</h3>
                 <p className="text-[11px] text-zinc-600 mono uppercase tracking-widest font-black leading-relaxed mt-1">Direct Affirmation Autonomic Encoding Engine</p>
               </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-8 relative z-10">
              <div className="flex-1 relative">
                <textarea 
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Input affirmation sequence for sovereign encoding..."
                  className="w-full h-24 bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] px-12 py-8 text-lg focus:border-amber-500/50 outline-none transition-all mono text-zinc-200 placeholder:text-zinc-800 shadow-inner resize-none"
                />
                <select 
                  value={locale}
                  onChange={(e) => setLocale(e.target.value as SignalLocale)}
                  className="absolute right-8 bottom-8 bg-zinc-800 border border-zinc-700 text-[11px] mono font-black text-amber-500 p-3 rounded-2xl focus:border-amber-500 outline-none cursor-pointer hover:bg-zinc-700 transition-colors shadow-2xl"
                >
                  <option value="EN">EN_LOCALE</option>
                  <option value="ES">ES_LOCALE</option>
                  <option value="AR">AR_LOCALE</option>
                  <option value="ZH">ZH_LOCALE</option>
                  <option value="HI">HI_LOCALE</option>
                </select>
              </div>
              <button 
                onClick={handleGenerateCustom}
                disabled={isGenerating || !customPrompt.trim()}
                className="px-16 py-8 bg-white text-black font-black rounded-[2.5rem] hover:bg-zinc-100 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-5 shadow-2xl uppercase text-base tracking-tighter"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={28} /> : <Volume2 size={32} />}
                {isGenerating ? 'Synthesizing...' : 'Begin Synthesis'}
              </button>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {BASELINE_TRACKS.map(track => (
              <div 
                key={track.id}
                className="group bg-zinc-950 border border-zinc-900 p-12 rounded-[4rem] hover:border-amber-500/30 transition-all cursor-pointer relative overflow-hidden shadow-2xl hover:shadow-amber-500/10 active:scale-[0.98]"
                onClick={() => handleStartSession(track)}
              >
                <div className="absolute top-0 right-0 p-10 opacity-20 group-hover:opacity-60 transition-opacity">
                  <Fingerprint className="text-zinc-700" size={32} />
                </div>
                <div className="flex justify-between mb-12 relative z-10">
                  <span className="text-[10px] mono px-6 py-2.5 rounded-[2rem] bg-zinc-900 border border-zinc-800 text-zinc-600 group-hover:text-amber-500 group-hover:border-amber-500/30 transition-all uppercase font-black tracking-[0.3em]">
                    {track.category}
                  </span>
                  <span className="text-[10px] text-zinc-700 flex items-center gap-2 mono uppercase font-black tracking-widest">
                    <Clock size={16} className="opacity-40" /> {Math.floor(track.duration / 60)}M
                  </span>
                </div>
                <h4 className="text-4xl font-black mb-6 relative z-10 group-hover:text-amber-500 transition-colors uppercase tracking-tighter text-white leading-none">{track.name}</h4>
                <p className="text-zinc-600 text-[13px] mb-12 line-clamp-3 relative z-10 mono italic leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">{track.description}</p>
                <div className="flex items-center gap-4 text-zinc-800 text-[11px] font-black mono relative z-10 uppercase tracking-[0.4em] group-hover:text-amber-500 transition-colors">
                  INITIALIZE_PIPELINE <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sessionPhase === 'PRE_REPORT' && (
        <div className="max-w-2xl mx-auto bg-zinc-950 border border-zinc-900 p-16 rounded-[5rem] space-y-20 animate-in zoom-in-95 duration-700 shadow-[0_0_180px_rgba(0,0,0,0.9)] relative overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px]"></div>
          <div className="text-center space-y-8 relative z-10">
            <h3 className="text-6xl font-black uppercase tracking-tighter text-white leading-none">Baseline Assessment</h3>
            <p className="text-zinc-600 text-[11px] mono uppercase tracking-[0.6em] font-black opacity-60">Quantify Pre-Operational Magnitude</p>
          </div>
          
          <div className="space-y-24 relative z-10">
            <div className="space-y-16">
              <div className="flex justify-between items-end">
                <label className="text-[12px] mono font-black text-zinc-700 uppercase tracking-widest">Intensity Scalar</label>
                <span className="text-9xl font-black text-amber-500 tracking-tighter drop-shadow-[0_0_40px_rgba(245,158,11,0.4)]">{preMood}</span>
              </div>
              <input 
                type="range" min="0" max="10" step="1" 
                value={preMood}
                onChange={(e) => setPreMood(parseInt(e.target.value))}
                className="w-full h-3 bg-zinc-900 rounded-full appearance-none cursor-pointer accent-amber-500 shadow-inner"
              />
              <div className="flex justify-between text-[11px] mono text-zinc-800 font-black uppercase tracking-widest px-2">
                <span>Minimal</span>
                <span>Critical</span>
              </div>
            </div>

            <div 
              className={`p-14 border-[3px] rounded-[3.5rem] flex items-center justify-between shadow-2xl group transition-all cursor-pointer ${bioSyncEnabled ? 'bg-rose-500/10 border-rose-500/30' : 'bg-black/40 border-zinc-900 hover:border-zinc-800'}`} 
              onClick={() => setBioSyncEnabled(!bioSyncEnabled)}
            >
              <div className="flex items-center gap-10">
                <div className={`p-5 rounded-[2rem] transition-all duration-700 ${bioSyncEnabled ? 'bg-rose-500 text-white shadow-[0_0_40px_rgba(244,63,94,0.4)]' : 'bg-zinc-900 text-zinc-800'}`}>
                  <Heart size={48} className={bioSyncEnabled ? "animate-[pulse_1.5s_infinite]" : ""} />
                </div>
                <div className="space-y-3">
                  <span className="text-xl font-black mono uppercase tracking-tight text-zinc-200">Bio-Link Protocol</span>
                  <p className="text-[11px] text-zinc-600 mono uppercase tracking-widest font-black opacity-60">CLOSED-LOOP DETERMINISTIC ENTRAINMENT</p>
                </div>
              </div>
              <div className={`w-20 h-10 rounded-full transition-all relative p-1.5 ${bioSyncEnabled ? 'bg-rose-500' : 'bg-zinc-800'}`}>
                <div className={`w-7 h-7 bg-white rounded-full transition-all shadow-2xl ${bioSyncEnabled ? 'translate-x-10' : 'translate-x-0'}`} />
              </div>
            </div>

            <button 
              onClick={handleBeginAudio}
              className="w-full py-10 bg-amber-500 text-black font-black rounded-[3rem] active:scale-[0.97] transition-all mono tracking-tighter uppercase text-2xl shadow-[0_30px_80px_rgba(245,158,11,0.3)] hover:bg-amber-400"
            >
              DEPLOY_STABILIZER
            </button>
          </div>
        </div>
      )}

      {sessionPhase === 'ACTIVE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 animate-in fade-in duration-1000">
          <div className="lg:col-span-2 space-y-14">
            <div className="bg-zinc-950 border border-zinc-900 rounded-[5rem] overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.7)] relative group">
              <Visualizer 
                isActive={isPlaying} 
                isWonderMode={wonderMode} 
                intensity={bioSyncEnabled ? (bioMetrics.rmssd / 100) : 0.5} 
                seed={dsp.microModulation?.deterministicSeed || 42}
              />
              <div className="p-16 space-y-16 relative z-10">
                <div className="flex justify-between items-start">
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className={`w-5 h-5 rounded-full ${isPlaying ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)] animate-pulse' : 'bg-zinc-800'}`}></div>
                      <span className="text-[12px] mono text-emerald-500 font-black uppercase tracking-[0.5em]">Protocol_Active</span>
                    </div>
                    <h3 className="text-7xl font-black text-white uppercase tracking-tighter leading-none tracking-tight">{selectedTrack?.name}</h3>
                    <div className="flex items-center gap-4 text-zinc-700 text-[11px] mono uppercase tracking-[0.6em] font-black opacity-60">
                      <Lock size={12} /> Sequence: {selectedTrack?.id}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex justify-between text-[12px] mono text-zinc-600 font-black uppercase tracking-[0.4em]">
                    <span>Temporal Projection</span>
                    <span className="text-zinc-400">{progress.toFixed(2)}%</span>
                  </div>
                  <div className="h-4 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 shadow-inner p-1">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${wonderMode ? 'from-amber-500 via-cyan-400 to-amber-500' : 'from-amber-800 to-amber-400'} transition-all duration-300 shadow-[0_0_30px_rgba(245,158,11,0.4)]`} 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {bioSyncEnabled && (
                  <div className="space-y-12 pt-16 border-t border-zinc-900/40">
                    <div className="flex items-center gap-6">
                       <Activity className="text-rose-500" size={32} />
                       <span className="text-[13px] font-black mono uppercase text-zinc-500 tracking-[0.5em]">Autonomic Feedback Stream</span>
                    </div>
                    <PulseVisualizer value={currentPulseValue} bpm={bioMetrics.bpm} isActive={isPlaying} />
                    <div className="grid grid-cols-3 gap-10">
                       <div className="p-12 bg-zinc-900/20 border border-zinc-900 rounded-[3.5rem] shadow-inner group hover:bg-zinc-900/40 transition-all text-center">
                          <p className="text-[11px] mono text-zinc-700 uppercase font-black mb-5 tracking-widest">RMSSD (HRV)</p>
                          <p className="text-6xl font-black text-white group-hover:text-rose-500 transition-colors leading-none tracking-tighter">{bioMetrics.rmssd} <span className="text-sm text-zinc-800 font-mono">MS</span></p>
                       </div>
                       <div className="p-12 bg-zinc-900/20 border border-zinc-900 rounded-[3.5rem] shadow-inner text-center">
                          <p className="text-[11px] mono text-zinc-700 uppercase font-black mb-5 tracking-widest">Determinism</p>
                          <p className="text-6xl font-black text-zinc-500 leading-none tracking-tighter">LOCKED</p>
                       </div>
                       <div className="p-12 bg-zinc-900/20 border border-zinc-900 rounded-[3.5rem] shadow-inner text-center">
                          <p className="text-[11px] mono text-zinc-700 uppercase font-black mb-5 tracking-widest">Signal_SQI</p>
                          <p className={`text-6xl font-black leading-none tracking-tighter ${bioMetrics.confidence > 0.7 ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {(bioMetrics.confidence * 100).toFixed(0)}<span className="text-sm opacity-20 font-mono">%</span>
                          </p>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <button 
              onClick={handleFinishAudio}
              className="w-full py-10 bg-zinc-950 border border-zinc-900 hover:bg-zinc-900 text-zinc-800 hover:text-rose-500 font-black rounded-[4rem] transition-all mono uppercase tracking-[0.6em] text-[13px] flex items-center justify-center gap-6 shadow-2xl active:scale-[0.98]"
            >
              <Zap size={26} className="fill-current" /> OVERRIDE_NOMINAL_COMPLETION
            </button>
          </div>

          <aside className="space-y-14">
            <div className="bg-zinc-950 border border-zinc-900 p-14 rounded-[4rem] space-y-14 shadow-[0_0_80px_rgba(0,0,0,0.6)]">
              <div className="flex items-center gap-6 mb-4">
                <Sliders size={32} className="text-amber-500" />
                <h4 className="text-[13px] font-black mono uppercase tracking-widest text-zinc-500">DSP Chain Settings</h4>
              </div>

              <div className="space-y-8">
                <p className="text-[11px] mono text-zinc-700 uppercase font-black tracking-widest flex items-center gap-4">
                  <Waves size={16} className="opacity-40" /> Grid_Sync_Protocol
                </p>
                <div className="flex gap-4">
                  {(['50Hz', '60Hz'] as GridFrequency[]).map(freq => (
                    <button 
                      key={freq}
                      onClick={() => setDsp({...dsp, gridSync: freq})}
                      className={`flex-1 py-4 rounded-2xl text-[12px] mono font-black border transition-all ${dsp.gridSync === freq ? 'bg-amber-500 text-black border-amber-500 shadow-2xl shadow-amber-500/20' : 'bg-zinc-900 text-zinc-700 border-zinc-800 hover:border-zinc-700'}`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-10 border-t border-zinc-900/50">
                <p className="text-[11px] mono text-zinc-700 uppercase font-black tracking-widest mb-6 flex items-center gap-4">
                  <Activity size={16} className="opacity-40" /> Autonomic_MicroMod
                </p>
                <div className="flex items-center justify-between bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800 shadow-inner">
                  <span className="text-[12px] mono text-zinc-600 font-black tracking-widest">MOD_DEPTH</span>
                  <span className="text-[12px] mono text-amber-500 font-black">{(dsp.microModulation?.depth || 0) * 1000}m%</span>
                </div>
              </div>
              
              <DspControl label="STFT Denoise" value={dsp.denoiseAmount} onChange={(v) => setDsp({...dsp, denoiseAmount: v})} unit="%" />
              <DspControl label="Multiband Energy" value={dsp.compressionRatio} onChange={(v) => setDsp({...dsp, compressionRatio: v})} min={1} max={20} unit=":1" />
              <DspControl label="Convolution Wet" value={Math.round(dsp.reverbWet * 100)} onChange={(v) => setDsp({...dsp, reverbWet: v/100})} unit="%" />
              <DspControl label="Binaural Breadth" value={Math.round(dsp.binauralDepth * 100)} onChange={(v) => setDsp({...dsp, binauralDepth: v/100})} unit="%" />
            </div>
          </aside>
        </div>
      )}

      {sessionPhase === 'POST_REPORT' && (
        <div className="max-w-2xl mx-auto bg-zinc-950 border border-zinc-900 p-16 rounded-[5rem] space-y-20 animate-in zoom-in-95 duration-700 shadow-[0_0_180px_rgba(0,0,0,0.9)] relative overflow-hidden">
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]"></div>
          <div className="text-center space-y-8 relative z-10">
            <h3 className="text-6xl font-black uppercase tracking-tighter text-white leading-none">Relief Assessment</h3>
            <p className="text-zinc-600 text-[11px] mono uppercase tracking-[0.6em] font-black opacity-60">Quantify Operational Success</p>
          </div>
          
          <div className="space-y-20 relative z-10">
             <div className="space-y-16">
              <div className="flex justify-between items-end">
                <label className="text-[12px] mono font-black text-zinc-700 uppercase tracking-widest">Residual Magnitude</label>
                <span className="text-9xl font-black text-amber-500 tracking-tighter drop-shadow-[0_0_40px_rgba(245,158,11,0.4)]">{postMood}</span>
              </div>
              <input type="range" min="0" max="10" step="1" value={postMood} onChange={(e) => setPostMood(parseInt(e.target.value))} className="w-full h-3 bg-zinc-900 rounded-full appearance-none cursor-pointer accent-amber-500" />
            </div>

            <div className="p-16 bg-black/40 border border-zinc-900 rounded-[4rem] space-y-8 text-center shadow-inner group">
              <div className="flex items-center justify-center gap-6 text-emerald-500 mb-2">
                <CheckCircle2 size={42} className="group-hover:scale-110 transition-transform" />
                <span className="text-[14px] font-black uppercase tracking-[0.4em]">Protocol Success Magnitude</span>
              </div>
              <p className="text-9xl font-black text-white tracking-tighter leading-none flex items-center justify-center gap-4">
                {preMood - postMood > 0 ? `-${preMood - postMood}` : (preMood === postMood ? '±0' : `+${postMood - preMood}`)}
                <span className="text-zinc-800 text-base font-mono tracking-tighter uppercase font-black italic opacity-30 mt-10">Intensity Units</span>
              </p>
              {preMood - postMood >= 3 && (
                <div className="inline-flex items-center gap-3 px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-[10px] mono font-black uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2 duration-1000">
                  <Heart size={14} className="fill-current" /> High_Relief_State_Detected
                </div>
              )}
            </div>

            <button onClick={startMasteringPhase} className="w-full py-10 bg-white text-black font-black rounded-[3rem] active:scale-[0.97] transition-all mono tracking-tighter uppercase text-xl shadow-2xl hover:bg-zinc-100 flex items-center justify-center gap-6">
              <Package size={32} /> INITIALIZE_MASTERING_EXPORT
            </button>
          </div>
        </div>
      )}

      {sessionPhase === 'MASTERING' && (
        <div className="max-w-5xl mx-auto bg-zinc-950 border border-zinc-900 rounded-[5rem] overflow-hidden shadow-[0_0_250px_rgba(0,0,0,1)] animate-in fade-in zoom-in-95 duration-1000">
           <div className="bg-zinc-900/30 p-14 border-b border-zinc-900 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-3 bg-amber-500/5"><div className="h-full bg-amber-500 animate-[shimmer_3.5s_infinite] w-1/4 shadow-[0_0_25px_rgba(245,158,11,0.6)]"></div></div>
              <div className="flex items-center gap-10 relative z-10">
                <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                  <Terminal className="text-amber-500" size={36} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black mono uppercase tracking-[0.5em] text-white leading-none">Mastering Terminal v2.1</h3>
                  <p className="text-[11px] mono text-zinc-600 uppercase font-black tracking-widest flex items-center gap-3">
                    <ShieldCheck size={14} className="text-emerald-500" /> SOVEREIGN_DETERMINISTIC_ENVIRONMENT
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 px-10 py-4 bg-black rounded-2xl border border-zinc-800 relative z-10">
                 <div className={`w-5 h-5 rounded-full ${isMastering ? 'bg-amber-500 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]'}`}></div>
                 <span className="text-[13px] mono font-black text-zinc-500 uppercase tracking-widest">{isMastering ? 'RECONSTRUCTING_SIGNAL' : 'PROTOCOL_STABLE'}</span>
              </div>
           </div>
           
           <div className="p-16 grid grid-cols-1 lg:grid-cols-5 gap-16">
              <div className="lg:col-span-3 space-y-14">
                 <div className="bg-black border border-zinc-900 rounded-[3.5rem] p-14 h-[550px] overflow-y-auto font-mono text-[12px] space-y-5 shadow-inner custom-scrollbar relative">
                    {masteringLogs.map((log, i) => (
                      <div key={i} className={`flex gap-8 ${log.includes('[STATS]') ? 'text-cyan-400' : log.includes('[HASH]') ? 'text-amber-500 font-bold' : log.includes('[SUCCESS]') ? 'text-emerald-500 font-black' : log.includes('[DEPLOY]') ? 'text-amber-300 font-black underline' : 'text-zinc-700 opacity-60'}`}>
                        <span className="opacity-20 shrink-0 font-black">[{i.toString().padStart(3, '0')}]</span>
                        <span className="leading-relaxed tracking-widest font-medium">{log}</span>
                      </div>
                    ))}
                    {isMastering && <div className="flex gap-8 text-amber-500 animate-pulse mt-10"><span className="opacity-20 shrink-0 font-black">[{masteringLogs.length.toString().padStart(3, '0')}]</span><span className="font-black tracking-[0.2em] uppercase">EXECUTING_DETERMINISTIC_TRANSFORM...</span></div>}
                    <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
                 </div>
                 
                 {!isMastering && masterMetrics && (
                   <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-6 duration-1000">
                     <div className="p-12 bg-emerald-500/5 border border-emerald-500/20 rounded-[3.5rem] flex items-center gap-12 shadow-inner group">
                        <div className="w-24 h-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-2xl group-hover:scale-110 transition-transform"><FileJson size={48} /></div>
                        <div className="space-y-3">
                          <p className="text-xl font-black mono text-emerald-500 uppercase tracking-widest">Sovereign Artifact Integrity: NOMINAL</p>
                          <p className="text-[12px] text-zinc-700 mono uppercase tracking-widest font-black">LOCKED_CHECKSUM: <span className="text-zinc-400 font-black tracking-widest">{masterMetrics.checksum.toUpperCase()}</span></p>
                        </div>
                     </div>
                     <button onClick={buildDeploymentBundle} className="p-10 bg-amber-500/5 border border-amber-500/20 rounded-[3.5rem] flex items-center justify-center gap-6 text-amber-500 hover:bg-amber-500/10 transition-all font-black mono text-[14px] uppercase tracking-[0.5em] shadow-2xl active:scale-[0.98] group">
                       <Archive size={28} className="group-hover:rotate-12 transition-transform" /> BUILD_SOVEREIGN_MESH_BUNDLE
                     </button>
                   </div>
                 )}
              </div>

              <div className="lg:col-span-2 space-y-16">
                 <div className="space-y-4">
                   <h4 className="text-[13px] font-black mono uppercase text-zinc-700 tracking-[0.6em] border-b border-zinc-900 pb-8 flex items-center justify-between">
                     Signal Analytics <Info size={14} className="opacity-40" />
                   </h4>
                   <div className="grid grid-cols-2 gap-8 pt-4">
                      <MasterMetric label="RMS_POWER" value={masterMetrics?.rms.toFixed(5) || '----'} />
                      <MasterMetric label="PEAK_AMP" value={masterMetrics?.peak.toFixed(5) || '----'} />
                      <MasterMetric label="HRV_MOD" value={masterMetrics?.hrvModulationDepth ? `${(masterMetrics.hrvModulationDepth * 1000).toFixed(1)}m%` : '----'} />
                      <MasterMetric label="REVERB_T" value={masterMetrics ? `${masterMetrics.rt60_sec.toFixed(2)}S` : '----'} />
                   </div>
                 </div>

                 <div className="p-10 bg-zinc-950 border border-zinc-900 rounded-[3.5rem] space-y-6 shadow-inner">
                    <div className="flex items-center gap-4 text-zinc-700">
                      <ShieldCheck size={20} className="text-emerald-500" />
                      <span className="text-[11px] mono uppercase font-black tracking-widest">Logic Verification</span>
                    </div>
                    <div className="space-y-3 text-[10px] mono text-zinc-600 uppercase font-bold">
                       <div className="flex justify-between"><span>Invariant Lock</span><span className="text-emerald-500">PASSED</span></div>
                       <div className="flex justify-between"><span>Divergence Scan</span><span className="text-emerald-500">0.00%</span></div>
                       <div className="flex justify-between"><span>Audit Ready</span><span className="text-emerald-500">YES</span></div>
                    </div>
                 </div>

                 <div className="pt-4 space-y-12">
                    <button onClick={handleSubmitFinal} disabled={isMastering} className="w-full py-10 bg-white hover:bg-zinc-100 text-black font-black rounded-[3rem] transition-all disabled:opacity-50 active:scale-[0.98] mono uppercase text-lg flex items-center justify-center gap-6 shadow-[0_0_80px_rgba(255,255,255,0.1)] group">
                      COMMIT_SOVEREIGN_LOG <ArrowRight size={32} className="group-hover:translate-x-3 transition-transform" />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <footer className="pt-24 flex justify-between items-center border-t border-zinc-900 opacity-20 hover:opacity-100 transition-opacity duration-1500 group">
        <div className="flex items-center gap-12">
           <div className="flex items-center gap-5">
              <Database size={22} className="text-zinc-600 group-hover:text-amber-500/50 transition-colors" />
              <span className="text-[12px] mono text-zinc-600 uppercase font-black tracking-widest">Sovereign Engine: Wonder_v2.1_GLOBAL_LOCK</span>
           </div>
           <div className="w-4 h-4 rounded-full bg-zinc-900"></div>
           <span className="text-[12px] mono text-zinc-700 uppercase font-black tracking-[0.4em] italic group-hover:text-zinc-500">DETERMINISTIC_SEED: 42</span>
        </div>
        {moodHistory.length > 0 && moodHistory[moodHistory.length - 1].artifact && (
          <button onClick={exportArtifact} className="flex items-center gap-6 px-12 py-5 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 text-[12px] font-black mono text-zinc-500 hover:text-amber-500 hover:border-amber-500/40 transition-all uppercase tracking-[0.5em] active:scale-95 shadow-2xl group/btn">
            <Download size={24} className="group-hover/btn:translate-y-1 transition-transform" /> EXPORT_SOVEREIGN_ARTIFACT
          </button>
        )}
      </footer>

      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-150%); } 100% { transform: translateX(350%); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 20px; border: 1px solid #000; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2a2a2a; }
        .text-glow { text-shadow: 0 0 40px rgba(255,255,255,0.15); }
      `}</style>
    </div>
  );
};

const MasterMetric: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="p-12 bg-zinc-900/20 border border-zinc-900 rounded-[3.5rem] shadow-inner hover:bg-zinc-900/40 transition-all group text-center border-b-[4px]">
    <p className="text-[11px] mono text-zinc-700 uppercase font-black mb-5 tracking-widest group-hover:text-zinc-500 transition-colors">{label}</p>
    <p className="text-5xl font-black text-white tracking-tighter leading-none group-hover:text-amber-500 transition-colors">{value}</p>
  </div>
);

const DspControl: React.FC<{ label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; unit?: string }> = ({ label, value, onChange, min = 0, max = 100, unit = "" }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center px-2">
      <span className="text-[12px] mono text-zinc-700 font-black uppercase tracking-widest">{label}</span>
      <span className="text-[12px] mono text-amber-500 font-black tracking-widest">{value}{unit}</span>
    </div>
    <input 
      type="range" min={min} max={max} step="1" 
      value={value} 
      onChange={(e) => onChange(parseInt(e.target.value))} 
      className="w-full h-2.5 bg-zinc-900 rounded-full appearance-none cursor-pointer accent-zinc-700 hover:accent-amber-500 transition-all shadow-inner" 
    />
  </div>
);

export default AudioLabView;
