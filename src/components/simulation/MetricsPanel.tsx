import React from 'react';
import type { SimulationState } from '../../lib/simulation/capacitivePhysics';
import { NumberTicker } from '../ui/NumberTicker';
import { Gauge, Radio, Cpu, Target } from 'lucide-react';

interface MetricsPanelProps {
  state: SimulationState;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ state }) => {
  return (
    <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
      {/* Baseline Mutual Capacitance */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0d111a]/70 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono">C_baseline (Mutual)</span>
          <Gauge className="h-4 w-4 text-cyan-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <NumberTicker
            value={state.baselineCapacitancePf}
            decimals={3}
            className="text-2xl font-bold text-white"
          />
          <span className="text-xs font-mono text-cyan-400">pF</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400">Inter-electrode coupling</div>
      </div>

      {/* Delta Shunted Capacitance */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0d111a]/70 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono">ΔC (Ground Shunt)</span>
          <Radio className="h-4 w-4 text-rose-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <NumberTicker
            value={state.deltaCapacitancePf}
            decimals={3}
            prefix={state.deltaCapacitancePf > 0 ? '-' : ''}
            className="text-2xl font-bold text-rose-400"
          />
          <span className="text-xs font-mono text-rose-400">pF</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400">
          {state.deltaCapacitancePf > 0 ? 'Finger contact registered' : 'No contact (0% drop)'}
        </div>
      </div>

      {/* Signal to Noise Ratio */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0d111a]/70 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono">Signal-to-Noise (SNR)</span>
          <Cpu className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <NumberTicker
            value={state.snrDb}
            decimals={1}
            className="text-2xl font-bold text-emerald-400"
          />
          <span className="text-xs font-mono text-emerald-400">dB</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400">ADC filtering threshold</div>
      </div>

      {/* Detected Coordinates */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0d111a]/70 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono">Centroid DSP Matrix</span>
          <Target className="h-4 w-4 text-amber-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2 font-mono">
          {state.detectedCoordinates ? (
            <span className="text-xl font-bold tracking-tight text-amber-400">
              X:{state.detectedCoordinates.x} Y:{state.detectedCoordinates.y}
            </span>
          ) : (
            <span className="text-sm font-semibold text-slate-500 py-1">IDLE / WAITING</span>
          )}
        </div>
        <div className="mt-1 text-[11px] text-slate-400">Sub-pixel interpolation</div>
      </div>
    </div>
  );
};
