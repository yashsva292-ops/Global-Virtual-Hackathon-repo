import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { animate, stagger } from 'animejs';
import { soundEngine } from '../../lib/audio/synthEngine';
import { NumberTicker } from '../ui/NumberTicker';
import { SpotlightCard } from '../ui/SpotlightCard';
import { CanvasErrorBoundary } from '../ui/CanvasErrorBoundary';
import {
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Layers,
  Sparkles,
  Zap,
  Activity,
  Cpu,
} from 'lucide-react';

// GLSL Vertex & Fragment Shaders for Quantum Screen
const quantumVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  uniform float uTime;
  uniform float uSurge;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    
    vec3 pos = position;
    if (uSurge > 0.05) {
      float ripple = sin(length(uv - vec2(0.5)) * 30.0 - uTime * 8.0);
      pos.z += ripple * 0.015 * uSurge;
    }
    
    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const quantumFragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  uniform float uTime;
  uniform float uSurge;
  uniform float uXRay;
  uniform vec2 uTouchPoint;

  void main() {
    // 1. Procedural ITO Micro-grid traces
    vec2 grid = fract(vUv * vec2(28.0, 56.0));
    float traces = step(0.92, grid.x) + step(0.92, grid.y);
    vec3 itoColor = mix(vec3(0.02, 0.08, 0.16), vec3(0.06, 0.85, 0.95), uXRay) * traces;

    // 2. Base Dark OLED Surface
    vec3 baseOled = vec3(0.02, 0.03, 0.05);

    // 3. Dynamic Electrostatic Harmonic Waves
    float waveDist = length(vUv - uTouchPoint);
    float wave = sin(waveDist * (32.0 + uSurge * 20.0) - uTime * (4.0 + uSurge * 6.0));
    wave = smoothstep(0.3, 0.95, wave) * (0.3 + uSurge * 0.5);
    vec3 waveColor = mix(vec3(0.02, 0.71, 0.83), vec3(0.38, 0.40, 0.95), sin(uTime * 2.0) * 0.5 + 0.5) * wave;

    // 4. Localized Ground Shunt Gaussian Well (-ΔC)
    float shunt = exp(-waveDist * waveDist * (28.0 - uSurge * 10.0));
    vec3 shuntGlow = vec3(0.96, 0.25, 0.37) * shunt * (1.2 + uSurge * 1.5);

    // 5. Fresnel Edge Reflection
    float fresnel = pow(1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.2) * 0.4;
    vec3 reflection = vec3(0.15, 0.35, 0.55) * fresnel;

    // Combine
    vec3 finalRgb = baseOled + itoColor + waveColor + shuntGlow + reflection;
    gl_FragColor = vec4(finalRgb, 0.96);
  }
