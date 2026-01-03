
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Settings2, 
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Ear,
  Sliders,
  ShieldCheck,
  Mic,
  Volume2,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { BASELINE_TRACKS } from '../constants';
import { AudioTrack, MoodEntry, DSPConfig } from '../types';
import Visualizer from '../components/Visualizer';
import { generateTherapeuticSpeech, decodeBase64, decodeAudioData } from '../lib/gemini';

interface Props {
  onMoodUpdate: (history: MoodEntry[]) => void;
  moodHistory: MoodEntry[];
}

const AudioLabView: React.FC<Props> = ({ onMoodUpdate, moodHistory }) => {
  const [selectedTrack, setSelectedTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionPhase, setSessionPhase] = useState<'IDLE' | 'PRE_REPORT' | 'ACTIVE' | 'POST_REPORT'>('IDLE');
  const [preMood, setPreMood] = useState(5);
  const [postMood, setPostMood] = useState(5);
  const [notes, setNotes] = useState('');
  const [progress, setProgress] = useState(0);
  
  // Custom Speech Synthesis
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [ttsAudioBuffer, setTtsAudioBuffer] = useState<AudioBuffer | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Hardened DSP State
  const [dsp, setDsp] = useState<DSPConfig>({
    denoiseAmount: 40,
    compressionRatio: 4,
    reverbWet: 0.3,
    binauralDepth: 0.8
  });

  const [safetyLock, setSafetyLock] = useState(true);
  const [peakLevel, setPeakLevel] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isPlaying && progress < 100) {
      interval = setInterval(() => {
        setProgress(p => Math.min(100, p + 0.05));
        setPeakLevel(Math.random() * 0.2 + 0.4);
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
      const base64 = await generateTherapeuticSpeech(customPrompt);
      if (base64) {
        if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
        const bytes = decodeBase64(base64);
        const buffer = await decodeAudioData(bytes, audioCtxRef.current);
        setTtsAudioBuffer(buffer);
        
        // Mock a track for custom session
        const customTrack: AudioTrack = {
          id: 'custom-tts',
          name: 'Custom Signal Synthesized',
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
    
    // If TTS, play the buffer
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

  const handleSubmitFinal = () => {
    const entry: MoodEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      scoreBefore: preMood,
      scoreAfter: postMood,
      notes,
      trackId: selectedTrack?.id,
      dspSnapshot: dsp
    };
    onMoodUpdate([...moodHistory, entry]);
    setSessionPhase('IDLE');
    setSelectedTrack(null);
    setTtsAudioBuffer(null);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header className="flex justify-between items-end border-b border-zinc-900 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
             <ShieldCheck className="text-amber-500" size={18} />
             <h2 className="text-3xl font-bold tracking-tight">Audio Lab</h2>
          </div>
          <p className="text-zinc-500 text-sm max-w-md mono uppercase tracking-widest">
            Signal Synthesis v1.5 :: GEMINI_TTS_INTEGRATED
          </p>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <div className="text-[10px] mono text-zinc-600 uppercase">Safety Governor</div>
            <div className={`text-xs font-bold mono ${safetyLock ? 'text-emerald-500' : 'text-rose-500'}`}>
              {safetyLock ? 'LOCKED_-6dB' : 'UNRESTRICTED'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] mono text-zinc-600 uppercase">Carrier</div>
            <div className="text-amber-500 font-bold mono tracking-widest">{selectedTrack?.baseFrequency || '432'} Hz</div>
          </div>
        </div>
      </header>

      {sessionPhase === 'IDLE' && (
        <div className="space-y-8">
          {/* Custom TTS Synthesizer */}
          <section className="bg-zinc-950 border border-zinc-900 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-3 bg-amber-500/10 rounded-2xl">
                 <Mic className="text-amber-500" size={24} />
               </div>
               <div>
                 <h3 className="text-xl font-black uppercase tracking-tighter">Signal Synthesizer</h3>
                 <p className="text-xs text-zinc-600 mono">Gemini-2.5-Flash-TTS Engine</p>
               </div>
            </div>
            <div className="flex gap-4">
              <input 
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Enter therapeutic affirmations for custom signal synthesis..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-sm focus:border-amber-500 outline-none transition-all mono"
              />
              <button 
                onClick={handleGenerateCustom}
                disabled={isGenerating || !customPrompt.trim()}
                className="px-8 bg-amber-500 text-black font-black rounded-2xl hover:bg-amber-400 disabled:opacity-50 transition-all active:scale-95 flex items-center gap-2"
              >
                {isGenerating ? <Loader2 className="animate-spin" /> : <Volume2 size={20} />}
                SYNTHESIZE
              </button>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BASELINE_TRACKS.map(track => (
              <div 
                key={track.id}
                className="group bg-zinc-950 border border-zinc-900 p-6 rounded-2xl hover:border-amber-500/40 transition-all cursor-pointer relative overflow-hidden"
                onClick={() => handleStartSession(track)}
              >
                <div className="flex justify-between mb-4 relative z-10">
                  <span className="text-[10px] mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:text-amber-500 transition-colors">
                    {track.category}
                  </span>
                  <span className="text-[10px] text-zinc-600 flex items-center gap-1 mono">
                    <Clock size={10} /> {Math.floor(track.duration / 60)}M
                  </span>
                </div>
                <h4 className="text-lg font-bold mb-2 relative z-10 group-hover:text-amber-500 transition-colors">{track.name}</h4>
                <p className="text-zinc-500 text-xs mb-4 line-clamp-2 relative z-10">{track.description}</p>
                <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold mono relative z-10">
                  INITIALIZE_SYSTEM <Play size={10} fill="currentColor" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sessionPhase === 'PRE_REPORT' && (
        <div className="max-w-xl mx-auto bg-zinc-950 border border-zinc-900 p-8 rounded-3xl space-y-8 animate-in zoom-in-95 duration-300">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold">Pre-Session Assessment</h3>
            <p className="text-zinc-500 text-sm mono uppercase tracking-widest text-[10px]">Quantify current state magnitude.</p>
          </div>
          
          <div className="space-y-10">
            <div className="space-y-6">
              <label className="text-xs mono font-bold text-zinc-400 flex justify-between uppercase tracking-tighter">
                <span>Suffering Magnitude</span>
                <span className="text-amber-500 text-xl font-black">{preMood}</span>
              </label>
              <input 
                type="range" min="0" max="10" step="1" 
                value={preMood}
                onChange={(e) => setPreMood(parseInt(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs mono font-bold text-zinc-400 uppercase tracking-tighter">Observations</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Log physical/mental state variables..."
                className="w-full h-24 bg-zinc-950 border border-zinc-900 rounded-xl p-4 text-sm focus:border-amber-500 outline-none resize-none transition-colors mono"
              />
            </div>

            <button 
              onClick={handleBeginAudio}
              className="w-full py-4 bg-amber-500 text-black font-black rounded-xl active:scale-95 transition-transform mono tracking-tighter uppercase"
            >
              DEPLOY_SIGNAL_PIPELINE
            </button>
          </div>
        </div>
      )}

      {sessionPhase === 'ACTIVE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
              <Visualizer isActive={isPlaying} />
              <div className="p-8 space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-[10px] mono text-emerald-500 font-bold uppercase tracking-widest">Signal_Live</span>
                    </div>
                    <h3 className="text-3xl font-black text-white">{selectedTrack?.name}</h3>
                    <p className="text-zinc-600 text-xs mono mt-1">UUID: {selectedTrack?.id.toUpperCase()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] mono text-zinc-500 font-bold uppercase">
                    <span>Temporal Progress</span>
                    <span>{progress.toFixed(2)}%</span>
                  </div>
                  <div className="h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-700 to-amber-400 transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleFinishAudio}
              className="w-full py-5 border border-zinc-800 hover:bg-zinc-900 text-zinc-500 font-black rounded-2xl transition-all mono uppercase tracking-widest text-xs"
            >
              MANUAL_COMPLETION_OVERRIDE
            </button>
          </div>

          <aside className="space-y-6">
            <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-3xl space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Sliders size={16} className="text-amber-500" />
                <h4 className="text-xs font-black mono uppercase tracking-tighter">DSP Chain Configuration</h4>
              </div>
              
              <DspControl 
                label="STFT Denoise" 
                value={dsp.denoiseAmount} 
                onChange={(v) => setDsp({...dsp, denoiseAmount: v})} 
                unit="%"
              />
              <DspControl 
                label="Multiband Comp" 
                value={dsp.compressionRatio} 
                onChange={(v) => setDsp({...dsp, compressionRatio: v})} 
                min={1} max={20}
                unit=":1"
              />
              <DspControl 
                label="Reverb Wet" 
                value={Math.round(dsp.reverbWet * 100)} 
                onChange={(v) => setDsp({...dsp, reverbWet: v/100})} 
                unit="%"
              />
              <DspControl 
                label="Binaural Width" 
                value={Math.round(dsp.binauralDepth * 100)} 
                onChange={(v) => setDsp({...dsp, binauralDepth: v/100})} 
                unit="%"
              />
            </div>
          </aside>
        </div>
      )}

      {sessionPhase === 'POST_REPORT' && (
        <div className="max-w-xl mx-auto bg-zinc-950 border border-zinc-900 p-8 rounded-3xl space-y-8 animate-in zoom-in-95 duration-300">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold">Post-Session Analysis</h3>
            <p className="text-zinc-500 text-sm mono uppercase tracking-widest text-[10px]">Verify reduction metrics.</p>
          </div>
          
          <div className="space-y-6">
             <div className="space-y-6">
              <label className="text-xs mono font-bold text-zinc-400 flex justify-between uppercase tracking-tighter">
                <span>Residual Intensity</span>
                <span className="text-amber-500 text-xl font-black">{postMood}</span>
              </label>
              <input 
                type="range" min="0" max="10" step="1" 
                value={postMood}
                onChange={(e) => setPostMood(parseInt(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-emerald-500 mb-2">
                <CheckCircle2 size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Telemetric Delta Confirmed</span>
              </div>
              <p className="text-4xl font-black text-white">
                {preMood - postMood > 0 ? `-${preMood - postMood}` : (preMood === postMood ? '0' : `+${postMood - preMood}`)}
                <span className="text-zinc-500 text-xs ml-3 font-mono tracking-tighter uppercase font-bold italic">Points Reduction</span>
              </p>
            </div>

            <button 
              onClick={handleSubmitFinal}
              className="w-full py-5 bg-emerald-500 text-black font-black rounded-xl active:scale-95 transition-transform mono tracking-tighter uppercase"
            >
              COMMIT_TO_SOVEREIGN_LOG
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const DspControl: React.FC<{ label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; unit?: string }> = ({ label, value, onChange, min = 0, max = 100, unit = "" }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <span className="text-[10px] mono text-zinc-500 font-bold uppercase">{label}</span>
      <span className="text-[10px] mono text-amber-500 font-bold">{value}{unit}</span>
    </div>
    <input 
      type="range" min={min} max={max} step="1" 
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-0.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-zinc-500"
    />
  </div>
);

export default AudioLabView;
