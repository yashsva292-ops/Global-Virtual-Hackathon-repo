import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThreeSquaresLoader } from './ThreeSquaresLoader';
import { LumenInteractiveShader } from './features/LumenInteractiveShader';

export type WordPreloaderPhase = 'idle' | 'expanding' | 'loading' | 'exiting';

interface WordsPreloaderProps {
  phase: WordPreloaderPhase;
  buttonOrigin?: { x: number; y: number } | null;
  onExpanded?: () => void;
  onLoadingComplete?: () => void;
  onExited?: () => void;
}

// 5x7 Dot-matrix glyph definitions for loading counter digits
const DIGIT_PATTERNS: Record<string, number[][]> = {
  '0': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 1, 1],
    [1, 0, 1, 0, 1],
    [1, 1, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  '1': [
    [0, 0, 1, 0, 0],
    [0, 1, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
  ],
  '2': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  '3': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 1, 1, 0],
    [0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  '4': [
    [0, 0, 0, 1, 0],
    [0, 0, 1, 1, 0],
    [0, 1, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 1, 0],
  ],
  '5': [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  '6': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  '7': [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0],
  ],
  '8': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  '9': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  '%': [
    [1, 1, 0, 0, 1],
    [1, 1, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 1, 0, 1, 1],
    [1, 0, 0, 1, 1],
    [0, 0, 0, 0, 0],
  ],
};

const InstantDotMatrixDigit: React.FC<{ char: string; dotSize?: number; color?: string }> = ({
  char,
  dotSize = 5,
  color = '#111b21',
}) => {
  const pattern = DIGIT_PATTERNS[char] || DIGIT_PATTERNS['0'];
  return (
    <div
      className="inline-grid gap-[2.5px] p-0.5 select-none"
      style={{
        gridTemplateColumns: `repeat(5, ${dotSize}px)`,
        gridTemplateRows: `repeat(7, ${dotSize}px)`,
      }}
    >
      {pattern.flatMap((row, r) =>
        row.map((on, c) => (
          <div
            key={`${r}-${c}`}
            className="rounded-full"
            style={{
              width: dotSize,
              height: dotSize,
              backgroundColor: on ? color : 'rgba(0, 0, 0, 0.06)',
              opacity: on ? 1 : 0.2,
              transition: 'none',
            }}
          />
        ))
      )}
    </div>
  );
};

// Stable loading label with generous descender space so 'g' is never cut off
const RollDownText: React.FC<{
  text: string;
  isComplete: boolean;
}> = ({ text, isComplete }) => {
  const letters = text.split('');

  return (
    <div className="inline-flex items-center overflow-visible pb-3 pt-1">
      <AnimatePresence mode="wait">
        {!isComplete ? (
          <motion.div
            key="loading-active"
            className="inline-flex items-center overflow-visible leading-relaxed"
          >
            {letters.map((char, i) => (
              <motion.span
                key={i}
                className="inline-block text-4xl sm:text-5xl md:text-6xl font-bold text-[#111b21] tracking-tight select-none"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  display: 'inline-block',
                  lineHeight: '1.35',
                  paddingBottom: '4px',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28, delay: i * 0.025 }}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

// Target word: "SCROLL"
const TARGET_WORD = 'SCROLL';

// Curated high-contrast glyph pool for vertical slot reel spinning
const SLOT_GLYPH_POOL = ['S', 'C', 'R', 'O', 'L', 'A', 'E', 'B', 'M', 'K', 'P', 'T', 'X', 'Z', '8', '3', '0', '9'];

// Strict sequential settling thresholds:
// All 6 letters start rolling simultaneously.
// S rolls and locks in at 26% (leaving 5 letters rolling)
// C rolls and locks in at 44% (leaving 4 letters rolling)
// R rolls and locks in at 62% (leaving 3 letters rolling)
// O rolls and locks in at 78% (leaving 2 letters rolling)
// First L rolls and locks in at 90% (leaving the final L rolling)
// Final L decelerates heavily, pauses through 99%, and settles strictly at 100% on the shared timeline!
const LOCK_THRESHOLDS = [26, 44, 62, 78, 90, 100];

/**
 * Vertical Rolling Physical Slot-Machine Reel Component
 * - All 6 letters roll simultaneously on independent vertical reels from the start.
 * - S rolls and locks into place, while the remaining letters keep rolling.
 * - Next, C rolls and locks into place, while the remaining keep rolling.
 * - Next, R rolls and locks, then O rolls and locks, then the first L rolls and locks.
 * - Finally, the last L decelerates and locks home simultaneously as the progress counter hits 100%.
 * - Each letter rolls smoothly without repeating the final letter twice.
 * - Fixed cell height/width ensures rock-solid stability with zero layout shift.
 */
const VerticalSlotReel: React.FC<{
  targetChar: string;
  slotIndex: number;
  progress: number;
  isLoaded: boolean;
}> = ({ targetChar, slotIndex, progress, isLoaded }) => {
  const threshold = LOCK_THRESHOLDS[slotIndex];
  const isFinal = slotIndex === TARGET_WORD.length - 1;
  const isLocked = isLoaded || progress >= threshold;

  // Single sequential reel strip:
  // Starts with random distinct glyphs and terminates EXACTLY once with targetChar at the end!
  // No duplicate targetChar before the end, ensuring it rolls only 1 time into place.
  const [tape] = useState<string[]>(() => {
    const list: string[] = [];
    const poolWithoutTarget = SLOT_GLYPH_POOL.filter((g) => g !== targetChar);
    const count = 16 + slotIndex * 4; // Length scaled so each reel steps steadily towards its target
    for (let i = 0; i < count; i++) {
      list.push(poolWithoutTarget[(i * 7 + slotIndex * 3) % poolWithoutTarget.length]);
    }
    list.push(targetChar); // Exactly 1 final destination glyph
    return list;
  });

  // Calculate target index on the tape based on progress approaching its lock threshold
  const [tapeIndex, setTapeIndex] = useState(0);

  useEffect(() => {
    if (isLocked) {
      // Snaps decisively into the target letter (the final item on the reel tape)
      setTapeIndex(tape.length - 1);
      return;
    }

    // Dynamic step cadence:
    // When rolling freely, steps briskly (45-65ms)
    // As progress approaches this slot's threshold, it smoothly rolls towards the final letter
    const progressRatio = Math.min(1, Math.max(0, progress / threshold));
    // Index increases progressively as progress approaches threshold, rolling once to the end
    const maxUnlockedIndex = tape.length - 2;
    const computedIndex = Math.floor(progressRatio * maxUnlockedIndex);

    // Keep an active rolling jitter if progress hasn't moved yet
    setTapeIndex((prev) => Math.max(prev, computedIndex));

    let stepSpeed = 48 + (slotIndex % 3) * 8;
    if (isFinal) {
      if (progress >= 99) {
        stepSpeed = 450; // Dramatic crawl during 99% pause
      } else if (progress >= 92) {
        stepSpeed = 220; // Noticeable deceleration
      } else if (progress >= 80) {
        stepSpeed = 110;
      }
    }

    const timer = setInterval(() => {
      setTapeIndex((prev) => {
        if (prev < maxUnlockedIndex) {
          return prev + 1;
        }
        return prev;
      });
    }, stepSpeed);

    return () => clearInterval(timer);
  }, [isLocked, progress, isFinal, slotIndex, tape.length, threshold]);

  const cellHeight = 16; // Exact cell height in px
  const cellWidth = 11;  // Exact cell width in px

  return (
    <div
      className="relative inline-block overflow-hidden select-none align-middle"
      style={{
        height: `${cellHeight}px`,
        width: `${cellWidth}px`,
      }}
    >
      <motion.div
        animate={{
          y: -tapeIndex * cellHeight,
        }}
        transition={
          isLocked
            ? {
                type: 'spring',
                stiffness: isFinal ? 140 : 320,
                damping: isFinal ? 18 : 22,
                mass: isFinal ? 1.1 : 0.8,
              }
            : {
                duration: isFinal && progress >= 92 ? 0.22 : 0.05,
                ease: 'linear',
              }
        }
        className="flex flex-col items-center"
      >
        {tape.map((ch, idx) => {
          const isAtTarget = idx === tape.length - 1 && isLocked;
          return (
            <div
              key={idx}
              className="flex items-center justify-center font-terminal-dots select-none uppercase tracking-[0.12em]"
              style={{
                height: `${cellHeight}px`,
                width: `${cellWidth}px`,
                fontSize: '11px',
                lineHeight: '16px',
                color: isAtTarget ? '#111b21' : '#555555',
                textShadow: isAtTarget ? '0 0.5px 1px rgba(0,0,0,0.18)' : 'none',
                opacity: isAtTarget ? 1 : 0.7,
              }}
            >
              {ch}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};

export const WordsPreloader: React.FC<WordsPreloaderProps> = ({
  phase,
  buttonOrigin,
  onExpanded,
  onLoadingComplete,
  onExited,
}) => {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const hasFinishedRef = useRef(false);

  // Cinematic pacing loading animation (calm, unhurried):
  // - 1% to 75%: smooth steady progress (~30ms per tick)
  // - 75% to 92%: begins slowing down noticeably (~75ms per tick)
  // - 92% to 98%: decelerates heavily (~160ms per tick)
  // - 99%: deliberate suspense pause (~600ms) before snapping into 100%
  useEffect(() => {
    if (phase === 'loading') {
      if (hasFinishedRef.current) return;
      setIsLoaded(false);
      setProgress(1);
      let current = 1;
      let timer: ReturnType<typeof setTimeout> | null = null;

      const step = () => {
        current += 1;
        if (current >= 100) {
          current = 100;
          setProgress(100);
          setIsLoaded(true);
          hasFinishedRef.current = true;
          if (onLoadingComplete) onLoadingComplete();
          return;
        }

        setProgress(current);

        // Compute delay based on cinematic curve
        let delay = 30;
        if (current >= 99) {
          delay = 600; // Dramatic cinematic pause at 99% before popping to 100%
        } else if (current >= 92) {
          delay = 140 + (current - 92) * 20; // Slow down intensely
        } else if (current >= 75) {
          delay = 45 + (current - 75) * 6; // Gradual deceleration
        } else {
          delay = 30; // Steady unhurried initial progress
        }

        timer = setTimeout(step, delay);
      };

      timer = setTimeout(step, 80);

      return () => {
        if (timer) clearTimeout(timer);
      };
    } else if (phase === 'idle') {
      hasFinishedRef.current = false;
      setProgress(0);
      setIsLoaded(false);
    }
  }, [phase, onLoadingComplete]);

  // Normalized coordinates in 1000x1000 viewBox:
  // Button origin (bx, by) defaults to bottom-right hotline zone (~860, 920)
  const winW = typeof window !== 'undefined' ? window.innerWidth : 1440;
  const winH = typeof window !== 'undefined' ? window.innerHeight : 900;
  const bx = buttonOrigin ? Math.round((buttonOrigin.x / winW) * 1000) : 860;
  const by = buttonOrigin ? Math.round((buttonOrigin.y / winH) * 1000) : 920;

  // Multi-Keyframe Organic Fluid Warping Path Sequence:
  // 0. Initial: small rounded bubble centered right on the clicked button
  const p0 = `M ${bx} ${by - 18} C ${bx + 40} ${by - 18}, ${bx + 55} ${by - 5}, ${bx + 55} ${by} C ${bx + 55} ${by + 5}, ${bx + 40} ${by + 18}, ${bx} ${by + 18} C ${bx - 40} ${by + 18}, ${bx - 55} ${by + 5}, ${bx - 55} ${by} C ${bx - 55} ${by - 5}, ${bx - 40} ${by - 18}, ${bx} ${by - 18} Z`;

  // 1. Magnetic stretch to Right and Bottom viewport edges:
  // The bubble's surface tension yields asymmetrically, pulling curved tendrils into the right edge (x=1000)
  // and the bottom edge (y=1000), while staying fluid and curved (corner 1000,1000 remains untouched).
  const p1 = `M ${bx - 60} ${by - 110} C ${bx + 80} ${by - 140}, 970 ${by - 50}, 1000 ${by - 20} C 1000 ${by + 30}, 960 930, 930 960 C 900 990, ${bx + 60} 1000, ${bx} 1000 C ${bx - 120} 1000, ${bx - 190} 940, ${bx - 130} ${by} C ${bx - 100} ${by - 60}, ${bx - 90} ${by - 90}, ${bx - 60} ${by - 110} Z`;

  // 2. Liquid sheet engulfs bottom and right margins, swelling upward and leftward:
  const p2 = `M ${bx - 260} ${by - 320} C 820 450, 960 520, 1000 480 C 1000 680, 970 880, 940 940 C 910 970, 780 1000, 620 1000 C 420 1000, 300 940, 340 820 C 370 720, 520 620, ${bx - 260} ${by - 320} Z`;

  // 3. Fluid expansion sweeps diagonally across the main viewport to top-left (0,0),
  // with a deeply undulating, living fluid frontier while the bottom-right corner (1000,1000) is held back:
  const p3 = `M 0 0 C 320 0, 780 0, 1000 0 C 1000 320, 1000 640, 920 740 C 830 830, 850 910, 740 1000 C 510 1000, 0 1000, 0 1000 C 0 680, 0 340, 0 0 Z`;

  // 4. Final step: The concave indentation at bottom-right smoothly fills and seals completely!
  const p4 = `M 0 0 C 320 0, 780 0, 1000 0 C 1000 320, 1000 640, 1000 1000 C 680 1000, 340 1000, 0 1000 C 0 680, 0 340, 0 0 Z`;

  const customEase = [0.22, 1, 0.36, 1] as const;

  const progressStr = String(Math.min(100, progress)).padStart(3, '0') + '%';
  const digits = progressStr.split('');

  const isVisible = phase !== 'idle';

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[120] pointer-events-auto overflow-hidden select-none">
          {/* 
            Expanding Warping Biscotti Cream Curtain:
            1. Originates as a translucent bubble over the clicked button.
            2. Stretches with magnetic attraction to right and bottom edges.
            3. Fluidly engulfs the canvas with undulating organic curvature.
            4. Bottom-right corner fills last without any sudden rectangular morph!
          */}
          {phase === 'expanding' && (
            <svg
              className="fixed inset-0 z-20 w-full h-full pointer-events-none"
              viewBox="0 0 1000 1000"
              preserveAspectRatio="none"
            >
              <motion.path
                fill="#efeae2"
                initial={{ d: p0, opacity: 0.85 }}
                animate={{
                  d: [p0, p1, p2, p3, p4],
                  opacity: [0.85, 0.92, 0.96, 0.99, 1],
                }}
                transition={{
                  d: {
                    duration: 2.2,
                    ease: customEase,
                    times: [0, 0.22, 0.48, 0.78, 1],
                  },
                  opacity: {
                    duration: 1.8,
                    ease: 'easeInOut',
                  },
                }}
                onAnimationComplete={() => {
                  if (onExpanded) onExpanded();
                }}
              />
            </svg>
          )}

          {/* Full Loading and Exiting Screen */}
          <motion.div
            className="fixed inset-0 z-30 flex items-center justify-center overflow-hidden bg-[#efeae2]"
            initial={{
              opacity: 0,
            }}
            animate={
              phase === 'loading'
                ? {
                    opacity: 1,
                    transition: { duration: 0.25, ease: 'easeOut' },
                  }
                : phase === 'exiting'
                ? {
                    y: '-100vh',
                    transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] },
                  }
                : { opacity: 0 }
            }
            onAnimationComplete={() => {
              if (phase === 'exiting' && onExited) {
                onExited();
              }
            }}
          >
            {/* 
              Loading page background:
              Base is authentic WhatsApp Biscotti Cream (#efeae2).
              The animated fluid gradient extends the existing homepage WebGL/WebGPU green/emerald shader
              (emerald, deep green, and teal highlights - NO blue-black cinematic background).
              Anchored at the bottom and expanding dynamically to roughly 3/8 (37.5% - 40%) of the viewport
              with an organic, flame-like undulating crest!
            */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={
                phase === 'loading'
                  ? {
                      y: '0%',
                      opacity: 1,
                    }
                  : { y: '100%', opacity: 0 }
              }
              transition={{
                duration: 2.2,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.1,
              }}
              className="absolute inset-x-0 bottom-0 h-[37.5%] pointer-events-none overflow-hidden z-10"
              style={{
                // Feathered top mask blending into Biscotti Cream (#efeae2)
                maskImage:
                  'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 55%, rgba(0,0,0,0.55) 82%, rgba(0,0,0,0.12) 94%, transparent 100%)',
                WebkitMaskImage:
                  'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 55%, rgba(0,0,0,0.55) 82%, rgba(0,0,0,0.12) 94%, transparent 100%)',
              }}
            >
              {/* Lively flame-like undulating motion extending the green/emerald fluid shader */}
              <motion.div
                animate={{
                  y: [0, -20, -6, -28, -12, 0],
                  scaleY: [1, 1.15, 1.05, 1.20, 1.08, 1],
                }}
                transition={{
                  duration: 8.0,
                  repeat: Infinity,
                  ease: [0.45, 0.05, 0.55, 0.95],
                }}
                className="absolute inset-0 w-full h-[130%] -top-[30%]"
              >
                <LumenInteractiveShader
                  baseColor={[0.005, 0.150, 0.095]}
                  warmColor={[0.000, 0.680, 0.500]}
                  midColor={[0.050, 0.850, 0.550]}
                  coolColor={[0.020, 0.560, 0.520]}
                  brightness={1.35}
                />
              </motion.div>
            </motion.div>

            {/* Studio Card (Loading Screen) - Floating WhatsApp off-white cream aesthetic */}
            <AnimatePresence>
              {phase === 'loading' && (
                <motion.div
                  key="loading-card-container"
                  initial={{ opacity: 0, scale: 0.95, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="relative z-20 w-full max-w-4xl h-[78vh] max-h-[580px] bg-white/95 rounded-3xl shadow-[0_30px_90px_rgba(11,20,26,0.22)] overflow-hidden flex flex-col justify-between p-6 sm:p-8 md:p-10 text-slate-900 border border-[#d1d7db]/80 mx-4 sm:mx-8 backdrop-blur-xl"
                >
                  {/* Center Loading Telemetry: Space Grotesk font for "Loading" with calm roll down exit */}
                  <div className="flex flex-col md:flex-row items-center justify-between my-auto w-full gap-8">
                    {/* Left: 'Loading' animated with calm roll down exit when 100% reached */}
                    <div className="flex items-center gap-4 min-h-[64px]">
                      <RollDownText text="Loading" isComplete={isLoaded} />
                      <AnimatePresence>
                        {!isLoaded && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.6, y: 16 }}
                            transition={{ duration: 0.4 }}
                          >
                            <ThreeSquaresLoader size={28} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Right: Big Dot-Matrix Counter with instant digit changes */}
                    <div className="flex items-center gap-2 sm:gap-3 bg-[#f0f2f5] px-6 py-5 rounded-2xl border border-[#d1d7db] shadow-inner">
                      {digits.map((ch, idx) => (
                        <InstantDotMatrixDigit key={idx} char={ch} dotSize={6} color="#111b21" />
                      ))}
                    </div>
                  </div>

                  {/* 
                    Bottom Section:
                    - Left: Retained "END-TO-END ENCRYPTION SIMULATOR"
                    - Bottom Right: Tactile pill indicator with genuine dot-matrix lottery machine for "SCROLL"
                  */}
                  <div className="relative flex items-center justify-between w-full border-t border-[#e9edef] pt-4 min-h-[56px]">
                    <span className="text-xs font-mono text-[#667781] tracking-wide select-none">
                      END-TO-END ENCRYPTION SIMULATOR
                    </span>

                    {/* Bottom Right: Tactile pill indicator with genuine dot-matrix lottery machine for "SCROLL" */}
                    <div className="relative flex items-center justify-end">
                      <div
                        className="group flex items-center rounded-[36px] transition-all duration-300 select-none cursor-default"
                        style={{
                          padding: '10px 18px 8px 18px',
                          backgroundColor: '#f2f2f2',
                          boxShadow:
                            '0 2px 2px 0 rgba(0,0,0,0.08), 0 4px 7px 0 rgba(0,0,0,0.2), 0 0.5px 2px 0 rgba(0,0,0,0.15), inset 0 -1px 0.2px 0 rgba(0,0,0,0.12), inset 0 1px 0.2px 0 #ffffff',
                        }}
                      >
                        {/* Authentic dot-matrix letters rolling on independent vertical slot reels */}
                        <span className="flex items-center tracking-normal text-[#1a1a1a]">
                          {TARGET_WORD.split('').map((char, idx) => (
                            <VerticalSlotReel
                              key={idx}
                              targetChar={char}
                              slotIndex={idx}
                              progress={progress}
                              isLoaded={isLoaded}
                            />
                          ))}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WordsPreloader;
