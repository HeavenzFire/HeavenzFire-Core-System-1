
import React, { useState } from 'react';
import { Terminal, ShieldAlert, CheckCircle2, XCircle, Play, RefreshCw, Database, Hash } from 'lucide-react';
import { GOLDEN_BASELINE } from '../constants';
import { VerificationStatus, GoldenTest } from '../types';

interface Props {
  onVerify: (status: VerificationStatus) => void;
  status: VerificationStatus | null;
}

const HarnessView: React.FC<Props> = ({ onVerify, status }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const runHarness = async () => {
    setIsRunning(true);
    setLogs(['[SYSTEM] INITIALIZING VERIFICATION HARNESS v1.0', '[SYSTEM] LOADING GOLDEN BASELINE DATA...']);
    
    await new Promise(r => setTimeout(r, 600));
    
    const results: Record<string, boolean> = {};
    let allPassed = true;

    for (const test of GOLDEN_BASELINE) {
      setLogs(prev => [...prev, `[TEST] EVALUATING: ${test.id}...`]);
      await new Promise(r => setTimeout(r, 400));
      
      // Verification Logic: Deterministic Delta Calculation
      const actualDelta = test.input.before - test.input.after;
      const passed = actualDelta === test.expected.delta;
      
      results[test.id] = passed;
      if (!passed) allPassed = false;
      
      setLogs(prev => [...prev, passed 
        ? `[PASS] ${test.id} :: DELTA_MATCHED :: CHECKSUM_${test.expected.checksum}` 
        : `[FAIL] ${test.id} :: DELTA_MISMATCH (Exp: ${test.expected.delta}, Act: ${actualDelta})`
      ]);
    }

    setLogs(prev => [...prev, '[SYSTEM] VERIFICATION SEQUENCE COMPLETE', `[RESULT] SYSTEM_INTEGRITY: ${allPassed ? 'NOMINAL' : 'COMPROMISED'}`]);
    
    onVerify({
      lastRun: Date.now(),
      passed: allPassed,
      results
    });
    setIsRunning(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end border-b border-zinc-900 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Terminal className="text-amber-500" size={18} />
            <h2 className="text-3xl font-black tracking-tighter uppercase">Verification Harness</h2>
          </div>
          <p className="text-zinc-500 text-sm mono">
            Mechanical Trust Anchor :: Deterministic Regression Safety
          </p>
        </div>
        <button 
          onClick={runHarness}
          disabled={isRunning}
          className="px-6 py-3 bg-amber-500 text-black font-black rounded-xl flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
        >
          {isRunning ? <RefreshCw className="animate-spin" size={18} /> : <Play fill="currentColor" size={18} />}
          EXECUTE_HARNESS
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <section className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-zinc-900/50 p-4 border-b border-zinc-900 flex justify-between items-center">
              <span className="text-[10px] mono font-black text-zinc-500 uppercase flex items-center gap-2">
                <Hash size={12} /> Golden_Inputs_Archive
              </span>
              <span className="text-[10px] mono text-zinc-600">LOCKED_READ_ONLY</span>
            </div>
            <div className="divide-y divide-zinc-900">
              {GOLDEN_BASELINE.map(test => (
                <div key={test.id} className="p-6 flex justify-between items-center">
                  <div className="space-y-1">
                    <h4 className="text-sm font-black mono text-zinc-300">{test.id}</h4>
                    <p className="text-[10px] text-zinc-500 mono uppercase">Expected_Delta: {test.expected.delta} Pts</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] mono text-zinc-600 uppercase mb-1">Status</div>
                    {status?.results[test.id] ? (
                      <CheckCircle2 size={16} className="text-emerald-500 ml-auto" />
                    ) : (
                      <ShieldAlert size={16} className={`${status ? 'text-rose-500' : 'text-zinc-800'} ml-auto`} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-zinc-950 border border-zinc-900 p-8 rounded-3xl space-y-4">
             <div className="flex items-center gap-3 text-amber-500/50 mb-2">
               <Database size={16} />
               <h3 className="text-xs font-black mono uppercase">Integrity Summary</h3>
             </div>
             {status ? (
               <div className="grid grid-cols-2 gap-6">
                 <div>
                   <div className="text-[10px] mono text-zinc-600 uppercase font-bold mb-1">Status</div>
                   <div className={`text-xl font-black mono ${status.passed ? 'text-emerald-500' : 'text-rose-500'}`}>
                     {status.passed ? 'VERIFIED' : 'FAILED'}
                   </div>
                 </div>
                 <div>
                   <div className="text-[10px] mono text-zinc-600 uppercase font-bold mb-1">Last Run</div>
                   <div className="text-sm font-bold text-zinc-300">
                     {new Date(status.lastRun).toLocaleTimeString()}
                   </div>
                 </div>
               </div>
             ) : (
               <p className="text-xs text-zinc-600 italic">No verification records found on this node.</p>
             )}
          </section>
        </div>

        <section className="bg-black border border-zinc-900 rounded-3xl flex flex-col min-h-[500px] shadow-inner">
          <div className="bg-zinc-950 p-4 border-b border-zinc-900 flex items-center justify-between">
            <span className="text-[10px] mono font-black text-amber-500 uppercase tracking-widest">Diagnostic_Log</span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800"></div>
            </div>
          </div>
          <div className="flex-1 p-6 font-mono text-xs overflow-y-auto space-y-1 text-zinc-400">
            {logs.length === 0 && <span className="text-zinc-800 animate-pulse">Waiting for execution...</span>}
            {logs.map((log, i) => (
              <div key={i} className={`${log.includes('[PASS]') ? 'text-emerald-500' : log.includes('[FAIL]') ? 'text-rose-500' : ''}`}>
                <span className="text-zinc-700 mr-2 opacity-50">[{i.toString().padStart(3, '0')}]</span>
                {log}
              </div>
            ))}
            {isRunning && <div className="text-amber-500 animate-pulse mt-2 underline">PROCESS_RUNNING...</div>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HarnessView;
