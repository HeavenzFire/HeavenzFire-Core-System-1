
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  AlertTriangle, 
  Eye, 
  Cpu, 
  Zap, 
  Terminal, 
  ChevronRight, 
  ShieldAlert, 
  Loader2, 
  Fingerprint,
  FileText,
  Activity,
  UserCheck
} from 'lucide-react';
import { LOCKED_INVARIANTS, CHAOS_SCENARIOS } from '../constants';
import { MoodEntry, ChaosScenario, Invariant } from '../types';

interface Props {
  moodHistory: MoodEntry[];
}

const SecurityView: React.FC<Props> = ({ moodHistory }) => {
  const [activeChaos, setActiveChaos] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditLog, setAuditLog] = useState<string[]>([]);

  const runAudit = () => {
    setIsAuditing(true);
    setAuditLog([]);
    const steps = [
      "[AUDIT] INITIALIZING SOVEREIGN CONTRACT VERIFICATION...",
      "[AUDIT] SCANNING INVARIANTS...",
      "[AUDIT] INV-01: OK (HASHCHAIN INTACT)",
      "[AUDIT] INV-02: OK (LATENCY < 16MS)",
      "[AUDIT] INV-03: OK (AI ISOLATED)",
      "[AUDIT] INV-04: OK (OFFLINE PARITY CONFIRMED)",
      "[AUDIT] SCANNING MOOD_HISTORY (N=" + moodHistory.length + ")...",
      "[SUCCESS] NODE INTEGRITY RATING: 100% SOVEREIGN"
    ];

    steps.forEach((step, i) => {
      setTimeout(() => {
        setAuditLog(prev => [...prev, step]);
        if (i === steps.length - 1) setIsAuditing(false);
      }, i * 500);
    });
  };

  const toggleChaos = (scenarioId: string) => {
    if (activeChaos === scenarioId) setActiveChaos(null);
    else setActiveChaos(scenarioId);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black mono uppercase tracking-widest">
          <ShieldAlert size={12} /> Sovereignty Control Node
        </div>
        <h2 className="text-6xl font-black tracking-tighter uppercase text-white leading-none">Power & <span className="text-rose-500">Invariants</span></h2>
        <p className="text-zinc-500 max-w-2xl mono text-xs leading-relaxed italic">
          "Power is predictability under stress. Narrowing the problem until it cannot lie. We reclaim agency through constraints."
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <section className="lg:col-span-2 space-y-10">
          <div className="bg-zinc-950 border border-zinc-900 p-10 rounded-[3.5rem] shadow-2xl space-y-10">
            <div className="flex justify-between items-center">
               <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase text-white tracking-tighter">Locked Invariants</h3>
                  <p className="text-[10px] mono text-zinc-600 uppercase tracking-widest font-black">Mechanical Trust Anchors</p>
               </div>
               <Lock className="text-zinc-800" size={32} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {LOCKED_INVARIANTS.map((inv) => (
                <div key={inv.id} className="p-6 bg-black/40 border border-zinc-900 rounded-[2rem] flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                       <ShieldCheck size={20} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-zinc-300 uppercase leading-none">{inv.label}</p>
                      <p className="text-[9px] mono text-zinc-600 font-bold uppercase">{inv.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-[9px] mono text-emerald-500 font-black uppercase">LOCKED</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 p-10 rounded-[3.5rem] shadow-2xl space-y-10">
            <div className="flex justify-between items-center">
               <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase text-white tracking-tighter">Chaos Harness</h3>
                  <p className="text-[10px] mono text-zinc-600 uppercase tracking-widest font-black">Adversarial Integrity Testing</p>
               </div>
               <Zap className="text-zinc-800" size={32} />
            </div>

            <div className="space-y-4">
              {CHAOS_SCENARIOS.map((scenario) => (
                <div key={scenario.id} className={`p-8 border rounded-[2.5rem] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${activeChaos === scenario.id ? 'bg-rose-500/5 border-rose-500/30' : 'bg-black/20 border-zinc-900 hover:border-zinc-800'}`}>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-black text-white uppercase tracking-tighter">{scenario.name}</h4>
                      <span className="text-[9px] mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-600 font-black uppercase">{scenario.id}</span>
                    </div>
                    <p className="text-xs text-zinc-500 mono leading-relaxed italic">{scenario.description}</p>
                    <div className="flex items-center gap-2 pt-2">
                       <AlertTriangle size={12} className="text-rose-500" />
                       <span className="text-[10px] mono text-rose-500/80 font-black uppercase">Impact: {scenario.impact}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleChaos(scenario.id)}
                    className={`px-8 py-3 rounded-2xl text-[10px] font-black mono uppercase tracking-widest transition-all ${activeChaos === scenario.id ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-white hover:border-zinc-700'}`}
                  >
                    {activeChaos === scenario.id ? 'KILL_PROCESS' : 'INJECT_FAULT'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-10">
          <section className="bg-zinc-950 border border-zinc-900 p-8 rounded-[3rem] shadow-2xl space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-25 transition-opacity duration-700">
              <UserCheck size={64} className="text-amber-500" />
            </div>
            <div className="space-y-3 relative z-10">
              <h3 className="text-2xl font-black uppercase text-white tracking-tighter">Auditor Contract</h3>
              <p className="text-[10px] mono text-zinc-600 uppercase tracking-widest font-black leading-relaxed">Advisory Intelligence Role Isolation</p>
            </div>
            <div className="p-8 bg-black border border-zinc-900 rounded-[2.5rem] space-y-6 shadow-inner">
               <div className="space-y-2">
                 <p className="text-[10px] mono text-zinc-500 uppercase font-bold tracking-widest">Active Model Role:</p>
                 <div className="px-4 py-3 bg-zinc-900/50 rounded-xl border border-zinc-800 text-xs font-black mono text-amber-500 flex items-center gap-3">
                    <Fingerprint size={16} /> PERSONA_AUDITOR_V1
                 </div>
               </div>
               <p className="text-xs text-zinc-600 mono italic leading-relaxed leading-relaxed">
                 "I can flag, but never mutate. I verify state, but never own it. My power is limited to the advisory cycle."
               </p>
               <button 
                onClick={runAudit}
                disabled={isAuditing}
                className="w-full py-5 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-4 hover:bg-zinc-100 transition-all active:scale-95 shadow-2xl uppercase text-[10px] tracking-widest"
               >
                 {isAuditing ? <Loader2 className="animate-spin" /> : <Eye size={18} />}
                 {isAuditing ? 'VERIFYING_CONTRACT...' : 'RUN_AUDIT_CYCLE'}
               </button>
            </div>
          </section>

          <section className="bg-black border border-zinc-900 p-8 rounded-[3rem] shadow-inner flex flex-col min-h-[400px]">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-zinc-900">
                 <Terminal size={18} className="text-rose-500" />
                 <h4 className="text-[10px] font-black mono uppercase tracking-widest text-zinc-500">Security_Telemetry</h4>
              </div>
              <div className="flex-1 space-y-4 font-mono text-[10px] overflow-y-auto custom-scrollbar pr-2">
                 {auditLog.length === 0 && <span className="text-zinc-800 italic opacity-40 font-black">AWAITING_AUDIT_INITIATION...</span>}
                 {auditLog.map((log, i) => (
                   <div key={i} className={`flex gap-4 ${log.includes('[SUCCESS]') ? 'text-emerald-500 font-black' : log.includes('[AUDIT]') ? 'text-zinc-600' : 'text-zinc-700'}`}>
                     <span className="opacity-20 shrink-0">[{i.toString().padStart(3, '0')}]</span>
                     <span className="leading-relaxed tracking-wider">{log}</span>
                   </div>
                 ))}
                 {isAuditing && <div className="text-rose-500 animate-pulse mt-4 flex items-center gap-2 underline">SCANNING_MEMORY_LADDER...</div>}
              </div>
          </section>

          <section className="bg-zinc-950 border border-zinc-900 p-8 rounded-[3rem] shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
               <FileText className="text-zinc-600" size={16} />
               <span className="text-[10px] mono font-black uppercase tracking-widest text-zinc-600">Threat Model V1.0</span>
            </div>
            <div className="space-y-4">
              <ThreatItem label="Partial Replay" likelihood="MED" risk="LOW" status="DEFLECTED" />
              <ThreatItem label="Bit-Flip Drift" likelihood="LOW" risk="HIGH" status="MONITORED" />
              <ThreatItem label="Desync Jitter" likelihood="HIGH" risk="MED" status="STABILIZED" />
            </div>
          </section>
        </aside>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2a2a2a; }
      `}</style>
    </div>
  );
};

const ThreatItem: React.FC<{ label: string; likelihood: string; risk: string; status: string }> = ({ label, likelihood, risk, status }) => (
  <div className="p-4 bg-black/40 border border-zinc-900 rounded-2xl space-y-2">
    <div className="flex justify-between items-center">
      <span className="text-[11px] font-black text-zinc-300 uppercase tracking-tight">{label}</span>
      <span className="text-[9px] mono text-emerald-500 font-bold uppercase">{status}</span>
    </div>
    <div className="flex gap-3 text-[8px] mono text-zinc-700 font-black uppercase tracking-widest">
      <span>L:{likelihood}</span>
      <span>R:{risk}</span>
    </div>
  </div>
);

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick} 
    className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-[11px] font-black mono uppercase tracking-widest transition-all ${active ? 'bg-rose-500 text-white shadow-2xl shadow-rose-500/20' : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-900/50'}`}
  >
    {icon} {label}
  </button>
);

export default SecurityView;
