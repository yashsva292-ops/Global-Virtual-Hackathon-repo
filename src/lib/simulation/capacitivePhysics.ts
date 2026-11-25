export interface SimulationParams {
  frequencyKhz: number;      // 50 to 500 kHz excitation frequency
  voltageV: number;          // 1.0 to 5.0 Volts
  plateDistanceMm: number;   // 0.5 to 3.0 mm glass thickness
  fingerPressure: number;    // 0.0 to 1.0 normalized
  chargeCarrierSpeed: number;// 0.5 to 2.5 multiplier
}

export interface TouchPoint {
  x: number;
  y: number;
  active: boolean;
}

export interface Electron {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  layer: 'drive' | 'sense' | 'fringe';
  energy: number;
}

export interface SimulationState {
  baselineCapacitancePf: number;
  mutualCapacitancePf: number;
  deltaCapacitancePf: number;
  snrDb: number;
  samplingRateKsps: number;
  detectedCoordinates: { x: number; y: number } | null;
}

// Baseline calculations based on physical parallel plate with fringing fields
// C = (epsilon_r * epsilon_0 * Area) / d
export function calculateCapacitance(params: SimulationParams, touch: TouchPoint): SimulationState {
  const epsilon0 = 8.854e-12; // F/m
  const epsilonR_glass = 7.0; // Borosilicate glass
  const electrodeArea = 4e-6; // 2mm x 2mm electrode grid in m^2
  const d_meters = params.plateDistanceMm * 1e-3;

  // Mutual baseline capacitance (ITO electrode intersection)
  const baselineC = (epsilonR_glass * epsilon0 * electrodeArea) / d_meters;
  const baselinePf = Number((baselineC * 1e12).toFixed(3)); // converted to pF

  if (!touch.active || touch.x < 0 || touch.y < 0) {
    return {
      baselineCapacitancePf: baselinePf,
      mutualCapacitancePf: baselinePf,
      deltaCapacitancePf: 0,
      snrDb: 48.5,
      samplingRateKsps: Math.round(params.frequencyKhz * 0.8),
      detectedCoordinates: null,
    };
  }

  // When human finger (virtual ground, ~100pF human body capacitance) touches screen,
  // fringing electric lines shunt to ground, REDUCING mutual capacitance between TX and RX.
  const deltaC = baselinePf * (0.25 + params.fingerPressure * 0.45) * (params.voltageV / 3.3);
  const mutualC = Math.max(0.01, baselinePf - deltaC);

  // Signal to noise ratio calculation
  const snr = 30 + (params.voltageV * 4.2) + (params.frequencyKhz / 40) - (params.plateDistanceMm * 2.5);

  return {
    baselineCapacitancePf: baselinePf,
    mutualCapacitancePf: Number(mutualC.toFixed(3)),
    deltaCapacitancePf: Number(deltaC.toFixed(3)),
    snrDb: Number(snr.toFixed(1)),
    samplingRateKsps: Math.round(params.frequencyKhz * 0.85),
    detectedCoordinates: { x: Math.round(touch.x), y: Math.round(touch.y) },
  };
}
