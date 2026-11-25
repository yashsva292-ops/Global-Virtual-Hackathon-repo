import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PersonSender, PersonReceiver } from './PersonCharacter';
import { WhatsAppPhoneChat } from './WhatsAppPhoneChat';
import { FloatingMessageParticles } from './FloatingMessageParticles';
import { Lock, Unlock, ArrowRight, ShieldCheck, RefreshCw, EyeOff, Radio } from 'lucide-react';

interface InteractiveE2EEJourneyProps {
  onExploreMore?: () => void;
}

// Simple Caesar cipher helper to produce realistic ciphertext
function encryptCaesar(text: string, shift = 3): string {
  return text
    .split('')
    .map((c) => {
      const code = c.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCharCode(((code - 65 + shift) % 26) + 65);
      if (code >= 97 && code <= 122) return String.fromCharCode(((code - 97 + shift) % 26) + 97);
      return c;
    })
    .join('');
}

// Random gibberish generator for the 1.5-second scrambling effect
function randomScramble(len: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  let out = '';
  for (let i = 0; i < len; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

export type JourneyState =
  | 'idle_scroll'      // User scrolls down, characters visible, floating particles active
  | 'phone_zoomed'     // Phone zoomed in, 1:1 WhatsApp chat opened
  | 'encrypting'       // Phone zoomed out, plaintext shown above Alice, scrambling for 1.5s
  | 'in_transit'       // Ciphertext packet traveling along trail towards Bob
  | 'decrypting'       // Packet at Bob, scrambling for 1.5s back to plaintext
  | 'delivered';       // Plaintext verified at Bob!

export const InteractiveE2EEJourney: React.FC<InteractiveE2EEJourneyProps> = ({ onExploreMore }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [journeyState, setJourneyState] = useState<JourneyState>('idle_scroll');

  const [plaintextMessage, setPlaintextMessage] = useState('MEET AT DAWN');
  const [cipherMessage, setCipherMessage] = useState('PHHW DW GDZQ');
  const [currentDisplayText, setCurrentDisplayText] = useState('MEET AT DAWN');
  const [scrollProgress, setScrollProgress] = useState(0.2);

  // Prevent background page scrolling when phone modal is showing
  useEffect(() => {
    if (journeyState === 'phone_zoomed') {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      const preventScroll = (e: Event) => {
        // If event is inside phone screen scroll container, allow it; otherwise prevent background scroll
        const target = e.target as HTMLElement | null;
        if (target && target.closest('.overflow-y-auto')) {
          return;
        }
        e.preventDefault();
      };

      window.addEventListener('wheel', preventScroll, { passive: false });
      window.addEventListener('touchmove', preventScroll, { passive: false });

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
        window.removeEventListener('wheel', preventScroll);
        window.removeEventListener('touchmove', preventScroll);
      };
    }
  }, [journeyState]);

  // Track scroll position to automatically trigger phone zoom when Person 1 is centered
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // When the journey section is comfortably in view
      const progress = Math.min(1, Math.max(0, (windowHeight - rect.top) / (rect.height + windowHeight)));
      setScrollProgress(progress);

      // Auto-trigger zoom when scrolling deep into the section if still idle
      if (journeyState === 'idle_scroll' && rect.top <= windowHeight * 0.35 && rect.bottom >= windowHeight * 0.5) {
        setJourneyState('phone_zoomed');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [journeyState]);

  // When user clicks Send on the zoomed WhatsApp phone
  const handleSendMessage = (msg: string) => {
    const original = msg.toUpperCase();
    const cipher = encryptCaesar(original, 3);
    setPlaintextMessage(original);
    setCipherMessage(cipher);
    setCurrentDisplayText(original);

    // 1. Phone zooms out immediately
    setJourneyState('encrypting');

    // 2. Perform 1.5 seconds scramble from Plaintext -> Ciphertext
    const scrambleStart = performance.now();
    const scrambleDuration = 1500; // EXACTLY 1.5 SECONDS as specified
    const interval = setInterval(() => {
      const elapsed = performance.now() - scrambleStart;
      if (elapsed >= scrambleDuration) {
        clearInterval(interval);
        setCurrentDisplayText(cipher);

        // 3. Start packet transit along the trail to Bob
        setJourneyState('in_transit');

        // Transit duration: 2.5 seconds along the curved trail
        setTimeout(() => {
          // 4. Packet arrives at Bob -> 1.5 seconds decryption
          setJourneyState('decrypting');

          const decryptStart = performance.now();
          const decryptInterval = setInterval(() => {
            const decElapsed = performance.now() - decryptStart;
            if (decElapsed >= scrambleDuration) {
              clearInterval(decryptInterval);
              setCurrentDisplayText(original);
              setJourneyState('delivered');
            } else {
              setCurrentDisplayText(randomScramble(original.length));
            }
          }, 45);
        }, 2500);
      } else {
        // Active scrambling gibberish
        setCurrentDisplayText(randomScramble(original.length));
      }
    }, 45);
  };

  const handleReset = () => {
    setJourneyState('phone_zoomed');
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[110vh] flex flex-col justify-between items-center py-12 px-4 sm:px-8 overflow-hidden select-none"
    >
      {/* Floating Message Particles (dissolve when phone is zoomed in) */}
      <FloatingMessageParticles
        scrollYProgress={scrollProgress}
        isDissolved={journeyState !== 'idle_scroll'}
      />

      {/* Section Subtitle & Status Badge */}
      <div className="relative z-20 flex flex-col items-center text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 border border-[#d1d7db] text-[#075e54] text-xs font-semibold shadow-xs mb-3">
          <ShieldCheck className="w-4 h-4 text-[#00a884]" />
          <span>Live Device-to-Device Cryptography</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-[#111b21] tracking-tight">
          How Your Message Travels
        </h2>
        <p className="text-xs sm:text-sm text-[#54656f] mt-1.5 max-w-md">
          {journeyState === 'idle_scroll' && 'Scroll to center Alice, or tap her phone to type a secret message.'}
          {journeyState === 'phone_zoomed' && 'Type any message inside the authentic WhatsApp chat and click Send!'}
          {journeyState === 'encrypting' && '🔒 Alice’s device encrypts the message locally using her private key (1.5s)...'}
          {journeyState === 'in_transit' && '⚡ Traveling across public networks. Eavesdroppers only see scrambled ciphertext!'}
          {journeyState === 'decrypting' && '🔑 Bob’s device receives the packet and decrypts it with the matching key (1.5s)...'}
          {journeyState === 'delivered' && '🎉 Delivered securely! Both endpoints verified without anyone in between reading it.'}
        </p>
      </div>

      {/* 
        The Main Interactive Arena:
        Left: Person 1 (Alice)
        Center: Curved Trail & Traveling Packet
        Right: Person 2 (Bob)
      */}
      <div className="relative z-20 w-full max-w-6xl min-h-[460px] flex items-center justify-between px-2 sm:px-8 my-auto">
        {/* ================= LEFT: Person 1 (Alice) ================= */}
        <div className="relative flex flex-col items-center">
          {/* Speech Prompt above Alice's head */}
          <AnimatePresence>
            {(journeyState === 'encrypting' || journeyState === 'in_transit') && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute -top-24 sm:-top-28 z-30 flex flex-col items-center"
              >
                <div
                  className={`px-4 py-2 rounded-2xl shadow-lg border text-center transition-all duration-300 ${
                    journeyState === 'encrypting'
                      ? 'bg-[#111b21] border-[#00a884] text-white shadow-[#00a884]/20'
                      : 'bg-white border-[#d1d7db] text-[#111b21]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 justify-center mb-0.5">
                    {journeyState === 'encrypting' ? (
                      <Lock className="w-3.5 h-3.5 text-[#25d366] animate-pulse" />
                    ) : (
                      <span className="text-[10px] text-[#00a884] font-semibold uppercase tracking-wider">
                        Plaintext Sent
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-[#8696a0]">Alice's Device</span>
                  </div>
                  <p className="text-sm sm:text-base font-mono font-bold tracking-wider">
                    {journeyState === 'encrypting' ? currentDisplayText : plaintextMessage}
                  </p>
                </div>
                {/* Speech tail */}
                <div
                  className={`w-3 h-3 rotate-45 -mt-1.5 ${
                    journeyState === 'encrypting' ? 'bg-[#111b21]' : 'bg-white'
                  }`}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Person 1 SVG */}
          <PersonSender
            isPhoneZoomed={journeyState === 'phone_zoomed'}
            onPhoneClick={() => setJourneyState('phone_zoomed')}
          />
          <div className="mt-2 text-center">
            <span className="text-xs font-bold text-[#111b21]">Alice</span>
            <span className="block text-[11px] text-[#54656f]">Sender (Local Device)</span>
          </div>
        </div>

        {/* ================= CENTER: Curved Trail & Traveling Packet ================= */}
        <div className="relative flex-1 h-64 mx-2 sm:mx-6 flex items-center justify-center">
          {/* SVG Following Trail connecting Alice to Bob */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            <defs>
              <linearGradient id="trailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00a884" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#25d366" stopOpacity="1" />
                <stop offset="100%" stopColor="#075e54" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Base subtle guide line */}
            <path
              d="M 20 130 C 140 30, 260 230, 380 130"
              fill="none"
              stroke="#d1d7db"
              strokeWidth="3"
              strokeDasharray="6 6"
              className="w-full"
            />

            {/* Active glowing trail when message is in transit */}
            {journeyState === 'in_transit' && (
              <motion.path
                d="M 20 130 C 140 30, 260 230, 380 130"
                fill="none"
                stroke="url(#trailGradient)"
                strokeWidth="5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.5, ease: 'easeInOut' }}
              />
            )}
          </svg>

          {/* Traveling Encrypted Packet (Ciphertext) */}
          <AnimatePresence>
            {journeyState === 'in_transit' && (
              <motion.div
                initial={{ left: '5%', top: '48%', scale: 0.8, opacity: 0 }}
                animate={{
                  left: ['5%', '35%', '65%', '95%'],
                  top: ['48%', '20%', '75%', '48%'],
                  scale: [0.9, 1.05, 1.05, 0.95],
                  opacity: 1,
                }}
                transition={{ duration: 2.5, ease: 'easeInOut' }}
                className="absolute z-40 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
              >
                <div className="bg-[#111b21] border-2 border-[#00a884] text-[#25d366] px-3.5 py-1.5 rounded-xl shadow-[0_0_20px_rgba(0,168,132,0.6)] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#25d366] animate-spin" style={{ animationDuration: '3s' }} />
                  <span className="font-mono font-bold text-xs sm:text-sm tracking-wider">
                    {cipherMessage}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1 bg-red-500/15 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-mono border border-red-500/30 backdrop-blur-sm">
                  <EyeOff className="w-3 h-3 text-red-600" />
                  <span>Public Wire (In Transit)</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Idle Center Hint */}
          {journeyState === 'idle_scroll' && (
            <div className="flex flex-col items-center text-center opacity-70">
              <Radio className="w-5 h-5 text-[#00a884] animate-pulse mb-1" />
              <span className="text-xs font-mono text-[#54656f]">End-to-End Cryptographic Tunnel</span>
            </div>
          )}
        </div>

        {/* ================= RIGHT: Person 2 (Bob) ================= */}
        <div className="relative flex flex-col items-center">
          {/* Speech Prompt above Bob's head */}
          <AnimatePresence>
            {(journeyState === 'decrypting' || journeyState === 'delivered') && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute -top-24 sm:-top-28 z-30 flex flex-col items-center"
              >
                <div
                  className={`px-4 py-2 rounded-2xl shadow-lg border text-center transition-all duration-300 ${
                    journeyState === 'decrypting'
                      ? 'bg-[#111b21] border-[#00a884] text-[#25d366]'
                      : 'bg-[#d9fdd3] border-[#b2e7a9] text-[#111b21] shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-1.5 justify-center mb-0.5">
                    {journeyState === 'decrypting' ? (
                      <Unlock className="w-3.5 h-3.5 text-[#25d366] animate-pulse" />
                    ) : (
                      <span className="text-[10px] text-[#075e54] font-semibold uppercase tracking-wider">
                        ✓ Decrypted Plaintext
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-[#54656f]">Bob's Device</span>
                  </div>
                  <p className="text-sm sm:text-base font-mono font-bold tracking-wider">
                    {journeyState === 'decrypting' ? currentDisplayText : plaintextMessage}
                  </p>
                </div>
                {/* Speech tail */}
                <div
                  className={`w-3 h-3 rotate-45 -mt-1.5 ${
                    journeyState === 'decrypting' ? 'bg-[#111b21]' : 'bg-[#d9fdd3]'
                  }`}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Person 2 SVG */}
          <PersonReceiver hasReceived={journeyState === 'delivered'} />
          <div className="mt-2 text-center">
            <span className="text-xs font-bold text-[#111b21]">Bob</span>
            <span className="block text-[11px] text-[#54656f]">Recipient (Local Device)</span>
          </div>
        </div>
      </div>

      {/* ================= MODAL OVERLAY: Zoomed 1:1 WhatsApp Chat ================= */}
      <AnimatePresence>
        {journeyState === 'phone_zoomed' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setJourneyState('idle_scroll');
              }
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.4, y: 100, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.3, y: 80, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <WhatsAppPhoneChat
                onSendMessage={handleSendMessage}
                onClose={() => setJourneyState('idle_scroll')}
                isZoomed={true}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Replay & Explore Action Bar */}
      <div className="relative z-20 flex flex-wrap items-center justify-center gap-4 mt-8 pb-4">
        {journeyState === 'delivered' && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00a884] hover:bg-[#075e54] text-white font-medium text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Send Another Secret Message</span>
          </motion.button>
        )}

        {onExploreMore && (
          <button
            onClick={onExploreMore}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/90 hover:bg-white border border-[#d1d7db] text-[#111b21] font-medium text-xs sm:text-sm shadow-xs transition-all cursor-pointer group hover:border-[#00a884]"
          >
            <span>Dive Deeper: Technical Cryptography Lab</span>
            <ArrowRight className="w-4 h-4 text-[#00a884] group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
};

export default InteractiveE2EEJourney;
