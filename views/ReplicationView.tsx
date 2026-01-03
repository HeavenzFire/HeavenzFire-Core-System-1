
import React, { useState, useEffect } from 'react';
import { Share2, Download, Package, ShieldCheck, Database, Globe, Archive, Loader2, ArrowRight, Zap, Terminal, Network, ShieldAlert, Wifi, Monitor, FileJson } from 'lucide-react';
import { MoodEntry, PeerNode, MeshBundle } from '../types';
import { BASELINE_TRACKS } from '../constants';

interface Props {
  moodHistory: MoodEntry[];
}

const ReplicationView: React.FC<Props> = ({ moodHistory }) => {
  const [isPackaging, setIsPackaging] = useState(false);
  const [isPilotPackaging, setIsPilotPackaging] = useState(false);
  const [packageReady, setPackageReady] = useState(false);
  const [pilotReady, setPilotReady] = useState(false);
  const [peers, setPeers] = useState<PeerNode[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [activeTab, setActiveTab] = useState<'DEPLOY' | 'PEERS' | 'VALIDATE'>('DEPLOY');

  // Peer Discovery Simulation
  const handleDiscovery = () => {
    setIsDiscovering(true);
    setTimeout(() => {
      setPeers([
        { id: 'Node-TX-041', status: 'ONLINE', latency: 45, bundleCount: 12, lastSeen: '12s ago' },
        { id: 'Node-TX-089', status: 'SYNCING', latency: 120, bundleCount: 8, lastSeen: 'Just now' },
        { id: 'Node-OK-012', status: 'ONLINE', latency: 82, bundleCount: 15, lastSeen: '4m ago' },
      ]);
      setIsDiscovering(false);
    }, 2000);
  };

  const generateMeshBundle = async () => {
    setIsPackaging(true);
    await new Promise(r => setTimeout(r, 2000));
    setPackageReady(true);
    setIsPackaging(false);
  };

  const generatePilotNode = async () => {
    setIsPilotPackaging(true);
    await new Promise(r => setTimeout(r, 3000));
    setPilotReady(true);
    setIsPilotPackaging(false);
  };

  const downloadMeshBundle = () => {
    const bundle: MeshBundle = {
      bundleID: `HF-BNDL-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      checksum: "SHA256_DETERMINISTIC_LOCK",
      timestamp: new Date().toISOString(),
      identity: "HF_SOVEREIGN_MESH_V1.2",
      protocol: "OFFLINE_INTERNET_PACKET",
      track: BASELINE_TRACKS[0],
      dsp: {
        denoiseAmount: 40,
        compressionRatio: 4,
        reverbWet: 0.3,
        binauralDepth: 0.8,
        gridSync: '60Hz',
        microModulation: { lfoFreq: 0.15, depth: 0.005, phaseShift: 0, deterministicSeed: 42 }
      },
      metrics: {
        rms: 0.24, peak: 0.88, crestFactor: 3.2, rt60_sec: 0.45, tail_rms_db: -45, checksum: "0xAF8C"
      },
      affirmations: [
        { locale: 'EN', content: 'You are grounded and stable.' },
        { locale: 'ES', content: 'Estás conectado y estable.' }
      ],
      replicationLog: [
        { nodeID: "LOCAL_NODE_01", received: new Date().toISOString() }
      ]
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HF_MESH_BUNDLE_${bundle.bundleID}.json`;
    a.click();
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-[10px] font-black mono uppercase tracking-widest">
          <Globe size={12} /> Global Mesh Portal v1.2
        </div>
        <h2 className="text-5xl font-black tracking-tighter uppercase text-white leading-none">Sovereign Replication</h2>
        <p className="text-zinc-500 max-w-2xl mono text-xs leading-relaxed italic">
          "Build and deploy sovereign nodes. Peer-to-peer distribution of deterministic signals through physical and mesh media. The network is us."
        </p>
      </header>

      <div className="flex gap-4 border-b border-zinc-900 pb-2">
        <TabButton active={activeTab === 'DEPLOY'} onClick={() => setActiveTab('DEPLOY')} icon={<Zap size={14} />} label="Deploy" />
        <TabButton active={activeTab === 'PEERS'} onClick={() => setActiveTab('PEERS')} icon={<Network size={14} />} label="Peers" />
        <TabButton active={activeTab === 'VALIDATE'} onClick={() => setActiveTab('VALIDATE')} icon={<ShieldCheck size={14} />} label="Validate" />
      </div>

      {activeTab === 'DEPLOY' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in duration-500">
          <section className="bg-zinc-950 border border-zinc-900 p-10 rounded-[3rem] shadow-2xl space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Archive size={64} className="text-amber-500" />
            </div>
            <div className="space-y-2 relative z-10">
              <h3 className="text-2xl font-black uppercase text-white tracking-tighter">Mesh Bundle v2</h3>
              <p className="text-[10px] mono text-zinc-600 uppercase tracking-widest font-black">Offline Internet Packet Generator</p>
            </div>
            <div className="p-8 bg-black/50 border border-zinc-800 rounded-3xl space-y-6 relative z-10 shadow-inner">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500"><Package size={24} /></div>
                  <p className="text-xs text-zinc-400 mono italic leading-relaxed">Bundles deterministic audio, DSP state, multilingual affirmations, and replication logs into a single verifiable artifact.</p>
               </div>
               {packageReady ? (
                 <button onClick={downloadMeshBundle} className="w-full py-5 bg-emerald-500 text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all shadow-xl uppercase text-xs">
                   <Download size={18} /> Download_Mesh_Bundle.JSON
                 </button>
               ) : (
                 <button onClick={generateMeshBundle} disabled={isPackaging} className="w-full py-5 bg-amber-500 text-black font-black rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-amber-400 disabled:opacity-50 shadow-xl uppercase text-xs">
                   {isPackaging ? <Loader2 className="animate-spin" /> : <Archive size={18} />}
                   {isPackaging ? 'PACKAGING_SIGNAL...' : 'GENERATE_MESH_BUNDLE'}
                 </button>
               )}
            </div>
          </section>

          <section className="bg-zinc-950 border border-zinc-900 p-10 rounded-[3rem] shadow-2xl space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Monitor size={64} className="text-cyan-500" />
            </div>
            <div className="space-y-2 relative z-10">
              <h3 className="text-2xl font-black uppercase text-white tracking-tighter">Global Pilot Hub</h3>
              <p className="text-[10px] mono text-zinc-600 uppercase tracking-widest font-black">Full Node Deployment Engine</p>
            </div>
            <div className="p-8 bg-black/50 border border-zinc-800 rounded-3xl space-y-6 relative z-10 shadow-inner">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-500"><Terminal size={24} /></div>
                  <p className="text-xs text-zinc-400 mono italic leading-relaxed">Generates a complete sovereign node environment including micro-modulation factory and replication harness.</p>
               </div>
               {pilotReady ? (
                 <button className="w-full py-5 bg-cyan-500 text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-cyan-400 transition-all shadow-xl uppercase text-xs">
                   <Download size={18} /> Export_Pilot_Node_v1.2
                 </button>
               ) : (
                 <button onClick={generatePilotNode} disabled={isPilotPackaging} className="w-full py-5 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-zinc-100 disabled:opacity-50 shadow-xl uppercase text-xs">
                   {isPilotPackaging ? <Loader2 className="animate-spin" /> : <Zap size={18} className="fill-current" />}
                   {isPilotPackaging ? 'DETERMINING_HARMONICS...' : 'GENERATE_PILOT_NODE'}
                 </button>
               )}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'PEERS' && (
        <div className="space-y-8 animate-in fade-in duration-500">
           <section className="bg-zinc-950 border border-zinc-900 p-10 rounded-[3rem] shadow-2xl space-y-10">
              <div className="flex justify-between items-center">
                 <div className="space-y-2">
                    <h3 className="text-2xl font-black uppercase text-white tracking-tighter">Peer Discovery</h3>
                    <p className="text-[10px] mono text-zinc-600 uppercase tracking-widest font-black">Local Mesh Scanning (WiFi-D / Bluetooth / LoRa)</p>
                 </div>
                 <button 
                  onClick={handleDiscovery}
                  disabled={isDiscovering}
                  className="px-8 py-3 bg-zinc-900 border border-zinc-800 text-[10px] mono font-black uppercase tracking-widest hover:border-amber-500 transition-all flex items-center gap-3 rounded-xl"
                 >
                   {isDiscovering ? <Loader2 size={14} className="animate-spin" /> : <Wifi size={14} />}
                   Scan_Mesh
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {peers.length === 0 ? (
                   <div className="col-span-full py-20 text-center space-y-4">
                      <Network size={48} className="mx-auto text-zinc-800 opacity-20" />
                      <p className="text-zinc-700 mono text-[10px] uppercase font-bold">No mesh peers detected in local radio range.</p>
                   </div>
                 ) : (
                   peers.map((peer) => (
                     <div key={peer.id} className="p-8 bg-black/40 border border-zinc-800 rounded-3xl space-y-6 hover:border-amber-500/30 transition-all group">
                        <div className="flex justify-between items-start">
                           <div className="space-y-1">
                              <h4 className="text-sm font-black mono text-zinc-300 group-hover:text-amber-500 transition-colors">{peer.id}</h4>
                              <p className={`text-[9px] mono font-bold uppercase ${peer.status === 'ONLINE' ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`}>
                                 {peer.status}
                              </p>
                           </div>
                           <span className="text-[9px] mono text-zinc-700 font-bold uppercase">{peer.latency}ms</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-900">
                           <div>
                              <p className="text-[8px] mono text-zinc-700 uppercase font-black">Bundles</p>
                              <p className="text-lg font-black text-zinc-400">{peer.bundleCount}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-[8px] mono text-zinc-700 uppercase font-black">Last Seen</p>
                              <p className="text-xs font-black text-zinc-500 mono">{peer.lastSeen}</p>
                           </div>
                        </div>
                        <button className="w-full py-3 bg-zinc-900 border border-zinc-800 text-[10px] font-black mono uppercase tracking-widest text-zinc-500 hover:text-amber-500 hover:border-amber-500/40 transition-all rounded-xl">
                           Initiate_Handshake
                        </button>
                     </div>
                   ))
                 )}
              </div>
           </section>
        </div>
      )}

      {activeTab === 'VALIDATE' && (
        <div className="space-y-8 animate-in fade-in duration-500">
           <section className="bg-zinc-950 border border-zinc-900 p-10 rounded-[3rem] shadow-2xl space-y-10">
              <div className="flex justify-between items-center">
                 <div className="space-y-2">
                    <h3 className="text-2xl font-black uppercase text-white tracking-tighter">Bundle Validation Harness</h3>
                    <p className="text-[10px] mono text-zinc-600 uppercase tracking-widest font-black">Deterministic Checksum Verification</p>
                 </div>
                 <FileJson className="text-zinc-800" size={32} />
              </div>
              
              <div className="border-2 border-dashed border-zinc-800 rounded-[2.5rem] p-20 flex flex-col items-center justify-center text-center space-y-6 group hover:border-amber-500/30 transition-all cursor-pointer">
                 <div className="p-6 bg-zinc-900 rounded-3xl group-hover:scale-110 transition-transform">
                   <ShieldAlert size={48} className="text-zinc-600 group-hover:text-amber-500 transition-colors" />
                 </div>
                 <div className="space-y-2">
                   <p className="text-lg font-black uppercase text-zinc-400 tracking-tight">Drop Bundle Artifact Here</p>
                   <p className="text-[10px] mono text-zinc-700 uppercase font-black">Support for .json Mesh Bundles only</p>
                 </div>
              </div>
           </section>
        </div>
      )}

      <div className="p-10 bg-rose-500/5 border border-rose-500/20 rounded-[3rem] flex items-start gap-6">
         <ShieldCheck className="text-rose-500 shrink-0 mt-1" size={28} />
         <div className="space-y-2">
           <h4 className="text-sm font-black mono text-rose-500 uppercase tracking-widest">Sovereign Deployment Protocol</h4>
           <p className="text-[11px] mono text-zinc-500 uppercase leading-relaxed font-bold italic">
             "DO NOT DISTRIBUTE VIA CLOUD HANDSHAKES. DISTRIBUTE ONLY VIA PHYSICAL MEDIA OR VERIFIED MESH HANDSHAKE. EVERY NODE IS A RELAY. EVERY PACKET IS A SHIELD."
           </p>
         </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick} 
    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[11px] font-black mono uppercase tracking-widest transition-all ${active ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-zinc-600 hover:text-zinc-400'}`}
  >
    {icon} {label}
  </button>
);

const CheckItem: React.FC<{ label: string; active?: boolean }> = ({ label, active = false }) => (
  <div className="flex items-center gap-3 p-4 bg-black/40 border border-zinc-900/50 rounded-2xl">
    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${active ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-800 bg-zinc-900'}`}>
       {active && <ArrowRight size={12} className="text-black" />}
    </div>
    <span className={`text-[10px] mono uppercase font-black tracking-tight ${active ? 'text-zinc-200' : 'text-zinc-700'}`}>{label}</span>
  </div>
);

export default ReplicationView;
