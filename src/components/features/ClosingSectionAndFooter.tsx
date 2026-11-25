import React, { useState } from 'react';
import { ExhibitCharacter } from './ExhibitCharacter';
import { ShieldCheck, ChevronDown, ChevronUp, ExternalLink, ArrowRight } from 'lucide-react';

interface ClosingSectionProps {
  onRestartSimulator: () => void;
  onExploreMechanism: () => void;
}

export const ClosingSectionAndFooter: React.FC<ClosingSectionProps> = ({
  onRestartSimulator,
  onExploreMechanism,
}) => {
  const [showSources, setShowSources] = useState(false);
  const [showModelDetails, setShowModelDetails] = useState(false);
  const [showDisclosure, setShowDisclosure] = useState(false);

  return (
    <footer className="w-full bg-[#153A32] text-[#F7F4EC] pt-16 pb-12 px-4 sm:px-8 border-t border-[#135942]">
      <div className="w-full max-w-5xl mx-auto">
        {/* Calm Forest Green Closing Area with High Contrast Warm-White Text */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          {/* Subtle characters pairing */}
          <div className="flex items-center justify-center gap-6 mb-6 opacity-90">
            <ExhibitCharacter type="sender" size={90} />
            <div className="w-10 h-0.5 border-t border-dashed border-[#E3EDE3]/40" />
            <ExhibitCharacter type="recipient" size={90} />
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F7F4EC] mb-4 leading-tight">
            The next time you see ‘end-to-end encrypted,’ you’ll know what happens behind those words.
          </h2>

          <p className="text-base sm:text-lg text-[#E3EDE3] max-w-xl mx-auto mb-8 font-medium">
            Your device encrypts. The relay delivers. The recipient’s device checks and decrypts.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onRestartSimulator}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#F7F4EC] text-[#153A32] font-semibold text-sm hover:bg-white active:scale-[0.98] transition-all cursor-pointer shadow-sm"
            >
              Try another message
            </button>
            <button
              onClick={onExploreMechanism}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#176B50] text-[#F7F4EC] font-semibold text-sm hover:bg-[#135942] active:scale-[0.98] transition-all cursor-pointer border border-[#E3EDE3]/20"
            >
              Explore the mechanism
            </button>
            <a
              href="https://github.com/yashsva292-ops/Global-Virtual-Hackathon-repo"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl text-xs font-semibold text-[#E3EDE3] hover:text-white hover:underline flex items-center justify-center gap-1.5"
            >
              <span>View source code</span>
              <ExternalLink size={14} />
            </a>
          </div>

          <p className="text-xs text-[#E3EDE3]/70 mt-8">
            Thank you for exploring with The Syntax Unveilers.
          </p>
        </div>

        {/* Expandable Technical Disclosures, Sources, and Model Limits */}
        <div className="border-t border-[#176B50] pt-8 space-y-4 text-xs text-[#E3EDE3]/80">
          {/* Section 1: Sources and Specifications */}
          <div className="p-4 rounded-2xl bg-[#0F2B25] border border-[#176B50]">
            <button
              onClick={() => setShowSources((s) => !s)}
              className="w-full flex items-center justify-between font-semibold text-sm text-[#F7F4EC] cursor-pointer"
            >
              <span>Primary Documentation and Specifications</span>
              {showSources ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showSources && (
              <ul className="mt-3 pt-3 border-t border-[#176B50]/60 space-y-2 font-mono text-[11px]">
                <li>
                  • WhatsApp Security Architecture:{' '}
                  <a
                    href="https://www.whatsapp.com/security/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#96D2B4] hover:underline"
                  >
                    https://www.whatsapp.com/security/
                  </a>
                </li>
                <li>
                  • Signal X3DH Key Agreement Protocol:{' '}
                  <a
                    href="https://signal.org/docs/specifications/x3dh/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#96D2B4] hover:underline"
                  >
                    https://signal.org/docs/specifications/x3dh/
                  </a>
                </li>
                <li>
                  • Signal Double Ratchet Algorithm:{' '}
                  <a
                    href="https://signal.org/docs/specifications/doubleratchet/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#96D2B4] hover:underline"
                  >
                    https://signal.org/docs/specifications/doubleratchet/
                  </a>
                </li>
                <li>
                  • Meta Key Transparency in WhatsApp:{' '}
                  <a
                    href="https://engineering.fb.com/2023/04/13/security/whatsapp-key-transparency/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#96D2B4] hover:underline"
                  >
                    https://engineering.fb.com/2023/04/13/security/whatsapp-key-transparency/
                  </a>
                </li>
                <li>
                  • WhatsApp Multi-Device End-to-End Encryption:{' '}
                  <a
                    href="https://engineering.fb.com/2021/07/14/security/whatsapp-multi-device/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#96D2B4] hover:underline"
                  >
                    https://engineering.fb.com/2021/07/14/security/whatsapp-multi-device/
                  </a>
                </li>
                <li>
                  • W3C Web Cryptography API (SubtleCrypto):{' '}
                  <a
                    href="https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#96D2B4] hover:underline"
                  >
                    https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto
                  </a>
                </li>
              </ul>
            )}
          </div>

          {/* Section 2: Model Simplifications & Privacy Verification */}
          <div className="p-4 rounded-2xl bg-[#0F2B25] border border-[#176B50]">
            <button
              onClick={() => setShowModelDetails((s) => !s)}
              className="w-full flex items-center justify-between font-semibold text-sm text-[#F7F4EC] cursor-pointer"
            >
              <span>How this educational model works & Local Privacy</span>
              {showModelDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showModelDetails && (
              <div className="mt-3 pt-3 border-t border-[#176B50]/60 space-y-2 text-[11px] leading-relaxed">
                <p>
                  <strong>All participants are simulated in one browser:</strong> The cryptographic operations (ECDH P-256 key agreement, HKDF-SHA-256 derivation, and AES-GCM authenticated encryption) are real Web Crypto primitives executed locally. However, this single-page demo does not provide physical isolation between simulated devices.
                </p>
                <p>
                  <strong>Privacy statement:</strong> Typed messages never leave your browser. They are not sent to any backend, third-party analytics, or AI service, nor are private keys stored in localStorage.
                </p>
                <p>
                  <strong>Simplifications from full Signal Protocol:</strong> We model single-turn session agreement using ECDH P-256 rather than Curve25519 X3DH and the continuous Double Ratchet. This isolates the core takeaway cleanly for first-time visitors within two minutes.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Legal & Project Disclosure */}
        <div className="mt-8 pt-6 border-t border-[#176B50] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#E3EDE3]/60">
          <span>
            An independent educational project by The Syntax Unveilers. Not affiliated with WhatsApp or Meta.
          </span>
          <span>
            Global Virtual Hackathon 2026 • Built with React & Web Crypto
          </span>
        </div>
      </div>
    </footer>
  );
};
