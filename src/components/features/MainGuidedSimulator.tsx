import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  Key,
  Lock,
  Unlock,
  Server,
  ArrowRight,
  RotateCcw,
  HelpCircle,
  Binary,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  generateEndpointKeyPair,
  deriveSymmetricMessageKey,
  encryptMessage,
  decryptPacket,
  flipBitInPacket,
  computeFingerprint,
  bytesToBinary,
  type KeyPairResult,
  type EncryptedPacket,
  type DecryptionResult,
} from '../../lib/simulation/cryptoEngine';

export const MainGuidedSimulator: React.FC = () => {
  // Step 1: Write (0), Step 2: Prepare Secrets (1), Step 3: Encrypt & Send (2),
  // Step 4: Check & Decrypt (3), Step 5: Try Changing It / Tamper Test (4)
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Endpoint identity labels
  const [senderLabel, setSenderLabel] = useState('Sender (Device A)');
  const [recipientLabel, setRecipientLabel] = useState('Recipient (Device B)');

  // User input message
  const [messageText, setMessageText] = useState('Are you coming to the tournament tomorrow?');
  const [isComputing, setIsComputing] = useState(false);

  // Cryptographic State
  const [senderKeys, setSenderKeys] = useState<KeyPairResult | null>(null);
  const [recipientKeys, setRecipientKeys] = useState<KeyPairResult | null>(null);
  const [derivedKey, setDerivedKey] = useState<CryptoKey | null>(null);
  const [derivedKeyHex, setDerivedKeyHex] = useState<string>('');
  const [fingerprintA, setFingerprintA] = useState<string>('');
  const [fingerprintB, setFingerprintB] = useState<string>('');

  // Packet & Decryption State
  const [packet, setPacket] = useState<EncryptedPacket | null>(null);
  const [decryptionResult, setDecryptionResult] = useState<DecryptionResult | null>(null);

  // Tamper Experiment State (Step 5)
  const [isTampered, setIsTampered] = useState(false);
  const [tamperedPacket, setTamperedPacket] = useState<EncryptedPacket | null>(null);
  const [tamperedDecryption, setTamperedDecryption] = useState<DecryptionResult | null>(null);
  const [tamperedByteInfo, setTamperedByteInfo] = useState<{ original: number; modified: number } | null>(null);

  // Optional disclosures
  const [showHowDisclosure, setShowHowDisclosure] = useState(false);
  const [showBitLevelView, setShowBitLevelView] = useState(false);
  const [showServerPacketView, setShowServerPacketView] = useState(false);

  // Understanding check quiz at end of core journey
  const [quizSelection, setQuizSelection] = useState<string | null>(null);

  // Initialize or reset keys
  const initKeys = async () => {
    setIsComputing(true);
    try {
      const a = await generateEndpointKeyPair();
      const b = await generateEndpointKeyPair();
      setSenderKeys(a);
      setRecipientKeys(b);

      const fpA = await computeFingerprint(a.publicKeyJwk);
      const fpB = await computeFingerprint(b.publicKeyJwk);
      setFingerprintA(fpA);
      setFingerprintB(fpB);

      // Independently compute matching secret
      const { key, rawKeyHex } = await deriveSymmetricMessageKey(a.privateKey, b.publicKey);
      setDerivedKey(key);
      setDerivedKeyHex(rawKeyHex);
    } catch (err) {
      console.error('Key agreement error:', err);
    } finally {
      setIsComputing(false);
    }
  };

  useEffect(() => {
    initKeys();
  }, []);

  // When user edits message, invalidate downstream results
  const handleMessageChange = (text: string) => {
    setMessageText(text);
    if (currentStep > 0) {
      setCurrentStep(0);
      setPacket(null);
      setDecryptionResult(null);
      setIsTampered(false);
      setTamperedPacket(null);
      setTamperedDecryption(null);
    }
  };

  // Step 1 -> 2: Prepare matching secrets
  const handleStep1PrepareKeys = async () => {
    if (!derivedKey) {
      await initKeys();
    }
    setCurrentStep(1);
    setShowHowDisclosure(false);
  };

  // Step 2 -> 3: Encrypt and send
  const handleStep2Encrypt = async () => {
    if (!derivedKey || !senderKeys || !recipientKeys) return;
    setIsComputing(true);
    try {
      const p = await encryptMessage(
        messageText,
        derivedKey,
        senderKeys.publicKeyJwk,
        recipientKeys.publicKeyJwk,
        senderLabel,
        recipientLabel
      );
      setPacket(p);
      setCurrentStep(2);
      setShowHowDisclosure(false);
    } catch (err) {
      console.error('Encryption error:', err);
    } finally {
      setIsComputing(false);
    }
  };

  // Step 3 -> 4: Deliver and Decrypt
  const handleStep3Deliver = async () => {
    if (!packet || !derivedKey) return;
    setIsComputing(true);
    try {
      const res = await decryptPacket(packet, derivedKey);
      setDecryptionResult(res);
      setCurrentStep(3);
      setShowHowDisclosure(false);
    } catch (err) {
      console.error('Decryption error:', err);
    } finally {
      setIsComputing(false);
    }
  };

  // Step 4 -> 5: Go to tamper test
  const handleGoToTamper = () => {
    setCurrentStep(4);
    setIsTampered(false);
    setTamperedPacket(null);
    setTamperedDecryption(null);
    setShowHowDisclosure(false);
  };

  // Tamper: Flip 1 bit in ciphertext
  const handleFlipBit = () => {
    if (!packet) return;
    const { tamperedPacket: tp, originalByte, tamperedByte } = flipBitInPacket(packet, 0, 0);
    setTamperedPacket(tp);
    setTamperedByteInfo({ original: originalByte, modified: tamperedByte });
    setIsTampered(true);
    setTamperedDecryption(null);
  };

  // Deliver tampered packet
  const handleDeliverTampered = async () => {
    if (!tamperedPacket || !derivedKey) return;
    setIsComputing(true);
    try {
      const res = await decryptPacket(tamperedPacket, derivedKey);
      setTamperedDecryption(res);
    } finally {
      setIsComputing(false);
    }
  };

  // Restore and deliver clean packet
  const handleRestoreOriginal = async () => {
    if (!packet || !derivedKey) return;
    setIsComputing(true);
    try {
      const res = await decryptPacket(packet, derivedKey);
      setDecryptionResult(res);
      setIsTampered(false);
      setTamperedPacket(null);
      setTamperedDecryption(null);
    } finally {
      setIsComputing(false);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setPacket(null);
    setDecryptionResult(null);
    setIsTampered(false);
    setTamperedPacket(null);
    setTamperedDecryption(null);
    setQuizSelection(null);
  };

  return (
    <section id="simulator-section" className="w-full max-w-6xl mx-auto py-16 px-4 sm:px-8">
      {/* Simulator Header & Step Tracker */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#D3CDC2] pb-6 mb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#176B50] block">
            Step-by-Step Educational Lab
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-[#153A32]">
            End-to-End Encryption Simulator
          </h2>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {['1. Write', '2. Keys', '3. Encrypt', '4. Decrypt', '5. Tamper Test'].map((lbl, idx) => (
            <span
              key={idx}
              className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                currentStep === idx
                  ? 'bg-[#176B50] text-[#F7F4EC]'
                  : currentStep > idx
                  ? 'bg-[#E3EDE3] text-[#153A32]'
                  : 'text-[#869992] bg-black/5'
              }`}
            >
              {lbl}
            </span>
          ))}
          <button
            onClick={handleRestart}
            title="Restart Journey"
            className="p-1.5 ml-2 rounded-lg text-[#52665F] hover:bg-[#E3EDE3] transition-all cursor-pointer"
            aria-label="Restart simulator journey"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Main 3-Column Simulator Layout (Sender | Delivery Server | Recipient) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-8">
        {/* LEFT COLUMN: Sender Device (Device A) */}
        <div className="lg:col-span-4 rounded-3xl bg-white border-2 border-[#D3CDC2] p-5 sm:p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E3EDE3] mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#176B50] block">
                  Sender
                </span>
                <input
                  type="text"
                  value={senderLabel}
                  onChange={(e) => setSenderLabel(e.target.value)}
                  className="text-sm font-semibold text-[#153A32] bg-transparent border-b border-transparent hover:border-[#176B50] focus:border-[#176B50] focus:outline-none w-full max-w-[200px]"
                  title="Display name label (educational only)"
                />
              </div>
              <div className="w-8 h-8 rounded-full bg-[#E3EDE3] flex items-center justify-center text-[#176B50]">
                <Lock size={16} />
              </div>
            </div>

            {/* Secret Key icon stays permanently inside endpoint */}
            <div className="mb-4 px-3 py-2 rounded-xl bg-[#E3EDE3]/60 border border-[#D3CDC2]/60 flex items-center justify-between text-xs">
              <span className="text-[#52665F] flex items-center gap-1.5">
                <Key size={14} className="text-[#A86B16]" />
                Private Identity Key
              </span>
              <span className="font-mono text-[10px] text-[#A86B16] font-bold">
                Holds Secret State
              </span>
            </div>

            {/* Editable Message Input (Step 1) */}
            <label className="text-xs font-semibold text-[#52665F] block mb-1">
              Your message:
            </label>
            <div className="relative">
              <textarea
                value={messageText}
                onChange={(e) => handleMessageChange(e.target.value)}
                maxLength={280}
                rows={3}
                placeholder="Type your message here..."
                className="w-full p-3 rounded-xl border border-[#D3CDC2] bg-[#F7F4EC]/60 text-sm font-medium text-[#153A32] focus:border-[#176B50] focus:bg-white focus:outline-none transition-all resize-none"
              />
              <span className="text-[10px] text-[#869992] absolute bottom-2 right-2">
                {messageText.length}/280
              </span>
            </div>

            {/* Step 3 Ciphertext preview inside Sender's device */}
            {currentStep >= 2 && packet && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 rounded-xl bg-[#F7F4EC] border border-[#D3CDC2] text-xs font-mono"
              >
                <div className="flex items-center justify-between text-[#176B50] font-semibold text-[11px] mb-1">
                  <span>Transformation:</span>
                  <span>AES-GCM (256-bit)</span>
                </div>
                <div className="text-[11px] text-[#52665F] break-all">
                  Ciphertext: <span className="text-[#A86B16]">{packet.ciphertextHex}</span>
                </div>
                <div className="text-[10px] text-[#869992] mt-1">
                  Fresh 96-bit nonce: {packet.nonceHex.slice(0, 16)}...
                </div>
              </motion.div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#E3EDE3] text-[11px] text-[#52665F]">
            Message is encrypted on this device before departure.
          </div>
        </div>

        {/* CENTER COLUMN: Insecure Relay / Delivery Server */}
        <div className="lg:col-span-4 rounded-3xl bg-[#E3EDE3]/40 border-2 border-dashed border-[#2E638F]/40 p-5 sm:p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#2E638F]/20 mb-4">
              <div>
                <span className="text-xs font-mono text-[#2E638F] font-bold uppercase tracking-wider block">
                  Delivery Server
                </span>
                <span className="text-xs text-[#52665F]">Untrusted Relay</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white border border-[#2E638F]/40 flex items-center justify-center text-[#2E638F]">
                <Server size={16} />
              </div>
            </div>

            {/* Relay Status Box */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-white border border-[#D3CDC2] text-xs">
                <span className="text-xs font-semibold text-[#153A32] block mb-1">
                  Server Routing State:
                </span>
                {currentStep < 2 ? (
                  <span className="text-[#869992] italic">Awaiting message from sender...</span>
                ) : (
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="text-[#2E638F] font-bold">
                      📦 Encrypted Packet Received
                    </div>
                    <div className="text-[#52665F]">
                      From: <span className="text-[#153A32]">{senderLabel}</span>
                    </div>
                    <div className="text-[#52665F]">
                      To: <span className="text-[#153A32]">{recipientLabel}</span>
                    </div>
                    <div className="text-[#52665F] break-all">
                      Carried bytes:{' '}
                      <span className="text-[#2E638F] font-semibold">
                        {isTampered && tamperedPacket
                          ? tamperedPacket.ciphertextHex.slice(0, 24) + '...'
                          : packet?.ciphertextHex.slice(0, 24) + '...'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Server Packet Inspector toggle */}
              {currentStep >= 2 && packet && (
                <button
                  onClick={() => setShowServerPacketView((s) => !s)}
                  className="w-full py-2 px-3 rounded-xl bg-white/80 border border-[#2E638F]/30 text-xs font-medium text-[#2E638F] hover:bg-white transition-all flex items-center justify-between cursor-pointer"
                >
                  <span>Server-visible packet details</span>
                  {showServerPacketView ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}

              {/* Detailed Server View Modal / Disclosure */}
              <AnimatePresence>
                {showServerPacketView && packet && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-white rounded-xl border border-[#D3CDC2] text-[10px] font-mono space-y-1 overflow-hidden"
                  >
                    <div className="text-[#153A32] font-bold">Actual Simulated Packet:</div>
                    <div className="text-[#52665F]">Auth Tag (128-bit): {packet.tagHex}</div>
                    <div className="text-[#52665F]">Public Nonce: {packet.nonceHex}</div>
                    <div className="text-[#52665F]">Bound Header (AAD): {packet.aad}</div>
                    <div className="text-[#869992] pt-1 border-t border-[#E3EDE3] italic">
                      Notice: Hex is a way to display bytes, not an encryption layer.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#2E638F]/20 text-[11px] text-[#52665F]">
            The delivery server is not given the message-decryption key.
          </div>
        </div>

        {/* RIGHT COLUMN: Recipient Device (Device B) */}
        <div className="lg:col-span-4 rounded-3xl bg-white border-2 border-[#D3CDC2] p-5 sm:p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E3EDE3] mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#176B50] block">
                  Recipient
                </span>
                <input
                  type="text"
                  value={recipientLabel}
                  onChange={(e) => setRecipientLabel(e.target.value)}
                  className="text-sm font-semibold text-[#153A32] bg-transparent border-b border-transparent hover:border-[#176B50] focus:border-[#176B50] focus:outline-none w-full max-w-[200px]"
                  title="Display name label (educational only)"
                />
              </div>
              <div className="w-8 h-8 rounded-full bg-[#E3EDE3] flex items-center justify-center text-[#176B50]">
                <Unlock size={16} />
              </div>
            </div>

            {/* Secret Key icon stays permanently inside endpoint */}
            <div className="mb-4 px-3 py-2 rounded-xl bg-[#E3EDE3]/60 border border-[#D3CDC2]/60 flex items-center justify-between text-xs">
              <span className="text-[#52665F] flex items-center gap-1.5">
                <Key size={14} className="text-[#A86B16]" />
                Private Identity Key
              </span>
              <span className="font-mono text-[10px] text-[#A86B16] font-bold">
                Holds Secret State
              </span>
            </div>

            {/* Received Message State */}
            <label className="text-xs font-semibold text-[#52665F] block mb-1">
              Received readable message:
            </label>

            {currentStep < 3 && (
              <div className="p-6 rounded-xl border border-dashed border-[#D3CDC2] bg-[#F7F4EC]/40 text-center text-xs text-[#869992] italic">
                Awaiting delivery and decryption...
              </div>
            )}

            {/* Step 4 & 5: Check Passed -> Plaintext Decrypted */}
            {currentStep >= 3 && !isTampered && decryptionResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-[#E3EDE3] border border-[#C5D8C5] text-xs"
              >
                <div className="flex items-center gap-1.5 text-[#176B50] font-bold text-xs mb-2">
                  <CheckCircle2 size={16} />
                  <span>Check passed</span>
                </div>
                <div className="p-3 bg-white rounded-lg text-sm font-medium text-[#153A32] shadow-2xs">
                  "{decryptionResult.plaintext}"
                </div>
                <span className="text-[10px] text-[#52665F] mt-2 block font-mono">
                  AES-GCM tag verified: matching message key confirmed.
                </span>
              </motion.div>
            )}

            {/* Step 5 Tampered Verification Failure */}
            {isTampered && tamperedDecryption && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-[#B8443E]/10 border border-[#B8443E]/30 text-xs"
              >
                <div className="flex items-center gap-1.5 text-[#B8443E] font-bold text-xs mb-2">
                  <ShieldAlert size={16} />
                  <span>Verification Failed</span>
                </div>
                <div className="p-3 bg-white rounded-lg text-xs font-mono text-[#B8443E]">
                  {tamperedDecryption.error}
                </div>
                <span className="text-[10px] text-[#52665F] mt-2 block">
                  The altered ciphertext produced an invalid authentication tag. Plaintext is rejected.
                </span>
              </motion.div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#E3EDE3] text-[11px] text-[#52665F]">
            Decrypted only inside recipient's device with the matching key.
          </div>
        </div>
      </div>

      {/* STABLE "WHAT IS HAPPENING?" EXPLANATION & ACTION PANEL */}
      <div className="w-full rounded-3xl bg-white border-2 border-[#176B50]/40 p-6 sm:p-8 shadow-sm mb-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-mono text-[#176B50] font-semibold uppercase tracking-wider block mb-1">
              What is happening?
            </span>

            {/* STEP 1 EXPLANATION */}
            {currentStep === 0 && (
              <div>
                <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#153A32] mb-1">
                  Step 1: Write
                </h3>
                <p className="text-base text-[#52665F] leading-relaxed">
                  This is your readable message. It has not left this device.
                </p>
              </div>
            )}

            {/* STEP 2 EXPLANATION */}
            {currentStep === 1 && (
              <div>
                <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#153A32] mb-1">
                  Step 2: Prepare Matching Secrets
                </h3>
                <p className="text-base text-[#153A32] font-medium leading-relaxed">
                  The devices use public information and their own private information to independently calculate matching secrets.
                </p>
                <p className="text-sm text-[#52665F] mt-1">
                  The server is not given the secret message key.
                </p>
                {derivedKeyHex && (
                  <div className="mt-3 p-2.5 rounded-xl bg-[#E3EDE3] text-xs font-mono text-[#153A32] flex items-center justify-between">
                    <span>Computed Agreement: <strong className="text-[#176B50]">Matched (256 bits)</strong></span>
                    <span className="text-[#52665F]">Fingerprints: {fingerprintA.slice(0, 9)} / {fingerprintB.slice(0, 9)}</span>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3 EXPLANATION */}
            {currentStep === 2 && (
              <div>
                <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#153A32] mb-1">
                  Step 3: Encrypt and Send
                </h3>
                <p className="text-base text-[#153A32] font-medium leading-relaxed">
                  Your device encrypts the message before sending it. The server receives encrypted data.
                </p>
                <p className="text-sm text-[#52665F] mt-1">
                  A fresh 96-bit nonce was generated by your browser. Plaintext never leaves device boundaries.
                </p>
              </div>
            )}

            {/* STEP 4 EXPLANATION */}
            {currentStep === 3 && (
              <div>
                <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#153A32] mb-1">
                  Step 4: Check and Decrypt
                </h3>
                <p className="text-base text-[#153A32] font-medium leading-relaxed">
                  The recipient’s device uses the matching message key to check and decrypt the packet.
                </p>
                <p className="text-sm text-[#52665F] mt-1">
                  The 16-byte authentication tag verified that no bytes were modified during delivery.
                </p>
              </div>
            )}

            {/* STEP 5 EXPLANATION */}
            {currentStep === 4 && (
              <div>
                <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#153A32] mb-1">
                  Step 5: Try Changing It
                </h3>
                <p className="text-base text-[#153A32] font-medium leading-relaxed">
                  Someone can change the travelling data. Without the secret, they cannot feasibly make the changed packet pass this check.
                </p>
                <p className="text-sm text-[#52665F] mt-1">
                  The tag detects changes. It does not prevent blocking delivery.
                </p>

                {/* Bit flip status */}
                {isTampered && tamperedByteInfo && (
                  <div className="mt-3 p-3 rounded-xl bg-[#F7F4EC] border border-[#D3CDC2] text-xs font-mono space-y-1">
                    <div className="text-[#B8443E] font-bold">Single Bit Flipped in Ciphertext!</div>
                    <div>Original byte 0: {tamperedByteInfo.original.toString(16).padStart(2, '0')} (bin: {tamperedByteInfo.original.toString(2).padStart(8, '0')})</div>
                    <div>Tampered byte 0: {tamperedByteInfo.modified.toString(16).padStart(2, '0')} (bin: {tamperedByteInfo.modified.toString(2).padStart(8, '0')})</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons for Current Step */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {currentStep === 0 && (
              <button
                onClick={handleStep1PrepareKeys}
                disabled={isComputing}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#176B50] text-[#F7F4EC] font-semibold text-sm hover:bg-[#135942] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Prepare our keys
                <ArrowRight size={16} />
              </button>
            )}

            {currentStep === 1 && (
              <button
                onClick={handleStep2Encrypt}
                disabled={isComputing}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#176B50] text-[#F7F4EC] font-semibold text-sm hover:bg-[#135942] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Encrypt my message
                <ArrowRight size={16} />
              </button>
            )}

            {currentStep === 2 && (
              <button
                onClick={handleStep3Deliver}
                disabled={isComputing}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#176B50] text-[#F7F4EC] font-semibold text-sm hover:bg-[#135942] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Deliver to recipient
                <ArrowRight size={16} />
              </button>
            )}

            {currentStep === 3 && (
              <button
                onClick={handleGoToTamper}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#A86B16] text-[#F7F4EC] font-semibold text-sm hover:bg-[#8F5910] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Test Tamper Protection
                <ArrowRight size={16} />
              </button>
            )}

            {currentStep === 4 && (
              <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
                {!isTampered ? (
                  <button
                    onClick={handleFlipBit}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#B8443E] text-white font-semibold text-xs sm:text-sm hover:bg-[#9E3833] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Change one encrypted bit
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleDeliverTampered}
                      disabled={isComputing}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#B8443E] text-white font-semibold text-xs sm:text-sm hover:bg-[#9E3833] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      Deliver the changed packet
                    </button>
                    <button
                      onClick={handleRestoreOriginal}
                      disabled={isComputing}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#176B50] text-white font-semibold text-xs sm:text-sm hover:bg-[#135942] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      Restore and deliver
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Optional "How?" Disclosure */}
        <div className="mt-4 pt-4 border-t border-[#E3EDE3]">
          <button
            onClick={() => setShowHowDisclosure((v) => !v)}
            className="text-xs font-semibold text-[#176B50] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle size={14} />
            <span>How does this specific step work behind the scenes?</span>
            {showHowDisclosure ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <AnimatePresence>
            {showHowDisclosure && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-4 rounded-xl bg-[#F7F4EC] text-xs text-[#52665F] space-y-2"
              >
                {currentStep === 0 && (
                  <p>
                    The sender device holds raw plaintext in device memory. Because encryption happens on-device, network monitors and servers never see this initial text.
                  </p>
                )}
                {currentStep === 1 && (
                  <p>
                    Elliptic Curve Diffie-Hellman (ECDH P-256) lets Device A and Device B combine their own private key with the other's public key. Both arrive at the exact same 256-bit point without transmitting that point over the wire.
                  </p>
                )}
                {currentStep === 2 && (
                  <p>
                    The browser uses AES-GCM with a freshly generated 12-byte random initialization vector (IV). An authentication tag is calculated across both the ciphertext and metadata headers.
                  </p>
                )}
                {currentStep === 3 && (
                  <p>
                    Upon arrival, AES-GCM recalculates the tag. If the tag matches within constant time, decryption proceeds. If even one bit differs, the browser's cryptographic engine throws an error and rejects the output.
                  </p>
                )}
                {currentStep === 4 && (
                  <p>
                    Galois/Counter Mode (GCM) provides authenticity and integrity alongside confidentiality. Altering ciphertext breaks the polynomial evaluation hash (GHASH), making unauthorized tampering immediately detectable.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* CORE TAKEAWAY & UNDERSTANDING CHECK */}
      {currentStep >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-[#E3EDE3]/70 border border-[#C5D8C5] p-6 sm:p-8 mb-12 text-center"
        >
          <span className="text-xs font-mono uppercase tracking-wider text-[#176B50] font-bold block mb-2">
            Core Takeaway
          </span>
          <h3 className="font-heading text-2xl sm:text-3xl font-bold text-[#153A32] mb-3">
            “The server carries the message. The endpoints hold the secrets.”
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto my-6 text-left">
            <div className="p-3.5 rounded-xl bg-white text-xs text-[#153A32] border border-[#D3CDC2]">
              <strong className="block text-[#176B50] mb-1">1. Encrypted Before Sending</strong>
              Plaintext is transformed on the sender's device before entering the network.
            </div>
            <div className="p-3.5 rounded-xl bg-white text-xs text-[#153A32] border border-[#D3CDC2]">
              <strong className="block text-[#176B50] mb-1">2. Checked After Arrival</strong>
              The recipient verifies authentication before recovering readable text.
            </div>
            <div className="p-3.5 rounded-xl bg-white text-xs text-[#153A32] border border-[#D3CDC2]">
              <strong className="block text-[#B8443E] mb-1">3. Alterations Rejected</strong>
              Altered packets fail cryptographic verification and cannot be decrypted.
            </div>
          </div>

          {/* Optional Understanding Check */}
          <div className="max-w-lg mx-auto pt-4 border-t border-[#D3CDC2]/60 text-center">
            <span className="text-sm font-semibold text-[#153A32] block mb-3">
              Where did the readable message become encrypted?
            </span>
            <div className="flex flex-wrap justify-center gap-2.5">
              {[
                { label: "Sender’s device", correct: true },
                { label: "Server", correct: false },
                { label: "Recipient’s device", correct: false },
              ].map((choice, i) => (
                <button
                  key={i}
                  onClick={() => setQuizSelection(choice.label)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    quizSelection === choice.label
                      ? choice.correct
                        ? 'bg-[#176B50] text-[#F7F4EC] border-[#176B50]'
                        : 'bg-[#B8443E] text-white border-[#B8443E]'
                      : 'bg-white text-[#153A32] border-[#D3CDC2] hover:bg-[#F7F4EC]'
                  }`}
                >
                  {choice.label}
                </button>
              ))}
            </div>

            {/* Restrained inline friendly feedback */}
            {quizSelection && (
              <p className="mt-3 text-xs text-[#153A32] font-medium">
                {quizSelection === "Sender’s device"
                  ? "Correct! The message is encrypted inside the sender's device before transmission."
                  : "Not quite. Remember, the server only ever receives ciphertext; encryption occurs on the sender's device."}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </section>
  );
};
