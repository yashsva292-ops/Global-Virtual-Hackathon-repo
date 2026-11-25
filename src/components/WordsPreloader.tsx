import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThreeSquaresLoader } from './ThreeSquaresLoader';
import { LumenInteractiveShader } from './features/LumenInteractiveShader';

export type WordPreloaderPhase = 'idle' | 'expanding' | 'loading' | 'exiting';

interface WordsPreloaderProps {
  phase: WordPreloaderPhase;
  buttonOrigin?: { x: number; y: number } | null;
  triggerType?: 'button' | 'scroll';
  scrollFraction?: number; // 0 (hidden at bottom 100%) to 1 (fully loaded 0%)
  isInteractiveScroll?: boolean;
  simulatorScrollProgress?: number; // 0 to 1 scroll driven exit into simulator
  onExpanded?: () => void;
  onLoadingComplete?: () => void;
  onExited?: () => void;
  onScrollRequested?: () => void;
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

// Alphanumeric character pool for reel characters
const GLYPH_POOL = ['A', 'B', 'D', 'F', 'G', 'H', 'J', 'K', 'M', 'N', 'P', 'Q', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '2', '3', '5', '7', '8', '9'];

function createReelTape(targetChar: string, stepCount: number, penultimateChar?: string): string[] {
  const pool = GLYPH_POOL.filter((c) => c !== targetChar && c !== penultimateChar);
  const tape: string[] = [];
  const count = stepCount - (penultimateChar ? 2 : 1);
  for (let i = 0; i < count; i++) {
    tape.push(pool[(i * 7 + targetChar.charCodeAt(0) * 3 + 1) % pool.length]);
  }
  if (penultimateChar) {
    tape.push(penultimateChar);
  }
  tape.push(targetChar);
  return tape;
}

/**
 * Vertical Rolling Physical Slot-Machine Reel Component
 * - All 6 letters roll simultaneously on independent vertical reels from the start.
 * - Reel 0 ('S') locks in first (~25% loading)
 * - Reel 1 ('C') locks in second (~45% loading)
 * - Reel 2 ('R') locks in third (~65% loading)
 * - Reel 3 ('O') exhibits continuous, smooth, uninterrupted vertical movement without pauses, restarts, or jumps (~80% loading)
 * - Reel 4 ('L') locks in fifth (~92% loading)
 * - Reel 5 (final 'L') exhibits smooth, progressive deceleration, rolling visibly through 'E' during the 99% suspense pause,
 *   and locks home into 'L' simultaneously as the counter hits 100%!
 */
const VerticalSlotReel: React.FC<{
  targetChar: string;
  slotIndex: number;
  progress: number;
  isLoaded: boolean;
  isEntranceComplete: boolean;
}> = ({ targetChar, slotIndex, progress, isLoaded, isEntranceComplete }) => {
  const isFinal = slotIndex === TARGET_WORD.length - 1;

  const [tape] = useState<string[]>(() => {
    if (slotIndex === 0) return createReelTape('S', 6);
    if (slotIndex === 1) return createReelTape('C', 9);
    if (slotIndex === 2) return createReelTape('R', 12);
    if (slotIndex === 3) return createReelTape('O', 15);
    if (slotIndex === 4) return createReelTape('L', 18);
    return createReelTape('L', 21, 'E');
  });

  const [tapeIndex, setTapeIndex] = useState(0);
  const targetIndex = tape.length - 1;
  const isLocked = isLoaded || (tapeIndex >= targetIndex);

  const progressRef = useRef(progress);
  progressRef.current = progress;
  const isLoadedRef = useRef(isLoaded);
  isLoadedRef.current = isLoaded;

  // Synchronized final 100% trigger: snaps or rolls into the final target character simultaneously with 100%
  useEffect(() => {
    if (isLoaded || progress >= 100) {
      setTapeIndex(targetIndex);
    }
  }, [isLoaded, progress, targetIndex]);

  useEffect(() => {
    // Only begin rolling once entrance animation has fully completed and settled
    if (!isEntranceComplete) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    let active = true;

    const tick = () => {
      if (!active) return;
      setTapeIndex((prev) => {
        if (prev >= targetIndex) return targetIndex;

        // For the final slot (Reel 5, 'L'):
        // Sits on penultimate 'E' (targetIndex - 1) during 99% pause until isLoaded/100%
        if (isFinal && prev >= targetIndex - 1 && !isLoadedRef.current && progressRef.current < 100) {
          timer = setTimeout(tick, 20);
          return prev;
        }

        const next = prev + 1;
        if (next >= targetIndex) {
          return targetIndex;
        }

        // Dynamic step speed calibrated for ~2-2.5s total runtime
        let stepSpeed = 30 + (slotIndex % 3) * 4;
        if (isFinal) {
          const currentProgress = progressRef.current;
          if (currentProgress >= 96) {
            stepSpeed = 100; // Deliberate roll through E
          } else if (currentProgress >= 88) {
            stepSpeed = 65; // Progressive deceleration
          } else if (currentProgress >= 75) {
            stepSpeed = 45; // Early deceleration
          }
        }

        timer = setTimeout(tick, stepSpeed);
        return next;
      });
    };

    timer = setTimeout(tick, 30 + (slotIndex % 3) * 4);

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [targetIndex, isFinal, slotIndex, isEntranceComplete]);

  const cellHeight = 20;
  const cellWidth = 14;

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
                stiffness: isFinal ? 180 : 300,
                damping: isFinal ? 20 : 24,
                mass: isFinal ? 1.0 : 0.8,
              }
            : {
                duration: (isFinal && progress >= 88 ? 0.18 : 0.045),
                ease: 'linear',
              }
        }
        className="flex flex-col items-center"
      >
        {tape.map((ch, idx) => {
          const isAtTarget = idx === targetIndex && isLocked;
          const isAtE = isFinal && idx === targetIndex - 1 && tapeIndex === targetIndex - 1;
          return (
            <div
              key={idx}
              className={`flex items-center justify-center font-terminal-dots select-none uppercase tracking-[0.12em] ${
                isAtTarget
                  ? 'text-[#111b21] font-bold'
                  : isAtE
                  ? 'text-[#222222] font-semibold'
                  : 'text-[#444444] font-medium opacity-85'
              }`}
              style={{
                height: `${cellHeight}px`,
                width: `${cellWidth}px`,
                fontSize: '13px',
                lineHeight: `${cellHeight}px`,
                textShadow: isAtTarget ? '0 0.5px 1px rgba(0,0,0,0.25)' : 'none',
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
  triggerType = 'scroll',
  scrollFraction = 0,
  isInteractiveScroll = false,
  simulatorScrollProgress = 0,
  onExpanded,
  onLoadingComplete,
  onExited,
  onScrollRequested,
}) => {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEntranceComplete, setIsEntranceComplete] = useState(false);
  const hasFinishedRef = useRef(false);

  const onLoadingCompleteRef = useRef(onLoadingComplete);
  useEffect(() => {
    onLoadingCompleteRef.current = onLoadingComplete;
  }, [onLoadingComplete]);

  // Reset state when preloader returns to idle; guarantee expanding completes
  useEffect(() => {
    if (phase === 'idle') {
      hasFinishedRef.current = false;
      setIsLoaded(false);
      setProgress(0);
      setIsEntranceComplete(false);
    } else if (phase === 'expanding') {
      // Promptly signal entrance completion to begin loading
      const fallback = setTimeout(() => {
        setIsEntranceComplete(true);
        if (onExpanded) onExpanded();
      }, 350);
      return () => clearTimeout(fallback);
    }
  }, [phase, onExpanded]);

  // Loading animation calibrated for ~2.0 - 2.5s total time from click to 100%:
  useEffect(() => {
    if (phase === 'loading' && isEntranceComplete) {
      if (hasFinishedRef.current) return;
      setIsLoaded(false);
      setProgress(1);
      let current = 1;
      let timer: ReturnType<typeof setTimeout> | null = null;

      const step = () => {
        // Fast, deterministic increments to complete within ~1.8s
        if (current < 60) {
          current += 4;
        } else if (current < 85) {
          current += 3;
        } else if (current < 95) {
          current += 2;
        } else {
          current += 1;
        }

        if (current >= 100) {
          current = 100;
          setProgress(100);
          setIsLoaded(true);
          hasFinishedRef.current = true;
          if (onLoadingCompleteRef.current) onLoadingCompleteRef.current();
          return;
        }

        setProgress(current);

        let delay = 16;
        if (current >= 99) {
          delay = 120; // Brief dramatic hold at 99%
        } else if (current >= 90) {
          delay = 20 + (current - 90) * 3; // Gentle deceleration
        } else {
          delay = 16; // Steady unhindered pace
        }

        timer = setTimeout(step, delay);
      };

      timer = setTimeout(step, 10);

      return () => {
        if (timer) clearTimeout(timer);
      };
    } else if (phase === 'idle') {
      hasFinishedRef.current = false;
      setProgress(0);
      setIsLoaded(false);
      setIsEntranceComplete(false);
    }
  }, [phase, isEntranceComplete]);

  // Normalized coordinates in 1000x1000 viewBox:
  // Button origin (bx, by) defaults to bottom-right hotline zone (~860, 920)
  const winW = typeof window !== 'undefined' ? window.innerWidth : 1440;
  const winH = typeof window !== 'undefined' ? window.innerHeight : 900;
  const bx = buttonOrigin ? Math.round((buttonOrigin.x / winW) * 1000) : 860;
  const by = buttonOrigin ? Math.round((buttonOrigin.y / winH) * 1000) : 920;

  // Smooth expanding circular/radial bubble expansion from button origin:
  // Starts directly at (bx, by) with radius 0%, smoothly expands into an encompassing circle (150vmax)
  // covering all four corners simultaneously without any clipping inversion or flipping!
  const originXPercent = buttonOrigin ? Math.round((buttonOrigin.x / winW) * 100) : 50;
  const originYPercent = buttonOrigin ? Math.round((buttonOrigin.y / winH) * 100) : 50;

  const clip0 = `circle(0% at ${originXPercent}% ${originYPercent}%)`;
  const clip1 = `circle(25% at ${originXPercent}% ${originYPercent}%)`;
  const clip2 = `circle(65% at ${originXPercent}% ${originYPercent}%)`;
  const clip3 = `circle(115% at ${originXPercent}% ${originYPercent}%)`;
  const clip4 = `circle(160% at ${originXPercent}% ${originYPercent}%)`;

  const customEase = [0.22, 1, 0.36, 1] as const;

  const progressStr = String(Math.min(100, progress)).padStart(3, '0') + '%';
  const digits = progressStr.split('');

  const isVisible = phase !== 'idle' || isInteractiveScroll;

  // SVG multi-point organic boundary for the advancing biscotti cream surface:
  // - Interactive scrubbing: starts at baselineY = (1 - scrollFraction) * 1000
  // - Auto-expanding commitment: smoothly interpolates from the current snapshot wave up to wave4 (full screen)
  //   without jumping back down to bottom or arbitrary points!
  const currentBaselineYRef = useRef(1000);
  if (isInteractiveScroll && phase === 'idle') {
    currentBaselineYRef.current = Math.max(0, Math.min(1000, Math.round((1 - scrollFraction) * 1000)));
  }

  // Track physical surface Y position for genuine upward pull and reverse-scroll retreat:
  // - Interactive scrubbing: surface translates upward from 100vh down to ~30vh
  // - When scrolling backward: surface smoothly retreats downward back to 100vh
  // - When committed to expanding: smoothly completes pull-up with natural deceleration into 0vh
  const currentSurfaceYRef = useRef(100);
  if (isInteractiveScroll && phase === 'idle') {
    currentSurfaceYRef.current = Math.max(0, Math.min(100, Math.round((1 - scrollFraction * 1.4) * 100)));
  } else if (phase === 'idle') {
    currentSurfaceYRef.current = 100;
  }

  // Generate an organic wave path at any given baseline Y
  const getWavePathAtY = (y: number, ampMultiplier = 1) => {
    const fraction = (1000 - y) / 1000;
    const a1 = Math.sin(fraction * Math.PI) * 55 * ampMultiplier;
    const a2 = Math.cos(fraction * Math.PI) * 45 * ampMultiplier;
    return `M 0 ${Math.min(1000, y + a1 * 0.4)} C 180 ${Math.max(0, y - a1)}, 340 ${Math.min(1000, y + a2)}, 520 ${Math.max(0, y - a2 * 0.8)} C 700 ${Math.min(1000, y + a1 * 0.7)}, 860 ${Math.max(0, y - a2)}, 1000 ${Math.min(1000, y + a2 * 0.5)} L 1000 1000 L 0 1000 Z`;
  };

  const currentInteractiveWave = getWavePathAtY(currentBaselineYRef.current);
  const midWayWave = getWavePathAtY(Math.min(currentBaselineYRef.current, 380) * 0.6);
  const wave4 = `M 0 0 C 250 0, 500 0, 750 0 C 850 0, 950 0, 1000 0 L 1000 1000 L 0 1000 Z`;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[120] pointer-events-auto overflow-hidden select-none">
          {/* 
            ORGANIC BISCOTTI CREAM ADVANCING SURFACE:
            Sits at z-[110] (above hero page, behind z-[115] 3D bubbles and z-[120] loading card).
          */}
          <svg
            className="fixed inset-0 z-[110] w-full h-full pointer-events-none"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
            style={{
              opacity:
                phase === 'loading'
                  ? Math.max(0, 1 - simulatorScrollProgress * 1.4)
                  : phase === 'exiting'
                  ? 0
                  : 1,
              transition: phase === 'exiting' ? 'opacity 0.6s ease-out' : 'opacity 0.05s ease-out',
            }}
          >
            {isInteractiveScroll && phase === 'idle' ? (
              <path
                d={currentInteractiveWave}
                fill="#efeae2"
                style={{ transition: 'd 0.08s ease-out' }}
              />
            ) : phase === 'expanding' ? (
              <motion.path
                fill="#efeae2"
                initial={{ d: currentInteractiveWave }}
                animate={{
                  d: [currentInteractiveWave, midWayWave, wave4],
                }}
                transition={{
                  duration: 1.1,
                  ease: [0.16, 1, 0.3, 1],
                  times: [0, 0.45, 1],
                }}
              />
            ) : (
              <path d="M 0 0 L 1000 0 L 1000 1000 L 0 1000 Z" fill="#efeae2" />
            )}
          </svg>

          {/* 
            GENUINE UPWARD-REVEAL LOADING SURFACE:
            Choreographed Sequence:
            1. Biscotti-cream emerges and reaches full screen (phase === 'expanding' -> wave reaches top).
            2. Green gradient develops progressively with soft mask reveal.
            3. Loading studio card enters smoothly with upward translate and gentle scale.
            4. 3D organic bubbles/cluster gradually fade into view behind the telemetry.
            5. Loading counter & character reels animate calmly.
            6. At 100%, downward scroll drives continuous, seamless reveal of simulator.
          */}
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden"
            initial={isInteractiveScroll ? false : { y: '100vh', opacity: 0 }}
            animate={
              isInteractiveScroll && phase === 'idle'
                ? {
                    y: `${currentSurfaceYRef.current}vh`,
                    opacity: Math.min(1, Math.max(0, (100 - currentSurfaceYRef.current) / 45)),
                    transition: { duration: 0.08, ease: 'easeOut' },
                  }
                : phase === 'expanding'
                ? {
                    y: '0vh',
                    opacity: 1,
                    transition: { duration: 1.15, ease: [0.16, 1, 0.3, 1] },
                  }
                : phase === 'loading'
                ? {
                    y: `${-simulatorScrollProgress * 100}vh`,
                    opacity: Math.max(0, 1 - simulatorScrollProgress * 1.5),
                    transition: { duration: 0.05, ease: 'easeOut' },
                  }
                : phase === 'exiting'
                ? {
                    y: '-40px',
                    scale: 0.96,
                    opacity: 0,
                    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
                  }
                : { y: '100vh', opacity: 0 }
            }
            onAnimationComplete={() => {
              if (phase === 'expanding') {
                setIsEntranceComplete(true);
                if (onExpanded) onExpanded();
              } else if (phase === 'exiting' && onExited) {
                onExited();
              }
            }}
          >
            {/* 
              Phase 2: Broad, soft ivory-to-sage restrained gradient (no fluorescent pool, no harsh seams)
              Warm ivory #F7F4EC blending into light sage #E9EEE5 with subtle mint accent #D7E9DE
            */}
            {(isInteractiveScroll || phase === 'expanding' || phase === 'loading') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{
                  opacity: phase === 'expanding' || phase === 'loading' ? 1 : Math.max(0, (scrollFraction - 0.2) * 1.25),
                }}
                transition={{ duration: 0.85, delay: phase === 'expanding' ? 0.2 : 0, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 pointer-events-none overflow-hidden z-10"
                style={{
                  background: 'linear-gradient(180deg, #F7F4EC 0%, #F1F4EE 40%, #E9EEE5 75%, #D7E9DE 100%)',
                }}
              />
            )}

            {/* 
              Phase 3: Studio Card (Loading Surface)
              Enters gracefully with near-white card surface (#FFFEF9) and isolated stacking context.
              Contains the clipped 3D spheres in its background:
              Bottom: White/ivory card surface with translucent readability layer.
              Above that: Clipped 3D sphere scene (at z-10 inside the card).
              Above that: Subtle readability mask behind foreground text.
              Top: "Loading", percentage, labels and controls.
            */}
            {(isInteractiveScroll || phase === 'expanding' || phase === 'loading') && (
              <motion.div
                initial={phase === 'expanding' ? { opacity: 0, y: 16, scale: 0.985 } : false}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                transition={{
                  duration: 0.35,
                  delay: phase === 'expanding' ? 0.15 : 0,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative z-20 w-full max-w-4xl h-[78vh] max-h-[580px] bg-[#FFFEF9]/85 backdrop-blur-xs rounded-3xl shadow-[0_24px_70px_rgba(21,58,50,0.12)] overflow-hidden flex flex-col justify-between p-6 sm:p-8 md:p-10 text-slate-900 border border-[#D3DBCF] mx-4 sm:mx-8"
              >
                {/* Center Loading Telemetry: Space Grotesk font for "Loading" with calm roll down exit */}
                <div className="relative z-30 flex flex-col md:flex-row items-center justify-between my-auto w-full gap-8 pointer-events-none">
                  {/* Left: 'Loading' animated with calm roll down exit when 100% reached */}
                  <div className="flex items-center gap-4 min-h-[64px] pointer-events-auto">
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
                  <div className="flex items-center gap-2 sm:gap-3 bg-[#f0f2f5]/90 backdrop-blur-xs px-6 py-5 rounded-2xl border border-[#d1d7db] shadow-inner pointer-events-auto">
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
                <div className="relative z-30 flex items-center justify-between w-full border-t border-[#e9edef] pt-4 min-h-[56px] pointer-events-none">
                  <span className="text-xs font-mono text-[#667781] tracking-wide select-none">
                    END-TO-END ENCRYPTION SIMULATOR
                  </span>

                  {/* Bottom Right: Tactile pill indicator with genuine dot-matrix lottery machine for "SCROLL" */}
                  <div className="relative flex items-center justify-end pointer-events-auto">
                    <div
                      onClick={isLoaded && onScrollRequested ? onScrollRequested : undefined}
                      className={`group flex items-center rounded-[36px] transition-all duration-300 select-none ${
                        isLoaded ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'
                      }`}
                      style={{
                        padding: '10px 18px 8px 18px',
                        backgroundColor: '#f2f2f2',
                        boxShadow:
                          '0 2px 2px 0 rgba(0,0,0,0.08), 0 4px 7px 0 rgba(0,0,0,0.2), 0 0.5px 2px 0 rgba(0,0,0,0.15), inset 0 -1px 0.2px 0 rgba(0,0,0,0.12), inset 0 1px 0.2px 0 #ffffff',
                      }}
                    >
                      {/* Authentic dot-matrix letters rolling on 6 independent vertical slot reels */}
                      <div className="flex items-center tracking-normal text-[#1a1a1a]">
                        {TARGET_WORD.split('').map((char, idx) => (
                          <VerticalSlotReel
                            key={idx}
                            targetChar={char}
                            slotIndex={idx}
                            progress={progress}
                            isLoaded={isLoaded}
                            isEntranceComplete={isEntranceComplete}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WordsPreloader;