`;

// 3D Orbital Electron Particle Cloud Component
const ElectronCloud: React.FC<{ surge: number }> = ({ surge }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 900;

  const [positions, phases] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 2.4 + Math.random() * 1.6;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = (r * 1.6) * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      ph[i] = Math.random() * Math.PI * 2;
    }
    return [pos, ph];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    const speed = 0.8 + surge * 2.5;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const phase = phases[i];
      // Orbit around the phone with harmonic drift
      const angle = t * speed * 0.4 + phase;
      const radius = 2.6 + Math.sin(t * 1.2 + phase) * (0.3 + surge * 0.6);

      array[idx] = radius * Math.cos(angle);
      array[idx + 1] += Math.sin(t * 2.0 + phase) * 0.006 * speed;
      // Wrap around vertically
      if (array[idx + 1] > 3.5) array[idx + 1] = -3.5;
      if (array[idx + 1] < -3.5) array[idx + 1] = 3.5;
      array[idx + 2] = radius * Math.sin(angle) * 0.6;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color={surge > 0.3 ? '#f43f5e' : '#38bdf8'}
        transparent
        opacity={0.75}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// 3D Interactive Device with Shaders & GSAP Controls
interface DeviceProps {
  deviceGroupRef: React.RefObject<THREE.Group | null>;
  surge: number;
  xray: boolean;
  touchPoint: [number, number];
}

const DeviceModel: React.FC<DeviceProps> = ({
  deviceGroupRef,
  surge,
  xray,
  touchPoint,
}) => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSurge: { value: 0 },
      uXRay: { value: 0 },
      uTouchPoint: { value: new THREE.Vector2(0.5, 0.5) },
    }),
    []
  );

  useFrame((_state, delta) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value += delta;
      shaderRef.current.uniforms.uSurge.value = THREE.MathUtils.lerp(
        shaderRef.current.uniforms.uSurge.value,
        surge,
        0.1
      );
      shaderRef.current.uniforms.uXRay.value = THREE.MathUtils.lerp(
        shaderRef.current.uniforms.uXRay.value,
        xray ? 1.0 : 0.0,
        0.1
      );
      shaderRef.current.uniforms.uTouchPoint.value.set(touchPoint[0], touchPoint[1]);
    }
  });

  return (
    <group ref={deviceGroupRef}>
      {/* Matte Obsidian Titanium Chassis */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.2, 4.4, 0.18]} />
        <meshStandardMaterial
          color="#0b101b"
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* Screen with Custom GLSL ShaderMaterial */}
      <mesh position={[0, 0, 0.1]}>
        <planeGeometry args={[2.05, 4.2, 32, 32]} />
        <shaderMaterial
          ref={shaderRef}
          vertexShader={quantumVertexShader}
          fragmentShader={quantumFragmentShader}
          uniforms={uniforms}
          transparent
        />
      </mesh>

      {/* Dynamic Electrostatic Aura */}
      <mesh position={[0, 0, 0.12]}>
        <ringGeometry args={[0.75, 0.78, 64]} />
        <meshBasicMaterial
          color={surge > 0.3 ? '#f43f5e' : '#06b6d4'}
          transparent
          opacity={surge > 0.3 ? 0.85 : 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

export const QuantumFieldShowcase: React.FC = () => {
  const deviceGroupRef = useRef<THREE.Group>(null);
  const animeContainerRef = useRef<HTMLDivElement>(null);

  const [surge, setSurge] = useState(0);
  const [xray, setXray] = useState(false);
  const [touchPoint, setTouchPoint] = useState<[number, number]>([0.5, 0.5]);
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Live telemetry metrics driven by animation
  const [frequency, setFrequency] = useState(180);
  const [voltage, setVoltage] = useState(3.3);
  const [capacitanceDrop, setCapacitanceDrop] = useState(0.48);
  const [quantumState, setQuantumState] = useState<'Harmonic Steady State' | 'Field Collapse' | 'Excited Surge'>('Harmonic Steady State');

  // GSAP Choreographed Cinematic Timeline
  const runCinematicSequence = () => {
    if (isPlayingSeq) return;
    setIsPlayingSeq(true);
    setQuantumState('Excited Surge');

    // Trigger futuristic sound surge
    soundEngine.playQuantumSurge();

    // 1. GSAP 3D Device Choreography
    if (deviceGroupRef.current) {
      const tl = gsap.timeline({
        onComplete: () => {
          setIsPlayingSeq(false);
          setQuantumState('Harmonic Steady State');
          setSurge(0);
        },
      });

      // Animate Surge state
      tl.to(
        {},
        {
          duration: 1.8,
          onUpdate: function () {
            const progress = this.progress();
            setSurge(Math.sin(progress * Math.PI));
            setFrequency(Math.round(180 + Math.sin(progress * Math.PI) * 220));
            setVoltage(3.3 + Math.sin(progress * Math.PI) * 1.5);
            setCapacitanceDrop(Number((0.48 + Math.sin(progress * Math.PI) * 0.95).toFixed(2)));
          },
        },
        0
      );

      // GSAP smooth 3D presentation tilt
      tl.to(
        deviceGroupRef.current.rotation,
        {
          x: 0.35,
          y: -0.65,
          z: 0.15,
          duration: 1.2,
          ease: 'power3.inOut',
        },
        0
      )
        .to(
          deviceGroupRef.current.position,
          {
            z: 0.8,
            duration: 1.0,
            ease: 'power2.out',
          },
          0
        )
        .to(deviceGroupRef.current.rotation, {
          x: 0.1,
          y: 0.5,
          z: -0.05,
          duration: 1.4,
          ease: 'power2.inOut',
        })
        .to(deviceGroupRef.current.rotation, {
          x: 0,
          y: 0,
          z: 0,
          duration: 1.2,
          ease: 'elastic.out(1, 0.4)',
        })
        .to(
          deviceGroupRef.current.position,
          {
            z: 0,
            duration: 1.2,
            ease: 'power3.out',
          },
          '-=1.0'
        );
    }

    // 2. Anime.js v4 Staggered DOM & SVG Element Sweep
    if (animeContainerRef.current) {
      const nodes = animeContainerRef.current.querySelectorAll('.anime-metric-card');
      animate(nodes, {
        scale: [1, 1.06, 1],
        opacity: [0.7, 1, 0.9],
        delay: stagger(100),
        duration: 800,
        ease: 'outQuad',
      });
    }
  };

  // Reset orientation
  const resetOrientation = () => {
    if (deviceGroupRef.current) {
      gsap.to(deviceGroupRef.current.rotation, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.8,
        ease: 'power2.out',
      });
      gsap.to(deviceGroupRef.current.position, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.8,
        ease: 'power2.out',
      });
    }
    setSurge(0);
    setFrequency(180);
    setVoltage(3.3);
    setCapacitanceDrop(0.48);
    setQuantumState('Harmonic Steady State');
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-[#07090e]/95 p-6 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/3 -translate-x-1/2 w-[550px] h-[300px] bg-gradient-to-r from-cyan-500/15 via-indigo-500/10 to-rose-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h3 className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
              Quantum Electrodynamic Lab
              <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 font-mono text-[10px] text-cyan-300 font-normal">
                Multi-Engine Integration
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time collaboration: Three.js WebGL &bull; Custom GLSL &bull; GSAP Timeline &bull; Anime.js Vector Engine &bull; Web Audio API
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={runCinematicSequence}
            disabled={isPlayingSeq}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-semibold shadow-lg transition-all ${
              isPlayingSeq
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                : 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:brightness-110 active:scale-95 shadow-cyan-500/20'
            }`}
          >
            <Play className={`h-3.5 w-3.5 ${isPlayingSeq ? 'animate-spin' : ''}`} />
            <span>{isPlayingSeq ? 'SURGE ACTIVE...' : 'LAUNCH CINEMATIC SURGE'}</span>
          </button>

          <button
            onClick={() => setXray(!xray)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 font-mono text-xs transition ${
              xray
                ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300'
                : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>X-Ray ITO</span>
          </button>

          <button
            onClick={resetOrientation}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={toggleMute}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-slate-400 transition hover:bg-white/10 hover:text-white"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Stage */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-center">
        {/* 3D Viewport with Three.js, Custom GLSL Shaders & Electron Cloud */}
        <div className="lg:col-span-8 relative h-[440px] w-full rounded-2xl border border-white/10 bg-[#05070c] overflow-hidden">
          <CanvasErrorBoundary fallbackTitle="Quantum Electrodynamics Lab">
            <Canvas
              camera={{ position: [0, 0, 5.8], fov: 45 }}
              className="cursor-grab active:cursor-grabbing w-full h-full"
              onPointerDown={(e) => {
                soundEngine.playTouchHaptic(frequency);
                const rect = e.currentTarget.getBoundingClientRect();
                const u = (e.clientX - rect.left) / rect.width;
                const v = 1.0 - (e.clientY - rect.top) / rect.height;
                setTouchPoint([u, v]);
              }}
            >
              <ambientLight intensity={0.65} />
              <directionalLight position={[4, 5, 4]} intensity={1.5} color="#38bdf8" />
              <pointLight position={[-4, -3, -2]} intensity={0.9} color="#818cf8" />
              
              {/* 3D Device Mesh with Custom GLSL Shader */}
              <DeviceModel
                deviceGroupRef={deviceGroupRef}
                surge={surge}
                xray={xray}
                touchPoint={touchPoint}
              />

              {/* Orbital Coulomb Electron Particle System */}
              <ElectronCloud surge={surge} />
            </Canvas>
          </CanvasErrorBoundary>

          {/* Interactive Overlay Badge */}
          <div className="absolute top-3 left-4 flex items-center gap-2 rounded-full border border-white/10 bg-[#07090e]/80 px-3 py-1 font-mono text-[11px] text-slate-300 backdrop-blur-md">
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>900 In-Browser GPU Electrons</span>
          </div>

          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-slate-500 pointer-events-none">
            <span>Direct WebGL Surface &bull; Drag to inspect 3D geometry</span>
            <span className="text-cyan-400/80">State: {quantumState}</span>
          </div>
        </div>

        {/* Anime.js Staggered Telemetry HUD (Skiper UI Spotlight Pattern) */}
        <div ref={animeContainerRef} className="lg:col-span-4 space-y-4">
          <SpotlightCard spotlightColor="rgba(6, 182, 212, 0.2)">
            <div className="flex items-center justify-between text-xs text-slate-400 anime-metric-card">
              <span className="font-mono flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-cyan-400" />
                AC Field Excitation
              </span>
              <span className="font-mono text-[10px] text-cyan-400">GSAP TIMELINE</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <NumberTicker value={frequency} decimals={0} className="text-2xl font-bold text-white" />
              <span className="text-xs font-mono text-cyan-400">kHz</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400">Micro-wire resonance carrier</div>
          </SpotlightCard>

          <SpotlightCard spotlightColor="rgba(244, 63, 94, 0.2)">
            <div className="flex items-center justify-between text-xs text-slate-400 anime-metric-card">
              <span className="font-mono flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-rose-400" />
                Ground Shunt Impact
              </span>
              <span className="font-mono text-[10px] text-rose-400">-ΔC WELL</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <NumberTicker value={capacitanceDrop} decimals={2} prefix="-" className="text-2xl font-bold text-rose-400" />
              <span className="text-xs font-mono text-rose-400">pF</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400">Electrostatic potential dip</div>
          </SpotlightCard>

          <SpotlightCard spotlightColor="rgba(99, 102, 241, 0.2)">
            <div className="flex items-center justify-between text-xs text-slate-400 anime-metric-card">
              <span className="font-mono flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                Electrode Drive Potential
              </span>
              <span className="font-mono text-[10px] text-indigo-400">V_PEAK</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <NumberTicker value={voltage} decimals={2} className="text-2xl font-bold text-indigo-300" />
              <span className="text-xs font-mono text-indigo-400">V</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400">Sinusoidal TX excitation</div>
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
};
