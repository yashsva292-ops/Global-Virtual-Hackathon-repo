import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { newSession, seal, receive, hex } from '../../lib/simulation/teachingProtocolEngine';
import { BlockReveal } from '../ui/BlockReveal';
import { DotExpandButton } from '../ui/DotExpandButton';

interface E2EEHomePageProps {
  onNavigateToSimulator: (origin?: { x: number; y: number }) => void;
  isInitialReady?: boolean;
}

export const E2EEHomePage: React.FC<E2EEHomePageProps> = ({ onNavigateToSimulator, isInitialReady = true }) => {
  const reducedMotion = useReducedMotion();
  const [ciphertext, setCiphertext] = useState<string>('c9f1 82ae 0b7d 44e3 91a0');
  const [journeyPhase, setJourneyPhase] = useState<'idle' | 'animating'>('animating');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Compute live cryptographic ciphertext for "See you tomorrow?" using Web Crypto ECDH + HKDF + AES-GCM
  const runCryptoJourney = async () => {
    try {
      const session = await newSession();
      const packet = await seal(session, 'See you tomorrow?');
      await receive(session, packet);
      const rawHex = hex(packet.ciphertext);
      // Group ciphertext into 4-character blocks as shown in reference
      const formatted = rawHex.slice(0, 24).match(/.{1,4}/g)?.join(' ') || rawHex.slice(0, 20);
      setCiphertext(formatted);
    } catch {
      setCiphertext('7b42 a9e1 f08c 33d7 59e2');
    }
  };

  useEffect(() => {
    runCryptoJourney();
  }, []);

  // Journey animation loop: ~5.6s total cycle with pauses at key points
  useEffect(() => {
    if (reducedMotion || isPaused) return;

    setJourneyPhase('animating');
    const cycleTime = 5600;

    const interval = setInterval(() => {
      runCryptoJourney();
      setJourneyPhase('idle');
      setTimeout(() => {
        setJourneyPhase('animating');
      }, 100);
    }, cycleTime);

    return () => clearInterval(interval);
  }, [reducedMotion, isPaused]);

  const handleReplay = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setJourneyPhase('idle');
    runCryptoJourney();
    setTimeout(() => {
      setJourneyPhase('animating');
    }, 60);
  };

  return (
    <div
      className="relative w-full min-h-screen overflow-x-hidden select-none bg-[#F7F4EC] text-[#153A32]"
      style={{
        fontFamily: "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* 
        Authentic WhatsApp Doodle Wallpaper Background:
        - Carefully refined background-to-foreground separation:
        - Radial mask creates an editorial clearing in the central text zone (fading doodles to ~0.03 directly behind typography)
        - Preserves crisp, balanced visibility of doodles (~0.14) around the periphery and behind the illustrated characters.
      */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        style={{
          opacity: 0.15,
          backgroundImage: 'url(/whatsapp-doodle.svg)',
          backgroundSize: '440px 799px',
          backgroundRepeat: 'repeat',
          maskImage: 'radial-gradient(ellipse 65% 55% at 50% 44%, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.20) 40%, rgba(0,0,0,0.75) 75%, black 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 65% 55% at 50% 44%, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.20) 40%, rgba(0,0,0,0.75) 75%, black 100%)',
        }}
      />

      {/* Subtle central luminous aura: soft ambient tonal separation providing pristine legibility without artificial shadows */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] max-w-[900px] h-[55vh] z-0 rounded-full"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255, 254, 250, 0.75) 0%, rgba(247, 244, 236, 0.4) 50%, rgba(247, 244, 236, 0) 80%)',
        }}
      />

      {/* Top Site Navigation Bar matching Reference Layout */}
      <header className="sticky top-0 z-40 flex items-center justify-between h-[76px] sm:h-[86px] px-6 sm:px-12 border-b border-[#D3DBCF] bg-[#F7F4EC]/95 backdrop-blur-md">
        <a href="#top" className="flex items-center gap-2.5 text-decoration-none group">
          <img src="/assets/lock.svg" width="30" height="34" alt="Lock icon" className="transition-transform group-hover:scale-105" />
          <span className="text-xs sm:text-sm font-normal text-[#153A32] leading-tight tracking-tight">
            Delivered,<br />
            <b className="font-bold">never read.</b>
          </span>
        </a>

        <div className="flex items-center gap-4">
        </div>
      </header>

      {/* Main Hero Container */}
      <main id="top" className="relative z-10 max-w-[1500px] mx-auto min-h-[calc(100vh-86px)] flex flex-col justify-between px-4 sm:px-8 md:px-12 pt-8 pb-14">
        {/*
          Side-by-Side Desktop Composition:
          - Left Character (Aarav): ~22–25% width
          - Central Text Zone: ~50–56% width (Centered Title & Action)
          - Right Character (Meera): ~22–25% width
          Framing the central title seamlessly without overlapping text.
        */}
        <div className="relative w-full flex-1 flex flex-col lg:flex-row items-center justify-between gap-6 my-auto">
          {/* LEFT: Aarav (Enlarged, Facing Inward, Holding Phone) */}
          <div className="w-full lg:w-[24%] flex flex-col items-center lg:items-end justify-center relative order-2 lg:order-1 pt-6 lg:pt-0">
            <div className="relative w-[180px] sm:w-[220px] md:w-[250px] lg:w-[270px]">
              {/* Sent Speech Bubble */}
              <motion.div
                initial={false}
                animate={
                  reducedMotion
                    ? { opacity: 1 }
                    : journeyPhase === 'animating'
                    ? { opacity: [1, 1, 0.55, 0.55, 1], y: [0, 0, 0, 0, 0] }
                    : { opacity: 1 }
                }
                transition={{ duration: 5.6, times: [0, 0.15, 0.35, 0.9, 1] }}
                className="absolute -top-7 sm:-top-8 left-6 sm:left-10 z-20 bg-[#FFFEF9] border border-[#CCD7C7] text-[#153A32] text-xs sm:text-sm font-medium px-3 sm:px-3.5 py-1.5 rounded-t-xl rounded-br-xl shadow-[0_6px_16px_rgba(21,58,50,0.06)] whitespace-nowrap"
              >
                See you tomorrow?
              </motion.div>

              {/* Aarav Vector Illustration Artwork */}
              <img
                src="/assets/aarav.svg"
                alt="Aarav holding his phone"
                className="w-full h-auto object-contain drop-shadow-md select-none"
              />

              {/* Restrained Endpoint Label */}
              <div className="text-center mt-2.5">
                <strong className="block text-xs sm:text-sm font-semibold text-[#153A32]">Aarav’s phone</strong>
                <span className="text-[11px] sm:text-xs text-[#52665F]">Encrypted here</span>
              </div>
            </div>
          </div>

          {/* CENTER: Focused Typography Zone with Exceptional Editorial Hierarchy */}
          <div className="w-full lg:w-[56%] flex flex-col items-center text-center px-2 sm:px-6 z-20 order-1 lg:order-2">
            {/* The Syntax Unveilers present - Refined Secondary Kicker */}
            <p className="text-[11px] sm:text-xs font-semibold tracking-[0.22em] uppercase text-[#176B50]/85 mb-3 sm:mb-4 select-none">
              The Syntax Unveilers present
            </p>

            {/* Prominent Two-Line Serif Headline with One-Time Stylish Block Reveal Effect */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[70px] xl:text-[76px] font-normal leading-[1.08] tracking-tight text-[#113129] max-w-3xl w-full flex flex-col items-center justify-center drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              <BlockReveal delay={200} duration={0.5} blockColor="#176B50" isReady={isInitialReady}>
                <span className="whitespace-nowrap">How does end-to-end</span>
              </BlockReveal>
              <BlockReveal delay={480} duration={0.5} blockColor="#176B50" isReady={isInitialReady}>
                <span className="whitespace-nowrap">
                  <em className="italic text-[#176B50] font-normal">encryption</em> work?
                </span>
              </BlockReveal>
            </h1>

            {/* Balanced Supporting Explainer Text */}
            <p className="text-base sm:text-lg text-[#475B54] leading-relaxed max-w-md mt-5 mb-7">
              Your message travels a long way.<br className="hidden sm:inline" />
              How does it stay between the two of you?
            </p>

            {/* Primary Action Button with Expanding Dot Pill Micro-Interaction */}
            <DotExpandButton
              text="Scroll to find out in 2 minutes"
              onClick={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                const origin = {
                  x: rect.left + rect.width / 2,
                  y: rect.top + rect.height / 2,
                };
                onNavigateToSimulator(origin);
              }}
            />
          </div>

          {/* RIGHT: Meera (Enlarged, Facing Inward, Holding Phone) */}
          <div className="w-full lg:w-[24%] flex flex-col items-center lg:items-start justify-center relative order-3 pt-6 lg:pt-0">
            <div className="relative w-[180px] sm:w-[220px] md:w-[250px] lg:w-[270px]">
              {/* Received Speech Bubble: Decrypts when packet arrives */}
              <motion.div
                initial={false}
                animate={
                  reducedMotion
                    ? { opacity: 1 }
                    : journeyPhase === 'animating'
                    ? { opacity: [0, 0, 0, 0, 1, 1], y: [6, 6, 6, 6, 0, 0], scale: [0.95, 0.95, 0.95, 0.95, 1, 1] }
                    : { opacity: 1 }
                }
                transition={{ duration: 5.6, times: [0, 0.72, 0.82, 0.86, 0.92, 1] }}
                className="absolute -top-7 sm:-top-8 right-6 sm:right-10 z-20 bg-[#FFFEF9] border border-[#CCD7C7] text-[#153A32] text-xs sm:text-sm font-medium px-3 sm:px-3.5 py-1.5 rounded-t-xl rounded-bl-xl shadow-[0_6px_16px_rgba(21,58,50,0.06)] whitespace-nowrap"
              >
                See you tomorrow?
              </motion.div>

              {/* Meera Vector Illustration Artwork */}
              <img
                src="/assets/meera.svg"
                alt="Meera holding her phone"
                className="w-full h-auto object-contain drop-shadow-md select-none"
              />

              {/* Restrained Endpoint Label */}
              <div className="text-center mt-2.5">
                <strong className="block text-xs sm:text-sm font-semibold text-[#153A32]">Meera’s phone</strong>
                <span className="text-[11px] sm:text-xs text-[#52665F]">Decrypted here</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default E2EEHomePage;
