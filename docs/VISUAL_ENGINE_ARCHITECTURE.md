# Visual Engine & Graphics Architecture
**System:** High-Performance Integrated Interactive Simulation & 3D Shader Pipeline  
**Application:** Global Virtual Hackathon — Capacitive Touch & Electron Electrodynamics

---

## 1. Pipeline Diagram

```text
               ┌────────────────────────────────────────────────────────┐
               │          User Input (Pointer, Sliders, Scroll)         │
               └──────────────────────────┬─────────────────────────────┘
                                          │
                     ┌────────────────────┴────────────────────┐
                     ▼                                         ▼
   ┌───────────────────────────────────┐     ┌──────────────────────────────────┐
   │  Pure Physics Engine              │     │  Lenis Smooth Inertial Driver    │
   │  (`capacitivePhysics.ts`)         │     │  (`lenis.raf` frame loop)        │
   │  - C_mutual = (ε_r * ε_0 * A) / d │     └──────────────────────────────────┘
   │  - -ΔC Ground Shunt Calculation   │
   │  - Centroid DSP Matrix            │
   └─────────────────┬─────────────────┘
                     │
         ┌───────────┴──────────────────────────────┐
         ▼                                          ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────────────┐
│ 2D Canvas Electron Simulation   │   │ Three.js WebGL & Custom GLSL Shaders    │
│ - TX/RX Electrode Grid          │   │ - 3D Smartphone Chassis Geometry        │
│ - Particle Drift & Shunt Field  │   │ - Custom Vertex Shader (Wave Perturb)   │
│ - 60fps RequestAnimationFrame   │   │ - Custom Fragment Shader (ITO Field Glow│
│                                 │   │   & Localized Touch Ground Depletion)   │
└────────────────┬────────────────┘   └────────────────────┬────────────────────┘
                 │                                         │
                 └────────────────────┬────────────────────┘
                                      ▼
               ┌────────────────────────────────────────────────────────┐
               │ Awwwards-Caliber UI Layer (Skiper UI & Motion)         │
               │ - Dynamic Island / Floating Nav Pill HUD               │
               │ - Interactive Spotlight Bento Cards (Mouse-following)  │
               │ - Animated Monospace Rolling Telemetry Tickers         │
               │ - Anime.js SVG Circuit Path Tracing                    │
               └────────────────────────────────────────────────────────┘
```

---

## 2. Core Architectural Layers

### Layer A: Pure Scientific Engine (`src/lib/simulation/`)
- Completely decoupled from React and rendering pipelines.
- Deterministic, unit-testable electrostatics:
  $$\Delta C = C_{\text{baseline}} \times \left(0.25 + P_{\text{finger}} \times 0.45\right) \times \frac{V_{\text{drive}}}{3.3}$$
- Emits real-time state: $C_{\text{baseline}}$, $-\Delta C$, $\text{SNR}$ in decibels, and calculated touch centroid coordinates $(X, Y)$.

### Layer B: GPU-Accelerated Shaders (`src/components/features/PhoneHero3D.tsx`)
- Utilizes Three.js `ShaderMaterial` written in native GLSL.
- **Vertex Shader:** Passes normalized UV coordinates and applies slight surface wave perturbation when touch pressure is exerted.
- **Fragment Shader:** Procedurally computes the Indium Tin Oxide (ITO) micro-grid pattern and modulates electric field potential rings:
  - Cyan harmonic ripples indicate active TX AC drive voltage.
  - When touch is active, a localized Gaussian attenuation well ($- \Delta C$) draws energy toward the simulated finger coordinate.

### Layer C: Skiper UI & Motion Presentation (`src/components/ui/`)
- **Spotlight Cards:** Dynamic CSS radial gradient borders driven by `onPointerMove` bounding client rect calculation.
- **Rolling Ticker:** Smoothly interpolates numeric values without string layout jumps.
- **Dynamic Floating Island:** Floats above page content and surfaces active telemetry when the user scrolls past the hero viewport.

### Layer D: Anime.js SVG Waveform Tracing
- Drives precision SVG wave paths representing alternating current (AC) drive pulses and ground sink vectors.
