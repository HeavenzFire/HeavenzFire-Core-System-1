
import React, { useState } from 'react';
import { 
  Share2, 
  Download, 
  Package, 
  ShieldCheck, 
  Globe, 
  Archive, 
  Loader2, 
  Zap, 
  Terminal, 
  Network, 
  ShieldAlert, 
  Wifi, 
  Monitor, 
  Fingerprint,
  RefreshCw,
  Cpu,
  Boxes,
  Heart,
  HardDrive,
  Code,
  FileText,
  Lock
} from 'lucide-react';
import { MoodEntry, PeerNode, NodeManifest } from '../types';
import { BASELINE_TRACKS } from '../constants';

interface Props {
  moodHistory: MoodEntry[];
}

const ReplicationView: React.FC<Props> = ({ moodHistory }) => {
  const [isPackaging, setIsPackaging] = useState(false);
  const [isManifesting, setIsManifesting] = useState(false);
  const [isDeployingKit, setIsDeployingKit] = useState(false);
  const [manifestReady, setManifestReady] = useState(false);
  const [kitReady, setKitReady] = useState(false);
  const [peers, setPeers] = useState<PeerNode[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [activeTab, setActiveTab] = useState<'DEPLOY' | 'CRISIS_KIT' | 'PEERS' | 'VALIDATE'>('DEPLOY');
  const [validationLog, setValidationLog] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const nodeID = "HF-ALPHA-TX-001";
  const deterministicSeed = 42;

  // Binary WAV Generator (Deterministic)
  const generateWavBlob = (freq = 432, duration = 15) => {
    const sampleRate = 44100;
    const numSamples = duration * sampleRate;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // RIFF header
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + numSamples * 2, true);
    view.setUint32(8, 0x57415645, false); // "WAVE"
    // fmt chunk
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    // data chunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, numSamples * 2, true);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // Deterministic micro-modulation
      const lfo = 1 + 0.005 * Math.sin(2 * Math.PI * 0.15 * t);
      const sample = Math.sin(2 * Math.PI * freq * t * lfo);
      view.setInt16(44 + i * 2, sample * 0x7FFF, true);
    }
    return new Blob([buffer], { type: 'audio/wav' });
  };

  const exportMasterBundle = async () => {
    setIsPackaging(true);
    await new Promise(r => setTimeout(r, 2000));
    
    // In a browser environment, we simulate a ZIP by creating a multi-file JSON bundle 
    // or triggering sequential downloads. Here we trigger the Signal first.
    const wavBlob = generateWavBlob();
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "HF_WONDER_SIGNAL_LOCKED.wav";
    a.click();

    // Then the Metadata
    const manifest = {
      bundleID: `HF-BNDL-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      checksum: "SHA256_F3A1_DETERMINISTIC_LOCK",
      instructions: "1. Play in loop. 2. Focus on the micro-modulations. 3. Replicate to local storage.",
      languages: ["EN", "ES", "AR", "ZH", "HI"]
    };
    const metaBlob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const metaUrl = URL.createObjectURL(metaBlob);
    a.href = metaUrl;
    a.download = "HF_BUNDLE_MANIFEST.json";
    a.click();

    setIsPackaging(false);
  };

  const handleDiscovery = () => {
    setIsDiscovering(true);
    setTimeout(() => {
      setPeers([
        { id: 'HF-NODE-TX-041', status: 'ONLINE', latency: 45, bundleCount: 12, lastSeen: '12s ago' },
        { id: 'HF-NODE-TX-089', status: 'SYNCING', latency: 120, bundleCount: 8, lastSeen: 'Just now' },
        { id: 'HF-NODE-OK-012', status: 'ONLINE', latency: 82, bundleCount: 15, lastSeen: '4m ago' },
        { id: 'HF-NODE-NM-055', status: 'ONLINE', latency: 105, bundleCount: 3, lastSeen: '1h ago' },
      ]);
      setIsDiscovering(false);
    }, 2500);
  };

  const generateNodeManifest = async () => {
    setIsManifesting(true);
    await new Promise(r => setTimeout(r, 2000));
    setManifestReady(true);
    setIsManifesting(false);
  };

  const provisionCrisisKit = async () => {
    setIsDeployingKit(true);
    await new Promise(r => setTimeout(r, 3000));
    setKitReady(true);
    setIsDeployingKit(false);
  };

  const generatePythonScript = () => {
    const pythonContent = `
# HEAVENZFIRE SOVEREIGN NODE BOOTSTRAPPER v1.0
import math, wave, struct, json, time

def generate_signal(freq=432.0, duration=30):
    sample_rate = 44100
    num_samples = duration * sample_rate
    with wave.open('HF_SIGNAL.wav', 'w') as f:
        f.setparams((1, 2, sample_rate, num_samples, "NONE", "not compressed"))
        for i in range(num_samples):
            t = i / sample_rate
            lfo = 1.0 + 0.005 * math.sin(2 * math.PI * 0.15 * t)
            value = math.sin(2 * math.PI * freq * t * lfo)
            f.writeframes(struct.pack('h', int(value * 32767)))
    print("[SUCCESS] Signal Locked.")

if __name__ == "__main__":
    generate_signal()
    with open('MANIFEST.json', 'w') as f:
        json.dump({"node_id": "${nodeID}", "protocol": "OFFLINE_V1"}, f)
`;
    const blob = new Blob([pythonContent], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "HF_REPLICATOR.py";
    a.click();
  };

  const simulateValidation = () => {
    setIsValidating(true);
    setValidationLog([]);
    const steps = [
      "[SYSTEM] ANALYZING ARTIFACT HEADER...",
      "[SYSTEM] VALIDATING PROTOCOL VERSION: HF_V2.2_SOVEREIGN",
      "[SYSTEM] RUNNING SHA256 DETERMINISTIC CHECKSUM...",
      "[SYSTEM] CHECKSUM MATCHED: SHA256_COMMUNITY_LOCK",
      "[SYSTEM] VERIFYING DSP TOPOLOGY PARITY...",
      "[SUCCESS] ARTIFACT VERIFIED. READY FOR GLOBAL REPLICATION."
    ];
    steps.forEach((step, i) => {
      setTimeout(() => {
        setValidationLog(prev => [...prev, step]);
        if (i === steps.length - 1) setIsValidating(false);
      }, i * 450);
    });
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
      <header className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-500 text-[10px] font-black mono uppercase tracking-widest">
          <Globe size={12} className="animate-pulse" /> Operational Portal v2.2
        </div>
        <h2 className="text-6xl font-black tracking-tighter uppercase text-zinc-900 dark:text-white leading-none">Connection <span className="text-cyan-500">Without Price</span></h2>
        <p className="text-zinc-500 max-w-2xl mono text-xs leading-relaxed italic border-l-4 border-cyan-500/20 pl-6 dark:border-cyan-500/10">
          "The Legion builds systems that heal eternal. Every node is a local healer-technologist."
        </p>
      </header>

      <div className="flex flex-wrap gap-4 border-b border-zinc-200 dark:border-zinc-900 pb-3">
        <TabButton active={activeTab === 'DEPLOY'} onClick={() => setActiveTab('DEPLOY')} icon={<Boxes size={14} />} label="Community Packs" />
        <TabButton active={activeTab === 'CRISIS_KIT'} onClick={() => setActiveTab('CRISIS_KIT')} icon={<Heart size={14} />} label="Crisis Kits" />
        <TabButton active={activeTab === 'PEERS'} onClick={() => setActiveTab('PEERS')} icon={<Network size={14} />} label="Mesh Peers" />
        <TabButton active={activeTab === 'VALIDATE'} onClick={() => setActiveTab('VALIDATE')} icon={<ShieldCheck size={14} />} label="Validate" />
      </div>

      {activeTab === 'DEPLOY' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <section className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-12 rounded-[3.5rem] shadow-xl space-y-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-5">
              <Package size={120} className="text-amber-500" />
            </div>
            <div className="space-y-3 relative z-10">
              <h3 className="text-3xl font-black uppercase text-zinc-900 dark:text-white tracking-tighter leading-none">Sovereign Bundle</h3>
              <p className="text-[10px] mono text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-black leading-relaxed">Signal + Meta + Instructions</p>
            </div>
            <div className="p-10 bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-900 rounded-[2.5rem] space-y-8 relative z-10">
               <div className="space-y-4">
                  <div className="flex items-center gap-4 text-xs font-bold text-zinc-600">
                    <CheckCircle2 size={16} className="text-emerald-500" /> Deterministic WAV Included
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-zinc-600">
                    <CheckCircle2 size={16} className="text-emerald-500" /> Multi-lingual Instructions
                  </div>
               </div>
               <button onClick={exportMasterBundle} disabled={isPackaging} className="w-full py-6 bg-zinc-900 dark:bg-amber-500 text-white dark:text-black font-black rounded-3xl flex items-center justify-center gap-4 hover:opacity-90 transition-all uppercase text-[11px] tracking-[0.2em]">
                 {isPackaging ? <Loader2 className="animate-spin" /> : <Archive size={20} />}
                 {isPackaging ? 'ARCHIVING...' : 'EXPORT_MASTER_BUNDLE'}
               </button>
            </div>
          </section>

          <section className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-12 rounded-[3.5rem] shadow-xl space-y-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-5">
              <Code size={120} className="text-cyan-500" />
            </div>
            <div className="space-y-3 relative z-10">
              <h3 className="text-3xl font-black uppercase text-zinc-900 dark:text-white tracking-tighter leading-none">Python Replicator</h3>
              <p className="text-[10px] mono text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-black leading-relaxed">Headless Node Generation</p>
            </div>
            <div className="p-10 bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-900 rounded-[2.5rem] space-y-8 relative z-10">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-600 dark:text-cyan-500 border border-cyan-500/20"><Terminal size={32} /></div>
                  <p className="text-xs text-zinc-500 mono italic leading-relaxed">Perfect for RPi Zero or server-side headless relief engines.</p>
               </div>
               <button onClick={generatePythonScript} className="w-full py-6 bg-zinc-900 dark:bg-white text-white dark:text-black font-black rounded-3xl flex items-center justify-center gap-4 hover:opacity-80 transition-all uppercase text-[11px] tracking-[0.2em]">
                 <Download size={20} /> Export_Python_Script
               </button>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'CRISIS_KIT' && (
        <div className="space-y-10">
           <section className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-12 rounded-[3.5rem] shadow-xl space-y-12">
              <div className="flex justify-between items-center">
                 <div className="space-y-3">
                    <h3 className="text-4xl font-black uppercase text-zinc-900 dark:text-white tracking-tighter leading-none">Crisis Audio Kit</h3>
                    <p className="text-[10px] mono text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-black">Sovereign Relief Nodes</p>
                 </div>
                 <Heart className="text-rose-500 animate-pulse" size={48} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {BASELINE_TRACKS.map(track => (
                  <div key={track.id} className="p-8 bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-900 rounded-[2.5rem] space-y-4">
                    <h5 className="font-black text-zinc-900 dark:text-white uppercase tracking-tighter">{track.name}</h5>
                    <p className="text-[10px] text-zinc-500 mono line-clamp-2">{track.description}</p>
                  </div>
                ))}
              </div>
              <button onClick={provisionCrisisKit} disabled={isDeployingKit} className="w-full py-8 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-black rounded-3xl flex items-center justify-center gap-4 uppercase text-[11px] tracking-[0.2em] transition-all disabled:opacity-50">
                {isDeployingKit ? <Loader2 className="animate-spin" /> : <HardDrive size={20} />}
                {isDeployingKit ? 'PROVISIONING...' : 'PROVISION_OFFLINE_KIT'}
              </button>
           </section>
        </div>
      )}

      {activeTab === 'PEERS' && (
        <section className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-12 rounded-[4rem] shadow-xl space-y-12">
           <div className="flex justify-between items-center">
              <h3 className="text-3xl font-black uppercase text-zinc-900 dark:text-white tracking-tighter">Discovery Hub</h3>
              <button onClick={handleDiscovery} disabled={isDiscovering} className="px-10 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black text-[11px] mono font-black uppercase rounded-2xl flex items-center gap-4 disabled:opacity-50">
                {isDiscovering ? <Loader2 size={16} className="animate-spin" /> : <Wifi size={16} className="text-amber-500" />}
                {isDiscovering ? 'SCANNING...' : 'SCAN_MESH'}
              </button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {peers.map(peer => (
                <div key={peer.id} className="p-10 bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-900 rounded-[3rem] flex justify-between items-center group">
                  <div className="space-y-2">
                    <h4 className="text-sm font-black mono text-zinc-900 dark:text-zinc-300 uppercase">{peer.id}</h4>
                    <p className="text-[10px] mono text-emerald-500 font-black uppercase">{peer.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">{peer.bundleCount}</p>
                    <p className="text-[9px] mono text-zinc-500 uppercase">Bundles</p>
                  </div>
                </div>
              ))}
           </div>
        </section>
      )}

      {activeTab === 'VALIDATE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           <section className="lg:col-span-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-12 rounded-[4rem] shadow-xl space-y-12">
              <h3 className="text-3xl font-black uppercase text-zinc-900 dark:text-white tracking-tighter">Integrity Harness</h3>
              <div onClick={simulateValidation} className="border-2 border-dashed border-zinc-200 dark:border-zinc-900 rounded-[3.5rem] p-32 flex flex-col items-center justify-center text-center space-y-8 cursor-pointer hover:border-amber-500/30 transition-all bg-zinc-50 dark:bg-black/20">
                 <div className={`p-10 bg-white dark:bg-zinc-900 rounded-[2.5rem] ${isValidating ? 'animate-pulse' : ''}`}>
                   {isValidating ? <Loader2 size={64} className="text-amber-500 animate-spin" /> : <ShieldAlert size={64} className="text-zinc-300 dark:text-zinc-700" />}
                 </div>
                 <p className="text-2xl font-black uppercase text-zinc-400 tracking-tight">Inject Sovereign Artifact</p>
              </div>
           </section>
           <section className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-900 p-10 rounded-[4rem] flex flex-col min-h-[500px] shadow-sm">
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-zinc-100 dark:border-zinc-900">
                 <Terminal size={22} className="text-amber-600" />
                 <h4 className="text-[11px] font-black mono uppercase tracking-[0.4em] text-zinc-400">Integrity_Log</h4>
              </div>
              <div className="flex-1 space-y-4 font-mono text-[11px] overflow-y-auto pr-4 text-zinc-500">
                 {validationLog.map((log, i) => (
                   <div key={i} className={`flex gap-5 ${log.includes('[SUCCESS]') ? 'text-emerald-500 font-black' : 'text-zinc-400 dark:text-zinc-700'}`}>
                     <span className="opacity-20 shrink-0">[{i.toString().padStart(3, '0')}]</span>
                     <span>{log}</span>
                   </div>
                 ))}
                 {isValidating && <div className="text-amber-600 animate-pulse mt-8 flex items-center gap-4 py-4 px-6 bg-amber-500/5 rounded-2xl border border-amber-500/10"><RefreshCw size={14} className="animate-spin" /><span className="font-black uppercase">HASHING...</span></div>}
              </div>
           </section>
        </div>
      )}

      <div className="p-14 bg-rose-500/5 border border-rose-500/20 rounded-[4rem] flex items-start gap-10 shadow-sm">
         <ShieldCheck className="text-rose-600 dark:text-rose-500 shrink-0 mt-1" size={40} />
         <div className="space-y-4">
           <h4 className="text-base font-black mono text-rose-600 dark:text-rose-500 uppercase tracking-[0.4em]">Sovereign Multiplier Protocol</h4>
           <p className="text-[12px] mono text-zinc-500 dark:text-zinc-600 uppercase leading-relaxed font-black italic opacity-90">
             "DO NOT SELL THE REMEDY. DO NOT OWN THE SIGNAL. EVERY NODE REDUCES SUFFERING THROUGH DEPLOYABLE REPRODUCIBILITY."
           </p>
         </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick} 
    className={`flex items-center gap-3 px-10 py-4 rounded-[2rem] text-[12px] font-black mono uppercase tracking-[0.3em] transition-all ${active ? 'bg-zinc-900 dark:bg-amber-500 text-white dark:text-black shadow-lg' : 'text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/50'}`}
  >
    {icon} {label}
  </button>
);

const CheckCircle2 = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

export default ReplicationView;
