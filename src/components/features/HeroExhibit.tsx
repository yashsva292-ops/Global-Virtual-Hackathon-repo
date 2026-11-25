import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExhibitCharacter } from './ExhibitCharacter';
import { Play, Pause, RotateCcw, ShieldCheck, ArrowRight } from 'lucide-react';
import { encryptMessage, generateEndpointKeyPair, deriveSymmetricMessageKey } from '../../lib/simulation/cryptoEngine';

interface HeroExhibitProps {
  onStartSimulator: () => void;
  onExploreDetails: () => void;
}

export const HeroExhibit: React.FC<HeroExhibitProps> = ({
  onStartSimulator,
  onExploreDetails,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [cycleIndex, setCycleIndex] = useState(0);
  const [demoCipherHex, setDemoCipherHex] = useState('7f4d2a9c1e');
  const [realCipherReady, setRealCipherReady] = useState(false);

  // Generate real browser-generated ciphertext for the hero demo
  useEffect(() => {
    let isMounted = true;
    async function initRealHeroCrypto() {
      try {
        const alice = await generateEndpointKeyPair();
        const bob = await generateEndpointKeyPair();
        const { key } = await deriveSymmetricMessageKey(alice.privateKey, bob.publicKey);
        const packet = await encryptMessage('Meet at dawn', key, alice.publicKeyJwk, bob.publicKeyJwk);
        if (isMounted) {
          setDemoCipherHex(packet.ciphertextHex.slice(0, 10));
          setRealCipherReady(true);
        }
      } catch {
        // Fallback demo hex if WebCrypto runs in restricted sandbox
      }
    }
    initRealHeroCrypto();
    return () => {
      isMounted = false;
    };
  }, []);

  // Animation cycle:
  // 0: "Meet at dawn" readable inside Sender's phone
  // 1: Encrypted inside Sender device -> transforms to ciphertext
  // 2: Bubble carrying encrypted bytes travels through delivery relay
  // 3: Reaches Recipient phone -> decrypted inside device to "Meet at dawn"
  // 4: Settled / Calm state with option to replay
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCycleIndex((prev) => {
        if (prev >= 4) {
          setIsPlaying(false); // Settle into calm state after 1 cycle
          return 4;
        }
        return prev + 1;
      });
    }, 2400);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleReplay = () => {
    setCycleIndex(0);
    setIsPlaying(true);
  };

  return (
    <section className="relative w-full min-h-screen bg-[#F7F4EC] text-[#153A32] flex flex-col justify-between px-4 sm:px-8 md:px-12 pt-8 pb-14 overflow-hidden">
      {/* Top Header / Brand Identity */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between border-b border-[#E3EDE3] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#176B50] flex items-center justify-center text-[#F7F4EC]">
            <ShieldCheck size={20} aria-hidden="true" />
          </div>
          <span className="font-semibold text-sm sm:text-base text-[#153A32] tracking-tight">
            The Syntax Unveilers
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs sm:text-sm text-[#52665F]">
          <span className="px-2.5 py-1 rounded-full bg-[#E3EDE3] font-medium text-[#153A32]">
            Educational Model
          </span>
        </div>
      </header>

      {/* Main Hero Exhibit Container */}
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center my-auto py-8">
        {/* Small introductory label */}
        <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#176B50] mb-3">
          An interactive explanation
        </span>

        {/* Centered Main Headline */}
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#153A32] max-w-3xl leading-[1.08] mb-5">
          How does end-to-end encryption work?
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-[#52665F] max-w-2xl leading-relaxed mb-8">
          Send a message. Follow its journey. Discover why the messenger doesn’t need to read it.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
          <button
            onClick={onStartSimulator}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#176B50] text-[#F7F4EC] font-semibold text-base shadow-sm hover:bg-[#135942] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#176B50]"
          >
            Try it in 2 minutes
            <ArrowRight size={18} aria-hidden="true" />
          </button>
          <button
            onClick={onExploreDetails}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-[#176B50] font-semibold text-base hover:bg-[#E3EDE3] active:scale-[0.98] transition-all cursor-pointer"
          >
            Explore the details
          </button>
        </div>

        {/* 
          Hero Message Journey Illustration
          Vector characters on sides with clear, non-intrusive central relay corridor.
          Plaintext NEVER crosses the relay; real browser ciphertext travels across.
        */}
        <div className="relative w-full max-w-4xl bg-white/70 border border-[#D3CDC2] rounded-3xl p-6 sm:p-8 shadow-xs">
          {/* Journey Controls (Pause, Replay) */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="p-1.5 rounded-lg bg-[#E3EDE3] text-[#153A32] hover:bg-[#D5E3D5] text-xs font-medium flex items-center gap-1 cursor-pointer"
              aria-label={isPlaying ? 'Pause hero demonstration' : 'Resume hero demonstration'}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button
              onClick={handleReplay}
              className="p-1.5 rounded-lg bg-[#E3EDE3] text-[#153A32] hover:bg-[#D5E3D5] text-xs font-medium flex items-center gap-1 cursor-pointer"
              aria-label="Replay hero message journey"
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">Replay</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Left: Sender endpoint */}
            <div className="flex flex-col items-center">
              <ExhibitCharacter type="sender" size={140} />
              <div className="mt-2 text-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#176B50] block">
                  Encrypted here
                </span>
                <span className="text-sm font-bold text-[#153A32] block">Sender (Device A)</span>
              </div>

              {/* Inside phone preview */}
              <div className="mt-3 px-3 py-2 rounded-xl bg-[#E3EDE3] border border-[#C5D8C5] text-left text-xs max-w-[190px]">
                <span className="text-[10px] text-[#52665F] block font-mono">Inside device:</span>
                {cycleIndex === 0 && (
                  <span className="text-xs font-medium text-[#153A32] block font-mono">
                    "Meet at dawn"
                  </span>
                )}
                {cycleIndex >= 1 && (
                  <span className="text-xs font-mono text-[#A86B16] font-semibold block truncate">
                    🔐 {demoCipherHex}...
                  </span>
                )}
              </div>
            </div>

            {/* Center: Insecure Delivery Server Relay */}
            <div className="flex flex-col items-center justify-center py-4 px-2 relative">
              {/* Relay node card */}
              <div className="w-full max-w-[220px] rounded-2xl bg-[#F7F4EC] border-2 border-dashed border-[#2E638F]/50 p-4 text-center">
                <span className="text-[11px] font-mono text-[#2E638F] font-semibold uppercase tracking-wide block mb-1">
                  Delivery server
                </span>
                <span className="text-xs text-[#52665F] leading-tight block">
                  Delivers encrypted data
                </span>

                {/* Animated traveling packet bubble */}
                <div className="h-10 my-2 flex items-center justify-center">
                  {cycleIndex === 2 ? (
                    <motion.div
                      initial={{ x: -40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.6 }}
                      className="px-3 py-1.5 rounded-full bg-[#2E638F] text-[#F7F4EC] text-xs font-mono font-medium shadow-xs"
                    >
                      bytes: {demoCipherHex}
                    </motion.div>
                  ) : (
                    <span className="text-[11px] text-[#869992] italic font-mono">
                      (No plaintext in transit)
                    </span>
                  )}
                </div>
              </div>

              <span className="text-[11px] text-[#52665F] mt-2 text-center">
                Server cannot read or decrypt the packet
              </span>
            </div>

            {/* Right: Recipient endpoint */}
            <div className="flex flex-col items-center">
              <ExhibitCharacter type="recipient" size={140} />
              <div className="mt-2 text-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#176B50] block">
                  Decrypted here
                </span>
                <span className="text-sm font-bold text-[#153A32] block">Recipient (Device B)</span>
              </div>

              {/* Inside phone preview */}
              <div className="mt-3 px-3 py-2 rounded-xl bg-[#E3EDE3] border border-[#C5D8C5] text-left text-xs max-w-[190px]">
                <span className="text-[10px] text-[#52665F] block font-mono">Inside device:</span>
                {cycleIndex < 3 && (
                  <span className="text-xs font-mono text-[#869992] italic block">
                    Awaiting transmission...
                  </span>
                )}
                {cycleIndex >= 3 && (
                  <span className="text-xs font-medium text-[#153A32] font-mono block">
                    "Meet at dawn"
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Footnote / Model Notice */}
      <div className="w-full max-w-4xl mx-auto text-center text-xs text-[#52665F] border-t border-[#E3EDE3] pt-4">
        <span>
          Simplified educational model using browser Web Crypto (ECDH P-256 & AES-GCM). All participants simulated locally in your browser.
        </span>
      </div>
    </section>
  );
};
