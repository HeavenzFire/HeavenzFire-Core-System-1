
import React from 'react';
import { AppView, MoodEntry, VerificationStatus } from '../types';
import { SYSTEM_MANIFESTO } from '../constants';
import { Zap, Heart, ShieldAlert, Cpu, Database, Terminal, ShieldCheck, XCircle } from 'lucide-react';

interface Props {
  onViewChange: (view: AppView) => void;
  moodHistory: MoodEntry[];
  verification: VerificationStatus | null;
}

const DashboardView: React.FC<Props> = ({ onViewChange, moodHistory, verification }) => {
  const lastEntry = moodHistory[moodHistory.length - 1];
  const avgSufferingReduction = moodHistory.reduce((acc, curr) => {
    if (curr.scoreAfter !== undefined) {
      return acc + (curr.scoreBefore - curr.scoreAfter);
    }
    return acc;
  }, 0) / (moodHistory.filter(m => m.scoreAfter !== undefined).length || 1);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold mono uppercase tracking-tight">
          <Zap size={12} className="fill-current" /> Live Node: HeavenzFire Sovereign
        </div>
        <h2 className="text-5xl font-black tracking-tighter uppercase">Tactical Relief</h2>
        <p className="text-zinc-500 max-w-2xl whitespace-pre-line leading-relaxed mono text-xs opacity-70">
          {SYSTEM_MANIFESTO}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<Heart className="text-rose-500" />} 
          title="Avg Reduction" 
          value={avgSufferingReduction.toFixed(1)} 
          unit="Pts/S"
        />
        <StatCard 
          icon={<Cpu className="text-cyan-500" />} 
          title="Integrity Status" 
          value={verification?.passed ? 'VERIFIED' : 'PENDING'} 
          unit={verification?.passed ? 'Nominal' : 'Requires Run'}
          highlight={verification?.passed ? 'emerald' : 'rose'}
        />
        <StatCard 
          icon={<ShieldAlert className="text-amber-500" />} 
          title="Node Security" 
          value="LOCAL" 
          unit="Offline Sovereign"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-zinc-950 border border-zinc-900 p-8 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors"></div>
          <h3 className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter">
            <Zap className="text-amber-500" size={20} fill="currentColor" />
            Active Pipeline
          </h3>
          <p className="text-zinc-500 text-sm leading-relaxed mono">
            Acute distress episodes require structured auditory grounding. 
            Initiate System 1 to deploy 432Hz/528Hz tuned harmonics.
          </p>
          <button 
            onClick={() => onViewChange(AppView.LAB)}
            className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-amber-500/20 uppercase tracking-tighter"
          >
            Launch Audio Lab
            <Zap size={18} fill="currentColor" />
          </button>
        </section>

        <section className="bg-zinc-950 border border-zinc-900 p-8 rounded-3xl space-y-6 shadow-2xl">
          <h3 className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter">
            <Terminal className="text-cyan-500" size={20} />
            Integrity Check
          </h3>
          <div className="p-4 bg-black rounded-2xl border border-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {verification?.passed ? (
                <ShieldCheck className="text-emerald-500" size={24} />
              ) : (
                <XCircle className="text-rose-500" size={24} />
              )}
              <div>
                <p className="text-sm font-bold uppercase tracking-tight">
                  {verification?.passed ? 'Harness Passed' : 'Harness Required'}
                </p>
                <p className="text-[10px] mono text-zinc-600">
                  {verification ? `Last Check: ${new Date(verification.lastRun).toLocaleString()}` : 'No verification run on this build.'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => onViewChange(AppView.HARNESS)}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-[10px] font-black mono rounded-lg uppercase transition-colors"
            >
              Verify_System
            </button>
          </div>
          
          <div className="pt-2 border-t border-zinc-900">
             <button 
                onClick={() => onViewChange(AppView.JOURNAL)}
                className="text-cyan-500/80 text-[10px] font-black mono uppercase hover:text-cyan-400 transition-colors flex items-center gap-2"
              >
                Inspect Sovereign Records →
              </button>
          </div>
        </section>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  unit: string;
  highlight?: 'emerald' | 'rose' | 'amber';
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, unit, highlight }) => {
  const highlightClass = highlight === 'emerald' ? 'text-emerald-500' : highlight === 'rose' ? 'text-rose-500' : 'text-white';
  
  return (
    <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-3xl hover:border-zinc-800 transition-all hover:bg-zinc-900/10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-zinc-600 text-[10px] font-black mono uppercase tracking-widest">{title}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-black tracking-tighter ${highlightClass}`}>{value}</span>
        <span className="text-[10px] text-zinc-700 font-black mono uppercase">{unit}</span>
      </div>
    </div>
  );
};

export default DashboardView;
