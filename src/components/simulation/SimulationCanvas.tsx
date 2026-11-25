import React, { useRef, useEffect } from 'react';
import type { SimulationParams, TouchPoint } from '../../lib/simulation/capacitivePhysics';

interface SimulationCanvasProps {
  params: SimulationParams;
  touch: TouchPoint;
  onTouchChange: (touch: TouchPoint) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  originX: number;
  originY: number;
  charge: number;
  layer: 'drive' | 'sense' | 'fringe';
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  params,
  touch,
  onTouchChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 700);
    const height = (canvas.height = 420);

    // Initialize electron particles along TX (drive) and RX (sense) ITO micro-wires
    const particles: Particle[] = [];
    const rows = 6;
    const cols = 9;

    for (let r = 0; r < rows; r++) {
      const y = (height / (rows + 1)) * (r + 1);
      for (let c = 0; c < cols; c++) {
        const x = (width / (cols + 1)) * (c + 1);
        // Create a cluster of electrons oscillating per node
        for (let p = 0; p < 4; p++) {
          particles.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            originX: x,
            originY: y,
            charge: -1,
            layer: p % 2 === 0 ? 'drive' : 'sense',
          });
        }
      }
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.03 * (params.frequencyKhz / 150);
      const width = canvas.width;
      const height = canvas.height;

      // Deep clean background with grid
      ctx.fillStyle = '#07090e';
      ctx.fillRect(0, 0, width, height);

      // Draw ITO Matrix Grid (Transmit TX lines in cyan, Receive RX lines in indigo)
      ctx.lineWidth = 1;
      const rows = 6;
      const cols = 9;

      // Draw horizontal TX drive electrodes
      for (let r = 0; r < rows; r++) {
        const y = (height / (rows + 1)) * (r + 1);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.18)';
        ctx.beginPath();
        ctx.moveTo(30, y);
        ctx.lineTo(width - 30, y);
        ctx.stroke();

        // Driving AC excitation wave indication
        const pulseX = ((Math.sin(time * 3 + r) + 1) / 2) * (width - 60) + 30;
        const grad = ctx.createRadialGradient(pulseX, y, 0, pulseX, y, 25);
        grad.addColorStop(0, 'rgba(6, 182, 212, 0.45)');
        grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(pulseX, y, 25, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw vertical RX sense electrodes
      for (let c = 0; c < cols; c++) {
        const x = (width / (cols + 1)) * (c + 1);
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.18)';
        ctx.beginPath();
        ctx.moveTo(x, 25);
        ctx.lineTo(x, height - 25);
        ctx.stroke();
      }

      // If finger is touching, draw electrostatic fringing field shunt
      if (touch.active) {
        // Finger contact aura
        const fingerRadius = 45 * (0.8 + params.fingerPressure * 0.4);
        const touchGlow = ctx.createRadialGradient(
          touch.x,
          touch.y,
          0,
          touch.x,
          touch.y,
          fingerRadius * 2
        );
        touchGlow.addColorStop(0, 'rgba(244, 63, 94, 0.35)');
        touchGlow.addColorStop(0.5, 'rgba(244, 63, 94, 0.12)');
        touchGlow.addColorStop(1, 'rgba(244, 63, 94, 0)');

        ctx.fillStyle = touchGlow;
        ctx.beginPath();
        ctx.arc(touch.x, touch.y, fingerRadius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Outer capacitive distortion ring
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(touch.x, touch.y, fingerRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label for Touch Shunt
        ctx.fillStyle = '#f43f5e';
        ctx.font = '11px Geist Mono, monospace';
        ctx.fillText(`HUMAN SHUNT GND [-ΔC]`, touch.x + fingerRadius + 8, touch.y - 10);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Geist Mono, monospace';
        ctx.fillText(`X:${Math.round(touch.x)} Y:${Math.round(touch.y)}`, touch.x + fingerRadius + 8, touch.y + 6);
      }

      // Update and draw live electrons
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Harmonic oscillator motion around node
        const targetX = p.originX + Math.sin(time + p.originY * 0.02) * 12;
        const targetY = p.originY + Math.cos(time + p.originX * 0.02) * 12;

        p.x += (targetX - p.x) * 0.1 * params.chargeCarrierSpeed;
        p.y += (targetY - p.y) * 0.1 * params.chargeCarrierSpeed;

        // If finger touches nearby, electrons get deflected (shunted towards virtual ground)
        if (touch.active) {
          const dx = p.x - touch.x;
          const dy = p.y - touch.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            const force = (110 - dist) / 110;
            // Shunt pull
            p.x += (dx / dist) * force * 3.5;
            p.y += (dy / dist) * force * 3.5;
          }
        }

        // Render electron
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.layer === 'drive' ? 2.5 : 2.0, 0, Math.PI * 2);
        if (p.layer === 'drive') {
          ctx.fillStyle = '#22d3ee'; // Cyan (drive carrier)
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 6;
        } else {
          ctx.fillStyle = '#818cf8'; // Indigo (sense carrier)
          ctx.shadowColor = '#6366f1';
          ctx.shadowBlur = 4;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Interactive guidance prompt overlay if idle
      if (!touch.active) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '12px Geist Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ Click or drag anywhere on the ITO grid to introduce capacitive touch', width / 2, height - 20);
        ctx.textAlign = 'start';
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [params, touch]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    onTouchChange({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!touch.active && e.buttons !== 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    onTouchChange({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    });
  };

  const handlePointerUp = () => {
    onTouchChange({ x: 0, y: 0, active: false });
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#07090e] shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-4 py-2.5 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-mono text-slate-300">ITO Micro-Electrode Array (Cross-Section)</span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> TX Drive Grid
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" /> RX Sense Grid
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Ground Shunt
          </span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="block w-full cursor-crosshair touch-none"
      />
    </div>
  );
};
