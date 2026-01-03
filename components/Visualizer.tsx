
import React, { useEffect, useRef } from 'react';

interface Props {
  isActive: boolean;
  isWonderMode?: boolean;
  intensity?: number; // 0-1, linked to HRV/Bio-sync
}

const Visualizer: React.FC<Props> = ({ isActive, isWonderMode = false, intensity = 0.5 }) => {
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
      ctx.fillStyle = isWonderMode ? '#000' : '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (isWonderMode) {
        // High-Fidelity Wonder Rendering: Organic Circular Modulation
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const time = Date.now() / 1000;
        const radiusBase = 60 + intensity * 40;

        ctx.lineWidth = 2;
        for (let j = 0; j < 3; j++) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(245, 158, 11, ${0.1 + (j * 0.1)})`;
          const layerIntensity = intensity * (j + 1) * 0.5;
          
          for (let i = 0; i < 360; i++) {
            const angle = (i * Math.PI) / 180;
            const wave = Math.sin(angle * 8 + time * 2) * (10 * layerIntensity);
            const r = radiusBase + wave + (Math.sin(time * (j + 1)) * 5);
            const vx = centerX + Math.cos(angle) * r;
            const vy = centerY + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(vx, vy);
            else ctx.lineTo(vx, vy);
          }
          ctx.closePath();
          ctx.stroke();
        }

        // Particle Glow simulation
        if (isActive) {
           for(let k = 0; k < 5; k++) {
             const px = centerX + (Math.random() - 0.5) * 400;
             const py = centerY + (Math.random() - 0.5) * 200;
             ctx.fillStyle = `rgba(245, 158, 11, ${Math.random() * 0.2})`;
             ctx.beginPath();
             ctx.arc(px, py, Math.random() * 2, 0, Math.PI * 2);
             ctx.fill();
           }
        }
      } else {
        // Standard Bar Visualizer
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
          const h = Math.max(2, barHeight);
          ctx.fillRect(x, canvas.height/2 - h/2, barWidth - 1, h);
          x += barWidth;
        }

        const scanX = (Date.now() % 2000 / 2000) * canvas.width;
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.1)';
        ctx.beginPath();
        ctx.moveTo(scanX, 0);
        ctx.lineTo(scanX, canvas.height);
        ctx.stroke();
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [isActive, isWonderMode, intensity]);

  return (
    <canvas 
      ref={canvasRef} 
      width={1200} 
      height={320} 
      className={`w-full h-64 bg-black border-b border-zinc-900 transition-colors duration-1000 ${isWonderMode ? 'border-amber-500/10 shadow-[inner_0_0_40px_rgba(245,158,11,0.05)]' : ''}`}
    />
  );
};

export default Visualizer;
