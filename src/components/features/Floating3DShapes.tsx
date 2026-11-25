import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface Floating3DShapesProps {
  isTransitioning?: boolean;
}

/**
 * Soft 3D frosted white spheres and organic pill/cross shapes with emerald-green rim glow,
 * inspired by the reference motion: sweeps smoothly from the loading surface into the simulator.
 */
export const Floating3DShapes: React.FC<Floating3DShapesProps> = ({ isTransitioning = false }) => {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none" aria-hidden="true">
      {/* Large Foreground-Right 3D Sphere with Mint Rim Glow */}
      <motion.div
        initial={{ y: '45vh', x: '8vw', scale: 0.82, opacity: 0 }}
        animate={{
          y: isTransitioning ? '-10vh' : ['0vh', '-3vh', '0vh'],
          x: isTransitioning ? '0vw' : ['0vw', '1.2vw', '0vw'],
          scale: 1,
          opacity: 0.85,
        }}
        transition={
          isTransitioning
            ? { duration: 1.15, ease: [0.16, 1, 0.3, 1] }
            : { duration: 11, repeat: Infinity, ease: 'easeInOut' }
        }
        className="absolute right-[6%] top-[16%] w-40 h-40 sm:w-56 sm:h-56 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 32% 28%, #ffffff 0%, #f2f7f4 54%, #bbf7d0 86%, #4ade80 100%)',
          boxShadow:
            '0 24px 60px rgba(23, 107, 80, 0.12), inset -10px -12px 28px rgba(34, 197, 94, 0.28), inset 8px 8px 20px rgba(255, 255, 255, 0.95)',
        }}
      />

      {/* Mid-Left Soft Blurred 3D Sphere */}
      <motion.div
        initial={{ y: '55vh', scale: 0.75, opacity: 0 }}
        animate={{
          y: isTransitioning ? '-5vh' : ['0vh', '2.5vh', '0vh'],
          scale: 1,
          opacity: 0.7,
        }}
        transition={
          isTransitioning
            ? { duration: 1.25, ease: [0.16, 1, 0.3, 1] }
            : { duration: 14, repeat: Infinity, ease: 'easeInOut' }
        }
        className="absolute left-[4%] top-[24%] w-28 h-28 sm:w-40 sm:h-40 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 35% 30%, #ffffff 0%, #eef5f0 58%, #a7f3d0 90%, #34d399 100%)',
          boxShadow:
            '0 18px 45px rgba(23, 107, 80, 0.1), inset -8px -10px 22px rgba(16, 185, 129, 0.24)',
          filter: 'blur(1.5px)',
        }}
      />

      {/* Organic 3D Capsule / Pill Shape (Upper Center-Left) */}
      <motion.div
        initial={{ y: '60vh', rotate: -28, opacity: 0 }}
        animate={{
          y: isTransitioning ? '-8vh' : ['0vh', '-2.2vh', '0vh'],
          rotate: isTransitioning ? -18 : [-18, -12, -18],
          opacity: 0.75,
        }}
        transition={
          isTransitioning
            ? { duration: 1.1, ease: [0.16, 1, 0.3, 1] }
            : { duration: 12, repeat: Infinity, ease: 'easeInOut' }
        }
        className="absolute left-[18%] top-[10%] w-16 h-44 sm:w-20 sm:h-56 rounded-full"
        style={{
          background:
            'linear-gradient(135deg, #ffffff 0%, #f1f6f3 55%, #bbf7d0 90%, #6ee7b7 100%)',
          boxShadow:
            '0 20px 48px rgba(23, 107, 80, 0.1), inset -6px -8px 18px rgba(34, 197, 94, 0.22), inset 6px 6px 14px rgba(255, 255, 255, 0.9)',
          filter: 'blur(1px)',
        }}
      />

      {/* Crossed 3D Sculptural Form (Bottom Right Accent) */}
      <motion.div
        initial={{ y: '70vh', rotate: 24, opacity: 0 }}
        animate={{
          y: isTransitioning ? '-6vh' : ['0vh', '2vh', '0vh'],
          rotate: isTransitioning ? 16 : [16, 22, 16],
          opacity: 0.8,
        }}
        transition={
          isTransitioning
            ? { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
            : { duration: 13, repeat: Infinity, ease: 'easeInOut' }
        }
        className="absolute right-[10%] bottom-[12%] w-36 h-36 sm:w-48 sm:h-48"
      >
        <div
          className="absolute inset-x-[30%] inset-y-0 rounded-full"
          style={{
            background:
              'linear-gradient(145deg, #ffffff 10%, #eff5f1 60%, #a7f3d0 92%, #34d399 100%)',
            boxShadow:
              '0 16px 40px rgba(23, 107, 80, 0.12), inset -5px -6px 14px rgba(16, 185, 129, 0.25)',
          }}
        />
        <div
          className="absolute inset-y-[30%] inset-x-0 rounded-full"
          style={{
            background:
              'linear-gradient(125deg, #ffffff 15%, #f0f6f2 62%, #bbf7d0 92%, #4ade80 100%)',
            boxShadow:
              '0 16px 40px rgba(23, 107, 80, 0.1), inset -5px -6px 14px rgba(16, 185, 129, 0.22)',
          }}
        />
      </motion.div>

      {/* Small Floating Bubble (Bottom Left) */}
      <motion.div
        initial={{ y: '65vh', scale: 0.7, opacity: 0 }}
        animate={{
          y: isTransitioning ? '-4vh' : ['0vh', '-2.5vh', '0vh'],
          scale: 1,
          opacity: 0.75,
        }}
        transition={
          isTransitioning
            ? { duration: 1.3, ease: [0.16, 1, 0.3, 1] }
            : { duration: 9.5, repeat: Infinity, ease: 'easeInOut' }
        }
        className="absolute left-[11%] bottom-[16%] w-20 h-20 sm:w-28 sm:h-28 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 30% 25%, #ffffff 0%, #f3f7f4 55%, #bbf7d0 88%, #4ade80 100%)',
          boxShadow:
            '0 16px 36px rgba(23, 107, 80, 0.11), inset -6px -8px 16px rgba(34, 197, 94, 0.24)',
        }}
      />
    </div>
  );
};

export default Floating3DShapes;
