
import React, { useState, useRef } from 'react';
import { MoodEntry } from '../types';
import { Calendar, Trash2, Download, Mic, Square, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { transcribeAudio } from '../lib/gemini';

interface Props {
  moodHistory: MoodEntry[];
  onUpdate: (history: MoodEntry[]) => void;
}

const JournalView: React.FC<Props> = ({ moodHistory, onUpdate }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleDelete = (id: string) => {
    if (window.confirm("Permanent deletion of record?")) {
      onUpdate(moodHistory.filter(m => m.id !== id));
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(moodHistory, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `heavenzfire_log_${Date.now()}.json`;
    a.click();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        await processTranscription(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error(e);
      alert("Microphone access required for transcription.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processTranscription = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const text = await transcribeAudio(base64Data);
        
        // Add as a special transcription entry
        const entry: MoodEntry = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          scoreBefore: 0,
          notes: `[TRANSCRIPTION] ${text}`,
        };
        onUpdate([...moodHistory, entry]);
      };
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center border-b border-zinc-900 pb-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tighter uppercase">Sovereign Log</h2>
          <p className="text-zinc-500 text-sm mono">Deterministic historical record of suffering reduction.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="p-3 px-6 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-black mono hover:bg-zinc-800 transition-colors flex items-center gap-2"
          >
            <Download size={14} /> EXPORT_JSON
          </button>
        </div>
      </header>

      {/* Transcription Hub */}
      <section className="bg-zinc-950 border border-zinc-900 p-8 rounded-3xl shadow-2xl space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${isRecording ? 'bg-rose-500/20 animate-pulse' : 'bg-zinc-900'}`}>
              <Mic className={isRecording ? 'text-rose-500' : 'text-zinc-500'} size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tighter">Audio Observation</h3>
              <p className="text-xs text-zinc-600 mono">{isRecording ? 'RECORDING_ACTIVE' : 'READY_TO_TRANSCRIBE'}</p>
            </div>
          </div>
          
          <button 
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isTranscribing}
            className={`px-8 py-4 rounded-2xl font-black mono text-xs uppercase transition-all active:scale-95 flex items-center gap-2 ${
              isRecording ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
            }`}
          >
            {isRecording ? <><Square size={16} /> STOP_LOG</> : <><Mic size={16} /> START_LOG</>}
          </button>
        </div>

        {isTranscribing && (
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center gap-4 animate-pulse">
            <Loader2 className="animate-spin text-amber-500" size={20} />
            <span className="text-xs font-black mono uppercase text-zinc-400">Gemini Synthesis in progress...</span>
          </div>
        )}
      </section>

      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-zinc-800 text-[10px] mono text-zinc-500 uppercase">
                <th className="px-6 py-5 font-bold">Timestamp</th>
                <th className="px-6 py-5 font-bold">Delta (Before/After)</th>
                <th className="px-6 py-5 font-bold">Observations</th>
                <th className="px-6 py-5 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {moodHistory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-zinc-600 italic mono uppercase text-xs">
                    No sovereign records found. System initialization pending.
                  </td>
                </tr>
              ) : (
                moodHistory.slice().reverse().map(entry => (
                  <tr key={entry.id} className="hover:bg-zinc-900/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm font-bold">
                        <Calendar size={14} className="text-zinc-600" />
                        {new Date(entry.timestamp).toLocaleDateString()}
                        <span className="text-[10px] text-zinc-700 mono">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        {entry.notes.includes('[TRANSCRIPTION]') ? (
                          <span className="flex items-center gap-1 text-[10px] mono text-cyan-500 font-black px-2 py-0.5 rounded bg-cyan-500/10">
                            <Sparkles size={10} /> AI_LOG
                          </span>
                        ) : (
                          <>
                            <span className="text-lg font-black text-zinc-400">{entry.scoreBefore}</span>
                            <span className="text-zinc-800">→</span>
                            <span className="text-lg font-black text-amber-500">{entry.scoreAfter ?? '?'}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-zinc-400 text-sm max-w-md italic leading-relaxed mono">
                      {entry.notes || <span className="opacity-30">NO_OBSERVATION</span>}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => handleDelete(entry.id)}
                        className="p-2 text-zinc-800 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JournalView;
