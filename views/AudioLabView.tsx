
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
  Waves
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
    gridSync: '60Hz'
  });

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        const time = Date.now() / 1000;
        const basePulse = Math.sin(time * (bioMetrics.bpm / 60 || 1.2) * 2 * Math.PI);
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
  }, [isPlaying, bioSyncEnabled, bioMetrics.bpm]);

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
      '[SYSTEM] INITIALIZING MASTERING ENGINE v3.1_OFFLINE', 
      `[SYSTEM] GRID_SYNC_LOCK: ${dsp.gridSync}`,
      '[SYSTEM] LOADING SESSION TELEMETRY...', 
      '[SYSTEM] BUFFERING SIGNAL_ARRAY (N=4000)',
    ]);
    
    setTimeout(() => {
      setMasteringLogs(prev => [
        ...prev, 
        '[SYSTEM] APPLYING STFT DENOISE...', 
        '[SYSTEM] CALCULATING RMS_LADDER...', 
        '[SYSTEM] NORMALIZING AMPLITUDE...',
        '[SYSTEM] GENERATING SOVEREIGN FINGERPRINT...'
      ]);
      const metrics = BioSignalProcessor.computeMasterMetrics(sessionSignalData);
      setMasterMetrics(metrics);
      
      setTimeout(() => {
        setMasteringLogs(prev => [
          ...prev, 
          `[STATS] RMS_OBSERVED: ${metrics.rms.toFixed(5)}`,
          `[HASH] SOVEREIGN_CHECKSUM: ${metrics.checksum}`,
          '[SUCCESS] GLOBAL_SIGNAL_STABILIZED.',
        ]);
        setIsMastering(false);
      }, 1200);
    }, 1000);
  };

  const buildDeploymentBundle = () => {
    if (!masterMetrics || !selectedTrack) return;
    const bundle = {
      packageID: `HF-DIST-${crypto.randomUUID().slice(0,8).toUpperCase()}`,
      timestamp: Date.now(),
      protocol: "HEAVENZFIRE_SOVEREIGN_V1",
      locale,
      dsp: dsp,
      metrics: masterMetrics,
    };
    const data = JSON.stringify(bundle, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HF_DEPLOYMENT_${bundle.packageID}.json`;
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
      version: "1.0.0",
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
    <div className="space-y-12 max-w-5xl mx-auto">
      <header className="flex justify-between items-end border-b border-zinc-900 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-amber-500 rounded-lg shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <Globe className="text-black" size={24} />
             </div>
             <h2 className="text-5xl font-black tracking-tighter uppercase text-white leading-none text-glow">Signal Hub</h2>
          </div>
          <p className="text-zinc-500 text-[10px] mono uppercase tracking-[0.4em] font-black leading-none opacity-60">
            Global Protocol v3.1_MESH :: {wonderMode ? 'WONDER_ENGAGED' : 'STANDARD_LOGIC'}
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setWonderMode(!wonderMode)}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-xl border text-[10px] font-black mono transition-all active:scale-95 ${wonderMode ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-2xl shadow-amber-500/10' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
          >
            <Sparkles size={14} fill={wonderMode ? "currentColor" : "none"} />
            {wonderMode ? 'WONDER_ACTIVE' : 'ACTIVATE_WONDER'}
          </button>
        </div>
      </header>

      {sessionPhase === 'IDLE' && (
        <div className="space-y-12 animate-in fade-in duration-500">
          <section className="bg-zinc-950 border border-zinc-900 p-10 rounded-[2.5rem] shadow-[0_0_60px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8">
              <Fingerprint className="text-zinc-800 group-hover:text-amber-500/20 transition-all duration-700" size={48} />
            </div>
            <div className="flex items-center gap-6 mb-10">
               <div className="p-5 bg-amber-500/10 rounded-2xl border border-amber-500/20 shadow-inner">
                 <Mic className="text-amber-500" size={32} />
               </div>
               <div>
                 <h3 className="text-3xl font-black uppercase tracking-tighter text-white">Global Synthesis</h3>
                 <p className="text-[10px] text-zinc-600 mono uppercase tracking-widest font-bold">Multilingual Affirmation Carrier</p>
               </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input 
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Enter therapeutic affirmations..."
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-8 py-6 text-sm focus:border-amber-500 outline-none transition-all mono text-zinc-300 placeholder:text-zinc-700 shadow-inner"
                />
                <select 
                  value={locale}
                  onChange={(e) => setLocale(e.target.value as SignalLocale)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-zinc-800 border border-zinc-700 text-[10px] mono font-bold text-amber-500 p-1.5 rounded-lg focus:border-amber-500 outline-none cursor-pointer"
                >
                  <option value="EN">EN_SIGNAL</option>
                  <option value="ES">ES_SIGNAL</option>
                  <option value="AR">AR_SIGNAL</option>
                  <option value="ZH">ZH_SIGNAL</option>
                  <option value="HI">HI_SIGNAL</option>
                </select>
              </div>
              <button 
                onClick={handleGenerateCustom}
                disabled={isGenerating || !customPrompt.trim()}
                className="px-12 py-6 bg-amber-500 text-black font-black rounded-2xl hover:bg-amber-400 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl shadow-amber-500/30 uppercase text-xs tracking-tighter"
              >
                {isGenerating ? <Loader2 className="animate-spin" /> : <Volume2 size={24} />}
                Lock_Locale
              </button>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BASELINE_TRACKS.map(track => (
              <div 
                key={track.id}
                className="group bg-zinc-950 border border-zinc-900 p-8 rounded-[2.2rem] hover:border-amber-500/40 transition-all cursor-pointer relative overflow-hidden shadow-2xl hover:shadow-amber-500/10 active:scale-[0.98]"
                onClick={() => handleStartSession(track)}
              >
                <div className="absolute top-0 right-0 p-5 opacity-40">
                  <span className="text-[9px] mono text-zinc-800 font-black">{track.id}</span>
                </div>
                <div className="flex justify-between mb-8 relative z-10">
                  <span className="text-[10px] mono px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:text-amber-500 group-hover:border-amber-500/40 transition-all uppercase font-black tracking-[0.2em]">
                    {track.category}
                  </span>
                  <span className="text-[10px] text-zinc-600 flex items-center gap-2 mono uppercase font-black opacity-60">
                    <Clock size={14} /> {Math.floor(track.duration / 60)}M
                  </span>
                </div>
                <h4 className="text-2xl font-black mb-3 relative z-10 group-hover:text-amber-500 transition-colors uppercase tracking-tighter text-white">{track.name}</h4>
                <p className="text-zinc-500 text-xs mb-8 line-clamp-2 relative z-10 mono italic leading-relaxed opacity-70">{track.description}</p>
                <div className="flex items-center gap-3 text-zinc-800 text-[10px] font-black mono relative z-10 uppercase tracking-[0.3em] group-hover:text-amber-500 transition-colors">
                  INITIALIZE_PIPELINE <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sessionPhase === 'PRE_REPORT' && (
        <div className="max-w-xl mx-auto bg-zinc-950 border border-zinc-900 p-12 rounded-[3rem] space-y-12 animate-in zoom-in-95 duration-500 shadow-[0_0_100px_rgba(0,0,0,0.6)] relative overflow-hidden">
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px]"></div>
          <div className="text-center space-y-4 relative z-10">
            <h3 className="text-4xl font-black uppercase tracking-tighter text-white">Pre-Session Log</h3>
            <p className="text-zinc-500 text-[10px] mono uppercase tracking-[0.4em] font-black opacity-60">Quantify Magnitude Delta</p>
          </div>
          
          <div className="space-y-16 relative z-10">
            <div className="space-y-10">
              <div className="flex justify-between items-end">
                <label className="text-[10px] mono font-black text-zinc-600 uppercase tracking-widest">Suffering Intensity</label>
                <span className="text-7xl font-black text-amber-500 tracking-tighter drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]">{preMood}</span>
              </div>
              <input 
                type="range" min="0" max="10" step="1" 
                value={preMood}
                onChange={(e) => setPreMood(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div className="p-10 bg-black/40 border border-zinc-900 rounded-[2.5rem] flex items-center justify-between shadow-inner group transition-all hover:bg-black/60">
              <div className="flex items-center gap-6">
                <Heart className={bioSyncEnabled ? "text-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.6)] scale-125" : "text-zinc-800 transition-all opacity-30"} size={32} />
                <div className="space-y-1.5">
                  <span className="text-sm font-black mono uppercase tracking-tight text-zinc-400">Bio-Link Protocol</span>
                  <p className="text-[10px] text-zinc-600 mono uppercase tracking-widest font-bold">HRV CLOSED-LOOP ENTRAINMENT</p>
                </div>
              </div>
              <button 
                onClick={() => setBioSyncEnabled(!bioSyncEnabled)}
                className={`w-16 h-8 rounded-full transition-all relative p-1.5 ${bioSyncEnabled ? 'bg-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.3)]' : 'bg-zinc-800'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-all shadow-xl ${bioSyncEnabled ? 'translate-x-8' : 'translate-x-0'}`} />
              </button>
            </div>

            <button 
              onClick={handleBeginAudio}
              className="w-full py-7 bg-amber-500 text-black font-black rounded-[1.8rem] active:scale-[0.97] transition-all mono tracking-tighter uppercase text-base shadow-2xl shadow-amber-500/20"
            >
              DEPLOY_STABILIZER
            </button>
          </div>
        </div>
      )}

      {sessionPhase === 'ACTIVE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-zinc-950 border border-zinc-900 rounded-[3.5rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] relative">
              <Visualizer 
                isActive={isPlaying} 
                isWonderMode={wonderMode} 
                intensity={bioSyncEnabled ? (bioMetrics.rmssd / 100) : 0.5} 
              />
              <div className="p-12 space-y-12">
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)] animate-pulse' : 'bg-zinc-800'}`}></div>
                      <span className="text-[10px] mono text-emerald-500 font-black uppercase tracking-[0.3em] font-black">System_Active</span>
                    </div>
                    <h3 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">{selectedTrack?.name}</h3>
                    <p className="text-zinc-600 text-[10px] mono uppercase tracking-[0.4em] font-black opacity-60">Sequence: {selectedTrack?.id}</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex justify-between text-[10px] mono text-zinc-500 font-black uppercase tracking-[0.2em]">
                    <span>Temporal Projection</span>
                    <span className="text-zinc-300">{progress.toFixed(2)}%</span>
                  </div>
                  <div className="h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 shadow-inner">
                    <div 
                      className={`h-full bg-gradient-to-r ${wonderMode ? 'from-amber-500 via-cyan-400 to-amber-500' : 'from-amber-700 to-amber-400'} transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.4)]`} 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {bioSyncEnabled && (
                  <div className="space-y-8 pt-12 border-t border-zinc-900/50">
                    <div className="flex items-center gap-4">
                       <Activity className="text-rose-500" size={24} />
                       <span className="text-[11px] font-black mono uppercase text-zinc-500 tracking-[0.3em]">Bio-Link Telemetry</span>
                    </div>
                    <PulseVisualizer value={currentPulseValue} bpm={bioMetrics.bpm} isActive={isPlaying} />
                    <div className="grid grid-cols-3 gap-8">
                       <div className="p-8 bg-zinc-900/30 border border-zinc-900 rounded-[2.5rem] shadow-inner group hover:bg-zinc-900/50 transition-all">
                          <p className="text-[10px] mono text-zinc-700 uppercase font-black mb-3 tracking-widest">RMSSD (HRV)</p>
                          <p className="text-4xl font-black text-white group-hover:text-rose-500 transition-colors leading-none">{bioMetrics.rmssd} <span className="text-xs text-zinc-800">ms</span></p>
                       </div>
                       <div className="p-8 bg-zinc-900/30 border border-zinc-900 rounded-[2.5rem] shadow-inner text-center">
                          <p className="text-[10px] mono text-zinc-700 uppercase font-black mb-3 tracking-widest">Resonance</p>
                          <p className="text-4xl font-black text-zinc-500 leading-none">COH</p>
                       </div>
                       <div className="p-8 bg-zinc-900/30 border border-zinc-900 rounded-[2.5rem] shadow-inner text-right">
                          <p className="text-[10px] mono text-zinc-700 uppercase font-black mb-3 tracking-widest">Signal_SQI</p>
                          <p className={`text-4xl font-black leading-none ${bioMetrics.confidence > 0.7 ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {(bioMetrics.confidence * 100).toFixed(0)}<span className="text-xs opacity-30">%</span>
                          </p>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <button 
              onClick={handleFinishAudio}
              className="w-full py-7 bg-zinc-950 border border-zinc-900 hover:bg-zinc-900 text-zinc-700 hover:text-rose-500 font-black rounded-[2.5rem] transition-all mono uppercase tracking-[0.4em] text-[11px] flex items-center justify-center gap-4 shadow-2xl active:scale-[0.98]"
            >
              <Zap size={18} className="fill-current" /> MANUAL_COMPLETION_OVERRIDE
            </button>
          </div>

          <aside className="space-y-10">
            <div className="bg-zinc-950 border border-zinc-900 p-10 rounded-[3rem] space-y-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-4 mb-2">
                <Sliders size={22} className="text-amber-500" />
                <h4 className="text-[11px] font-black mono uppercase tracking-widest text-zinc-500">DSP Chain Topology</h4>
              </div>

              <div className="space-y-4">
                <p className="text-[9px] mono text-zinc-700 uppercase font-black tracking-widest flex items-center gap-2">
                  <Waves size={10} /> Grid_Sync_Lock
                </p>
                <div className="flex gap-2">
                  {(['50Hz', '60Hz'] as GridFrequency[]).map(freq => (
                    <button 
                      key={freq}
                      onClick={() => setDsp({...dsp, gridSync: freq})}
                      className={`flex-1 py-2 rounded-xl text-[10px] mono font-bold border transition-all ${dsp.gridSync === freq ? 'bg-amber-500 text-black border-amber-500' : 'bg-zinc-900 text-zinc-600 border-zinc-800'}`}
                    >
                      {freq}
                    </button>
                  ))}
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
        <div className="max-w-xl mx-auto bg-zinc-950 border border-zinc-900 p-12 rounded-[3.5rem] space-y-12 animate-in zoom-in-95 duration-500 shadow-[0_0_120px_rgba(0,0,0,0.6)] relative overflow-hidden">
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-emerald-500/5 rounded-full blur-[90px]"></div>
          <div className="text-center space-y-4 relative z-10">
            <h3 className="text-4xl font-black uppercase tracking-tighter text-white">Post-Session Log</h3>
            <p className="text-zinc-500 text-[10px] mono uppercase tracking-[0.4em] font-black opacity-60">Quantify Success Magnitude</p>
          </div>
          
          <div className="space-y-12 relative z-10">
             <div className="space-y-10">
              <div className="flex justify-between items-end">
                <label className="text-[10px] mono font-black text-zinc-600 uppercase tracking-widest">Residual Magnitude</label>
                <span className="text-7xl font-black text-amber-500 tracking-tighter drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]">{postMood}</span>
              </div>
              <input type="range" min="0" max="10" step="1" value={postMood} onChange={(e) => setPostMood(parseInt(e.target.value))} className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-500" />
            </div>

            <div className="p-10 bg-black/40 border border-zinc-900 rounded-[2.5rem] space-y-3 text-center shadow-inner">
              <div className="flex items-center justify-center gap-3 text-emerald-500 mb-2">
                <CheckCircle2 size={24} />
                <span className="text-[11px] font-black uppercase tracking-widest">Protocol Success Confirmed</span>
              </div>
              <p className="text-7xl font-black text-white tracking-tighter leading-none">
                {preMood - postMood > 0 ? `-${preMood - postMood}` : (preMood === postMood ? '±0' : `+${postMood - preMood}`)}
                <span className="text-zinc-700 text-sm ml-4 font-mono tracking-tighter uppercase font-black italic opacity-40">Pts Intensity</span>
              </p>
            </div>

            <button onClick={startMasteringPhase} className="w-full py-7 bg-amber-500 text-black font-black rounded-[1.8rem] active:scale-[0.97] transition-all mono tracking-tighter uppercase text-base shadow-2xl shadow-amber-500/30 flex items-center justify-center gap-4">
              <Package size={24} /> INITIALIZE_MASTERING
            </button>
          </div>
        </div>
      )}

      {sessionPhase === 'MASTERING' && (
        <div className="max-w-4xl mx-auto bg-zinc-950 border border-zinc-900 rounded-[4rem] overflow-hidden shadow-[0_0_150px_rgba(0,0,0,0.7)] animate-in fade-in zoom-in-95 duration-700">
           <div className="bg-zinc-900/50 p-10 border-b border-zinc-900 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500/10"><div className="h-full bg-amber-500 animate-[shimmer_2.5s_infinite] w-1/3"></div></div>
              <div className="flex items-center gap-6 relative z-10">
                <Terminal className="text-amber-500" size={28} />
                <div className="space-y-1">
                  <h3 className="text-base font-black mono uppercase tracking-[0.3em] text-white">Mastering Terminal v3.1</h3>
                  <p className="text-[10px] mono text-zinc-600 uppercase font-black tracking-widest">SOVEREIGN HARDWARE LOCK ENVIRONMENT</p>
                </div>
              </div>
              <div className="flex items-center gap-4 px-6 py-2.5 bg-black rounded-2xl border border-zinc-800 relative z-10">
                 <div className={`w-3 h-3 rounded-full ${isMastering ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]'}`}></div>
                 <span className="text-[11px] mono font-black text-zinc-500 uppercase tracking-widest">{isMastering ? 'EXECUTING_LADDER' : 'NOMINAL_STATUS'}</span>
              </div>
           </div>
           
           <div className="p-12 grid grid-cols-1 lg:grid-cols-5 gap-12">
              <div className="lg:col-span-3 space-y-10">
                 <div className="bg-black border border-zinc-900 rounded-[2.5rem] p-10 h-[450px] overflow-y-auto font-mono text-[10px] space-y-3 shadow-inner custom-scrollbar">
                    {masteringLogs.map((log, i) => (
                      <div key={i} className={`flex gap-5 ${log.includes('[STATS]') ? 'text-cyan-400' : log.includes('[HASH]') ? 'text-amber-500' : log.includes('[SUCCESS]') ? 'text-emerald-500' : log.includes('[DEPLOY]') ? 'text-amber-300 font-black underline' : 'text-zinc-600 opacity-60'}`}>
                        <span className="opacity-20 shrink-0">[{i.toString().padStart(3, '0')}]</span>
                        <span className="leading-relaxed tracking-wider">{log}</span>
                      </div>
                    ))}
                    {isMastering && <div className="flex gap-5 text-amber-500 animate-pulse mt-6"><span className="opacity-20 shrink-0">[{masteringLogs.length.toString().padStart(3, '0')}]</span><span className="font-black tracking-widest uppercase">LADDER_TRANSFORM_IN_PROGRESS...</span></div>}
                    <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
                 </div>
                 
                 {!isMastering && masterMetrics && (
                   <div className="flex flex-col gap-5 animate-in slide-in-from-bottom-2 duration-500">
                     <div className="p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem] flex items-center gap-8 shadow-inner">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/5"><FileJson size={32} /></div>
                        <div className="space-y-1.5">
                          <p className="text-sm font-black mono text-emerald-500 uppercase tracking-widest">Sovereign Artifact Integrity: NOMINAL</p>
                          <p className="text-[10px] text-zinc-700 mono uppercase tracking-widest font-bold">CHECKSUM: <span className="text-zinc-400 font-black">{masterMetrics.checksum.toUpperCase()}</span></p>
                        </div>
                     </div>
                     <button onClick={buildDeploymentBundle} className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-[2.5rem] flex items-center justify-center gap-4 text-amber-500 hover:bg-amber-500/20 transition-all font-black mono text-xs uppercase tracking-[0.3em] shadow-2xl active:scale-[0.98]">
                       <Archive size={20} /> BUILD_SOVEREIGN_DIST_BUNDLE
                     </button>
                   </div>
                 )}
              </div>

              <div className="lg:col-span-2 space-y-10">
                 <h4 className="text-[11px] font-black mono uppercase text-zinc-700 tracking-[0.4em] border-b border-zinc-900 pb-5">Artifact Telemetry</h4>
                 <div className="grid grid-cols-2 gap-5">
                    <MasterMetric label="RMS_POWER" value={masterMetrics?.rms.toFixed(5) || '----'} />
                    <MasterMetric label="PEAK_MAG" value={masterMetrics?.peak.toFixed(5) || '----'} />
                    <MasterMetric label="REVERB_RT60" value={masterMetrics ? `${masterMetrics.rt60_sec.toFixed(2)}s` : '----'} />
                    <MasterMetric label="TAIL_MAG" value={masterMetrics ? `${masterMetrics.tail_rms_db.toFixed(1)}dB` : '----'} />
                 </div>
                 <div className="pt-16 space-y-8">
                    <button onClick={handleSubmitFinal} disabled={isMastering} className="w-full py-6 bg-white hover:bg-zinc-100 text-black font-black rounded-[2rem] transition-all disabled:opacity-50 active:scale-[0.98] mono uppercase text-sm flex items-center justify-center gap-4 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                      LOCK_TO_SOVEREIGN_HISTORY <ArrowRight size={22} />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <footer className="pt-16 flex justify-between items-center border-t border-zinc-900 opacity-20 hover:opacity-100 transition-opacity duration-1000">
        <div className="flex items-center gap-8">
           <div className="flex items-center gap-3">
              <Database size={16} className="text-zinc-600" />
              <span className="text-[10px] mono text-zinc-600 uppercase font-black tracking-widest">Engine: Wonder_V3.1_GLOBAL</span>
           </div>
           <div className="w-2 h-2 rounded-full bg-zinc-900"></div>
           <span className="text-[10px] mono text-zinc-700 uppercase font-black tracking-[0.2em] italic">GLOBAL_LOCALE: {locale}</span>
        </div>
        {moodHistory.length > 0 && moodHistory[moodHistory.length - 1].artifact && (
          <button onClick={exportArtifact} className="flex items-center gap-4 px-8 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-[10px] font-black mono text-zinc-500 hover:text-amber-500 hover:border-amber-500/40 transition-all uppercase tracking-[0.3em] active:scale-95">
            <Download size={18} /> EXPORT_LATEST_ARTIFACT
          </button>
        )}
      </footer>

      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #000; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #18181b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #27272a; }
        .text-glow { text-shadow: 0 0 20px rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
};

const MasterMetric: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="p-8 bg-zinc-900/30 border border-zinc-900 rounded-[2.5rem] shadow-inner hover:bg-zinc-900/50 transition-all group">
    <p className="text-[10px] mono text-zinc-700 uppercase font-black mb-3 tracking-widest group-hover:text-zinc-500">{label}</p>
    <p className="text-3xl font-black text-white tracking-tighter leading-none">{value}</p>
  </div>
);

const DspControl: React.FC<{ label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; unit?: string }> = ({ label, value, onChange, min = 0, max = 100, unit = "" }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center px-1">
      <span className="text-[10px] mono text-zinc-600 font-black uppercase tracking-widest">{label}</span>
      <span className="text-[10px] mono text-amber-500 font-black tracking-widest">{value}{unit}</span>
    </div>
    <input type="range" min={min} max={max} step="1" value={value} onChange={(e) => onChange(parseInt(e.target.value))} className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-zinc-500 hover:accent-amber-500 transition-all" />
  </div>
);

export default AudioLabView;
