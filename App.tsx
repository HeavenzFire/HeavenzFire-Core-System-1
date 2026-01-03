
import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Shield, 
  Book, 
  BarChart3, 
  Volume2, 
  Zap,
  ChevronRight,
  Database,
  Terminal,
  ShieldCheck,
  BrainCircuit,
  Share2
} from 'lucide-react';
import { AppView, MoodEntry, VerificationStatus } from './types';
import DashboardView from './views/DashboardView';
import AudioLabView from './views/AudioLabView';
import JournalView from './views/JournalView';
import AnalyticsView from './views/AnalyticsView';
import HarnessView from './views/HarnessView';
import IntelligenceView from './views/IntelligenceView';
import ReplicationView from './views/ReplicationView';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [verification, setVerification] = useState<VerificationStatus | null>(null);
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('hf_mood_history');
    if (saved) {
      try {
        setMoodHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load mood history", e);
      }
    }
    const savedVerify = localStorage.getItem('hf_verify_status');
    if (savedVerify) setVerification(JSON.parse(savedVerify));
    const cookieConsent = localStorage.getItem('hf_cookie_consent');
    if (!cookieConsent) setShowCookieBanner(true);
  }, []);

  const saveHistory = (newHistory: MoodEntry[]) => {
    setMoodHistory(newHistory);
    localStorage.setItem('hf_mood_history', JSON.stringify(newHistory));
  };

  const saveVerification = (status: VerificationStatus) => {
    setVerification(status);
    localStorage.setItem('hf_verify_status', JSON.stringify(status));
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <DashboardView onViewChange={setCurrentView} moodHistory={moodHistory} verification={verification} />;
      case AppView.LAB:
        return <AudioLabView onMoodUpdate={saveHistory} moodHistory={moodHistory} />;
      case AppView.JOURNAL:
        return <JournalView moodHistory={moodHistory} onUpdate={saveHistory} />;
      case AppView.ANALYTICS:
        return <AnalyticsView moodHistory={moodHistory} />;
      case AppView.HARNESS:
        return <HarnessView onVerify={saveVerification} status={verification} />;
      case AppView.INTELLIGENCE:
        return <IntelligenceView />;
      case AppView.REPLICATION:
        return <ReplicationView moodHistory={moodHistory} />;
      default:
        return <DashboardView onViewChange={setCurrentView} moodHistory={moodHistory} verification={verification} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#050505] text-gray-200">
      <nav className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-950 p-6 flex flex-col justify-between overflow-y-auto">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-amber-500 rounded flex items-center justify-center glow-amber shadow-amber-500/20 shadow-lg">
              <Shield className="text-black" size={24} />
            </div>
            <div>
              <h1 className="font-black text-lg leading-tight tracking-tighter text-white">HEAVENZFIRE</h1>
              <p className="text-[10px] text-zinc-500 mono tracking-widest uppercase">GLOBAL_MESH_V1</p>
            </div>
          </div>

          <div className="space-y-1">
            <NavItem active={currentView === AppView.DASHBOARD} onClick={() => setCurrentView(AppView.DASHBOARD)} icon={<Activity size={18} />} label="Dashboard" />
            <NavItem active={currentView === AppView.LAB} onClick={() => setCurrentView(AppView.LAB)} icon={<Volume2 size={18} />} label="Signal Hub" />
            <NavItem active={currentView === AppView.INTELLIGENCE} onClick={() => setCurrentView(AppView.INTELLIGENCE)} icon={<BrainCircuit size={18} />} label="Research Hub" />
            <NavItem active={currentView === AppView.JOURNAL} onClick={() => setCurrentView(AppView.JOURNAL)} icon={<Book size={18} />} label="Sovereign Log" />
            <NavItem active={currentView === AppView.ANALYTICS} onClick={() => setCurrentView(AppView.ANALYTICS)} icon={<BarChart3 size={18} />} label="Global Metrics" />
            <div className="pt-4 mt-4 border-t border-zinc-900">
              <NavItem active={currentView === AppView.REPLICATION} onClick={() => setCurrentView(AppView.REPLICATION)} icon={<Share2 size={18} />} label="Replication Portal" />
              <NavItem active={currentView === AppView.HARNESS} onClick={() => setCurrentView(AppView.HARNESS)} icon={<Terminal size={18} />} label="Verify Harness" />
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-4">
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <Database size={14} className="text-zinc-500" />
              <span className="text-[10px] mono uppercase text-zinc-500">Node Connectivity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span className="text-xs font-bold mono uppercase tracking-tighter text-emerald-500">MESH_ACTIVE</span>
            </div>
          </div>
          <div className="text-[10px] text-zinc-700 mono text-center px-2">BUILD: GLOBAL_v1.0<br />REDUCING_SUFFERING_2026</div>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto p-4 md:p-10 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.03),transparent_40%)]">
        <div className="max-w-6xl mx-auto pb-24">{renderView()}</div>
      </main>

      {showCookieBanner && (
        <div className="fixed bottom-0 left-0 right-0 p-6 md:p-8 z-50 flex justify-center pointer-events-none">
          <div className="w-full max-w-2xl bg-zinc-950/90 border border-zinc-800 p-6 rounded-2xl shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-full duration-500 pointer-events-auto">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-amber-500 mb-2"><ShieldCheck size={20} /><h4 className="font-black mono uppercase tracking-widest text-[10px]">Mesh Sovereignty Protocol</h4></div>
                <p className="text-sm text-zinc-400 leading-relaxed mono italic">Node utilizes local persistence to maintain sovereign logs. Global sync occurs only via encrypted, user-initiated replication bundles.</p>
              </div>
              <button onClick={() => setShowCookieBanner(false)} className="px-8 py-3 bg-zinc-100 text-black font-black rounded-xl hover:bg-white transition-all active:scale-95 mono uppercase text-xs">Acknowledge</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 border ${active ? 'bg-zinc-900 text-amber-500 border-zinc-800 shadow-lg shadow-black/40' : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-zinc-900/50 hover:border-zinc-800'}`}>
    {icon}<span className="font-bold text-sm tracking-tight">{label}</span>{active && <ChevronRight size={14} className="ml-auto opacity-50" />}
  </button>
);

export default App;
