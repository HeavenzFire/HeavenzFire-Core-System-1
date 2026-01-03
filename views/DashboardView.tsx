
import React from 'react';
import { AppView, MoodEntry, VerificationStatus } from '../types';
import { SYSTEM_MANIFESTO, DEPLOYMENT_ROADMAP } from '../constants';
import { Zap, Heart, ShieldAlert, Cpu, Database, Terminal, ShieldCheck, XCircle, Activity, ChevronRight, Target, Clock } from 'lucide-react';

interface Props {
  onViewChange: (view: AppView) => void;
  moodHistory: MoodEntry[];
  verification: VerificationStatus | null;
}

const DashboardView: React.FC<Props> = ({ onViewChange, moodHistory, verification }) => {
  const avgSufferingReduction = moodHistory.reduce((acc, curr) => {
    if (curr.scoreAfter !== undefined) {
      return acc + (curr.scoreBefore - curr.scoreAfter);
    }
    return acc;
  }, 0) / (moodHistory.filter(m => m.scoreAfter !== undefined).length || 1);

  const bioLinkSessions = moodHistory.filter(m => m.bioSnapshot).length;
  const lockedArtifacts = moodHistory.filter(m => m.artifact).length;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black mono uppercase tracking-widest">
          <Zap size={12} className="fill-current" /> Live Node: HeavenzFire Sovereign
        </div>
        <h2 className="text-6xl font-black tracking-tighter uppercase text-white">Tactical Relief</h2>
        <p className="text-zinc-500 max-w-2xl whitespace-pre-line leading-relaxed mono text-xs opacity-80 italic">
          "{SYSTEM_MANIFESTO}"
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          icon={<Heart className="text-rose-500" />} 
          title="Avg Reduction" 
          value={avgSufferingReduction.toFixed(1)} 
          unit="Pts/S"
        />
        <StatCard 
          icon={<Activity className="text-emerald-500" />} 
          title="Artifacts Locked" 
          value={lockedArtifacts.toString()} 
          unit="Mastered"
        />
        <StatCard 
          icon={<Cpu className="text-cyan-500" />} 
          title="Integrity Status" 
          value={verification?.passed ? 'VERIFIED' : 'PENDING'} 
          unit={verification?.passed ? 'Nominal' : 'Run Req.'}
          highlight={verification?.passed ? 'emerald' : 'rose'}
        />
        <StatCard 
          icon={<ShieldAlert className="text-amber-500" />} 
          title="Node Security" 
          value="LOCAL" 
          unit="Air-Gapped"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2.5rem] space-y-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all duration-1000"></div>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-2xl font-black flex items-center gap-3 uppercase tracking-tighter text-white">
                  Active Pipeline
                </h3>
                <p className="text-zinc-500 text-[10px] mono uppercase tracking-widest">System 1 Protocol</p>
              </div>
              <Zap className="text-amber-500/20 group-hover:text-amber-500/50 transition-colors" size={40} />
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed mono italic">
              "Acute distress episodes require structured auditory grounding. 
              Initiate Wonder Engine v3.0 to deploy deterministic harmonics with integrated bio-link telemetry."
            </p>
            <button 
              onClick={() => onViewChange(AppView.LAB)}
              className="w-full py-5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xl shadow-amber-500/10 uppercase tracking-tighter text-sm"
            >
              Launch Wonder Engine
              <ChevronRight size={18} />
            </button>
          </section>

          <section className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2.5rem] shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
              <Target className="text-cyan-500" size={20} />
              <h3 className="text-xs font-black mono uppercase tracking-widest text-zinc-500">Sovereign Deployment Trajectory</h3>
            </div>
            <div className="space-y-4">
              {DEPLOYMENT_ROADMAP.map((step, i) => (
                <div key={i} className={`p-5 rounded-2xl border transition-all ${step.status === 'ACTIVE' ? 'bg-zinc-900/50 border-amber-500/20' : 'bg-transparent border-zinc-900 opacity-40'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] mono font-black text-amber-500 uppercase">Month {step.month}</span>
                    <span className={`text-[9px] mono font-bold px-2 py-0.5 rounded ${step.status === 'ACTIVE' ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                      {step.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-white mb-1 uppercase tracking-tight">{step.title}</h4>
                  <p className="text-xs text-zinc-500 mono leading-snug">{step.objective}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          <section className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2.5rem] space-y-6 shadow-2xl">
            <h3 className="text-xs font-black mono uppercase tracking-widest text-zinc-500 flex items-center gap-3">
              <Terminal size={16} /> Integrity Check
            </h3>
            <div className="p-5 bg-black rounded-2xl border border-zinc-900 space-y-4">
              <div className="flex items-center gap-4">
                {verification?.passed ? (
                  <ShieldCheck className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" size={24} />
                ) : (
                  <XCircle className="text-rose-500 animate-pulse" size={24} />
                )}
                <div>
                  <p className="text-xs font-bold uppercase tracking-tight text-zinc-200">
                    {verification?.passed ? 'Node Integrity: Verified' : 'Integrity Check Required'}
                  </p>
                  <p className="text-[9px] mono text-zinc-600 uppercase">
                    {verification ? `Last: ${new Date(verification.lastRun).toLocaleTimeString()}` : 'No local history'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => onViewChange(AppView.HARNESS)}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-[10px] font-black mono rounded-xl uppercase transition-colors border border-zinc-800"
              >
                Verify_Protocol
              </button>
            </div>
          </section>

          <section className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2.5rem] shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
               <Database className="text-zinc-600" size={16} />
               <span className="text-[10px] mono font-black uppercase tracking-widest text-zinc-600">Storage Telemetry</span>
            </div>
            <div className="space-y-4">
               <div>
                  <div className="flex justify-between text-[9px] mono text-zinc-500 uppercase font-bold mb-1">
                     <span>Node Capacity</span>
                     <span>0.02%</span>
                  </div>
                  <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                     <div className="h-full bg-cyan-500 w-[2%]"></div>
                  </div>
               </div>
               <p className="text-[9px] mono text-zinc-700 uppercase leading-relaxed italic">
                  Local persistence only. Data remains within your sovereign hardware boundary. No cloud handshakes detected.
               </p>
            </div>
          </section>
        </aside>
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
    <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-3xl hover:border-zinc-700 transition-all duration-300 hover:bg-zinc-900/20 group relative overflow-hidden">
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className="text-zinc-600 text-[9px] font-black mono uppercase tracking-widest">{title}</span>
      </div>
      <div className="flex items-baseline gap-2 relative z-10">
        <span className={`text-4xl font-black tracking-tighter ${highlightClass}`}>{value}</span>
        <span className="text-[10px] text-zinc-700 font-black mono uppercase tracking-tighter">{unit}</span>
      </div>
    </div>
  );
};

export default DashboardView;
