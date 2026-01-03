
import React, { useState } from 'react';
import { Share2, Download, Package, ShieldCheck, Database, Globe, Archive, Loader2, ArrowRight } from 'lucide-react';
import { MoodEntry } from '../types';

interface Props {
  moodHistory: MoodEntry[];
}

const ReplicationView: React.FC<Props> = ({ moodHistory }) => {
  const [isPackaging, setIsPackaging] = useState(false);
  const [packageReady, setPackageReady] = useState(false);

  const generateReplicationPack = async () => {
    setIsPackaging(true);
    // Simulation of asset bundling and manifest generation
    await new Promise(r => setTimeout(r, 2000));
    setPackageReady(true);
    setIsPackaging(false);
  };

  const downloadPack = () => {
    const manifest = {
      system: "HeavenzFire_System_1",
      version: "1.0.0_GLOBAL",
      timestamp: Date.now(),
      nodeHistoryCount: moodHistory.length,
      baselineChecksums: ["0xAF8C", "0x2B4F"],
      instructions: "Deploy on any air-gapped hardware. Share only via physical media."
    };
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HF_COMMUNITY_PACK_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-[10px] font-black mono uppercase tracking-widest">
          <Globe size={12} /> Global Mesh Portal
        </div>
        <h2 className="text-5xl font-black tracking-tighter uppercase text-white">Community Replication</h2>
        <p className="text-zinc-500 max-w-2xl mono text-xs leading-relaxed italic">
          "Build and deploy sovereign nodes. One shielded node interrupts generational cycles. Package the signal for rural deployment."
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="bg-zinc-950 border border-zinc-900 p-10 rounded-[3rem] shadow-2xl space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Archive size={64} className="text-amber-500" />
          </div>
          <div className="space-y-2 relative z-10">
            <h3 className="text-2xl font-black uppercase text-white tracking-tighter">System 4 Archive</h3>
            <p className="text-[10px] mono text-zinc-600 uppercase tracking-widest font-black">Community Replication Pack Generator</p>
          </div>
          
          <div className="p-8 bg-black/50 border border-zinc-800 rounded-3xl space-y-6 relative z-10 shadow-inner">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500"><Package size={24} /></div>
                <p className="text-xs text-zinc-400 mono italic">Generates a single sovereign artifact containing the pipeline source, 50 healing IRs, and field documentation.</p>
             </div>
             
             {packageReady ? (
               <button 
                 onClick={downloadPack}
                 className="w-full py-5 bg-emerald-500 text-black font-black rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-emerald-400 shadow-xl shadow-emerald-500/20 uppercase text-xs"
               >
                 <Download size={18} /> Download_Replication_Bundle.ZIP
               </button>
             ) : (
               <button 
                 onClick={generateReplicationPack}
                 disabled={isPackaging}
                 className="w-full py-5 bg-amber-500 text-black font-black rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-amber-400 disabled:opacity-50 shadow-xl shadow-amber-500/20 uppercase text-xs"
               >
                 {isPackaging ? <Loader2 className="animate-spin" /> : <Archive size={18} />}
                 {isPackaging ? 'BUNDLING_SOVEREIGN_ASSETS' : 'GENERATE_COMMUNITY_PACK'}
               </button>
             )}
          </div>
        </section>

        <section className="space-y-8">
          <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2.5rem] shadow-2xl">
             <div className="flex items-center gap-3 mb-6">
                <Database className="text-cyan-500" size={20} />
                <h3 className="text-xs font-black mono uppercase tracking-widest text-zinc-500">Propagation Checklist</h3>
             </div>
             <div className="space-y-4">
                <CheckItem label="Offline Pipeline Mastery" active />
                <CheckItem label="Regional Grid Sync Verification" active />
                <CheckItem label="Linguistic Affinity Lock" active />
                <CheckItem label="Field Documentation (README)" active />
                <CheckItem label="Encrypted Distribution Drive" active={packageReady} />
             </div>
          </div>

          <div className="p-8 bg-amber-500/5 border border-amber-500/20 rounded-[2.5rem] flex items-start gap-4">
             <ShieldCheck className="text-amber-500 shrink-0" size={20} />
             <p className="text-[10px] mono text-zinc-600 uppercase leading-relaxed font-bold">
               SOVEREIGN_WARNING: Distribute artifacts only to verified healing nodes (Churches, Schools, Recovery Groups). Ensure recipients understand the deterministic nature of the signal.
             </p>
          </div>
        </section>
      </div>
    </div>
  );
};

const CheckItem: React.FC<{ label: string; active?: boolean }> = ({ label, active = false }) => (
  <div className="flex items-center gap-3">
    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${active ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-800 bg-zinc-900'}`}>
       {active && <ArrowRight size={10} className="text-black" />}
    </div>
    <span className={`text-[10px] mono uppercase font-black ${active ? 'text-zinc-300' : 'text-zinc-700'}`}>{label}</span>
  </div>
);

export default ReplicationView;
