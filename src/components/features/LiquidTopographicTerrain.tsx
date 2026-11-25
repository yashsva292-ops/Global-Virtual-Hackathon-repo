import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { CanvasErrorBoundary } from '../ui/CanvasErrorBoundary';

interface LiquidTerrainProps {
  intensity?: number;
  isTouched?: boolean;
}

const terrainVertexShader = `
  varying vec2 vUv;
  varying float vElevation;
  varying vec3 vNormal;
  uniform float uTime;
  uniform float uIntensity;
  uniform float uTouch;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    
    vec3 pos = position;
    
    // Multi-octave harmonic liquid waves (Guaranteed WebGL cross-platform safe)
    float w1 = sin(uv.x * 12.0 + uTime * 0.8) * cos(uv.y * 10.0 + uTime * 0.6) * 0.35;
    float w2 = sin((uv.x + uv.y) * 16.0 - uTime * 1.2) * 0.15;
    float w3 = cos(length(uv - vec2(0.5)) * 22.0 - uTime * 2.2) * 0.12;
    
    float totalElevation = (w1 + w2 + w3) * uIntensity;
    
    // Dip on touch to simulate electrostatic potential well
    if (uTouch > 0.05) {
      float dist = length(uv - vec2(0.5));
      totalElevation -= exp(-dist * dist * 12.0) * 0.65 * uTouch;
    }
    
    pos.z += totalElevation;
    vElevation = totalElevation;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const terrainFragmentShader = `
  varying vec2 vUv;
  varying float vElevation;
  varying vec3 vNormal;
  uniform float uTime;
  uniform float uTouch;

  void main() {
    // Topographic contour isolines calculation
    float lineDensity = 38.0;
    float contour = fract((vElevation + 0.8) * lineDensity);
    float isLine = smoothstep(0.85, 0.95, contour);

    // Deep obsidian & electric cyan palette
    vec3 deepBase = vec3(0.02, 0.03, 0.06);
    vec3 cyanLine = vec3(0.04, 0.78, 0.92);
    vec3 indigoLine = vec3(0.39, 0.40, 0.95);
    vec3 roseWell = vec3(0.96, 0.24, 0.38);

    // Color gradient across height
    vec3 contourColor = mix(cyanLine, indigoLine, clamp((vElevation + 0.4) / 0.8, 0.0, 1.0));
    
    // Localized ground shunt in red/rose on touch
    if (uTouch > 0.05) {
      float dist = length(vUv - vec2(0.5));
      float shuntInfluence = exp(-dist * dist * 14.0) * uTouch;
      contourColor = mix(contourColor, roseWell, shuntInfluence);
    }

    // Blend base with topographic glow isolines
    vec3 finalColor = mix(deepBase, contourColor, isLine * 0.85 + 0.1);
    
    // Edge vignette with valid ascending smoothstep parameters
    float edgeX = smoothstep(0.0, 0.15, vUv.x) * (1.0 - smoothstep(0.85, 1.0, vUv.x));
    float edgeY = smoothstep(0.0, 0.15, vUv.y) * (1.0 - smoothstep(0.85, 1.0, vUv.y));
    float edge = edgeX * edgeY;

    gl_FragColor = vec4(finalColor * edge, 0.94);
  }
`;

const TerrainMesh: React.FC<LiquidTerrainProps> = ({ intensity = 1.0, isTouched = false }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: intensity },
      uTouch: { value: 0 },
    }),
    [intensity]
  );

  useFrame((state, delta) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value += delta;
      shaderRef.current.uniforms.uIntensity.value = intensity;
      shaderRef.current.uniforms.uTouch.value = THREE.MathUtils.lerp(
        shaderRef.current.uniforms.uTouch.value,
        isTouched ? 1.0 : 0.0,
        0.08
      );
    }
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      meshRef.current.rotation.z = Math.sin(t * 0.08) * 0.04;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 3.2, 0, 0]} position={[0, -0.6, 0]}>
      <planeGeometry args={[12, 10, 96, 96]} />
      <shaderMaterial
        ref={shaderRef}
        vertexShader={terrainVertexShader}
        fragmentShader={terrainFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export const LiquidTopographicTerrain: React.FC<LiquidTerrainProps> = ({
  intensity = 1.0,
  isTouched = false,
}) => {
  return (
    <div className="relative h-[380px] w-full overflow-hidden rounded-3xl border border-white/10 bg-[#05070d] shadow-2xl">
      <CanvasErrorBoundary fallbackTitle="Liquid Topographic Terrain">
        <Canvas camera={{ position: [0, -3.8, 4.2], fov: 42 }} className="w-full h-full">
          <ambientLight intensity={0.5} />
          <directionalLight position={[0, 5, 5]} intensity={1.2} color="#38bdf8" />
          <TerrainMesh intensity={intensity} isTouched={isTouched} />
        </Canvas>
      </CanvasErrorBoundary>

      {/* Topographic HUD Overlay */}
      <div className="absolute top-4 left-5 flex items-center gap-2 rounded-full border border-white/10 bg-[#07090e]/80 px-3.5 py-1.5 font-mono text-xs text-slate-300 backdrop-blur-md">
        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
        <span>Procedural Liquid Electrostatic Potential Map (GLSL)</span>
      </div>

      <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between font-mono text-[11px] text-slate-500 pointer-events-none">
        <span>Harmonic Elevation Mesh &bull; 9,216 Dynamic GPU Vertices</span>
        <span className="text-cyan-400">Contours: 38 Isolines</span>
      </div>
    </div>
  );
};
