import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Radio, Code2 } from 'lucide-react';
import type { SimulationState } from '../../lib/simulation/capacitivePhysics';

interface FloatingPillNavProps {
  state: SimulationState;
  isTouched: boolean;
}

export const FloatingPillNav: React.FC<FloatingPillNavProps> = ({ state, isTouched }) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="flex items-center gap-3 rounded-full border border-white/10 bg-[#07090e]/85 px-4 py-2 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
            <Cpu className="h-3.5 w-3.5" />
          </div>
          <span className="font-mono text-xs font-bold tracking-tight text-white hidden sm:inline">
            CAPACITOR<span className="text-cyan-400">.IO</span>
          </span>
        </div>

        <div className="h-4 w-px bg-white/10" />

        {/* Live dynamic telemetry indicator */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <AnimatePresence mode="wait">
            {isTouched ? (
              <motion.div
                key="touch"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5 text-rose-400"
              >
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                <span className="font-semibold">
                  -ΔC: {state.deltaCapacitancePf.toFixed(2)} pF
                </span>
                {state.detectedCoordinates && (
                  <span className="text-[10px] text-slate-400 hidden md:inline">
                    ({state.detectedCoordinates.x}, {state.detectedCoordinates.y})
                  </span>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5 text-cyan-400"
              >
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                <span>Base: {state.baselineCapacitancePf.toFixed(2)} pF</span>
                <span className="text-[10px] text-emerald-400 hidden md:inline">
                  {state.snrDb.toFixed(1)} dB SNR
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-4 w-px bg-white/10" />

        <a
          href="https://github.com/yashsva292-ops/Global-Virtual-Hackathon-repo"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-[11px] font-mono text-slate-400 transition hover:text-white"
        >
          <Code2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Repo</span>
        </a>
      </motion.div>
    </div>
  );
};
