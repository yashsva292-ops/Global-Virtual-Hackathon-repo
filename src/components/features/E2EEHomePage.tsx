import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { newSession, seal, receive, hex } from '../../lib/simulation/teachingProtocolEngine';

interface E2EEHomePageProps {
  onNavigateToSimulator: () => void;
  isInitialReady?: boolean;
}

export const E2EEHomePage: React.FC<E2EEHomePageProps> = ({ onNavigateToSimulator }) => {
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
        WhatsApp-Style Chat Doodles Background:
        Fine SVG vector doodles (chat bubbles, paper planes, phones, locks, keys, stars, speech marks)
        rendered at 9% opacity with a soft radial center mask so the center title is clean and legible.
      */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        style={{
          opacity: 0.09,
          maskImage: 'radial-gradient(ellipse 65% 55% at 50% 45%, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.95) 75%, black 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 65% 55% at 50% 45%, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.95) 75%, black 100%)',
        }}
      >
        <svg className="w-full h-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="chat-doodles" width="220" height="220" patternUnits="userSpaceOnUse">
              {/* Lock & Key */}
              <g stroke="#153A32" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                {/* Lock */}
                <rect x="25" y="35" width="24" height="20" rx="4" />
                <path d="M31 35 V27 C31 22 43 22 43 27 V35" />
                <circle cx="37" cy="44" r="2.5" fill="#153A32" />
                {/* Key */}
                <circle cx="165" cy="40" r="6" />
                <path d="M171 40 L190 40 M182 40 V46 M187 40 V45" />
                {/* Speech Bubble */}
                <path d="M30 140 C20 140 16 150 16 160 C16 172 26 178 38 178 L38 188 L48 178 C60 178 68 170 68 160 C68 148 58 140 30 140 Z" />
                {/* Paper Plane */}
                <path d="M160 145 L200 130 L180 180 L168 156 Z M180 140 L168 156" />
                {/* Phone */}
                <rect x="95" y="80" width="18" height="30" rx="3" />
                <line x1="101" y1="83" x2="107" y2="83" />
                <circle cx="104" cy="105" r="1.5" />
                {/* Stars / Glints */}
                <path d="M125 30 L127 36 L133 38 L127 40 L125 46 L123 40 L117 38 L123 36 Z" />
                <path d="M100 175 L101 179 L105 180 L101 181 L100 185 L99 181 L95 180 L99 179 Z" />
                {/* Curved handwritten notes */}
                <path d="M60 85 Q75 75 90 85 T110 85" strokeDasharray="3 3" />
                <path d="M130 150 C140 165 155 160 160 155" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#chat-doodles)" />
        </svg>
      </div>

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
          <button
            onClick={onNavigateToSimulator}
            className="rounded-full border border-[#BAC8BB] px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium text-[#153A32] hover:bg-[#E3EDE3] transition-colors cursor-pointer"
          >
            Try it yourself
          </button>
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

          {/* CENTER: Centered Title, Subtitle, and Primary Button */}
          <div className="w-full lg:w-[52%] flex flex-col items-center text-center px-2 sm:px-6 z-20 order-1 lg:order-2">
            {/* The Syntax Unveilers present */}
            <p className="text-[11px] sm:text-xs font-semibold tracking-[0.14em] uppercase text-[#176B50] mb-3 sm:mb-4">
              The Syntax Unveilers present
            </p>

            {/* Exact Reference Heading */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-normal leading-[1.05] tracking-tight text-[#153A32] max-w-2xl"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              How does end-to-end<br />
              <em className="italic text-[#176B50] font-normal">encryption</em> work?
            </h1>

            {/* Exact Reference Supporting Text */}
            <p className="text-sm sm:text-base md:text-lg text-[#52665F] leading-relaxed max-w-lg mt-5 mb-6">
              Your message travels a long way.<br className="hidden sm:inline" />
              How does it stay between the two of you?
            </p>

            {/* Primary Action Button */}
            <button
              onClick={onNavigateToSimulator}
              className="inline-flex items-center justify-center min-h-[50px] px-8 py-3.5 rounded-lg bg-[#176B50] hover:bg-[#12553F] active:translate-y-0.5 text-white font-semibold text-sm sm:text-base shadow-[0_4px_0_#104B39] transition-all cursor-pointer"
            >
              Find out in 2 minutes
            </button>

            {/* Supporting Line */}
            <p className="text-xs text-[#52665F] mt-3 sm:mt-3.5">
              A message you write. An experiment you control.
            </p>
          </div>

          {/* RIGHT: Meera (Enlarged, Facing Inward, Holding Phone) */}
          <div className="w-full lg:w-[24%] flex flex-col items-center lg:items-start justify-center relative order-3 pt-6 lg:pt-0">
            <div className="relative w-[180px] sm:w-[220px] md:w-[250px] lg:w-[270px]">
              {/* Received Speech Bubble */}
              <motion.div
                initial={false}
                animate={
                  reducedMotion
                    ? { opacity: 1 }
                    : journeyPhase === 'animating'
                    ? { opacity: [0, 0, 0, 1, 1], y: [6, 6, 6, 0, 0] }
                    : { opacity: 1 }
                }
                transition={{ duration: 5.6, times: [0, 0.75, 0.82, 0.9, 1] }}
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

        {/* 
          FLOATING MESSAGE JOURNEY:
          Gentle curved path overarching the scene:
          - Rises from Aarav's phone on the left carrying ciphertext.
          - Floats above the scene without crossing words or button.
          - Emphasises/magnifies the live computed ciphertext at the apex.
          - Decrypts when arriving at Meera's phone.
        */}
        <div className="relative w-full max-w-4xl mx-auto mt-6 pt-4 border-t border-[#D3DBCF]/80 flex flex-col items-center">
          {/* Animated Journey Curve & Travelling Cipher Packet */}
          <div className="relative w-full h-[70px] sm:h-[84px] overflow-visible">
            {/* Dashed Sage Journey Arc Line */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 800 80"
              preserveAspectRatio="none"
            >
              <path
                d="M 60 70 C 220 70, 240 10, 400 10 C 560 10, 580 70, 740 70"
                fill="none"
                stroke="#8BA78D"
                strokeWidth="1.6"
                strokeDasharray="4 6"
              />
            </svg>

            {/* Travelling Cipher Packet */}
            <motion.div
              initial={false}
              animate={
                reducedMotion
                  ? { left: '50%', top: '10px', opacity: 1, scale: 1 }
                  : journeyPhase === 'animating'
                  ? {
                      left: ['8%', '16%', '50%', '50%', '84%', '92%'],
                      top: ['65px', '45px', '10px', '10px', '45px', '65px'],
                      opacity: [0, 1, 1, 1, 1, 0],
                      scale: [0.75, 0.88, 1.05, 1.05, 0.88, 0.75],
                    }
                  : { opacity: 0 }
              }
              transition={{
                duration: 5.6,
                times: [0, 0.15, 0.42, 0.58, 0.85, 1],
                ease: 'easeInOut',
              }}
              style={{ transform: 'translate(-50%, -50%)' }}
              className="absolute z-30 inline-flex items-center gap-2 rounded-full bg-[#153A32] text-[#F7F4EC] px-3.5 sm:px-4 py-1.5 shadow-[0_6px_20px_rgba(21,58,50,0.18)] border border-[#21493F] whitespace-nowrap"
            >
              <svg width="14" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4E5C9" strokeWidth="2">
                <rect x="5" y="10" width="14" height="11" rx="2" />
                <path d="M8 10V6a4 4 0 018 0v4" />
              </svg>
              <span className="font-mono text-[11px] sm:text-xs tracking-wider text-[#D8E5CA]">
                {ciphertext}
              </span>
            </motion.div>
          </div>

          {/* Central Relay Caption and Journey Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-3xl mt-2 text-center sm:text-left gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#52665F]">
              <span className="text-[#176B50] font-serif text-lg leading-none">⌁</span>
              <strong className="font-semibold text-[#153A32]">The relay:</strong>
              <span>Passes it on. Cannot read it.</span>
            </div>

            {/* Replay & Accessibility Motion Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleReplay}
                className="text-xs text-[#176B50] hover:text-[#12553F] underline underline-offset-4 cursor-pointer font-medium"
              >
                Replay the journey
              </button>
              <span className="text-[#D3DBCF]">|</span>
              <button
                onClick={() => setIsPaused((prev) => !prev)}
                className="text-xs text-[#52665F] hover:text-[#153A32] cursor-pointer"
                aria-label={isPaused ? 'Resume journey animation' : 'Pause journey animation'}
              >
                {isPaused ? 'Resume animation' : 'Pause animation'}
              </button>
            </div>
          </div>
        </div>

        {/* Hero Baseline Footer matching Reference System */}
        <div className="w-full flex items-center justify-between pt-6 border-t border-[#D3DBCF] text-[11px] sm:text-xs text-[#52665F] font-mono tracking-wider mt-4">
          <span className="hidden sm:inline">PRIVATE AT BOTH ENDS</span>
          <span className="mx-auto sm:mx-0 font-sans tracking-normal">Scroll to follow a message &darr;</span>
          <span className="hidden sm:inline">CURIOUS IN BETWEEN</span>
        </div>
      </main>
    </div>
  );
};

export default E2EEHomePage;
