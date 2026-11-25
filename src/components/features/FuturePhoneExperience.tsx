import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { animate } from 'animejs';
import { soundEngine } from '../../lib/audio/synthEngine';
import { MagneticButton } from '../ui/MagneticButton';
import { NumberTicker } from '../ui/NumberTicker';
import { SpotlightCard } from '../ui/SpotlightCard';
import { CanvasErrorBoundary } from '../ui/CanvasErrorBoundary';
import {
  Play,
  RotateCcw,
  Activity,
  Layers,
  ArrowRight,
  Fingerprint,
} from 'lucide-react';

// Advanced Multilayer GLSL Screen Shader
const phoneScreenVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  uniform float uTime;
  uniform float uTouchActive;
  uniform vec2 uTouchCoords;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    
    vec3 transformed = position;
    // Micro electrostatic surface deformation on finger touch
    if (uTouchActive > 0.01) {
      float dist = length(uv - uTouchCoords);
      float deformation = sin(dist * 35.0 - uTime * 12.0) * exp(-dist * 8.0);
      transformed.z += deformation * 0.012 * uTouchActive;
    }
    
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    vViewPos = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const phoneScreenFragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  uniform float uTime;
  uniform float uTouchActive;
  uniform vec2 uTouchCoords;
  uniform float uRotationProgress; // 0 = portrait, 1 = landscape
  uniform float uXRay;

  void main() {
    // 1. Transparent Indium Tin Oxide (ITO) Diamond Interleaved Matrix
    vec2 p = vUv * vec2(20.0, 40.0);
    vec2 diamondGrid = abs(fract(p - 0.5) - 0.5);
    float diamondEdge = 1.0 - smoothstep(0.44, 0.49, diamondGrid.x + diamondGrid.y);
    vec3 itoColor = mix(vec3(0.02, 0.08, 0.14), vec3(0.08, 0.85, 0.98), uXRay) * diamondEdge * 0.4;

    // 2. High-Tech Obsidian OLED Core
    vec3 baseOled = vec3(0.015, 0.02, 0.035);

    // 3. Harmonic AC Electrostatic Fringing Waves (Cyan/Blue carrier)
    float waveDist = length(vUv - vec2(0.5, 0.5));
    float harmonic = sin(waveDist * 28.0 - uTime * 4.5);
    harmonic = smoothstep(0.35, 0.95, harmonic) * (0.2 + uRotationProgress * 0.35);
    vec3 waveGlow = vec3(0.02, 0.72, 0.88) * harmonic;

    // 4. Ground Shunt Depletion Basin (-ΔC) around Finger Contact
    float fingerDist = length(vUv - uTouchCoords);
    float shuntBasin = exp(-fingerDist * fingerDist * 24.0) * uTouchActive;
    vec3 shuntColor = vec3(0.98, 0.22, 0.38) * shuntBasin * 1.8;

    // 5. Physical Fresnel Glass Glare
    vec3 viewDir = normalize(vViewPos);
    float fresnel = pow(1.0 - max(0.0, dot(vNormal, viewDir)), 3.0);
    vec3 glassReflection = vec3(0.12, 0.32, 0.52) * fresnel * 0.6;

    // Combined Shader Color
    vec3 finalColor = baseOled + itoColor + waveGlow + shuntColor + glassReflection;
    gl_FragColor = vec4(finalColor, 0.96);
  }
