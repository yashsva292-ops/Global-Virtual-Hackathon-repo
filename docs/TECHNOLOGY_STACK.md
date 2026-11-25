# Technology Stack & Evaluation Matrix
**Project:** Global Virtual Hackathon (Canadian International School, Singapore)  
**Theme:** *Unveiling Technology* — Capacitive Touch & Electron Electrodynamics  
**Version:** 1.0.0 (Production Blueprint)

---

## 1. Visual & Animation Ecosystem Overview

| Technology | Category | Status | Version | Official Documentation | Role in GVH Project |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Motion** (`motion`) | React Layout & Gesture Animation | **Active / Installed** | `^14.14.0` | [motion.dev](https://motion.dev/) | Primary engine for React UI component mount/unmount, interactive spring physics, layout shifts, and micro-interactions. |
| **Three.js** | WebGL 3D Rendering | **Active / Installed** | `^0.187.0` | [threejs.org](https://threejs.org/) | Core 3D engine providing scene graph, geometric meshes, lights, and custom GLSL ShaderMaterials. |
| **React Three Fiber** (`@react-three/fiber`) | React 3D Declarative Layer | **Active / Installed** | `^9.8.2` | [r3f.docs.pmnd.rs](https://r3f.docs.pmnd.rs/) | Declarative React wrapper binding Three.js meshes and shaders directly to React component state. |
| **Custom GLSL Shaders** | GPU Fragment & Vertex Shaders | **Active / Implemented** | WebGL 2.0 / GLSL ES 3.0 | [khronos.org/opengl](https://www.khronos.org/) | Renders real-time electrostatic field wave potentials, ITO interference patterns, and localized charge shunting on the 3D phone screen. |
| **Skiper UI Components** | Bespoke UI Component Patterns | **Active / Implemented** | Custom / shadcn-style | [skiper-ui.com](https://skiper-ui.com/) | Spotlight mouse-tracking feature cards, Dynamic Island / Nav Pill HUD, and animated numerical telemetry counters. |
| **Anime.js** | Complex SVG & Timeline Engine | **Active / Installed** | `^4.5.0` | [animejs.com](https://animejs.com/) | Orchestrates complex SVG circuit path tracing, non-React DOM coordinate transforms, and staggered vector waveforms. |
| **Lenis** | Smooth Inertial Scroll | **Active / Installed** | `^1.3.27` | [lenis.darkroom.engineering](https://lenis.darkroom.engineering/) | Smooth inertial momentum scrolling across viewport sections without breaking native touch or keyboard accessibility. |
| **GSAP** | Motion Sequencing Engine | **Audited / Installed** | `^3.15.1` | [greensock.com](https://greensock.com/) | Reserved for heavy non-React scroll timelines and complex multi-actor choreographies. |
| **React Spring** | Physics Springs | **Audited / Installed** | `^10.1.2` | [react-spring.dev](https://react-spring.dev/) | Secondary spring engine; delegated to Motion to eliminate runtime duplication. |

---

## 2. Functional Overlap & Boundary Separation

To ensure maximum performance and maintain an ultra-lean bundle, clear boundaries are enforced:

1. **Motion vs. Anime.js vs. GSAP:**
   * **Motion** owns **React component lifecycle**, conditional element animations, layout morphing, and hover states.
   * **Anime.js (v4)** owns **SVG path morphing, circuit wiring traces**, and raw canvas timeline coordination.
   * **GSAP** is kept scoped to avoid conflicting with React's virtual DOM reconciliation.
2. **Three.js Custom GLSL vs. CSS 3D:**
   * All 3D and electromagnetic field visualizations run exclusively in Three.js WebGL via `@react-three/fiber`. No fake CSS 3D transforms are used for scientific simulations.
3. **Skiper UI Registry vs. Heavy Component Kits:**
   * Components from Skiper UI are introduced as modular, standalone TypeScript components. We avoid bulky full-page templates or cursor trails that interfere with touch interaction.

---

## 3. Performance & Competition Readiness Verification
* **Zero AI / Zero External API Dependency:** The entire scientific calculation and visual engine runs 100% in-browser on client devices.
* **GPU Memory Footprint:** Custom shaders use lightweight mathematical procedures (`sin`, `exp`, distance fields) with zero external image textures, keeping VRAM consumption under 15MB.
* **Reduced Motion:** All kinetic transitions and smooth scroll operations observe `window.matchMedia('(prefers-reduced-motion: reduce)')`.
