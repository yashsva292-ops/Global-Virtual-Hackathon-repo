import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExhibitCharacter } from './ExhibitCharacter';
import { Eye, Server, Lock, HelpCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import {
  generateEndpointKeyPair,
  deriveSymmetricMessageKey,
  encryptMessage,
  type EncryptedPacket,
} from '../../lib/simulation/cryptoEngine';

export const WhyPrivacyMattersStory: React.FC = () => {
  // Toggle: 'friend' (readable plaintext) vs 'relay' (actual computed ciphertext)
  const [viewMode, setViewMode] = useState<'friend' | 'relay'>('friend');
  const [showFullPacket, setShowFullPacket] = useState(false);

  // Discovery quiz selection
  const [sharingAnswer, setSharingAnswer] = useState<'yes' | 'no' | null>(null);
  const [showLimitsDisclosure, setShowLimitsDisclosure] = useState(false);

  // Dedicated separate cryptographic session for this illustrative conversation
  const [storyPacket, setStoryPacket] = useState<EncryptedPacket | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function initStoryCrypto() {
      try {
        const alice = await generateEndpointKeyPair();
        const bob = await generateEndpointKeyPair();
        const { key } = await deriveSymmetricMessageKey(
          alice.privateKey,
          bob.publicKey,
          'story-salt-v1',
          'story-message-key'
        );
        const p = await encryptMessage(
          "Everyone thinks I’m ready for tomorrow. Honestly, I’m nervous.",
          key,
          alice.publicKeyJwk,
          bob.publicKeyJwk,
          "Sender (Device A)",
          "Recipient (Device B)"
        );
        if (isMounted) {
          setStoryPacket(p);
        }
      } catch (err) {
        console.error('Story encryption error:', err);
      }
    }
    initStoryCrypto();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="why-privacy-matters" className="w-full max-w-5xl mx-auto py-16 px-4 sm:px-8 border-t border-[#D3CDC2]">
      {/* Intro Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-mono uppercase tracking-wider text-[#176B50] font-bold block mb-2">
          WHY THIS MATTERS
        </span>
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-[#153A32] tracking-tight mb-4">
          Some messages need an audience of one.
        </h2>
        <p className="text-base sm:text-lg text-[#52665F] leading-relaxed">
          Not every private message contains a grand secret. Sometimes it contains something you are only ready to tell one person.
        </p>
        <span className="text-[11px] font-mono text-[#869992] uppercase tracking-wider block mt-2">
          An illustrative conversation
        </span>
      </div>

      {/* Illustrated Setting with Sender & Recipient Characters */}
      <div className="rounded-3xl bg-[#E3EDE3]/40 border border-[#C5D8C5] p-6 sm:p-10 mb-8 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mb-8">
          {/* Sender Seated beside sports bag */}
          <div className="md:col-span-5 flex flex-col items-center text-center">
            <ExhibitCharacter type="sender" size={160} />
            <div className="mt-2">
              <span className="text-xs font-bold text-[#153A32] block">Sender</span>
              <span className="text-[11px] text-[#52665F]">Holding phone before tournament</span>
            </div>
          </div>

          {/* Central Dialogue Corridor */}
          <div className="md:col-span-7 space-y-4">
            {/* Sender's message bubble */}
            <div className="p-4 rounded-2xl bg-white border border-[#D3CDC2] shadow-2xs text-left max-w-md">
              <span className="text-[10px] font-mono text-[#176B50] font-bold uppercase tracking-wider block mb-1">
                Sender's Message
              </span>
              <p className="text-sm sm:text-base font-medium text-[#153A32]">
                “Everyone thinks I’m ready for tomorrow. Honestly, I’m nervous.”
              </p>
            </div>

            {/* Recipient's reply bubble */}
            <div className="p-4 rounded-2xl bg-[#176B50] text-[#F7F4EC] shadow-2xs text-left max-w-md ml-auto">
              <span className="text-[10px] font-mono text-[#E3EDE3] font-semibold uppercase tracking-wider block mb-1">
                Recipient's Reply
              </span>
              <p className="text-sm sm:text-base font-medium">
                “You don’t have to pretend with me. We’ll practise together.”
              </p>
            </div>
          </div>
        </div>

        {/* INTERACTION: TWO VIEWS OF THE SAME MESSAGE */}
        <div className="border-t border-[#D3CDC2] pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#153A32] block">
                Compare Perspectives on the Same Packet:
              </span>
              <span className="text-xs text-[#52665F]">
                Inspect what the recipient reads vs what the relay carries.
              </span>
            </div>

            {/* Accessible View Mode Switch Buttons */}
            <div className="inline-flex p-1 rounded-xl bg-white border border-[#D3CDC2]" role="tablist">
              <button
                role="tab"
                aria-selected={viewMode === 'friend'}
                onClick={() => setViewMode('friend')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'friend'
                    ? 'bg-[#176B50] text-[#F7F4EC]'
                    : 'text-[#52665F] hover:text-[#153A32]'
                }`}
              >
                What the friend sees
              </button>
              <button
                role="tab"
                aria-selected={viewMode === 'relay'}
                onClick={() => setViewMode('relay')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'relay'
                    ? 'bg-[#2E638F] text-[#F7F4EC]'
                    : 'text-[#52665F] hover:text-[#153A32]'
                }`}
              >
                What the relay receives
              </button>
            </div>
          </div>

          {/* View Content Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#D3CDC2] text-xs">
            {viewMode === 'friend' ? (
              <div>
                <div className="flex items-center gap-2 text-[#176B50] font-bold text-xs mb-1.5">
                  <Eye size={16} />
                  <span>The intended recipient’s device can recover the message.</span>
                </div>
                <div className="p-3 bg-[#E3EDE3]/40 rounded-xl font-medium text-sm text-[#153A32] border border-[#C5D8C5]">
                  “Everyone thinks I’m ready for tomorrow. Honestly, I’m nervous.”
                </div>
                <span className="text-[11px] text-[#52665F] mt-2 block">
                  Plaintext recovered locally on Device B using matching symmetric key material.
                </span>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 text-[#2E638F] font-bold text-xs mb-1.5">
                  <Server size={16} />
                  <span>The relay carries encrypted content and delivery information. It is not given the message-decryption key.</span>
                </div>

                <div className="p-3 bg-[#F7F4EC] rounded-xl font-mono text-xs text-[#2E638F] border border-[#D3CDC2] break-all">
                  <span className="text-[#52665F] font-bold block mb-1">Actual Demonstration Ciphertext (Hex):</span>
                  {storyPacket?.ciphertextHex || 'Computing real ciphertext...'}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-[#52665F]">
                    Hex/Base64 represents encrypted binary bytes, not an encryption cipher.
                  </span>
                  <button
                    onClick={() => setShowFullPacket((p) => !p)}
                    className="text-xs font-semibold text-[#2E638F] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showFullPacket ? 'Hide full packet' : 'Inspect full packet'}</span>
                    {showFullPacket ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>

                {showFullPacket && storyPacket && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-mono space-y-1">
                    <div><strong>Routing Tag:</strong> {storyPacket.aad}</div>
                    <div><strong>Fresh Nonce (96-bit):</strong> {storyPacket.nonceHex}</div>
                    <div><strong>Auth Tag (128-bit):</strong> {storyPacket.tagHex}</div>
                    <div className="text-slate-400 italic">No secret keys are exposed or present in the relay view.</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Closing Story Copy */}
      <div className="text-center max-w-2xl mx-auto my-8">
        <h3 className="font-heading text-2xl font-bold text-[#153A32] mb-2">
          “To the network, encrypted data. To a friend, a moment of trust.”
        </h3>
        <p className="text-sm sm:text-base text-[#52665F] leading-relaxed">
          End-to-end encryption helps protect the contents of a conversation between its endpoints. Understanding it helps you recognise both the protection and its limits.
        </p>
      </div>

      {/* ONE FINAL DISCOVERY: Does encryption stop the recipient from sharing this? */}
      <div className="max-w-xl mx-auto p-6 rounded-3xl bg-white border border-[#D3CDC2] text-center shadow-xs">
        <span className="text-xs font-mono uppercase tracking-wider text-[#176B50] font-bold block mb-2">
          One Final Discovery
        </span>
        <h4 className="font-heading text-lg sm:text-xl font-bold text-[#153A32] mb-4">
          Does encryption stop the recipient from sharing this?
        </h4>

        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={() => setSharingAnswer('yes')}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
              sharingAnswer === 'yes'
                ? 'bg-[#B8443E] text-white border-[#B8443E]'
                : 'bg-[#F7F4EC] text-[#153A32] border-[#D3CDC2] hover:bg-[#E3EDE3]'
            }`}
          >
            Yes
          </button>
          <button
            onClick={() => setSharingAnswer('no')}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
              sharingAnswer === 'no'
                ? 'bg-[#176B50] text-[#F7F4EC] border-[#176B50]'
                : 'bg-[#F7F4EC] text-[#153A32] border-[#D3CDC2] hover:bg-[#E3EDE3]'
            }`}
          >
            No
          </button>
        </div>

        {/* Restrained Inline Feedback */}
        {sharingAnswer === 'yes' && (
          <p className="text-xs text-[#52665F] leading-relaxed">
            Not quite. The recipient can read the message and may copy it. Encryption cannot decide what they do next.
          </p>
        )}
        {sharingAnswer === 'no' && (
          <p className="text-xs text-[#153A32] font-medium leading-relaxed">
            Exactly. It protects the message’s journey. The recipient can still copy what they receive.
          </p>
        )}

        <div className="mt-4 pt-3 border-t border-[#E3EDE3]">
          <span className="text-xs font-bold text-[#176B50] block">
            “Protect the connection. Protect your device. Choose who you trust.”
          </span>
        </div>

        {/* Optional limits disclosure */}
        <div className="mt-3 text-left">
          <button
            onClick={() => setShowLimitsDisclosure((v) => !v)}
            className="text-[11px] font-semibold text-[#52665F] hover:underline flex items-center gap-1 mx-auto cursor-pointer"
          >
            <HelpCircle size={13} />
            <span>Read about practical endpoint security boundaries</span>
            {showLimitsDisclosure ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {showLimitsDisclosure && (
            <div className="mt-2 p-3 bg-[#F7F4EC] rounded-xl text-[11px] text-[#52665F] space-y-1">
              <div>• An unlocked or compromised endpoint can expose readable messages.</div>
              <div>• Recipients can copy, screenshot, or forward received information.</div>
              <div>• Metadata (such as participant IDs, delivery timestamps) may remain visible to relays.</div>
              <div>• Stored copies and unencrypted backups require separate consideration.</div>
              <div>• Account security and message encryption solve different problems.</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
