
import React, { useState } from 'react';
import { BrainCircuit, Search, Network, Send, Loader2, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { performResearch } from '../lib/gemini';
import { GroundingSource } from '../types';

const IntelligenceView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [useThinking, setUseThinking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ text: string; sources: GroundingSource[] } | null>(null);

  const handleResearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const data = await performResearch(query, useThinking);
      setResult(data);
    } catch (e) {
      console.error(e);
      setResult({ text: "Research protocol failed. Verification of local node required.", sources: [] });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="border-b border-zinc-900 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <BrainCircuit className="text-amber-500" size={24} />
          <h2 className="text-3xl font-black tracking-tighter uppercase">Intelligence Hub</h2>
        </div>
        <p className="text-zinc-500 text-sm mono">
          Sovereign Information Synthesis :: {useThinking ? 'THINKING_MODE_ENGAGED' : 'GROUNDED_SEARCH_PIPELINE'}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-3xl space-y-4">
            <h3 className="text-[10px] font-black mono text-zinc-500 uppercase tracking-widest mb-2">Pipeline Settings</h3>
            
            <button 
              onClick={() => setUseThinking(false)}
              className={`w-full p-4 rounded-xl border flex items-center gap-3 transition-all ${!useThinking ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
            >
              <Search size={18} />
              <div className="text-left">
                <p className="text-xs font-bold">Search Grounding</p>
                <p className="text-[10px] mono opacity-70">Flash Model</p>
              </div>
            </button>

            <button 
              onClick={() => setUseThinking(true)}
              className={`w-full p-4 rounded-xl border flex items-center gap-3 transition-all ${useThinking ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
            >
              <Network size={18} />
              <div className="text-left">
                <p className="text-xs font-bold">Deep Thinking</p>
                <p className="text-[10px] mono opacity-70">Pro Model_32K</p>
              </div>
            </button>

            <div className="pt-4 border-t border-zinc-900">
               <div className="flex items-center gap-2 text-[10px] mono text-zinc-600 uppercase">
                 <ShieldCheck size={12} />
                 Safety Filters Active
               </div>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-3 space-y-6">
          <div className="relative">
            <textarea 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Input query for synthesis (e.g., 'Recent meta-analyses on 432Hz efficacy')..."
              className="w-full h-32 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 text-sm focus:border-amber-500 outline-none resize-none transition-all pr-16 mono"
            />
            <button 
              onClick={handleResearch}
              disabled={isLoading || !query.trim()}
              className="absolute bottom-4 right-4 p-4 bg-amber-500 text-black rounded-2xl hover:bg-amber-400 disabled:opacity-50 active:scale-90 transition-all shadow-xl shadow-amber-500/10"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>

          {result && (
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4">
              <div className="bg-zinc-900/50 px-6 py-4 border-b border-zinc-900 flex justify-between items-center">
                 <span className="text-[10px] mono font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                   <Sparkles size={12} /> Synthesis_Complete
                 </span>
                 <span className="text-[10px] mono text-zinc-600">DETERMINISTIC_ARTIFACT</span>
              </div>
              <div className="p-8 space-y-6">
                <div className="prose prose-invert prose-sm max-w-none text-zinc-300 leading-relaxed mono whitespace-pre-wrap">
                  {result.text}
                </div>

                {result.sources.length > 0 && (
                  <div className="pt-6 border-t border-zinc-900">
                    <h4 className="text-[10px] font-black mono text-zinc-500 uppercase mb-4 tracking-widest">Grounded Sources</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.sources.map((source, i) => (
                        <a 
                          key={i} 
                          href={source.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors group"
                        >
                          <span className="text-xs font-bold truncate pr-4 text-zinc-400 group-hover:text-amber-500">{source.title || source.uri}</span>
                          <ExternalLink size={14} className="text-zinc-600 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntelligenceView;
