import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes.js';
import gsap from 'gsap';
import { MOTION_CONFIG } from '../../motion.config';

export interface Persistent3DTransitionProps {
  /**
   * Persistent scene stage:
   * - 'hero': floating gently behind the hero page
   * - 'card': positioned on the loading card
   * - 'simulator': spread across the simulator background
   */
  stage: 'hero' | 'card' | 'simulator';
  /**
   * Scroll progress from 0 (on loading card) to 1 (settled in simulator).
   * Drives the exit off-screen (0 -> 0.42) and re-entry onto simulator (0.52 -> 1.0).
   */
  scrollProgress?: number;
  /**
   * Current window scroll Y in pixels for depth-based parallax.
   */
  scrollY?: number;
}

interface ShapeDef {
  type: 'sphere' | 'cluster';
  geomArgs: number[];
  parallaxDepth: number; // 0.2x, 0.5x, 0.8x
  heroPos: [number, number, number];
  cardPos: [number, number, number];
  simPos: [number, number, number];
  heroRot: [number, number, number];
  cardRot: [number, number, number];
  simRot: [number, number, number];
  heroScale: number;
  cardScale: number;
  simScale: number;
}

/**
 * Creates the organic, seamless connected cross structure from Design B:
 * - High-resolution (res 72) smooth isosurface.
 * - Central hollow rounded diamond aperture with inner mint glow.
 */
function createDesignBOrganicMesh(sharedMaterial: THREE.Material): THREE.Mesh {
  const res = 72;
  const mc = new MarchingCubes(res, sharedMaterial, true, true);
  mc.isolation = 75;
  mc.reset();

  const arms = [
    { dir: [0.45, 0.89], innerR: 0.11, midR: 0.22, tipR: 0.33, str: 0.28 },
    { dir: [0.92, -0.38], innerR: 0.11, midR: 0.22, tipR: 0.33, str: 0.28 },
    { dir: [-0.45, -0.89], innerR: 0.11, midR: 0.22, tipR: 0.33, str: 0.28 },
    { dir: [-0.92, 0.38], innerR: 0.11, midR: 0.22, tipR: 0.33, str: 0.28 },
  ];

  arms.forEach((arm) => {
    mc.addBall(0.5 + arm.dir[0] * arm.innerR, 0.5 + arm.dir[1] * arm.innerR, 0.5, arm.str * 1.08, 8);
    mc.addBall(0.5 + arm.dir[0] * arm.midR, 0.5 + arm.dir[1] * arm.midR, 0.5, arm.str * 0.98, 8);
    mc.addBall(0.5 + arm.dir[0] * arm.tipR, 0.5 + arm.dir[1] * arm.tipR, 0.5, arm.str * 1.12, 8);
  });

  for (let i = 0; i < 4; i++) {
    const a1 = arms[i];
    const a2 = arms[(i + 1) % 4];
    const midX = 0.5 + (a1.dir[0] * a1.innerR + a2.dir[0] * a2.innerR) / 2;
    const midY = 0.5 + (a1.dir[1] * a1.innerR + a2.dir[1] * a2.innerR) / 2;
    mc.addBall(midX, midY, 0.5, 0.24, 8);
  }

  mc.addBall(0.5, 0.5, 0.5, -0.30, 8);
  mc.update();

  const pos = mc.geometry.attributes.position;
  const norm = mc.geometry.attributes.normal;
  let validCount = 0;
  for (let i = 0; i < pos.count; i += 3) {
    if (
      pos.getX(i) !== 0 || pos.getY(i) !== 0 || pos.getZ(i) !== 0 ||
      pos.getX(i + 1) !== 0 || pos.getY(i + 1) !== 0 || pos.getZ(i + 1) !== 0
    ) {
      validCount += 3;
    }
  }

  const cleanPos = new Float32Array(validCount * 3);
  const cleanNorm = new Float32Array(validCount * 3);
  let idx = 0;
  for (let i = 0; i < pos.count; i += 3) {
    if (
      pos.getX(i) !== 0 || pos.getY(i) !== 0 || pos.getZ(i) !== 0 ||
      pos.getX(i + 1) !== 0 || pos.getY(i + 1) !== 0 || pos.getZ(i + 1) !== 0
    ) {
      for (let k = 0; k < 3; k++) {
        cleanPos[(idx + k) * 3] = pos.getX(i + k);
        cleanPos[(idx + k) * 3 + 1] = pos.getY(i + k);
        cleanPos[(idx + k) * 3 + 2] = pos.getZ(i + k);
        cleanNorm[(idx + k) * 3] = norm.getX(i + k);
        cleanNorm[(idx + k) * 3 + 1] = norm.getY(i + k);
        cleanNorm[(idx + k) * 3 + 2] = norm.getZ(i + k);
      }
      idx += 3;
    }
  }

  const cleanGeo = new THREE.BufferGeometry();
  cleanGeo.setAttribute('position', new THREE.BufferAttribute(cleanPos, 3));
  cleanGeo.setAttribute('normal', new THREE.BufferAttribute(cleanNorm, 3));
  cleanGeo.computeVertexNormals();
  cleanGeo.center();
  cleanGeo.scale(2.2, 2.2, 2.2);

  return new THREE.Mesh(cleanGeo, sharedMaterial);
}

