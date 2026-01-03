
import React, { useState } from 'react';
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { MoodEntry } from '../types';
import { BarChart3, TrendingDown, Target, Zap, BrainCircuit, Loader2, Sparkles } from 'lucide-react';
import { analyzeMoodTrends } from '../lib/gemini';

interface Props {
  moodHistory: MoodEntry[];
}

const AnalyticsView: React.FC<Props> = ({ moodHistory }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const chartData = moodHistory.slice(-10).map(entry => ({
    date: new Date(entry.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    before: entry.scoreBefore,
    after: entry.scoreAfter ?? entry.scoreBefore,
    reduction: entry.scoreBefore - (entry.scoreAfter ?? entry.scoreBefore)
  }));

  const totalReduction = moodHistory.reduce((acc, curr) => acc + (curr.scoreBefore - (curr.scoreAfter ?? curr.scoreBefore)), 0);
  const successRate = (moodHistory.filter(m => (m.scoreBefore - (m.scoreAfter ?? m.scoreBefore)) > 0).length / (moodHistory.length || 1)) * 100;

  const handleRunAnalysis = async () => {
    if (moodHistory.length === 0) return;
    setIsAnalyzing(true);
    try {
      const summary = await analyzeMoodTrends(moodHistory);
      setAiAnalysis(summary);
    } catch (e) {
      console.error(e);
      setAiAnalysis("Error during intelligence synthesis. Ensure local node connectivity.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       <header className="flex justify-between items-end border-b border-zinc-900 pb-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tighter uppercase">System Metrics</h2>
          <p className="text-zinc-500 text-sm mono">Empirical evidence of suffering reduction across temporal nodes.</p>
        </div>
        <button 
          onClick={handleRunAnalysis}
          disabled={isAnalyzing || moodHistory.length === 0}
          className="px-6 py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-500 hover:border-amber-500/50 transition-all rounded-xl text-xs font-black mono flex items-center gap-2 disabled:opacity-50"
        >
          {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <BrainCircuit size={14} />}
          AI_GENERATE_INSIGHT
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          icon={<TrendingDown className="text-amber-500" />} 
          label="Cumulative Reduction" 
          value={`${totalReduction} Pts`}
        />
        <MetricCard 
          icon={<Target className="text-cyan-500" />} 
          label="Protocol Success Rate" 
          value={`${successRate.toFixed(0)}%`}
        />
        <MetricCard 
          icon={<Zap className="text-emerald-500" />} 
          label="Active Sessions" 
          value={moodHistory.length.toString()}
        />
      </div>

      {aiAnalysis && (
        <section className="bg-zinc-950 border border-zinc-900 p-8 rounded-3xl shadow-2xl animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="text-amber-500" size={20} />
            <h3 className="text-xs font-black mono uppercase tracking-widest text-zinc-400">Intelligence Synthesis Summary</h3>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed mono whitespace-pre-wrap italic">
            {aiAnalysis}
          </p>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-zinc-950 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
          <h3 className="text-sm font-black mono text-zinc-500 uppercase mb-8 flex items-center gap-2">
            <BarChart3 size={16} /> Suffering Intensity Delta
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBefore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAfter" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                <XAxis dataKey="date" stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} domain={[0, 10]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="before" stroke="#ef4444" fillOpacity={1} fill="url(#colorBefore)" strokeWidth={2} name="Intensity Before" />
                <Area type="monotone" dataKey="after" stroke="#f59e0b" fillOpacity={1} fill="url(#colorAfter)" strokeWidth={2} name="Intensity After" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="bg-zinc-950 border border-zinc-800 p-8 rounded-3xl flex flex-col justify-center text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-zinc-900 mx-auto flex items-center justify-center border border-zinc-800">
             <BarChart3 size={40} className="text-zinc-600" />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-bold uppercase tracking-tighter">Signal Efficiency</h4>
            <p className="text-xs text-zinc-500 px-8 mono leading-relaxed opacity-70">
              Current telemetry indicates a steady downward trend in reported acute suffering episodes since System 1 deployment.
            </p>
          </div>
          <div className="pt-4 grid grid-cols-2 divide-x divide-zinc-800">
            <div>
              <p className="text-2xl font-black text-white">432Hz</p>
              <p className="text-[10px] mono text-zinc-600 uppercase">Optimum Carrier</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">12.5m</p>
              <p className="text-[10px] mono text-zinc-600 uppercase">Avg. Exposure</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ icon: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => (
  <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-3xl shadow-xl hover:bg-zinc-900/10 transition-colors">
    <div className="flex items-center gap-3 mb-2">
      {icon}
      <span className="text-[10px] font-black mono uppercase text-zinc-500 tracking-widest">{label}</span>
    </div>
    <div className="text-3xl font-black text-white tracking-tighter">{value}</div>
  </div>
);

export default AnalyticsView;
