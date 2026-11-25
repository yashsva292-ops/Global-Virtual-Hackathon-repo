import React from 'react';
import type { SimulationParams } from '../../lib/simulation/capacitivePhysics';
import { Sliders, Activity, Zap, Layers, RefreshCw } from 'lucide-react';

interface ParameterControlsProps {
  params: SimulationParams;
  onChange: (updated: SimulationParams) => void;
  onReset: () => void;
}

export const ParameterControls: React.FC<ParameterControlsProps> = ({
  params,
  onChange,
  onReset,
}) => {
  const handleChange = (key: keyof SimulationParams, value: number) => {
    onChange({
      ...params,
      [key]: value,
    });
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d111a]/80 p-5 backdrop-blur-xl shadow-xl">
      <div className="mb-5 flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-cyan-400" />
          <h3 className="font-semibold text-sm text-slate-200">Hardware & Physics Controls</h3>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1 text-xs text-slate-400 transition hover:bg-white/5 hover:text-cyan-300"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Reset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Drive Frequency */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Activity className="h-3.5 w-3.5 text-cyan-400" />
              TX Excitation Frequency
            </span>
            <span className="text-cyan-400 font-semibold">{params.frequencyKhz} kHz</span>
          </div>
          <input
            type="range"
            min={50}
            max={400}
            step={10}
            value={params.frequencyKhz}
            onChange={(e) => handleChange('frequencyKhz', Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>50 kHz (Low Noise)</span>
            <span>400 kHz (Ultra Fast Scan)</span>
          </div>
        </div>

        {/* Drive Voltage */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Zap className="h-3.5 w-3.5 text-yellow-400" />
              Electrode Voltage (V_drive)
            </span>
            <span className="text-yellow-400 font-semibold">{params.voltageV.toFixed(1)} V</span>
          </div>
          <input
            type="range"
            min={1.2}
            max={5.0}
            step={0.1}
            value={params.voltageV}
            onChange={(e) => handleChange('voltageV', Number(e.target.value))}
            className="w-full accent-yellow-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>1.2V (Energy Efficient)</span>
            <span>5.0V (High SNR)</span>
          </div>
        </div>

        {/* Cover Glass Thickness */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Layers className="h-3.5 w-3.5 text-indigo-400" />
              Dielectric Glass Distance (d)
            </span>
            <span className="text-indigo-400 font-semibold">{params.plateDistanceMm.toFixed(2)} mm</span>
          </div>
          <input
            type="range"
            min={0.4}
            max={2.5}
            step={0.05}
            value={params.plateDistanceMm}
            onChange={(e) => handleChange('plateDistanceMm', Number(e.target.value))}
            className="w-full accent-indigo-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0.4mm (Gorilla Glass)</span>
            <span>2.5mm (Ruggedized)</span>
          </div>
        </div>

        {/* Finger Coupling Pressure */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-3 w-3 rounded-full bg-rose-500 inline-block" />
              Contact Area / Pressure
            </span>
            <span className="text-rose-400 font-semibold">{Math.round(params.fingerPressure * 100)}%</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={1.0}
            step={0.05}
            value={params.fingerPressure}
            onChange={(e) => handleChange('fingerPressure', Number(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Light Touch (Finger Tip)</span>
            <span>Firm Press (Full Pad)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
