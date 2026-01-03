
import React, { useMemo } from 'react';
import { AppView, MoodEntry, VerificationStatus } from '../types';
import { SYSTEM_MANIFESTO, DEPLOYMENT_ROADMAP } from '../constants';
import { Zap, Heart, ShieldAlert, Cpu, Database, Terminal, ShieldCheck, Activity, Globe, Server, Network, Radio } from 'lucide-react';

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

  const meshData = useMemo(() => {
    return [
      { region: 'North America', density: 0.82, nodes: 421, status: 'NOMINAL' },
      { region: 'Europe', density: 0.65, nodes: 312, status: 'NOMINAL' },
      { region: 'Asia', density: 0.44, nodes: 189, status: 'SYNCING' },
      { region: 'South America', density: 0.28, nodes: 94, status: 'STABLE' },
      { region: 'Africa', density: 0.15, nodes: 56, status: 'INIT' },
    ];
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 text-[10px] font-black mono uppercase tracking-widest">
          <Zap size={12} className="fill-current" /> Mesh Active: HeavenzFire Sovereign Node Alpha
        </div>
        <h2 className="text-7xl font-black tracking-tighter uppercase text-zinc-900 dark:text-white leading-none">The Future <span className="text-amber-500">&</span> The Past</h2>
        <p className="text-zinc-500 max-w-2xl whitespace-pre-line leading-relaxed mono text-xs opacity-80 italic">
          "{SYSTEM_MANIFESTO}"
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={<Heart className="text-rose-500" />} title="Avg Reduction" value={avgSufferingReduction.toFixed(1)} unit="Pts/S" />
        <StatCard icon={<Network className="text-cyan-500" />} title="Mesh Peers" value="1,072" unit="Nodes" />
        <StatCard icon={<Cpu className="text-emerald-500" />} title="Node Integrity" value={verification?.passed ? 'VERIFIED' : 'PENDING'} unit={verification?.passed ? 'Nominal' : 'Run Req.'} highlight={verification?.passed ? 'emerald' : 'rose'} />
        <StatCard icon={<Database className="text-amber-500" />} title="Local Cache" value={`${moodHistory.length}`} unit="Bundles" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-10 rounded-[3rem] shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Globe size={180} className="text-amber-500" />
            </div>
            <div className="flex justify-between items-start mb-10 relative z-10">
              <div className="space-y-2">
                <h3 className="text-3xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">Tactical Mesh Map</h3>
                <p className="text-zinc-400 dark:text-zinc-500 text-[10px] mono uppercase tracking-widest font-bold">Global Auditory Grounding Reach</p>
              </div>
              <Radio size={24} className="text-zinc-400 dark:text-zinc-600 animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
              <div className="space-y-6">
                {meshData.map((region) => (
                  <div key={region.region} className="space-y-2 group/item">
                    <div className="flex justify-between text-[10px] mono font-black uppercase tracking-widest text-zinc-500 group-hover/item:text-amber-500 transition-colors">
                      <span>{region.region}</span>
                      <span>{region.nodes} Nodes</span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800/50">
                      <div className="h-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-300 transition-all duration-1000" style={{ width: `${region.density * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-900 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center space-y-4">
                 <div className="w-24 h-24 border-2 border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center relative">
                   <div className="absolute inset-0 border border-amber-500/20 rounded-full animate-ping"></div>
                   <Network size={32} className="text-amber-500" />
                 </div>
                 <p className="text-[10px] mono font-black text-emerald-500 uppercase">Awaiting Handshake...</p>
              </div>
            </div>
            <button onClick={() => onViewChange(AppView.REPLICATION)} className="mt-12 w-full py-6 bg-zinc-900 dark:bg-white text-white dark:text-black font-black rounded-3xl flex items-center justify-center gap-3 hover:opacity-90 transition-all uppercase text-xs tracking-widest">
              <Server size={18} /> Replicate Local Node
            </button>
          </section>

          <section className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-8 rounded-[2.5rem] shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6">
            {DEPLOYMENT_ROADMAP.map((step, i) => (
              <div key={i} className={`p-6 rounded-[2rem] border transition-all ${step.status === 'ACTIVE' ? 'bg-amber-50 dark:bg-zinc-900/50 border-amber-500/20' : step.status === 'COMPLETE' ? 'bg-emerald-50 dark:bg-zinc-900/20 border-emerald-500/20' : 'bg-transparent border-zinc-100 dark:border-zinc-900 opacity-40'}`}>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[9px] mono font-black text-zinc-400 uppercase">Month {step.month}</span>
                  <div className={`w-2 h-2 rounded-full ${step.status === 'ACTIVE' ? 'bg-amber-500 animate-pulse' : step.status === 'COMPLETE' ? 'bg-emerald-500' : 'bg-zinc-200'}`}></div>
                </div>
                <h4 className="font-black text-zinc-900 dark:text-white mb-2 uppercase tracking-tighter text-sm">{step.title}</h4>
                <p className="text-[10px] text-zinc-500 mono leading-relaxed line-clamp-3 italic">{step.objective}</p>
              </div>
            ))}
          </section>
        </div>

        <aside className="space-y-8">
          <section className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-8 rounded-[2.5rem] shadow-xl space-y-6 relative overflow-hidden">
            <h3 className="text-xs font-black mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 flex items-center gap-3">
              <Terminal size={16} /> Integrity Check
            </h3>
            <div className="p-6 bg-zinc-50 dark:bg-black rounded-[2rem] border border-zinc-200 dark:border-zinc-900 space-y-6 shadow-inner">
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${verification?.passed ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                   {verification?.passed ? <ShieldCheck size={32} /> : <ShieldAlert size={32} className="animate-pulse" />}
                </div>
                <div>
                  <p className="text-sm font-black uppercase text-zinc-900 dark:text-zinc-200">{verification?.passed ? 'Signal Invariant' : 'Verification Required'}</p>
                  <p className="text-[10px] mono text-zinc-500 uppercase">{verification ? `Last: ${new Date(verification.lastRun).toLocaleTimeString()}` : 'Audit Pending'}</p>
                </div>
              </div>
              <button onClick={() => onViewChange(AppView.HARNESS)} className="w-full py-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-[10px] font-black mono uppercase hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all">
                Launch_Verify_Pipeline
              </button>
            </div>
          </section>

          <section className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-8 rounded-[2.5rem] shadow-xl space-y-6">
            <div className="flex items-center gap-3">
               <Database className="text-zinc-400" size={16} />
               <span className="text-[10px] mono font-black uppercase text-zinc-400">Memory Telemetry</span>
            </div>
            <div className="p-5 bg-zinc-50 dark:bg-black/40 rounded-2xl border border-zinc-200 dark:border-zinc-900">
               <div className="flex justify-between text-[10px] mono text-zinc-500 uppercase font-black mb-3">
                  <span>Cache Capacity</span>
                  <span>{((moodHistory.length / 500) * 100).toFixed(1)}%</span>
               </div>
               <div className="h-2 bg-zinc-200 dark:bg-zinc-900 rounded-full overflow-hidden border border-zinc-200">
                  <div className="h-full bg-cyan-500" style={{ width: `${Math.max(5, (moodHistory.length / 500) * 100)}%` }}></div>
               </div>
            </div>
            <p className="text-[9px] mono text-rose-500/60 uppercase font-bold italic text-center">[SECURE_MODE_ENGAGED] No cloud uplink active.</p>
          </section>
        </aside>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; unit: string; highlight?: 'emerald' | 'rose' }> = ({ icon, title, value, unit, highlight }) => (
  <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-6 rounded-[2rem] hover:border-amber-500/30 transition-all group shadow-md">
    <div className="flex items-center gap-4 mb-5">
      <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-zinc-400 text-[10px] font-black mono uppercase tracking-widest">{title}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <span className={`text-4xl font-black tracking-tighter ${highlight === 'emerald' ? 'text-emerald-500' : highlight === 'rose' ? 'text-rose-500' : 'text-zinc-900 dark:text-white'}`}>{value}</span>
      <span className="text-[10px] text-zinc-400 font-black mono uppercase">{unit}</span>
    </div>
  </div>
);

export default DashboardView;