// Persistent 3D shapes inspired by the Dribbble reference (ChatGPT AI tool redesign by Lazarev):
// In 'card' stage: Spheres and organic cross form a cohesive cluster positioned INSIDE the white card bounds.
// In 'simulator' stage: The spheres smoothly expand, rotating and spreading outward across the simulator background.
const SHAPES_CONFIG: ShapeDef[] = [
  // 1. Central Organic Cross (Lies at center inside the card during loading, drifts to upper right in simulator)
  {
    type: 'cluster',
    geomArgs: [0.55],
    parallaxDepth: 0.35,
    heroPos: [0, 0, -10],
    cardPos: [0.1, -0.05, 0.2],
    simPos: [3.4, 0.8, -1.0],
    heroRot: [0, 0, 0],
    cardRot: [0.08, -0.15, 0.12],
    simRot: [-0.22, 0.65, 0.95],
    heroScale: 0.01,
    cardScale: 0.92,
    simScale: 1.35,
  },
  // 2. Prominent Left Inner Sphere (inside card bounds, next to Loading text)
  {
    type: 'sphere',
    geomArgs: [0.44, 48, 48],
    parallaxDepth: 0.5,
    heroPos: [-10, 0, -10],
    cardPos: [-1.45, 0.45, 0.4],
    simPos: [-4.2, -1.8, -0.2],
    heroRot: [0, 0, 0],
    cardRot: [0.1, 0.15, 0],
    simRot: [0.4, 0.6, 0.2],
    heroScale: 0.01,
    cardScale: 0.82,
    simScale: 1.25,
  },
  // 3. Lower Right Inner Sphere (inside card bounds, below percentage counter)
  {
    type: 'sphere',
    geomArgs: [0.38, 48, 48],
    parallaxDepth: 0.8,
    heroPos: [10, -10, -10],
    cardPos: [1.5, -0.42, 0.3],
    simPos: [2.2, -2.4, -0.3],
    heroRot: [0, 0, 0],
    cardRot: [-0.1, 0.2, 0],
    simRot: [-0.4, 0.4, -0.4],
    heroScale: 0.01,
    cardScale: 0.78,
    simScale: 1.2,
  },
  // 4. Upper Center-Left Floating Sphere (tucked neatly within card)
  {
    type: 'sphere',
    geomArgs: [0.32, 48, 48],
    parallaxDepth: 0.2,
    heroPos: [-10, 10, -10],
    cardPos: [-0.65, 0.75, 0.1],
    simPos: [-2.8, 2.5, -1.0],
    heroRot: [0, 0, 0],
    cardRot: [0, -0.2, 0],
    simRot: [0.3, -0.5, 0.4],
    heroScale: 0.01,
    cardScale: 0.72,
    simScale: 1.15,
  },
  // 5. Upper Right Satellite Sphere (balanced near top-right within card bounds)
  {
    type: 'sphere',
    geomArgs: [0.34, 48, 48],
    parallaxDepth: 0.65,
    heroPos: [10, 10, -10],
    cardPos: [1.35, 0.65, 0.15],
    simPos: [4.4, 2.2, -1.4],
    heroRot: [0, 0, 0],
    cardRot: [0.15, 0.1, 0.2],
    simRot: [0.6, 0.3, 0.7],
    heroScale: 0.01,
    cardScale: 0.74,
    simScale: 1.1,
  },
  // 6. Lower Left Depth Accent Sphere (soft backdrop inside card)
  {
    type: 'sphere',
    geomArgs: [0.28, 36, 36],
    parallaxDepth: 0.25,
    heroPos: [0, -10, -10],
    cardPos: [-0.85, -0.65, -0.1],
    simPos: [-1.2, 0.4, -1.8],
    heroRot: [0, 0, 0],
    cardRot: [0, 0, 0],
    simRot: [0.2, 0.2, 0.1],
    heroScale: 0.01,
    cardScale: 0.68,
    simScale: 1.0,
  },
];