`;

// Realistic Smartphone 3D Mesh
interface DeviceMeshProps {
  deviceGroupRef: React.RefObject<THREE.Group | null>;
  fingerGroupRef: React.RefObject<THREE.Group | null>;
  touchActive: number;
  rotationProgress: number;
  xray: boolean;
  touchCoords: [number, number];
}

const PhotorealisticPhone: React.FC<DeviceMeshProps> = ({
  deviceGroupRef,
  fingerGroupRef,
  touchActive,
  rotationProgress,
  xray,
  touchCoords,
}) => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTouchActive: { value: 0 },
      uTouchCoords: { value: new THREE.Vector2(0.5, 0.5) },
      uRotationProgress: { value: 0 },
      uXRay: { value: 0 },
    }),
    []
  );

  useFrame((_state, delta) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value += delta;
      shaderRef.current.uniforms.uTouchActive.value = THREE.MathUtils.lerp(
        shaderRef.current.uniforms.uTouchActive.value,
        touchActive,
        0.12
      );
      shaderRef.current.uniforms.uRotationProgress.value = THREE.MathUtils.lerp(
        shaderRef.current.uniforms.uRotationProgress.value,
        rotationProgress,
        0.1
      );
      shaderRef.current.uniforms.uXRay.value = THREE.MathUtils.lerp(
        shaderRef.current.uniforms.uXRay.value,
        xray ? 1.0 : 0.0,
        0.12
      );
      shaderRef.current.uniforms.uTouchCoords.value.set(touchCoords[0], touchCoords[1]);
    }
  });

  return (
    <group ref={deviceGroupRef} position={[0, 0, 0]}>
      {/* 1. Brushed Titanium Chassis Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.3, 4.6, 0.19]} />
        <meshStandardMaterial
          color="#0b111e"
          metalness={0.92}
          roughness={0.18}
        />
      </mesh>

      {/* 2. Precision Chamfered Metallic Edge Frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.32, 4.62, 0.16]} />
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.95}
          roughness={0.12}
        />
      </mesh>

      {/* 3. Screen Glass with Custom GLSL Electrostatic Shader */}
      <mesh position={[0, 0, 0.102]}>
        <planeGeometry args={[2.15, 4.42, 48, 48]} />
        <shaderMaterial
          ref={shaderRef}
          vertexShader={phoneScreenVertexShader}
          fragmentShader={phoneScreenFragmentShader}
          uniforms={uniforms}
          transparent
        />
      </mesh>

      {/* 4. Top Optical Sensor Pill */}
      <mesh position={[0, 2.05, 0.11]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.045, 0.045, 0.25, 16]} />
        <meshBasicMaterial color="#020617" />
      </mesh>

      {/* 5. 3D Animated Finger Model Entering & Touching Glass */}
      <group ref={fingerGroupRef} position={[0, 0, 2.2]}>
        {/* Finger tip pad */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.65, 16]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive={touchActive > 0.3 ? '#f43f5e' : '#0284c7'}
            emissiveIntensity={touchActive > 0.3 ? 0.7 : 0.2}
            roughness={0.4}
            metalness={0.3}
            transparent
            opacity={0.88}
          />
        </mesh>
        {/* Electrostatic capacitive transfer ring at contact point */}
        <mesh position={[0, -0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.08, 0.32, 32]} />
          <meshBasicMaterial
            color={touchActive > 0.3 ? '#f43f5e' : '#38bdf8'}
            transparent
            opacity={touchActive > 0.3 ? 0.95 : 0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
};

export const FuturePhoneExperience: React.FC<{ onDeepDive: () => void }> = ({ onDeepDive }) => {
  const deviceGroupRef = useRef<THREE.Group>(null);
  const fingerGroupRef = useRef<THREE.Group>(null);
  const animeCircuitRef = useRef<SVGSVGElement>(null);

  // Experience progression states:
  // Step 1: Vertical phone intro
  // Step 2: 3D Rolling rotation to landscape
  // Step 3: Finger enters scene & touches screen
  // Step 4: Electron quantum visualization surges
  // Step 5: Deep Dive unlocked
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [touchActive, setTouchActive] = useState(0);
  const [rotationProgress, setRotationProgress] = useState(0);
  const [xray, setXray] = useState(false);
  const [touchCoords] = useState<[number, number]>([0.5, 0.5]);

  // Live telemetry metrics driven dynamically by the sequence
  const [metrics, setMetrics] = useState({
    frequency: 180,
    capacitanceDrop: 0.0,
    couplingRatio: 0.12,
    phaseAngle: 12.4,
  });

  // Orchestrate the Complete 5-Step Cinematic Experience
  const playCinematicShowcase = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    soundEngine.playQuantumSurge();

    // GSAP Master Timeline
    const masterTl = gsap.timeline({
      onComplete: () => {
        setIsPlaying(false);
        setCurrentStep(5);
      },
    });

    // STEP 1 -> STEP 2: Phone Rolling Rotation in 3D Space (Vertical to Landscape)
    setCurrentStep(2);
    if (deviceGroupRef.current) {
      masterTl.to(deviceGroupRef.current.rotation, {
        x: 0.22,
        y: 0.15,
        z: -Math.PI / 2, // 90 degree roll into landscape!
        duration: 2.0,
        ease: 'power3.inOut',
        onUpdate: () => setRotationProgress(1),
      });

      masterTl.to(
        deviceGroupRef.current.position,
        {
          x: 0,
          y: 0.1,
          z: 0.4,
          duration: 2.0,
          ease: 'power3.inOut',
        },
        0
      );
    }

    // STEP 3: Finger enters scene and descends to touch glass
    masterTl.add(() => {
      setCurrentStep(3);
    }, '+=0.2');

    if (fingerGroupRef.current) {
      // Finger sweeps in from top-right and lands directly on screen
      masterTl.fromTo(
        fingerGroupRef.current.position,
        { x: 1.5, y: 1.2, z: 2.4 },
        {
          x: 0.05,
          y: 0.02,
          z: 0.24, // Touch point right above glass
          duration: 1.4,
          ease: 'power2.out',
          onComplete: () => {
            // Touch occurs!
            soundEngine.playTouchHaptic(360);
            setTouchActive(1.0);
            setCurrentStep(4);

            // Animate Anime.js Vector Circuit Trace
            if (animeCircuitRef.current) {
              const paths = animeCircuitRef.current.querySelectorAll('.flow-path');
              animate(paths, {
                strokeDashoffset: [200, 0],
                duration: 1200,
                loop: true,
                ease: 'linear',
              });
            }
          },
        }
      );
    }

    // STEP 4: Electron quantum surge & capacitance drop telemetry
    masterTl.to(
      {},
      {
        duration: 2.2,
        onUpdate: function () {
          const p = this.progress();
          setMetrics({
            frequency: Math.round(180 + p * 240),
            capacitanceDrop: Number((p * 1.52).toFixed(2)),
            couplingRatio: Number((0.12 + p * 0.76).toFixed(2)),
            phaseAngle: Number((12.4 + p * 78.2).toFixed(1)),
          });
        },
      }
    );

    // Finger lifts slightly and settles into active monitoring
    if (fingerGroupRef.current) {
      masterTl.to(fingerGroupRef.current.position, {
        z: 0.55,
        duration: 1.0,
        ease: 'power2.inOut',
      });
    }
  };

  const resetAll = () => {
    if (deviceGroupRef.current) {
      gsap.to(deviceGroupRef.current.rotation, { x: 0, y: 0, z: 0, duration: 1.0 });
      gsap.to(deviceGroupRef.current.position, { x: 0, y: 0, z: 0, duration: 1.0 });
    }
    if (fingerGroupRef.current) {
      gsap.to(fingerGroupRef.current.position, { x: 0, y: 0, z: 2.2, duration: 1.0 });
    }
    setCurrentStep(1);
    setIsPlaying(false);
    setTouchActive(0);
    setRotationProgress(0);
    setMetrics({
      frequency: 180,
      capacitanceDrop: 0.0,
      couplingRatio: 0.12,
      phaseAngle: 12.4,
    });
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-[#06080e]/95 p-6 backdrop-blur-3xl shadow-[0_0_60px_rgba(6,182,212,0.12)]">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-cyan-500/20 via-sky-500/10 to-indigo-500/15 rounded-full blur-[140px]" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
              Future Phone Interactive Quantum Lab
              <span className="rounded-md border border-cyan-400/40 bg-cyan-400/10 px-2.5 py-0.5 font-mono text-[11px] text-cyan-300">
                5-Step Cinematic Pipeline
              </span>
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            3D Smartphone Roll &bull; Finger Electrostatic Touch &bull; Custom GLSL Shader Screen &bull; Anime.js Circuit Vectors
          </p>
        </div>

        {/* Action Controls using MagneticButtons */}
        <div className="flex flex-wrap items-center gap-3">
          <MagneticButton
            onClick={playCinematicShowcase}
            variant="glow"
            className="text-xs"
          >
            <Play className={`h-4 w-4 ${isPlaying ? 'animate-spin' : ''}`} />
            <span>{isPlaying ? 'EXECUTING CINEMATIC...' : 'PLAY 5-STEP EXPERIENCE'}</span>
          </MagneticButton>

          <MagneticButton
            onClick={() => setXray(!xray)}
            variant="secondary"
            className="text-xs"
          >
            <Layers className="h-4 w-4" />
            <span>{xray ? 'Hide ITO Grid' : 'X-Ray ITO Grid'}</span>
          </MagneticButton>

          <MagneticButton onClick={resetAll} variant="secondary" className="px-3">
            <RotateCcw className="h-4 w-4" />
          </MagneticButton>
        </div>
      </div>

      {/* Main Showcase Stage */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
        {/* 3D WebGL Canvas */}
        <div className="lg:col-span-8 relative h-[480px] w-full rounded-2xl border border-white/10 bg-[#04060b] overflow-hidden shadow-2xl">
          <CanvasErrorBoundary fallbackTitle="3D Smartphone Viewport">
            <Canvas camera={{ position: [0, 0, 5.8], fov: 45 }} className="w-full h-full cursor-grab">
              <ambientLight intensity={0.7} />
              <directionalLight position={[5, 6, 4]} intensity={1.6} color="#38bdf8" />
              <pointLight position={[-4, -3, -2]} intensity={0.9} color="#818cf8" />
              <PhotorealisticPhone
                deviceGroupRef={deviceGroupRef}
                fingerGroupRef={fingerGroupRef}
                touchActive={touchActive}
                rotationProgress={rotationProgress}
                xray={xray}
                touchCoords={touchCoords}
              />
            </Canvas>
          </CanvasErrorBoundary>

          {/* Real-time State Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full border border-white/10 bg-[#07090e]/85 px-3.5 py-1.5 font-mono text-xs text-slate-300 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Step {currentStep} of 5: {
              currentStep === 1 ? 'Vertical Device Introduction' :
              currentStep === 2 ? '3D Landscape Rotation' :
              currentStep === 3 ? 'Capacitive Finger Approach' :
              currentStep === 4 ? 'Quantum Ground Shunt (-ΔC Active)' :
              'Deep Dive Ready'
            }</span>
          </div>

          {/* Deep Dive Action Prompt when sequence reaches step 4 or 5 */}
          {currentStep >= 4 && (
            <div className="absolute bottom-4 right-4 z-20">
              <MagneticButton
                onClick={onDeepDive}
                variant="glow"
                className="bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-bold"
              >
                <span>Deep Dive into Science</span>
                <ArrowRight className="h-4 w-4" />
              </MagneticButton>
            </div>
          )}
        </div>

        {/* Live HUD Telemetry & Vector Circuit Matrix */}
        <div className="lg:col-span-4 space-y-4">
          <SpotlightCard spotlightColor="rgba(6, 182, 212, 0.25)">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-cyan-400" />
                AC Excitation Freq
              </span>
              <span className="font-mono text-[10px] text-cyan-400">ITO CARRIER</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <NumberTicker value={metrics.frequency} decimals={0} className="text-3xl font-bold text-white" />
              <span className="text-xs font-mono text-cyan-400">kHz</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400">Drive oscillation frequency</div>
          </SpotlightCard>

          <SpotlightCard spotlightColor="rgba(244, 63, 94, 0.25)">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono flex items-center gap-1.5">
                <Fingerprint className="h-4 w-4 text-rose-400" />
                Ground Shunt Impact
              </span>
              <span className="font-mono text-[10px] text-rose-400">-ΔC MUTUAL</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <NumberTicker value={metrics.capacitanceDrop} decimals={2} prefix="-" className="text-3xl font-bold text-rose-400" />
              <span className="text-xs font-mono text-rose-400">pF</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400">Charge interception by human body</div>
          </SpotlightCard>

          {/* Anime.js SVG Circuit Flow Vector Engine */}
          <div className="rounded-2xl border border-white/10 bg-[#07090e]/80 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between mb-2 text-xs font-mono text-slate-300">
              <span>Circuit Wave Vector (Anime.js)</span>
              <span className="text-cyan-400">{metrics.phaseAngle.toFixed(1)}° Phase</span>
            </div>
            <svg ref={animeCircuitRef} viewBox="0 0 320 60" className="w-full h-12">
              <path
                d="M 10 30 Q 80 5 160 30 T 310 30"
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="2"
              />
              <path
                className="flow-path"
                d="M 10 30 Q 80 5 160 30 T 310 30"
                fill="none"
                stroke={touchActive > 0.3 ? '#f43f5e' : '#06b6d4'}
                strokeWidth="2.5"
                strokeDasharray="14 6"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
