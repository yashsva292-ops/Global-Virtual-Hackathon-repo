import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { DoodleFrame } from './DoodleFrame';
import { HeroQuestionSection } from './HeroQuestionSection';
import { InteractiveE2EEJourney } from './InteractiveE2EEJourney';
import { SoapBubbleButton } from '../soap-bubble';
import { ShieldCheck, Lock, Sparkles, ArrowLeft } from 'lucide-react';

interface E2EEMainPageProps {
  onBackToHome?: () => void;
  onNavigateToSimulator?: () => void;
}

export const E2EEMainPage: React.FC<E2EEMainPageProps> = ({
  onBackToHome,
  onNavigateToSimulator,
}) => {
  const journeyRef = useRef<HTMLDivElement>(null);

  const handleScrollToJourney = () => {
    if (journeyRef.current) {
      journeyRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <DoodleFrame>
      {/* Top Navbar Header */}
      <header className="w-full px-6 sm:px-10 py-5 flex items-center justify-between border-b border-[#d1d7db]/60 z-30">
        <div className="flex items-center gap-3">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="p-1.5 rounded-full hover:bg-black/5 text-[#54656f] hover:text-[#111b21] transition-colors cursor-pointer"
              title="Back to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="w-9 h-9 rounded-xl bg-[#00a884] text-white flex items-center justify-center shadow-md shadow-[#00a884]/20">
            <Lock className="w-5 h-5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-bold text-[#111b21] tracking-tight leading-tight">
              End-to-End Encryption
            </span>
            <span className="text-[10px] text-[#075e54] font-semibold uppercase tracking-wider">
              Educational Interactive Showcase
            </span>
          </div>
        </div>

        {/* Technical Simulator Lab Button */}
        {onNavigateToSimulator && (
          <button
            onClick={onNavigateToSimulator}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00a884] hover:bg-[#075e54] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Simulator Lab</span>
          </button>
        )}
      </header>

      {/* Main Content Sections */}
      <main className="flex-1 w-full flex flex-col">
        {/* Section 1: Hero Question (Millions Use E2EE -> 4s gap -> But do you know how it works) */}
        <HeroQuestionSection onScrollClick={handleScrollToJourney} />

        {/* Section 2: Person holding phone, zoom into 1:1 WhatsApp chat, type & send, 1.5s encryption & trail transit */}
        <div ref={journeyRef} className="w-full border-t border-[#d1d7db]/60">
          <InteractiveE2EEJourney onExploreMore={onNavigateToSimulator} />
        </div>

        {/* Section 3: Bottom Footer / Deep Dive Technical Lab */}
        {onNavigateToSimulator && (
          <section className="w-full py-16 px-6 sm:px-12 bg-white/40 border-t border-[#d1d7db]/60 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00a884]/10 text-[#075e54] text-xs font-semibold mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00a884]" />
                <span>Full Cryptographic Mechanics</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#111b21] tracking-tight">
                Ready to master how keys are generated?
              </h3>
              <p className="text-xs sm:text-sm text-[#54656f] mt-2 leading-relaxed">
                Explore Diffie-Hellman key exchange, symmetric Caesar / AES ciphers, and inspect raw ciphertext passing over simulated network nodes.
              </p>
            </div>

            <button
              onClick={onNavigateToSimulator}
              className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#075e54] hover:bg-[#00a884] text-white text-sm font-semibold shadow-lg transition-all cursor-pointer"
            >
              <span>Launch Cryptographic Lab &rarr;</span>
            </button>
          </section>
        )}
      </main>
    </DoodleFrame>
  );
};

export default E2EEMainPage;
