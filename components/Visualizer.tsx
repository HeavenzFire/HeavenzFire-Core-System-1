
import React, { useEffect, useRef } from 'react';

interface Props {
  isActive: boolean;
  isWonderMode?: boolean;
  intensity?: number; // 0-1, linked to HRV/Bio-sync
  seed?: number;
}

const Visualizer: React.FC<Props> = ({ isActive, isWonderMode = false, intensity = 0.5, seed = 42 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Deterministic Pseudo-Random Generator
  const mulberry32 = (a: number) => {
    return () => {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const bars = 100;
    const barWidth = (canvas.width / bars);
    const getRand = mulberry32(seed);

    const render = () => {
      // Background: Deep Sovereign Void
      ctx.fillStyle = isWonderMode ? '#030303' : '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Noise grain overlay for tactile texture
      for (let n = 0; n < 2000; n++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        ctx.fillStyle = `rgba(255, 255, 255, 0.02)`;
        ctx.fillRect(x, y, 1, 1);
      }

      if (isWonderMode) {
        // High-Fidelity Sovereign Mandalas
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const time = Date.now() / 1500;
        const radiusBase = 80 + intensity * 60;

        ctx.lineWidth = 1.5;
        for (let j = 0; j < 4; j++) {
          ctx.beginPath();
          const opacity = (0.05 + (j * 0.08)) * (isActive ? 1 : 0.5);
          ctx.strokeStyle = `rgba(245, 158, 11, ${opacity})`;
          
          const layerIntensity = intensity * (j + 1) * 0.4;
          const layerSeedOffset = j * 100;
          const layerRand = mulberry32(seed + layerSeedOffset);
          
          for (let i = 0; i <= 360; i++) {
            const angle = (i * Math.PI) / 180;
            // Deterministic jitter based on layer seed
            const jitter = layerRand() * 2;
            const wave = Math.sin(angle * (6 + j) + time * (1 + j * 0.2)) * (15 * layerIntensity + jitter);
            const r = radiusBase + wave + (Math.sin(time * 0.5) * 10);
            
            const vx = centerX + Math.cos(angle) * r;
            const vy = centerY + Math.sin(angle) * r;
            
            if (i === 0) ctx.moveTo(vx, vy);
            else ctx.lineTo(vx, vy);
          }
          ctx.closePath();
          ctx.stroke();

          // Outer Glow Pulse
          if (isActive && j === 3) {
            ctx.shadowBlur = 40 * intensity;
            ctx.shadowColor = 'rgba(245, 158, 11, 0.2)';
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }

        // Floating 'Data Particles' (Sovereign Seeds)
        if (isActive) {
          for (let k = 0; k < 15; k++) {
            const pRand = mulberry32(seed + k * 10);
            const orbitR = 120 + pRand() * 200;
            const speed = 0.2 + pRand() * 0.5;
            const pAngle = time * speed + pRand() * Math.PI * 2;
            
            const px = centerX + Math.cos(pAngle) * orbitR;
            const py = centerY + Math.sin(pAngle) * orbitR;
            
            ctx.fillStyle = `rgba(245, 158, 11, ${0.1 + pRand() * 0.2})`;
            ctx.beginPath();
            ctx.arc(px, py, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else {
        // Deterministic Grid-Aligned Signal Bars
        const time = Date.now() / 1000;
        let xPos = 0;

        for (let i = 0; i < bars; i++) {
          const barSeed = seed + i;
          const bRand = mulberry32(barSeed);
          let barHeight = 2;

          if (isActive) {
            const freq = (i / bars) * 8;
            const wave1 = Math.sin(time * 3 + freq) * 25;
            const wave2 = Math.cos(time * 2 - freq * 1.5) * 15;
            const determinism = bRand() * 10;
            barHeight = 50 + (wave1 + wave2 + determinism) * (0.5 + intensity * 0.5);
          }

          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          if (isActive) {
            gradient.addColorStop(0, '#f59e0b');
            gradient.addColorStop(0.5, '#b45309');
            gradient.addColorStop(1, 'rgba(69, 26, 3, 0)');
          } else {
            gradient.addColorStop(0, '#111');
            gradient.addColorStop(1, '#050505');
          }

          ctx.fillStyle = gradient;
          const h = Math.max(1, barHeight);
          ctx.fillRect(xPos, canvas.height/2 - h/2, barWidth - 2, h);
          xPos += barWidth;
        }

        // Horizontal Scanline (Love for Aesthetics)
        const scanY = (Date.now() % 5000 / 5000) * canvas.height;
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(canvas.width, scanY);
        ctx.stroke();
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [isActive, isWonderMode, intensity, seed]);

  return (
    <div className="relative group">
      <canvas 
        ref={canvasRef} 
        width={1200} 
        height={400} 
        className={`w-full h-80 bg-black border-b border-zinc-900 transition-all duration-1000 ${isWonderMode ? 'border-amber-500/20 shadow-[0_0_80px_rgba(245,158,11,0.05)]' : ''}`}
      />
      <div className="absolute bottom-4 left-6 flex items-center gap-4 opacity-30 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
          <span className="text-[9px] mono text-zinc-500 uppercase font-bold tracking-widest">Signal_Locked</span>
        </div>
        <div className="text-[9px] mono text-zinc-700 uppercase font-bold">Seed_{seed.toString().padStart(4, '0')}</div>
      </div>
    </div>
  );
};

export default Visualizer;
