import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThreeSquaresLoader } from './ThreeSquaresLoader';
import { LumenInteractiveShader } from './features/LumenInteractiveShader';
import { Floating3DShapes } from './features/Floating3DShapes';

export type WordPreloaderPhase = 'idle' | 'expanding' | 'loading' | 'exiting';

interface WordsPreloaderProps {
  phase: WordPreloaderPhase;
  buttonOrigin?: { x: number; y: number } | null;
  triggerType?: 'button' | 'scroll';
  scrollFraction?: number; // 0 (hidden at bottom 100%) to 1 (fully loaded 0%)
  isInteractiveScroll?: boolean;
  onExpanded?: () => void;
  onLoadingComplete?: () => void;
  onExited?: () => void;
  onClose?: () => void;
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
    if (slotIndex === 0) return createReelTape('S', 24);
    if (slotIndex === 1) return createReelTape('C', 42);
    if (slotIndex === 2) return createReelTape('R', 58);
    if (slotIndex === 3) return createReelTape('O', 72);
    if (slotIndex === 4) return createReelTape('L', 84);
    return createReelTape('L', 94, 'E');
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

  // Clean deterministic stepping without side-effects inside state updaters
  // Prevents double-scheduling in StrictMode and eliminates micro-hitches on Reel 3 ('O')
  const [stepDuration, setStepDuration] = useState(0.05);

