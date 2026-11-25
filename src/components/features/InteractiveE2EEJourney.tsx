import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PersonCharacter } from './PersonCharacter';
import { WhatsAppPhoneChat } from './WhatsAppPhoneChat';
import { encryptCaesar, generateScrambledText, generateDecrambledText } from '../../lib/simulation/cryptoEngine';
import { Lock, Unlock, EyeOff, Radio, RefreshCw, ArrowRight } from 'lucide-react';

export interface InteractiveE2EEJourneyProps {
  onExploreMore?: () => void;
  className?: string;
}

export type JourneyState =
  | 'idle_scroll'    // Normal overview, Alice and Bob on opposite sides
  | 'phone_zoomed'   // Phone zoomed in center with dark backdrop blur
  | 'encrypting'     // Scrambling plaintext into ciphertext (1.5s)
  | 'in_transit'     // Curved SVG trail transit across the wire
  | 'decrypting'     // Decrypting ciphertext back to original plaintext at Bob (1.5s)
  | 'delivered';     // Verified delivery with "Send Another Secret Message"

export const InteractiveE2EEJourney: React.FC<InteractiveE2EEJourneyProps> = ({
  onExploreMore,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [journeyState, setJourneyState] = useState<JourneyState>('idle_scroll');

  const [plaintextMessage, setPlaintextMessage] = useState('MEET AT DAWN');
  const [cipherMessage, setCipherMessage] = useState('PHHW DW GDZQ');
  const [currentDisplayText, setCurrentDisplayText] = useState('MEET AT DAWN');

  // Prevent background body scroll only while phone modal is zoomed in
  useEffect(() => {
    if (journeyState === 'phone_zoomed') {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const preventScroll = (e: Event) => {
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
        window.removeEventListener('wheel', preventScroll);
        window.removeEventListener('touchmove', preventScroll);
      };
    }
  }, [journeyState]);

  // Scroll detection: auto-zoom phone when Alice is comfortably centered in the viewport
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Auto-zoom phone if user scrolls down into the section and hasn't sent a message yet
      if (
        journeyState === 'idle_scroll' &&
        rect.top <= windowHeight * 0.35 &&
        rect.bottom >= windowHeight * 0.55
      ) {
        setJourneyState('phone_zoomed');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [journeyState]);

  // Exact Post-Send Animation Choreography
  const handleSendMessage = (msg: string) => {
    const original = msg.toUpperCase();
    const cipher = encryptCaesar(original, 3);
    setPlaintextMessage(original);
    setCipherMessage(cipher);
    setCurrentDisplayText(original);

    // 1. Zoom Out phone back into Alice's hands immediately
    setJourneyState('encrypting');

    // 2. Encrypt to Ciphertext (Exactly 1.5 seconds / 1500ms):
    // Characters scramble progressively into ciphertext
    const scrambleStart = performance.now();
    const scrambleDuration = 1500;
    const scrambleInterval = setInterval(() => {
      const elapsed = performance.now() - scrambleStart;
      const progress = Math.min(1, elapsed / scrambleDuration);
      const resolvedCount = Math.floor(progress * original.length);

      if (elapsed >= scrambleDuration) {
        clearInterval(scrambleInterval);
        setCurrentDisplayText(cipher);

        // 3. Curved SVG Trail Transit (Traveling Packet across public wire)
        setJourneyState('in_transit');

        // Travel time across the curved SVG path
        setTimeout(() => {
          // 4. Arrives above Bob's head -> pause 400ms, then decrypt character-by-character over 1500ms
          setJourneyState('decrypting');

          setTimeout(() => {
            const decryptStart = performance.now();
            const decryptInterval = setInterval(() => {
              const decElapsed = performance.now() - decryptStart;
              const decProgress = Math.min(1, decElapsed / scrambleDuration);
              const decResolved = Math.floor(decProgress * original.length);

              if (decElapsed >= scrambleDuration) {
                clearInterval(decryptInterval);
                setCurrentDisplayText(original);
                // 5. Delivered state
                setJourneyState('delivered');
              } else {
                setCurrentDisplayText(generateDecrambledText(cipher, decResolved, original));
              }
            }, 45);
          }, 400); // 400ms brief arrival pause
        }, 2200); // transit duration
      } else {
        setCurrentDisplayText(generateScrambledText(original, resolvedCount, cipher));
      }
    }, 45);
  };

  const handleReset = () => {
    setJourneyState('phone_zoomed');
  };

  return (
    <section
      ref={containerRef}
      className={`relative w-full max-w-6xl mx-auto my-12 p-4 sm:p-8 select-none ${className}`}
    >
      {/* 
        Stage Layout & Characters:
        Clean WhatsApp Biscotti Cream (#efeae2) container (rounded-[32px])
        Framed by WhatsApp doodle wallpaper texture
      */}
      <div className="relative w-full bg-[#efeae2] rounded-[32px] border-2 border-[#d1d7db] shadow-xl overflow-hidden p-6 sm:p-10 flex flex-col items-center">
        {/* Subtle WhatsApp doodle background overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20 z-0"
          style={{
            backgroundImage: 'url(/whatsapp-doodle.jpg)',
            backgroundSize: '360px 360px',
            backgroundRepeat: 'repeat',
          }}
        />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/90 border border-[#d1d7db] text-[#075e54] text-xs font-semibold shadow-xs mb-2">
            <Radio className="w-3.5 h-3.5 text-[#00a884] animate-pulse" />
            <span>Interactive Live Device-to-Device E2EE Lab</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111b21] tracking-tight">
            How Your Message Travels
          </h2>
          <p className="text-xs sm:text-sm text-[#54656f] mt-1 max-w-md">
            {journeyState === 'idle_scroll' && 'Click Alice’s phone or scroll to compose a secret message.'}
            {journeyState === 'phone_zoomed' && 'Type any secret message or pick a chip, then click Send.'}
            {journeyState === 'encrypting' && '🔒 Alice’s device encrypts the message locally using cryptographic keys (1.5s)...'}
            {journeyState === 'in_transit' && '⚡ Traveling across public networks. Eavesdroppers only see scrambled ciphertext!'}
            {journeyState === 'decrypting' && '🔑 Bob’s device receives the packet and decrypts it with the matching key (1.5s)...'}
            {journeyState === 'delivered' && '✓ Delivered securely! Only Alice and Bob hold the keys.'}
          </p>
        </div>

        {/* The Main Stage: Alice (Left), Curved SVG Trail (Center), Bob (Right) */}
        <div className="relative z-10 w-full min-h-[460px] flex items-center justify-between px-2 sm:px-8 my-auto">
          {/* ================= LEFT: Alice (Sender) ================= */}
          <div className="relative flex flex-col items-center">
            {/* Plaintext / Encrypting Prompt above Alice's head */}
            <AnimatePresence>
              {(journeyState === 'encrypting' || journeyState === 'in_transit') && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  className="absolute -top-24 sm:-top-28 z-30 flex flex-col items-center"
                >
                  <div
                    className={`px-4 py-2 rounded-2xl shadow-lg border text-center transition-all duration-300 ${
                      journeyState === 'encrypting'
                        ? 'bg-[#111b21] border-[#00a884] text-[#25d366] shadow-[#00a884]/20'
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
                  {/* Tail */}
                  <div
                    className={`w-3 h-3 rotate-45 -mt-1.5 ${
                      journeyState === 'encrypting' ? 'bg-[#111b21]' : 'bg-white'
                    }`}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Alice Flat-Vector Illustration */}
            <PersonCharacter
              type="alice"
              isPhoneZoomed={journeyState === 'phone_zoomed'}
              onPhoneClick={() => setJourneyState('phone_zoomed')}
            />
          </div>

          {/* ================= CENTER: Curved SVG Trail & Traveling Packet ================= */}
          <div className="relative flex-1 h-64 mx-2 sm:mx-6 flex items-center justify-center">
            {/* SVG Connecting Curved Path */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
              viewBox="0 0 400 200"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="journeyTrailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00a884" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#25d366" stopOpacity="1" />
                  <stop offset="100%" stopColor="#075e54" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Base Dotted Guide Line */}
              <path
                d="M 20 100 C 120 10, 280 190, 380 100"
                fill="none"
                stroke="#d1d7db"
                strokeWidth="3"
                strokeDasharray="6 6"
              />

              {/* Glowing Animated Transit Trail */}
              {journeyState === 'in_transit' && (
                <motion.path
                  d="M 20 100 C 120 10, 280 190, 380 100"
                  fill="none"
                  stroke="url(#journeyTrailGradient)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2.2, ease: 'easeInOut' }}
                />
              )}
            </svg>

            {/* Traveling Ciphertext Packet along the curve */}
            <AnimatePresence>
              {journeyState === 'in_transit' && (
                <motion.div
                  initial={{ left: '5%', top: '50%', scale: 0.8, opacity: 0 }}
                  animate={{
                    left: ['5%', '35%', '65%', '95%'],
                    top: ['50%', '15%', '85%', '50%'],
                    scale: [0.9, 1.05, 1.05, 0.95],
                    opacity: 1,
                  }}
                  transition={{ duration: 2.2, ease: 'easeInOut' }}
                  className="absolute z-40 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                >
                  <div className="bg-[#111b21] border-2 border-[#00a884] text-[#25d366] px-3.5 py-1.5 rounded-xl shadow-[0_0_20px_rgba(0,168,132,0.6)] flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#25d366] animate-pulse" />
                    <span className="font-mono font-bold text-xs sm:text-sm tracking-wider">
                      {cipherMessage}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 bg-red-500/15 text-red-700 px-2.5 py-0.5 rounded-full text-[10px] font-mono border border-red-500/30 backdrop-blur-sm shadow-xs">
                    <EyeOff className="w-3 h-3 text-red-600" />
                    <span>In Transit: Public Wire</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Idle Cryptographic Tunnel Badge */}
            {journeyState === 'idle_scroll' && (
              <div className="flex flex-col items-center text-center opacity-75">
                <span className="text-xs font-mono text-[#54656f]">End-to-End Cryptographic Tunnel</span>
              </div>
            )}
          </div>

          {/* ================= RIGHT: Bob (Recipient) ================= */}
          <div className="relative flex flex-col items-center">
            {/* Decrypted Prompt above Bob's head */}
            <AnimatePresence>
              {(journeyState === 'decrypting' || journeyState === 'delivered') && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
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
                          🔓 Decrypted Plaintext
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-[#54656f]">Bob's Device</span>
                    </div>
                    <p className="text-sm sm:text-base font-mono font-bold tracking-wider">
                      {journeyState === 'decrypting' ? currentDisplayText : plaintextMessage}
                    </p>
                  </div>
                  {/* Tail */}
                  <div
                    className={`w-3 h-3 rotate-45 -mt-1.5 ${
                      journeyState === 'decrypting' ? 'bg-[#111b21]' : 'bg-[#d9fdd3]'
                    }`}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bob Flat-Vector Illustration */}
            <PersonCharacter
              type="bob"
              hasReceived={journeyState === 'delivered'}
            />
          </div>
        </div>

        {/* Action Controls: Send Another Secret Message button */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 mt-6">
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
              <span>Explore Cryptography Lab Below</span>
              <ArrowRight className="w-4 h-4 text-[#00a884] group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* ================= MODAL OVERLAY: Zoomed Alice's WhatsApp Phone ================= */}
      <AnimatePresence>
        {journeyState === 'phone_zoomed' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.35, y: 120, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.35, y: 100, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 24,
              }}
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
    </section>
  );
};

export default InteractiveE2EEJourney;