function createReferenceMaterial(): THREE.MeshPhysicalMaterial {
  // Soft ivory-white body with subtle warm sage undertone, gentle depth, and restrained rim lighting
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xfcfdfb),
    roughness: 0.22,
    metalness: 0.01,
    clearcoat: 0.35,
    clearcoatRoughness: 0.2,
    transmission: 0.02,
    thickness: 1.0,
    ior: 1.42,
    transparent: true,
    opacity: 0.98,
  });

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uGlowColor = { value: new THREE.Color(0xa7f3d0) }; // restrained soft mint/sage
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `#include <common>
       uniform vec3 uGlowColor;`
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `#include <dithering_fragment>
       float rim = 1.0 - clamp(dot(geometryNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
       rim = smoothstep(0.45, 0.98, rim);
       gl_FragColor.rgb += uGlowColor * rim * 0.18;`
    );
  };

  return mat;
}

export const Persistent3DTransition: React.FC<Persistent3DTransitionProps> = ({
  stage,
  scrollProgress = 0,
  scrollY = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const meshesRef = useRef<THREE.Object3D[]>([]);
  const baseTransformsRef = useRef<
    { x: number; y: number; z: number; rx: number; ry: number; rz: number; scale: number }[]
  >(
    SHAPES_CONFIG.map((cfg) => ({
      x: cfg.heroPos[0],
      y: cfg.heroPos[1],
      z: cfg.heroPos[2],
      rx: cfg.heroRot[0],
      ry: cfg.heroRot[1],
      rz: cfg.heroRot[2],
      scale: cfg.heroScale,
    }))
  );
  const scrollYRef = useRef(scrollY);
  scrollYRef.current = scrollY;
  const scrollProgressRef = useRef(scrollProgress);
  scrollProgressRef.current = scrollProgress;
  const stageRef = useRef(stage);
  stageRef.current = stage;

  const [renderFailed, setRenderFailed] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mq.matches);
      reducedMotionRef.current = mq.matches;
      const listener = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
        reducedMotionRef.current = e.matches;
      };
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, []);

  // Smoothly animate base transforms between stages using GSAP (no resets, no pops)
  useEffect(() => {
    const duration = reducedMotionRef.current ? 0.25 : MOTION_CONFIG.durations.bubbleSpread;
    const ease = MOTION_CONFIG.easings.gsapTransition;

    SHAPES_CONFIG.forEach((cfg, idx) => {
      const target = baseTransformsRef.current[idx];
      if (!target) return;

      const pos = stage === 'hero' ? cfg.heroPos : stage === 'card' ? cfg.cardPos : cfg.simPos;
      const rot = stage === 'hero' ? cfg.heroRot : stage === 'card' ? cfg.cardRot : cfg.simRot;
      const scale = stage === 'hero' ? cfg.heroScale : stage === 'card' ? cfg.cardScale : cfg.simScale;

      gsap.to(target, {
        x: pos[0],
        y: pos[1],
        z: pos[2],
        rx: rot[0],
        ry: rot[1],
        rz: rot[2],
        scale,
        duration,
        ease,
        overwrite: 'auto',
      });
    });
  }, [stage]);

  // Initialize Three.js scene once and keep it mounted persistently
  useEffect(() => {
    if (renderFailed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      // Cap devicePixelRatio at 2 for 60fps performance
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
    } catch (e) {
      console.warn('WebGL init failed, falling back gracefully:', e);
      setRenderFailed(true);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 7.2);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Key light: warm white soft illumination
    const keyLight = new THREE.DirectionalLight(0xfffdf7, 1.1);
    keyLight.position.set(4, 5, 6);
    scene.add(keyLight);

    // Fill light: gentle light sage ambient
    const fillLight = new THREE.DirectionalLight(0xf4f8f4, 0.7);
    fillLight.position.set(-5, 2, 4);
    scene.add(fillLight);

    // Rim light: restrained soft mint
    const rimLight = new THREE.DirectionalLight(0xa7f3d0, 0.7);
    rimLight.position.set(3, -4, -3);
    scene.add(rimLight);

    // Back bounce: gentle subtle depth
    const backBounce = new THREE.PointLight(0xd7e9de, 0.9, 14);
    backBounce.position.set(-1, -2, -2);
    scene.add(backBounce);

    const sharedMaterial = createReferenceMaterial();
    const meshes: THREE.Object3D[] = [];

    SHAPES_CONFIG.forEach((cfg) => {
      let obj: THREE.Object3D;
      if (cfg.type === 'sphere') {
        const geo = new THREE.SphereGeometry(cfg.geomArgs[0], 48, 48);
        obj = new THREE.Mesh(geo, sharedMaterial);
      } else {
        obj = createDesignBOrganicMesh(sharedMaterial);
      }
      obj.position.set(...cfg.heroPos);
      obj.rotation.set(...cfg.heroRot);
      obj.scale.setScalar(cfg.heroScale);
      scene.add(obj);
      meshes.push(obj);
    });

    meshesRef.current = meshes;

    let animationFrameId: number;
    let isTabHidden = document.hidden;
    const clock = new THREE.Clock();

    const renderLoop = () => {
      if (isTabHidden) return;

      const elapsedTime = clock.getElapsedTime();
      const isReduced = reducedMotionRef.current;
      const currentScroll = isReduced ? 0 : scrollYRef.current;
      const p = scrollProgressRef.current;
      const currentStage = stageRef.current;

      SHAPES_CONFIG.forEach((cfg, idx) => {
        const obj = meshes[idx];
        const base = baseTransformsRef.current[idx];
        if (!obj || !base) return;

        let posX = base.x;
        let posY = base.y;
        let posZ = base.z;
        let rotX = base.rx;
        let rotY = base.ry;
        let rotZ = base.rz;
        let scale = base.scale;

        // When transitioning from loading card to simulator:
        // p goes from 0.0 (inside card) to 1.0 (settled across simulator background)
        // Smoothly advances spheres, rotating and spreading them across the viewport
        if (currentStage === 'card' && p > 0.001) {
          const easeT = p * p * (3 - 2 * p); // smooth hermite interpolation
          posX = cfg.cardPos[0] + (cfg.simPos[0] - cfg.cardPos[0]) * easeT;
          posY = cfg.cardPos[1] + (cfg.simPos[1] - cfg.cardPos[1]) * easeT;
          posZ = cfg.cardPos[2] + (cfg.simPos[2] - cfg.cardPos[2]) * easeT;
          rotX = cfg.cardRot[0] + (cfg.simRot[0] - cfg.cardRot[0]) * easeT;
          rotY = cfg.cardRot[1] + (cfg.simRot[1] - cfg.cardRot[1]) * easeT;
          rotZ = cfg.cardRot[2] + (cfg.simRot[2] - cfg.cardRot[2]) * easeT;
          scale = cfg.cardScale + (cfg.simScale - cfg.cardScale) * easeT;
        }

        // Subtle ambient drift: strictly held still during loading (currentStage === 'card' and p === 0)
        const isStill = currentStage === 'card' && p === 0;
        const driftX = isReduced || isStill ? 0 : Math.sin(elapsedTime * 0.55 + idx * 1.4) * 0.12;
        const driftY = isReduced || isStill ? 0 : Math.cos(elapsedTime * 0.45 + idx * 1.1) * 0.12;
        const driftRotZ = isReduced || isStill ? 0 : Math.sin(elapsedTime * 0.35 + idx * 0.9) * 0.06;
        const scaleBreath = isReduced || isStill ? 1 : 1 + Math.sin(elapsedTime * 0.5 + idx) * 0.025;

        // Depth-based scroll parallax (0.2x, 0.5x, 0.8x)
        const parallaxY = (currentScroll * 0.0025) * cfg.parallaxDepth;
        const parallaxRot = (currentScroll * 0.0004) * cfg.parallaxDepth;

        obj.position.set(posX + driftX, posY + driftY + parallaxY, posZ);
        obj.rotation.set(rotX, rotY + parallaxRot, rotZ + driftRotZ);
        obj.scale.setScalar(scale * scaleBreath);
      });

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    const handleVisibilityChange = () => {
      isTabHidden = document.hidden;
      if (!isTabHidden) {
        clock.getDelta(); // reset delta
        animationFrameId = requestAnimationFrame(renderLoop);
      } else {
        cancelAnimationFrame(animationFrameId);
      }
    };

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    if (!isTabHidden) {
      animationFrameId = requestAnimationFrame(renderLoop);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      renderer.dispose();
      sharedMaterial.dispose();
      scene.clear();
    };
  }, [renderFailed]);

  // In 'card' stage: Strictly clipped to the white card container (1024px max-width, 78vh max-580px centered)
  // In 'simulator' stage: Positioned across the full simulator background behind UI panels
  const isCardStage = stage === 'card';

  return (
    <div
      className={`fixed inset-0 pointer-events-none select-none overflow-hidden ${
        isCardStage ? 'flex items-center justify-center z-[115]' : 'z-0'
      }`}
      aria-hidden="true"
    >
      <div
        className={
          isCardStage
            ? 'w-full max-w-4xl h-[78vh] max-h-[580px] mx-4 sm:mx-8 rounded-3xl overflow-hidden relative'
            : 'w-full h-full relative'
        }
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full block pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};

export default Persistent3DTransition;