  useEffect(() => {
    if (!isEntranceComplete || isLocked || tapeIndex >= targetIndex) return;

    // For final slot (Reel 5, 'L'): hold on penultimate 'E' (targetIndex - 1) until 100% completion
    if (isFinal && tapeIndex >= targetIndex - 1 && !isLoadedRef.current && progressRef.current < 100) {
      return;
    }

    let stepSpeed = 50 + (slotIndex % 3) * 5;
    if (isFinal) {
      const currentProgress = progressRef.current;
      if (currentProgress >= 96) {
        stepSpeed = 360; // Slow deliberate roll into 'E'
      } else if (currentProgress >= 88) {
        stepSpeed = 200; // Progressive deceleration
      } else if (currentProgress >= 75) {
        stepSpeed = 110; // Early deceleration
      } else {
        stepSpeed = 58;
      }
    }

    setStepDuration(stepSpeed / 1000);

    const timer = setTimeout(() => {
      setTapeIndex((prev) => {
        if (prev >= targetIndex) return targetIndex;
        if (isFinal && prev >= targetIndex - 1 && !isLoadedRef.current && progressRef.current < 100) {
          return prev;
        }
        return prev + 1;
      });
    }, stepSpeed);

    return () => clearTimeout(timer);
  }, [tapeIndex, targetIndex, isFinal, slotIndex, isEntranceComplete, isLocked]);

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
                damping: isFinal ? 22 : 26,
                mass: isFinal ? 1.0 : 0.8,
              }
            : {
                duration: stepDuration,
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
  onExpanded,
  onLoadingComplete,
  onExited,
  onClose,
}) => {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEntranceComplete, setIsEntranceComplete] = useState(false);
  const hasFinishedRef = useRef(false);

  const onLoadingCompleteRef = useRef(onLoadingComplete);
  useEffect(() => {
    onLoadingCompleteRef.current = onLoadingComplete;
  }, [onLoadingComplete]);

  // Keyboard Escape accessibility for Close control
  useEffect(() => {
    if (phase === 'idle' || !onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, onClose]);

  const onExpandedRef = useRef(onExpanded);
  useEffect(() => {
    onExpandedRef.current = onExpanded;
  }, [onExpanded]);

  // Safety fallback: guarantees entrance completion fires even if onAnimationComplete is skipped under heavy load
  useEffect(() => {
    if (phase === 'expanding' && !isEntranceComplete) {
      const fallbackTimer = setTimeout(() => {
        setIsEntranceComplete(true);
        if (onExpandedRef.current) onExpandedRef.current();
      }, 1100);
      return () => clearTimeout(fallbackTimer);
    }
  }, [phase, isEntranceComplete]);

  // Reset state when preloader returns to idle
  useEffect(() => {
    if (phase === 'idle' && !isInteractiveScroll) {
      hasFinishedRef.current = false;
      setIsLoaded(false);
      setProgress(0);
      setIsEntranceComplete(false);
    }
  }, [phase, isInteractiveScroll]);

  // Deliberate, breathing loading cadence:
  // GATED: Only starts once the upward pull entrance has fully completed and settled!
  useEffect(() => {
    if (phase === 'loading' && isEntranceComplete) {
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
          if (onLoadingCompleteRef.current) onLoadingCompleteRef.current();
          return;
        }

        setProgress(current);

        // Deliberate, natural breathing pace
        let delay = 34;
        if (current >= 99) {
          delay = 680; // Intentional 99% suspense pause before synchronized 100% + final 'L'
        } else if (current >= 88) {
          delay = 120 + (current - 88) * 14; // Smooth heavy deceleration
        } else if (current >= 70) {
          delay = 50 + (current - 70) * 4; // Gradual early deceleration
        } else {
          delay = 34; // Steady, readable progression
        }

        timer = setTimeout(step, delay);
      };

      timer = setTimeout(step, 120);

      return () => {
        if (timer) clearTimeout(timer);
      };
    } else if (phase === 'idle' && !isInteractiveScroll) {
      hasFinishedRef.current = false;
      setProgress(0);
      setIsLoaded(false);
      setIsEntranceComplete(false);
    }
  }, [phase, isEntranceComplete, isInteractiveScroll]);

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
  } else if (phase === 'idle' && !isInteractiveScroll) {
    currentBaselineYRef.current = 1000;
  }

  // Track physical surface Y position for genuine upward pull and reverse-scroll retreat:
  // - Interactive scrubbing: surface translates upward from 100vh down to ~30vh
  // - When scrolling backward: surface smoothly retreats downward back to 100vh
  // - When committed to expanding: smoothly completes pull-up with natural deceleration into 0vh
  const currentSurfaceYRef = useRef(100);
  if (isInteractiveScroll && phase === 'idle') {
    currentSurfaceYRef.current = Math.max(0, Math.min(100, Math.round((1 - scrollFraction * 1.4) * 100)));
  } else if (phase === 'idle' && !isInteractiveScroll) {
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
        <motion.div
          className="fixed inset-0 z-[120] pointer-events-auto overflow-hidden select-none"
          initial={{ y: '0vh' }}
          animate={
            phase === 'exiting'
              ? {
                  y: '-100vh',
                  transition: { duration: 0.95, ease: [0.76, 0, 0.24, 1] },
                }
              : { y: '0vh' }
          }
          onAnimationComplete={() => {
            if (phase === 'exiting' && onExited) {
              onExited();
            }
          }}
        >
          {/* 
            ORGANIC BISCOTTI CREAM ADVANCING SURFACE:
            - When scrubbing: continuously morphs along an asymmetric fluid wave contour.
            - When committed: smoothly rolls up with continuous multi-keyframe contour morphing (wave0 -> wave4).
            - When exiting: lifts together with the loading surface to uncover the simulator underneath.
          */}
          <svg
            className="fixed inset-0 z-20 w-full h-full pointer-events-none"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
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
                  duration: 1.05,
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
            - Progressively emerges into the viewport through a controlled upward movement.
            - Starts from currentSurfaceYRef.current (100vh on button click, or current scroll position).
            - Follows reverse scrolling naturally without resetting or abrupt jumps.
            - Settles into place with smooth natural deceleration.
            - Loading animation (counter and reels) only begins after entrance is 100% complete.
          */}
          <motion.div
            className="fixed inset-0 z-30 flex items-center justify-center overflow-hidden"
            initial={{
              y: `${currentSurfaceYRef.current}vh`,
              opacity: triggerType === 'button' ? 0.65 : Math.min(1, Math.max(0.15, (100 - currentSurfaceYRef.current) / 45)),
            }}
            animate={
              isInteractiveScroll && phase === 'idle'
                ? {
                    y: `${currentSurfaceYRef.current}vh`,
                    opacity: Math.min(1, Math.max(0.15, (100 - currentSurfaceYRef.current) / 45)),
                    transition: { duration: 0.08, ease: 'easeOut' },
                  }
                : phase === 'expanding'
                ? {
                    y: '0vh',
                    opacity: 1,
                    transition: { duration: 1.05, ease: [0.16, 1, 0.3, 1] },
                  }
                : phase === 'loading' || phase === 'exiting'
                ? {
                    y: '0vh',
                    opacity: 1,
                    transition: { duration: 0.35, ease: 'easeOut' },
                  }
                : { y: '100vh', opacity: 0 }
            }
            onAnimationComplete={() => {
              if (phase === 'expanding') {
                setIsEntranceComplete(true);
                if (onExpanded) onExpanded();
              }
            }}
          >
            {/* 
              Loading page background:
              Anchored at the bottom at 3/8 height (37.5%) with lively undulating crest.
            */}
            {(isInteractiveScroll || phase === 'expanding' || phase === 'loading' || phase === 'exiting') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-x-0 bottom-0 h-[37.5%] pointer-events-none overflow-hidden z-10"
                style={{
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
            )}

            {/* Floating 3D green/white bubbles & cross shapes originating on the loading page */}
            {(isInteractiveScroll || phase === 'expanding' || phase === 'loading' || phase === 'exiting') && (
              <div className="absolute inset-0 z-[15] pointer-events-none">
                <Floating3DShapes isTransitioning={false} />
              </div>
            )}

            {/* Studio Card (Loading Screen) - Unified physical surface progressively pulled upward */}
            {(isInteractiveScroll || phase === 'expanding' || phase === 'loading' || phase === 'exiting') && (
              <div
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
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WordsPreloader;
