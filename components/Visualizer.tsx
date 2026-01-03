
import React, { useEffect, useRef } from 'react';

interface Props {
  isActive: boolean;
}

const Visualizer: React.FC<Props> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const bars = 80;
    const barWidth = (canvas.width / bars);
    let barHeight: number;
    let x = 0;

    const render = () => {
      // Background bleed
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid lines
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 0.5;
      for(let i = 0; i < canvas.height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      x = 0;
      const time = Date.now() / 1000;

      for (let i = 0; i < bars; i++) {
        if (isActive) {
          // Complex waveform simulation
          const freq = (i / bars) * 10;
          const wave1 = Math.sin(time * 2 + freq) * 20;
          const wave2 = Math.sin(time * 5 - freq * 0.5) * 15;
          const noise = Math.random() * 5;
          barHeight = 40 + wave1 + wave2 + noise + (Math.sin(time + i * 0.1) * 30);
        } else {
          barHeight = 2 + Math.random() * 2;
        }

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        if (isActive) {
          gradient.addColorStop(0, '#f59e0b'); // amber-500
          gradient.addColorStop(0.5, '#b45309'); // amber-700
          gradient.addColorStop(1, '#451a03'); // amber-950
        } else {
          gradient.addColorStop(0, '#18181b');
          gradient.addColorStop(1, '#09090b');
        }

        ctx.fillStyle = gradient;
        
        // Render bar with slight gap
        const h = Math.max(2, barHeight);
        ctx.fillRect(x, canvas.height/2 - h/2, barWidth - 1, h);

        x += barWidth;
      }

      // Scanner line
      const scanX = (Date.now() % 2000 / 2000) * canvas.width;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.1)';
      ctx.beginPath();
      ctx.moveTo(scanX, 0);
      ctx.lineTo(scanX, canvas.height);
      ctx.stroke();

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isActive]);

  return (
    <canvas 
      ref={canvasRef} 
      width={1200} 
      height={240} 
      className="w-full h-48 bg-black border-b border-zinc-900"
    />
  );
};

export default Visualizer;
