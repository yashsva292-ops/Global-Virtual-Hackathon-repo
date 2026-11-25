'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface Skiper8Props {
  words?: string[];
  onComplete?: () => void;
  className?: string;
}

const DEFAULT_WORDS = [
  'Hello',
  'Bonjour',
  'Ciao',
  'Olà',
  'やあ',
  'Hallå',
  'Guten tag',
  'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਜੀ',
];

/**
 * Skiper8 Words Preloader (Faithfully aligned with https://skiper-ui.com/v1/skiper8)
 * 
 * - Full-height SVG curve with exact initial & exit quadratic control points
 * - Synchronous window dimension initialization for zero flash
 * - Precise word timing: "Hello" stays slightly longer, subsequent greetings sequence with smooth natural cadences
 * - Coordinated SVG exit delay (delay: 0.3s) and container slide (delay: 0.2s) matching the original physics
 */
export const Skiper8: React.FC<Skiper8Props> = ({
  words = DEFAULT_WORDS,
  onComplete,
  className = '',
}) => {
  const [index, setIndex] = useState(0);
  const [dimension, setDimension] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    setDimension({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      setDimension({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (index === words.length - 1) {
      // Hold last word briefly, then trigger the upward wipe
      const exitTimer = setTimeout(() => {
        setIsActive(false);
        if (onComplete) {
          // Duration .8s + delay .2s = 1000ms
          setTimeout(onComplete, 1000);
        }
      }, 240);
      return () => clearTimeout(exitTimer);
    }

    // Precise rhythm: "Hello" stays just a little longer (~400ms), other words cycle smoothly at 140ms
    const delay = index === 0 ? 400 : 140;
    const timer = setTimeout(() => {
      setIndex((prev) => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [index, words.length, onComplete]);

  // Exact Dennis Snellenberg / Skiper UI SVG curve formulas:
  // Initial has a quadratic bulge (height + 300) downwards
  // Exit flattens to height
  const initialPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height + 300} 0 ${dimension.height} L0 0`;
  const exitPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height} 0 ${dimension.height} L0 0`;

  const curveVariants = {
    initial: {
      d: initialPath,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] as const },
    },
    exit: {
      d: exitPath,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] as const, delay: 0.3 },
    },
  };

  const containerVariants = {
    initial: {
      top: 0,
    },
    exit: {
      top: '-100vh',
      transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const, delay: 0.2 },
    },
  };

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          variants={containerVariants}
          initial="initial"
          exit="exit"
          className={`fixed inset-0 z-[9999] flex h-full w-full items-center justify-center select-none ${className}`}
          style={{ background: 'transparent' }}
        >
          {dimension.width > 0 && (
            <>
              {/* Cycling Word — Clean Typography, NO green dot, matching Skiper UI font and tracking */}
              <motion.p
                key={index}
                variants={{
                  initial: { opacity: 0 },
                  enter: {
                    opacity: 0.85,
                    transition: { duration: 0.25, ease: 'easeOut' },
                  },
                }}
                initial="initial"
                animate="enter"
                className="absolute z-10 text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tighter text-black select-none pointer-events-none"
                style={{
                  fontFamily:
                    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                }}
              >
                {words[index]}
              </motion.p>

              {/* Full SVG surface drawing the pure white background with the smooth bottom curve */}
              <svg
                className="absolute top-0 left-0 h-[calc(100%+300px)] w-full pointer-events-none"
              >
                <motion.path
                  variants={curveVariants}
                  initial="initial"
                  exit="exit"
                  className="fill-white"
                />
              </svg>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Skiper8;
