import React, { useState, useEffect } from 'react';
import Lenis from 'lenis';
import { motion } from 'motion/react';
import {
  calculateCapacitance,
  type SimulationParams,
  type TouchPoint,
} from '../../lib/simulation/capacitivePhysics';
import { SimulationCanvas } from '../simulation/SimulationCanvas';
import { ParameterControls } from '../simulation/ParameterControls';
import { MetricsPanel } from '../simulation/MetricsPanel';
import { MechanismExplainer } from './MechanismExplainer';
import { PhoneHero3D } from './PhoneHero3D';
import { FuturePhoneExperience } from './FuturePhoneExperience';
import { QuantumFieldShowcase } from './QuantumFieldShowcase';
import { CombinedTopographicBackground } from './CombinedTopographicBackground';
import { FloatingPillNav } from '../ui/FloatingPillNav';
import { Cpu, Zap, ShieldCheck, Terminal, Code2, ArrowLeft } from 'lucide-react';

const DEFAULT_PARAMS: SimulationParams = {
  frequencyKhz: 180,
  voltageV: 3.3,
  plateDistanceMm: 1.1,
  fingerPressure: 0.6,
  chargeCarrierSpeed: 1.2,
};

interface E2EESimulatorPortalProps {
  onBackToHome: () => void;
}

export const E2EESimulatorPortal: React.FC<E2EESimulatorPortalProps> = ({ onBackToHome }) => {
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
  const [touch, setTouch] = useState<TouchPoint>({ x: 0, y: 0, active: false });

  // Smooth inertial scroll initialization with Lenis
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const animId = requestAnimationFrame(raf);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Compute live physics calculation
  const simState = calculateCapacitance(params, touch);

  return (
    <CombinedTopographicBackground>
      {/* Floating Pill HUD */}
      <FloatingPillNav state={simState} isTouched={touch.active} />

      {/* Top Header with Return Button */}
      <header className="sticky top-0 z-40 border-b border-black/10 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Homepage</span>
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/20">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-slate-950 flex items-center gap-2">
                CAPACITOR<span className="text-cyan-600">.IO</span>
                <span className="rounded-full border border-cyan-600/30 bg-cyan-50 px-2 py-0.5 text-[10px] font-mono text-cyan-700">
                  GVH 2026
                </span>
              </span>
              <p className="text-[10px] text-slate-500 font-mono">Unveiling Capacitive Touch Physics</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-600/20 bg-emerald-50 px-3 py-1 text-xs text-emerald-700 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              Real-Time Physics Engine Active
            </span>
            <a
              href="https://github.com/yashsva292-ops/Global-Virtual-Hackathon-repo"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl border border-black/10 bg-white/90 px-3 py-1.5 text-xs text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-black"
            >
              <Code2 className="h-4 w-4" />
              <span>Repository</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 mb-20">
          <div className="lg:col-span-7 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-600/30 bg-cyan-50/90 px-3.5 py-1 text-xs font-mono text-cyan-800 shadow-sm backdrop-blur-md"
            >
              <Zap className="h-3.5 w-3.5 text-cyan-600" />
              Theme: Unveiling Technology
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-950"
            >
              How Glass Feels Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600">
                Touch
              </span>
              .
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base text-slate-700 leading-relaxed max-w-xl font-medium"
            >
              Glass is an electrical insulator. Yet modern screens register sub-millimeter touches in under 20 milliseconds.
              Explore the real electrodynamics of mutual capacitance, transparent Indium Tin Oxide micro-electrodes, and how the human body acts as a virtual ground shunt.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-2 font-mono text-xs"
            >
              <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-white/90 px-3 py-2 text-slate-800 shadow-sm backdrop-blur-md">
                <ShieldCheck className="h-4 w-4 text-cyan-600" />
                <span>100% Client-Side Physics</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-white/90 px-3 py-2 text-slate-800 shadow-sm backdrop-blur-md">
                <Terminal className="h-4 w-4 text-indigo-600" />
                <span>Zero AI / Zero External Quota</span>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <PhoneHero3D isTouched={touch.active} />
          </div>
        </div>

        {/* Premier 5-Step Future Phone Cinematic Experience */}
        <section id="phone-lab" className="mb-20">
          <FuturePhoneExperience
            onDeepDive={() => {
              const el = document.getElementById('simulation-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </section>

        {/* 3D Quantum Field Showcase with GSAP, GLSL Shaders & Anime.js */}
        <section className="mb-20">
          <QuantumFieldShowcase />
        </section>

        {/* Live Simulation & Metrics Section */}
        <section id="simulation-section" className="space-y-6 mb-20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2">
                <span>Interactive Capacitive Matrix</span>
                <span className="text-xs font-mono font-normal text-slate-600">
                  (Move pointer or finger over canvas)
                </span>
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Simulating electron drift velocity and electrostatic field lines shunting to ground
              </p>
            </div>
            {touch.active && (
              <span className="inline-flex items-center gap-2 font-mono text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full shadow-sm animate-pulse font-semibold">
                TOUCH REGISTERED: -{simState.deltaCapacitancePf.toFixed(2)} pF
              </span>
            )}
          </div>

          {/* Interactive Simulation Canvas */}
          <SimulationCanvas
            params={params}
            touch={touch}
            onTouchChange={setTouch}
          />

          {/* Real-Time Mathematical Telemetry Panel */}
          <MetricsPanel state={simState} />

          {/* Hardware & Physics Controls */}
          <ParameterControls
            params={params}
            onChange={setParams}
            onReset={() => setParams(DEFAULT_PARAMS)}
          />
        </section>

        {/* Three Step Educational Explainer Section with Anime.js Circuit Trace & Spotlight Cards */}
        <section className="space-y-6 mb-20">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl font-bold text-slate-950">The Scientific Mechanism Explained</h3>
            <p className="text-xs text-slate-600 font-medium">
              Understanding the 3 distinct phases that take place during a 20-millisecond screen tap
            </p>
          </div>
          <MechanismExplainer />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/10 bg-white/90 py-8 text-xs text-slate-600 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <p>© 2026 Global Virtual Hackathon Submission — Canadian International School, Singapore.</p>
          <p className="font-mono text-[11px] text-slate-500">
            Powered by Vite, React 19, ReactDrops Topographic Flow, Motion, Three.js, Anime.js & Lenis.
          </p>
        </div>
      </footer>
    </CombinedTopographicBackground>
  );
};
