import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RubiksCubeLoader } from './ui/rubiks-cube-loader';
import { EncryptedText } from './ui/encrypted-text';
import { SoffitGradient, type SoffitGradientConfig } from './SoffitGradient';

export type DeepDivePreloaderPhase = 'idle' | 'expanding' | 'loading' | 'exiting';

interface DeepDivePreloaderProps {
  phase: DeepDivePreloaderPhase;
  buttonOrigin?: { x: number; y: number } | null;
  text?: string;
  onExpanded?: () => void;
  onLoadingComplete?: () => void;
  onExited?: () => void;
}

export const DeepDivePreloader: React.FC<DeepDivePreloaderProps> = ({
  phase,
  buttonOrigin,
  text = 'Welcome to the Matrix, Neo.',
  onExpanded,
  onLoadingComplete,
  onExited,
}) => {
  const [isDecrypted, setIsDecrypted] = useState(false);

  useEffect(() => {
    if (phase === 'loading') {
      setIsDecrypted(false);
    }
  }, [phase]);

  // When text finishes decrypting, hold briefly then signal loading complete
  const handleDecryptionComplete = () => {
    setIsDecrypted(true);
    const completeTimer = setTimeout(() => {
      if (onLoadingComplete) {
        onLoadingComplete();
      }
    }, 700);

    return () => clearTimeout(completeTimer);
  };

  const originX = buttonOrigin ? `${Math.round(buttonOrigin.x)}px` : '50%';
  const originY = buttonOrigin ? `${Math.round(buttonOrigin.y)}px` : 'calc(100% - 70px)';

  // Organic circular & elliptical curtain expanding from the clicked bubble button
  const initialClip = `ellipse(0px 0px at ${originX} ${originY})`;
  const expandingWarpClip = `ellipse(120vw 100vh at ${originX} ${originY})`;
  const fullCoverClip = `ellipse(220vw 220vh at ${originX} ${originY})`;
  const customEase = [0.16, 1, 0.3, 1] as const;

  const isVisible = phase !== 'idle';

  // Ambient fluid backdrop configuration
  const soffitConfig: SoffitGradientConfig = {
    bgColor: '#075e54',
    colorA: '#00a884',
    colorB: '#128c7e',
    colorC: '#25d366',
    colorD: '#0b141a',
    scale: 0.85,
    speed: 0.4,
    tilt: 0.0,
    rock: 0.06,
    horizon: -0.15,
    breathe: 0.25,
    spread: 0.6,
    curve: 2.8,
    direct: 0.85,
    bounce: 0.25,
    bounceCurve: 2.5,
    spillCentre: 0.0,
    spillWidth: 1.8,
    spillFloor: 0.2,
    amount: 0.28,
    warp: 2.2,
    warpScale: 0.65,
    flow: 0.38,
    roughness: 0.35,
    lacunarity: 2.0,
    motes: 0.05,
    moteScale: 7,
    ambient: 0.32,
    contrast: 1.8,
    midpoint: 0.55,
    sink: 0.22,
    glow: 0.55,
    grain: 0.04,
    grainAnim: 0,
    dither: 0.8,
    vignette: 0.15,
    steer: 0.0,
    lift: 0.08,
    sweep: 0.2,
    cursor: 1,
    parallax: 0.008,
    maxDpr: 1,
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[120] pointer-events-auto overflow-hidden select-none">
          <motion.div
            className="fixed inset-0 z-30 flex flex-col items-center justify-center overflow-hidden bg-[#0b141a]"
            initial={{
              clipPath: initialClip,
              backgroundColor: 'rgba(11, 20, 26, 0.0)',
            }}
            animate={
              phase === 'expanding'
                ? {
                    clipPath: [initialClip, expandingWarpClip, fullCoverClip],
                    backgroundColor: ['rgba(11, 20, 26, 0.3)', 'rgba(11, 20, 26, 0.8)', '#0b141a'],
                    transition: {
                      clipPath: { duration: 0.95, ease: customEase, times: [0, 0.5, 1] },
                      backgroundColor: { duration: 0.85, ease: 'easeInOut' },
                    },
                  }
                : phase === 'loading'
                ? {
                    clipPath: fullCoverClip,
                    backgroundColor: '#0b141a',
                  }
                : phase === 'exiting'
                ? {
                    y: '-100vh',
                    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const },
                  }
                : {}
            }
            onAnimationComplete={() => {
              if (phase === 'expanding' && onExpanded) {
                onExpanded();
              } else if (phase === 'exiting' && onExited) {
                onExited();
              }
            }}
          >
            {/* Ambient Background Gradient Glow */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <SoffitGradient config={soffitConfig} className="w-full h-full" />
            </div>

            {/* Dark vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0b141a]/80 via-transparent to-[#0b141a]/95 pointer-events-none" />

            {/* Combined Preloader Content (Rubik's Cube Top + Encrypted Text Bottom) */}
            <AnimatePresence>
              {phase === 'loading' && (
                <motion.div
                  key="deep-dive-preloader-content"
                  initial={{ opacity: 0, scale: 0.92, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="relative z-20 flex flex-col items-center justify-center gap-12 sm:gap-14 px-6 text-center max-w-3xl"
                >
                  {/* Upwards: Rubik's Cube Preloader (Preloader 1) */}
                  <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
                    <RubiksCubeLoader size={1.15} squareColor="#ffffff" />
                  </div>

                  {/* Downwards: Encrypted Text Preloader (Preloader 2) at a slightly bigger size */}
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold tracking-tight text-center leading-relaxed">
                      <EncryptedText
                        text={text}
                        revealDelayMs={45}
                        flipDelayMs={45}
                        encryptedClassName="text-[#00a884]/65 font-mono drop-shadow-[0_0_8px_rgba(0,168,132,0.5)]"
                        revealedClassName="text-white font-mono drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]"
                        onComplete={handleDecryptionComplete}
                      />
                    </p>

                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isDecrypted ? 0.9 : 0.4 }}
                      transition={{ duration: 0.3 }}
                      className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-[#25d366]"
                    >
                      {isDecrypted ? 'Decryption Complete • Entering Experience' : 'Establishing Secure E2EE Tunnel...'}
                    </motion.span>
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

export default DeepDivePreloader;
