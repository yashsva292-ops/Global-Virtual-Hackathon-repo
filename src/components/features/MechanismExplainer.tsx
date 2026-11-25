import React, { useEffect, useRef } from 'react';
import { SpotlightCard } from '../ui/SpotlightCard';
import { animate } from 'animejs';
import { Sparkles, Terminal, Layers } from 'lucide-react';

export const MechanismExplainer: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Anime.js v4 pulse wave stroke-dashoffset animation
    const paths = svgRef.current.querySelectorAll<SVGPathElement>('.anime-pulse-path');
    if (paths.length > 0) {
      animate(paths, {
        strokeDashoffset: [100, 0],
        duration: 2000,
        loop: true,
        ease: 'linear',
      });
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Anime.js Interactive Circuit Path Diagram */}
      <div className="rounded-2xl border border-white/10 bg-[#07090e]/80 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <h4 className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
              Circuit Level Electrodynamic Path (Anime.js Vector Engine)
            </h4>
          </div>
          <span className="font-mono text-[11px] text-cyan-400">Continuous AC Waveform</span>
        </div>

        <div className="w-full overflow-x-auto">
          <svg
            ref={svgRef}
            viewBox="0 0 800 120"
            className="w-full min-w-[650px] h-28 text-slate-400"
          >
            {/* Base circuit lines */}
            <path
              d="M 40 60 L 220 60 L 260 20 L 300 100 L 340 60 L 520 60"
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="2"
            />
            {/* Animated TX excitation wave */}
            <path
              className="anime-pulse-path"
              d="M 40 60 L 220 60 L 260 20 L 300 100 L 340 60 L 520 60"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeDasharray="20 6"
            />

            {/* Shunt to ground path */}
            <path
              d="M 380 60 L 380 110"
              fill="none"
              stroke="rgba(244,63,94,0.2)"
              strokeWidth="2"
            />
            <path
              className="anime-pulse-path"
              d="M 380 60 L 380 110"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="2"
              strokeDasharray="8 4"
            />

            {/* Receiver path */}
            <path
              d="M 520 60 L 760 60"
              fill="none"
              stroke="#818cf8"
              strokeWidth="2"
              strokeDasharray="6 4"
            />

            {/* Circuit Node Indicators */}
            <circle cx="40" cy="60" r="5" fill="#06b6d4" />
            <text x="30" y="40" fill="#06b6d4" fontSize="11" fontFamily="Geist Mono">
              TX Drive (3.3V AC)
            </text>

            <circle cx="380" cy="60" r="6" fill="#f43f5e" />
            <text x="340" y="35" fill="#f43f5e" fontSize="11" fontFamily="Geist Mono">
              Finger Ground Shunt (-ΔC)
            </text>

            <circle cx="760" cy="60" r="5" fill="#818cf8" />
            <text x="680" y="40" fill="#818cf8" fontSize="11" fontFamily="Geist Mono">
              RX ADC Sense Matrix
            </text>
          </svg>
        </div>
      </div>

      {/* Skiper UI-Style Spotlight Bento Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <SpotlightCard spotlightColor="rgba(6, 182, 212, 0.18)">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
            <span className="font-mono font-bold text-sm">01</span>
          </div>
          <h4 className="text-base font-bold text-slate-100 mb-2 flex items-center justify-between">
            <span>The Invisible Matrix</span>
            <Layers className="h-4 w-4 text-cyan-400 opacity-60" />
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Beneath the dielectric glass sits an orthogonal grid of optically transparent Indium Tin Oxide (ITO) micro-wires. Transmit (TX) lines emit a high-frequency AC field that couples to Receive (RX) lines, creating mutual capacitance at every intersection.
          </p>
        </SpotlightCard>

        <SpotlightCard spotlightColor="rgba(244, 63, 94, 0.18)">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4">
            <span className="font-mono font-bold text-sm">02</span>
          </div>
          <h4 className="text-base font-bold text-slate-100 mb-2 flex items-center justify-between">
            <span>The Human Shunt</span>
            <Sparkles className="h-4 w-4 text-rose-400 opacity-60" />
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            The human body has an inherent electrical capacitance of approximately 100 pF to earth ground. As your finger enters the fringing electrostatic field, it intercepts electric field lines and shunts charge away, causing a localized drop (-ΔC) in mutual capacitance.
          </p>
        </SpotlightCard>

        <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.18)">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
            <span className="font-mono font-bold text-sm">03</span>
          </div>
          <h4 className="text-base font-bold text-slate-100 mb-2 flex items-center justify-between">
            <span>DSP Centroid Math</span>
            <Terminal className="h-4 w-4 text-emerald-400 opacity-60" />
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            A dedicated touch controller scans all node intersections up to 400 times per second. By analyzing the differential capacitance bell-curve across neighboring electrodes, a centroid interpolation algorithm calculates coordinates to sub-millimeter precision.
          </p>
        </SpotlightCard>
      </div>
    </div>
  );
};
