import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CanvasErrorBoundary } from '../ui/CanvasErrorBoundary';

interface PhoneSceneProps {
  isTouched: boolean;
}

// Custom GLSL Shader code for the ITO Capacitive Screen
const screenVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  uniform float uTime;
  uniform float uTouch;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    
    // Micro surface displacement on touch
    vec3 pos = position;
    if (uTouch > 0.01) {
      float dist = length(vUv - vec2(0.5, 0.5));
      pos.z += sin(dist * 20.0 - uTime * 6.0) * 0.005 * uTouch;
    }
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const screenFragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  uniform float uTime;
  uniform float uTouch;

  void main() {
    // 1. Procedural ITO Micro-grid (Fine orthogonal electrode traces)
    vec2 grid = fract(vUv * vec2(24.0, 48.0));
    float lines = step(0.94, grid.x) + step(0.94, grid.y);
    vec3 gridColor = vec3(0.04, 0.12, 0.22) * lines;

    // 2. Base Dark Glass OLED Color
    vec3 baseGlass = vec3(0.03, 0.04, 0.07);

    // 3. Electrostatic Potential Harmonic Waves (Cyan)
    float wave = sin(length(vUv - vec2(0.5, 0.5)) * 28.0 - uTime * 3.5);
    wave = smoothstep(0.4, 0.9, wave) * 0.25;
    vec3 fieldWave = vec3(0.02, 0.71, 0.83) * wave;

    // 4. Localized Human Body Ground Shunt Deflection (-ΔC in Rose Red)
    vec2 touchCenter = vec2(0.5, 0.5);
    float touchDist = length(vUv - touchCenter);
    float shunt = exp(-touchDist * touchDist * 22.0) * uTouch;
    vec3 shuntColor = vec3(0.96, 0.25, 0.37) * shunt * 1.5;

    // 5. Fresnel Edge Glare
    float fresnel = pow(1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.5) * 0.3;

    // Combine all components
    vec3 finalColor = baseGlass + gridColor + fieldWave + shuntColor + vec3(fresnel * 0.2, fresnel * 0.4, fresnel * 0.6);

    gl_FragColor = vec4(finalColor, 0.95);
  }
`;

const PhoneModel: React.FC<PhoneSceneProps> = ({ isTouched }) => {
  const meshRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Shader uniforms
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTouch: { value: 0 },
    }),
    []
  );

  useFrame((state, delta) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      // Gentle spatial hover
      meshRef.current.rotation.y = Math.sin(t * 0.35) * 0.12 - 0.18;
      meshRef.current.rotation.x = Math.cos(t * 0.25) * 0.06 + 0.08;
      meshRef.current.position.y = Math.sin(t * 0.7) * 0.06;
    }

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
      // Smoothly interpolate touch uniform value
      const targetTouch = isTouched ? 1.0 : 0.0;
      materialRef.current.uniforms.uTouch.value +=
        (targetTouch - materialRef.current.uniforms.uTouch.value) * 0.15;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Matte Titanium Chassis */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.2, 4.4, 0.18]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.25}
          metalness={0.85}
        />
      </mesh>

      {/* Camera Cutout Housing */}
      <mesh position={[0, 1.88, 0.105]}>
        <circleGeometry args={[0.075, 32]} />
        <meshBasicMaterial color="#020617" />
      </mesh>

      {/* Screen with Custom GLSL ShaderMaterial */}
      <mesh position={[0, 0, 0.1]}>
        <planeGeometry args={[2.05, 4.2, 32, 32]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={screenVertexShader}
          fragmentShader={screenFragmentShader}
          uniforms={uniforms}
          transparent
        />
      </mesh>

      {/* Ambient Electrostatic Holographic Orbit */}
      <mesh position={[0, 0, 0.12]}>
        <ringGeometry args={[0.7, 0.73, 48]} />
        <meshBasicMaterial
          color={isTouched ? '#f43f5e' : '#06b6d4'}
          transparent
          opacity={isTouched ? 0.75 : 0.22}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

export const PhoneHero3D: React.FC<PhoneSceneProps> = ({ isTouched }) => {
  return (
    <div className="relative h-[360px] w-full max-w-[360px] mx-auto">
      <CanvasErrorBoundary fallbackTitle="3D Phone Preview">
        <Canvas
          camera={{ position: [0, 0, 5.5], fov: 45 }}
          className="cursor-grab active:cursor-grabbing"
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[4, 5, 4]} intensity={1.4} color="#38bdf8" />
          <pointLight position={[-4, -3, -2]} intensity={0.8} color="#818cf8" />
          <PhoneModel isTouched={isTouched} />
        </Canvas>
      </CanvasErrorBoundary>
      <div className="absolute bottom-2 left-0 right-0 text-center font-mono text-[10px] text-slate-500 pointer-events-none">
        Three.js GLSL Custom Shader &bull; Procedural ITO Field Simulation
      </div>
    </div>
  );
};
