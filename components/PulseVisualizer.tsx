
import React, { useEffect, useRef } from 'react';

interface Props {
  value: number;
  bpm: number;
  isActive: boolean;
}

const PulseVisualizer: React.FC<Props> = ({ value, bpm, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    dataRef.current.push(value);
    if (dataRef.current.length > 200) dataRef.current.shift();

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Background Grid
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 20) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
      }

      // Signal Trace
      if (dataRef.current.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = isActive ? '#ef4444' : '#27272a';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        
        const step = canvas.width / 200;
        const baseline = canvas.height / 2;
        
        ctx.moveTo(0, baseline - dataRef.current[0] * 30);
        for (let i = 1; i < dataRef.current.length; i++) {
          ctx.lineTo(i * step, baseline - dataRef.current[i] * 30);
        }
        ctx.stroke();

        // Glow Effect
        if (isActive) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'rgba(239, 68, 68, 0.5)';
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [value, isActive]);

  return (
    <div className="relative bg-black rounded-2xl border border-zinc-900 overflow-hidden">
      <canvas ref={canvasRef} width={600} height={100} className="w-full h-24" />
      <div className="absolute top-2 right-4 flex items-baseline gap-1">
        <span className={`text-2xl font-black mono tracking-tighter ${isActive ? 'text-rose-500' : 'text-zinc-800'}`}>
          {bpm > 0 ? bpm : '--'}
        </span>
        <span className="text-[10px] font-bold text-zinc-600 mono uppercase">BPM</span>
      </div>
    </div>
  );
};

export default PulseVisualizer;
