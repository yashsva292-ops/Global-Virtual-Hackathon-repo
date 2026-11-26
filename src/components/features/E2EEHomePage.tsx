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

  // Journey animation loop: 7.5s total cycle (3s Aarav steady -> Delivered slide -> BlockReveal wipe handoff to Meera)
  useEffect(() => {
    if (reducedMotion || isPaused) return;

    setJourneyPhase('animating');
    const cycleTime = 7500;

    const interval = setInterval(() => {
      runCryptoJourney();
      setJourneyPhase('idle');
      setTimeout(() => {
        setJourneyPhase('animating');
      }, 80);
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
          backgroundImage: 'url(./whatsapp-doodle.svg)',
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
          <img src="./assets/lock.svg" width="30" height="34" alt="Lock icon" className="transition-transform group-hover:scale-105" />
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
        <div className="relative w-full flex-1 flex flex-col lg:grid lg:grid-cols-[minmax(180px,1fr)_auto_minmax(180px,1fr)] items-center justify-items-center gap-6 lg:gap-8 my-auto">
          {/* LEFT: Aarav (Proportioned Editorial Illustration, Holding Phone) */}
          <div className="w-full flex flex-col items-center lg:items-end justify-center relative order-2 lg:order-1 pt-8 lg:pt-0">
            <div className="relative w-[175px] sm:w-[210px] md:w-[225px] lg:w-[235px] flex flex-col items-center">
              {/* Sent Speech Bubble Pop-up: Stays 3s, slides in "Delivered", then wipes away directly to the side (no fade) */}
              <motion.div
                initial={false}
                animate={
                  reducedMotion
                    ? { clipPath: 'inset(0 0% 0 0)', opacity: 1 }
                    : journeyPhase === 'animating'
                    ? {
                        clipPath: [
                          'inset(0 100% 0 0)',
                          'inset(0 0% 0 0)',
                          'inset(0 0% 0 0)',
                          'inset(0 0% 0 100%)',
                          'inset(0 0% 0 100%)',
                        ],
                      }
                    : { clipPath: 'inset(0 100% 0 0)' }
                }
                transition={{
                  duration: 7.5,
                  times: [0, 0.06, 0.56, 0.62, 1],
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="mb-2.5 sm:mb-0 sm:absolute sm:-top-11 sm:left-2 z-20 relative overflow-hidden bg-[#CFE3C9] border border-[#9EC098] text-[#153A32] text-sm sm:text-[15px] font-semibold px-4 py-2 rounded-t-2xl rounded-br-2xl shadow-[0_6px_16px_rgba(21,58,50,0.08)] whitespace-nowrap"
              >
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.16]"
                  style={{
                    backgroundImage: 'url(./whatsapp-doodle.svg)',
                    backgroundRepeat: 'repeat',
                    backgroundSize: '340px auto',
                  }}
                  aria-hidden="true"
                />
                <span className="relative z-10 inline-flex items-center gap-2">
                  <span>See you tomorrow?</span>
                  {/* Authentic WhatsApp single-tick -> double-tick -> blue double-tick */}
                  <span className="inline-flex items-center" aria-label="Delivered">
                    <svg width="18" height="11" viewBox="0 0 18 11" fill="none" aria-hidden="true">
                      <motion.path
                        d="M1.5 5.8L4.8 9.2L11.5 1.8"
                        strokeWidth="1.65"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={false}
                        animate={
                          reducedMotion
                            ? { opacity: 1, stroke: '#53BDEB' }
                            : journeyPhase === 'animating'
                            ? {
                                opacity: [0, 0, 1, 1, 1],
                                stroke: ['#667781', '#667781', '#667781', '#53BDEB', '#53BDEB'],
                              }
                            : { opacity: 0, stroke: '#667781' }
                        }
                        transition={{
                          duration: 7.5,
                          times: [0, 0.16, 0.22, 0.42, 1],
                        }}
                      />
                      <motion.path
                        d="M6.5 5.8L9.8 9.2L16.5 1.8"
                        strokeWidth="1.65"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={false}
                        animate={
                          reducedMotion
                            ? { opacity: 1, stroke: '#53BDEB' }
                            : journeyPhase === 'animating'
                            ? {
                                opacity: [0, 0, 1, 1],
                                stroke: ['#667781', '#667781', '#53BDEB', '#53BDEB'],
                              }
                            : { opacity: 0, stroke: '#667781' }
                        }
                        transition={{
                          duration: 7.5,
                          times: [0, 0.36, 0.42, 1],
                        }}
                      />
                    </svg>
                  </span>
                </span>
                {/* BlockReveal wipe overlay when Aarav's pop-up exits */}
                {!reducedMotion && (
                  <motion.div
                    initial={false}
                    animate={
                      journeyPhase === 'animating'
                        ? { scaleX: [0, 0, 1, 1, 0], originX: [0, 0, 0, 1, 1] }
                        : { scaleX: 0 }
                    }
                    transition={{
                      duration: 7.5,
                      times: [0, 0.53, 0.56, 0.62, 0.64],
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute inset-0 z-20 bg-[#176B50] pointer-events-none"
                    aria-hidden="true"
                  />
                )}
              </motion.div>

              {/* Aarav Vector Illustration Artwork */}
              <img
                src="./assets/aarav.svg"
                width={260}
                height={340}
                alt="Aarav holding his phone"
                className="w-full h-auto aspect-[260/340] object-contain drop-shadow-[0_10px_24px_rgba(21,58,50,0.08)] select-none"
              />

              {/* Restrained Endpoint Label */}
              <div className="text-center mt-2.5">
                <strong className="block text-xs sm:text-sm font-semibold text-[#153A32]">Aarav’s phone</strong>
                <span className="text-[11px] sm:text-xs text-[#52665F]">Encrypted here</span>
              </div>
            </div>
          </div>

          {/* CENTER: Focused Typography Zone with Exceptional Editorial Hierarchy */}
          <div className="w-full max-w-2xl flex flex-col items-center text-center px-2 sm:px-4 z-20 order-1 lg:order-2">
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

          {/* RIGHT: Meera (Proportioned Editorial Illustration, Holding Phone) */}
          <div className="w-full flex flex-col items-center lg:items-start justify-center relative order-3 pt-8 lg:pt-0">
            <div className="relative w-[175px] sm:w-[210px] md:w-[225px] lg:w-[235px] flex flex-col items-center">
              {/* Received Speech Bubble Pop-up: Wipes in from the side simultaneously as Aarav's wipes out (no fade) */}
              <motion.div
                initial={false}
                animate={
                  reducedMotion
                    ? { clipPath: 'inset(0 0% 0 0)', opacity: 1 }
                    : journeyPhase === 'animating'
                    ? {
                        clipPath: [
                          'inset(0 100% 0 0)',
                          'inset(0 100% 0 0)',
                          'inset(0 0% 0 0)',
                          'inset(0 0% 0 0)',
                          'inset(0 0% 0 100%)',
                        ],
                      }
                    : { clipPath: 'inset(0 100% 0 0)' }
                }
                transition={{
                  duration: 7.5,
                  times: [0, 0.56, 0.62, 0.93, 0.99],
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="mb-2.5 sm:mb-0 sm:absolute sm:-top-11 sm:right-2 z-20 relative overflow-hidden bg-[#CFE3C9] border border-[#9EC098] text-[#153A32] text-sm sm:text-[15px] font-semibold px-4 py-2 rounded-t-2xl rounded-bl-2xl shadow-[0_6px_16px_rgba(21,58,50,0.08)] whitespace-nowrap"
              >
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.16]"
                  style={{
                    backgroundImage: 'url(./whatsapp-doodle.svg)',
                    backgroundRepeat: 'repeat',
                    backgroundSize: '340px auto',
                  }}
                  aria-hidden="true"
                />
                <span className="relative z-10 inline-flex items-center gap-2">
                  <span>See you tomorrow?</span>
                  <motion.span
                    initial={false}
                    animate={
                      reducedMotion
                        ? { opacity: 1, scale: 1 }
                        : journeyPhase === 'animating'
                        ? { opacity: [0, 0, 1, 1], scale: [0.85, 0.85, 1, 1] }
                        : { opacity: 0 }
                    }
                    transition={{
                      duration: 7.5,
                      times: [0, 0.61, 0.67, 1],
                    }}
                    className="inline-flex items-center text-[#53BDEB]"
                    aria-label="Read"
                  >
                    <svg width="18" height="11" viewBox="0 0 18 11" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M1.5 5.8L4.8 9.2L11.5 1.8" />
                      <path d="M6.5 5.8L9.8 9.2L16.5 1.8" />
                    </svg>
                  </motion.span>
                </span>
                {/* BlockReveal wipe overlay on Meera's pop-up entry and exit */}
                {!reducedMotion && (
                  <motion.div
                    initial={false}
                    animate={
                      journeyPhase === 'animating'
                        ? { scaleX: [0, 0, 1, 0, 0, 1, 0], originX: [0, 0, 0, 1, 0, 0, 1] }
                        : { scaleX: 0 }
                    }
                    transition={{
                      duration: 7.5,
                      times: [0, 0.56, 0.60, 0.65, 0.92, 0.96, 1],
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute inset-0 z-20 bg-[#176B50] pointer-events-none"
                    aria-hidden="true"
                  />
                )}
              </motion.div>

              {/* Meera Vector Illustration Artwork */}
              <img
                src="./assets/meera.svg"
                width={260}
                height={340}
                alt="Meera holding her phone"
                className="w-full h-auto aspect-[260/340] object-contain drop-shadow-[0_10px_24px_rgba(21,58,50,0.08)] select-none"
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
