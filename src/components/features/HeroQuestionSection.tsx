import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EncryptedText } from '../ui/encrypted-text';
import { ArrowDown, ShieldCheck, Lock } from 'lucide-react';

interface HeroQuestionSectionProps {
  onScrollClick?: () => void;
}

export const HeroQuestionSection: React.FC<HeroQuestionSectionProps> = ({ onScrollClick }) => {
  // Phase 1: Show initial statement "Millions Use End-to-end Encryption Everyday"
  // After 4 seconds: Phase 2 morphs using EncryptedText into "But Do you know how it works"
  const [phase, setPhase] = useState<'initial' | 'question'>('initial');

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('question');
    }, 4000); // Exactly 4.0 seconds readable delay as requested

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative w-full min-h-[90vh] flex flex-col justify-between items-center text-center px-4 sm:px-8 md:px-12 py-12 sm:py-16">
      {/* Top subtle badge */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00a884]/10 border border-[#00a884]/30 text-[#075e54] text-xs sm:text-sm font-semibold tracking-wide uppercase backdrop-blur-sm"
      >
        <ShieldCheck className="w-4 h-4 text-[#00a884]" />
        <span>End-to-End Encryption Explained</span>
      </motion.div>

      {/* Main Dynamic Headline */}
      <div className="my-auto max-w-4xl w-full flex flex-col items-center justify-center min-h-[220px]">
        <AnimatePresence mode="wait">
          {phase === 'initial' ? (
            <motion.div
              key="statement"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-[#111b21] tracking-tight leading-[1.12]">
                Millions Use{' '}
                <span className="text-[#075e54] relative inline-block">
                  End-to-end Encryption
                </span>{' '}
                Everyday.
              </h1>
              <p className="mt-6 text-sm sm:text-base md:text-lg text-[#54656f] max-w-lg">
                On WhatsApp, Signal, and modern communication apps around the world.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="question"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.12] text-[#111b21]">
                <EncryptedText
                  text="But Do you know how it works?"
                  revealDelayMs={45}
                  flipDelayMs={40}
                  encryptedClassName="text-[#00a884] font-mono tracking-wider opacity-75"
                  revealedClassName="text-[#111b21] font-black"
                />
              </h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                className="mt-6 text-sm sm:text-base md:text-lg text-[#075e54] font-medium max-w-md"
              >
                Scroll down to witness how your messages stay safe from phone to phone.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll Down Indicator */}
      <motion.button
        onClick={onScrollClick}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{
          opacity: { duration: 0.6, delay: 0.8 },
          y: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' },
        }}
        className="flex flex-col items-center gap-2 text-xs sm:text-sm font-semibold text-[#54656f] hover:text-[#075e54] transition-colors cursor-pointer group pb-4"
      >
        <span>Scroll down to explore</span>
        <div className="w-9 h-9 rounded-full bg-white/80 border border-[#d1d7db] flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:border-[#00a884] transition-all">
          <ArrowDown className="w-4 h-4 text-[#075e54]" />
        </div>
      </motion.button>
    </section>
  );
};

export default HeroQuestionSection;
