import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tinyDiffieHellman } from '../../lib/simulation/cryptoEngine';
import { ChevronDown, ChevronUp, Key, Cpu, Shield, Smartphone, Users, Database, Layers } from 'lucide-react';

export const DeeperExplorationSection: React.FC = () => {
  // Section B Tiny-number DH state: p=23, g=5, default private 6 & 15
  const [pVal] = useState(23);
  const [gVal] = useState(5);
  const [alicePriv, setAlicePriv] = useState(6);
  const [bobPriv, setBobPriv] = useState(15);
  const [showBruteForce, setShowBruteForce] = useState(false);

  // Simplified KDF Key Chain experiment state (Topic D)
  const [chainStep, setChainStep] = useState(0);

  // Compute tiny DH results
  const dh = tinyDiffieHellman(pVal, gVal, alicePriv, bobPriv);

  // Topics A-H accordion/tabs
  const [activeTopic, setActiveTopic] = useState<string | null>('B');

  const toggleTopic = (id: string) => {
    setActiveTopic((prev) => (prev === id ? null : id));
  };

  return (
    <section id="deeper-exploration" className="w-full max-w-5xl mx-auto py-16 px-4 sm:px-8 border-t border-[#D3CDC2]">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-mono uppercase tracking-wider text-[#2E638F] font-bold block mb-2">
          OPTIONAL TECHNICAL DEPTH
        </span>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#153A32] tracking-tight mb-3">
          Open the mechanism
        </h2>
        <p className="text-base text-[#52665F]">
          Explore the exact cryptographic foundations: key agreements, ratchets, authentication tags, and systemic boundaries.
        </p>
      </div>

      <div className="space-y-4">
        {/* A. MESSAGE AND KEYS */}
        <div className="rounded-2xl bg-white border border-[#D3CDC2] p-5 shadow-xs">
          <button
            onClick={() => toggleTopic('A')}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <div>
              <span className="text-xs font-mono text-[#176B50] font-bold uppercase tracking-wider block">
                Topic A
              </span>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-[#153A32]">
                What is the difference between encoding, encryption, and keys?
              </h3>
            </div>
            {activeTopic === 'A' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {activeTopic === 'A' && (
            <div className="mt-4 pt-4 border-t border-[#E3EDE3] text-sm text-[#52665F] space-y-3">
              <p>
                <strong>Plaintext vs Ciphertext:</strong> Plaintext is readable original text. Ciphertext is the pseudorandom binary output produced by an encryption algorithm when combined with a secret key.
              </p>
              <div className="p-3 rounded-xl bg-[#F7F4EC] border border-[#D3CDC2] text-xs">
                <strong>Encoding vs Encryption:</strong> Formats like Hexadecimal, Base64, or ASCII are <em>encodings</em>—standard rules to represent raw bytes without secrecy. Anyone with the format specification can reverse encoding. <em>Encryption</em> relies on secret key material; without the key, reversing ciphertext is computationally infeasible.
              </div>
              <p>
                <strong>Identity Keys vs Symmetric Message Keys:</strong> Long-term asymmetric identity keypairs (public/private) establish endpoint identity. Ephemeral symmetric keys (derived via HKDF) are short-lived 256-bit secrets used strictly to encrypt and decrypt actual message payloads at high speed with low overhead.
              </p>
              <span className="text-[11px] text-[#869992] italic block">
                Educational reference: conceptual explanation.
              </span>
            </div>
          )}
        </div>

        {/* B. HOW MATCHING SECRETS ARE POSSIBLE (Interactive Tiny DH) */}
        <div className="rounded-2xl bg-white border-2 border-[#176B50]/30 p-5 shadow-xs">
          <button
            onClick={() => toggleTopic('B')}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <div>
              <span className="text-xs font-mono text-[#176B50] font-bold uppercase tracking-wider block">
                Topic B • Interactive Model
              </span>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-[#153A32]">
                How can two devices agree on a secret over an open network?
              </h3>
            </div>
            {activeTopic === 'B' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {activeTopic === 'B' && (
            <div className="mt-4 pt-4 border-t border-[#E3EDE3] text-sm text-[#52665F] space-y-4">
              <p>
                Diffie-Hellman allows two parties to create matching secrets over an untrusted channel. Both parties agree on public parameters: a prime modulus <code>p = 23</code> and base generator <code>g = 5</code>.
              </p>

              {/* Warning label */}
              <div className="p-2.5 rounded-lg bg-[#A86B16]/10 border border-[#A86B16]/30 text-xs text-[#A86B16] font-medium">
                Tiny teaching numbers: insecure and not used to protect messages above. Illustrates the mathematical principle of modular exponentiation.
              </div>

              {/* Interactive Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#F7F4EC] border border-[#D3CDC2]">
                <div>
                  <label className="text-xs font-bold text-[#153A32] block mb-1">
                    Alice's Private Value (a):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="22"
                    value={alicePriv}
                    onChange={(e) => setAlicePriv(Number(e.target.value) || 1)}
                    className="w-full p-2 rounded-lg bg-white border border-[#D3CDC2] font-mono text-sm"
                  />
                  <div className="text-xs text-[#52665F] mt-1 font-mono">
                    Public A = 5<sup>{alicePriv}</sup> mod 23 = <strong className="text-[#176B50]">{dh.alicePublic}</strong>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#153A32] block mb-1">
                    Bob's Private Value (b):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="22"
                    value={bobPriv}
                    onChange={(e) => setBobPriv(Number(e.target.value) || 1)}
                    className="w-full p-2 rounded-lg bg-white border border-[#D3CDC2] font-mono text-sm"
                  />
                  <div className="text-xs text-[#52665F] mt-1 font-mono">
                    Public B = 5<sup>{bobPriv}</sup> mod 23 = <strong className="text-[#176B50]">{dh.bobPublic}</strong>
                  </div>
                </div>
              </div>

              {/* Shared Result */}
              <div className="p-4 rounded-xl bg-[#E3EDE3] border border-[#C5D8C5] text-xs font-mono space-y-1 text-[#153A32]">
                <div className="font-bold text-sm">
                  Shared Secret Result: <span className="text-[#176B50] font-black">{dh.aliceShared}</span>
                </div>
                <div>Alice calculates: B<sup>a</sup> mod 23 = {dh.bobPublic}<sup>{alicePriv}</sup> mod 23 = {dh.aliceShared}</div>
                <div>Bob calculates: A<sup>b</sup> mod 23 = {dh.alicePublic}<sup>{bobPriv}</sup> mod 23 = {dh.bobShared}</div>
                <div className="text-[11px] text-[#176B50] font-semibold pt-1 border-t border-[#C5D8C5]">
                  Both endpoints arrived at the exact same secret without sending it through the relay!
                </div>
              </div>

              {/* Small Brute-Force experiment toggle */}
              <div>
                <button
                  onClick={() => setShowBruteForce((b) => !b)}
                  className="text-xs font-semibold text-[#2E638F] hover:underline cursor-pointer"
                >
                  {showBruteForce ? 'Hide tiny brute-force demonstration' : 'Try brute-forcing this tiny prime (p=23)'}
                </button>
                {showBruteForce && (
                  <div className="mt-2 p-3 bg-white rounded-lg border border-[#D3CDC2] text-xs font-mono text-[#52665F]">
                    Because p=23 is tiny, an observer checking 5<sup>x</sup> mod 23 takes at most 22 trials. In production, curves like Curve25519 or P-256 use numbers with hundreds of bits, making brute force search physically impossible with modern computing.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* C. STARTING WHILE A FRIEND IS OFFLINE */}
        <div className="rounded-2xl bg-white border border-[#D3CDC2] p-5 shadow-xs">
          <button
            onClick={() => toggleTopic('C')}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <div>
              <span className="text-xs font-mono text-[#176B50] font-bold uppercase tracking-wider block">
                Topic C
              </span>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-[#153A32]">
                How do we send a message when our friend is offline?
              </h3>
            </div>
            {activeTopic === 'C' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {activeTopic === 'C' && (
            <div className="mt-4 pt-4 border-t border-[#E3EDE3] text-sm text-[#52665F] space-y-3">
              <p>
                In protocols like Signal’s X3DH, users publish <strong>Prekey Bundles</strong> to the server while online:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li><strong>Identity Key (IK):</strong> Long-term identity.</li>
                <li><strong>Signed Prekey (SPK):</strong> Medium-term key, signed by the identity key to prove authenticity.</li>
                <li><strong>One-Time Prekeys (OPK):</strong> Single-use keys consumed upon initiating a session.</li>
              </ul>
              <p className="text-xs">
                When Alice wants to message Bob while Bob is offline, Alice fetches Bob's public prekey bundle from the server, performs cryptographic agreement locally, and sends her initial ciphertext. Bob processes it when he reconnects.
              </p>
              <div className="p-2.5 rounded-lg bg-[#F7F4EC] text-xs text-[#52665F] border border-[#D3CDC2]">
                <em>Note on signatures:</em> A digital signature verifies mathematical integrity and linkage to a private key; it does not in itself verify a real-world legal name without out-of-band verification.
              </div>
            </div>
          )}
        </div>

        {/* D. MAKING MESSAGE KEYS & THE KEY CHAIN */}
        <div className="rounded-2xl bg-white border border-[#D3CDC2] p-5 shadow-xs">
          <button
            onClick={() => toggleTopic('D')}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <div>
              <span className="text-xs font-mono text-[#176B50] font-bold uppercase tracking-wider block">
                Topic D • Interactive Chain
              </span>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-[#153A32]">
                How are new message keys derived from root secrets?
              </h3>
            </div>
            {activeTopic === 'D' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {activeTopic === 'D' && (
            <div className="mt-4 pt-4 border-t border-[#E3EDE3] text-sm text-[#52665F] space-y-3">
              <p>
                A <strong>Key Derivation Function (KDF)</strong> acts as a cryptographic ratchet. Given an input key and constant inputs, it produces two outputs:
              </p>
              <div className="p-3 bg-[#F7F4EC] rounded-xl border border-[#D3CDC2] text-xs font-mono">
                <code>KDF(ChainKey_i) → (ChainKey_{"{i+1}"}, MessageKey_i)</code>
              </div>
              <p className="text-xs">
                Step through this simplified one-way ratchet state evolution:
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setChainStep((s) => s + 1)}
                  className="px-4 py-2 rounded-lg bg-[#176B50] text-[#F7F4EC] text-xs font-semibold cursor-pointer"
                >
                  Step Ratchet Forward
                </button>
                <span className="font-mono text-xs text-[#153A32]">
                  Step #{chainStep} | Current Chain State: 0x{((chainStep + 1) * 314159).toString(16).slice(0, 8)}
                </span>
              </div>
              <p className="text-xs text-[#869992]">
                Because the KDF is a one-way cryptographic hash, an attacker who obtains the current key cannot compute previous message keys.
              </p>
            </div>
          )}
        </div>

        {/* E. CHANGING KEYS (Double Ratchet) */}
        <div className="rounded-2xl bg-white border border-[#D3CDC2] p-5 shadow-xs">
          <button
            onClick={() => toggleTopic('E')}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <div>
              <span className="text-xs font-mono text-[#176B50] font-bold uppercase tracking-wider block">
                Topic E
              </span>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-[#153A32]">
                Why does the key change with every single message?
              </h3>
            </div>
            {activeTopic === 'E' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {activeTopic === 'E' && (
            <div className="mt-4 pt-4 border-t border-[#E3EDE3] text-sm text-[#52665F] space-y-3">
              <p>
                “The algorithm stays the same; the secret values evolve.”
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-[#F7F4EC] border border-[#D3CDC2]">
                  <strong className="text-[#176B50] block mb-1">1. Forward Secrecy</strong>
                  If someone compromises a device today, they cannot read past messages because earlier message keys were already securely erased from memory.
                </div>
                <div className="p-3 rounded-xl bg-[#F7F4EC] border border-[#D3CDC2]">
                  <strong className="text-[#176B50] block mb-1">2. Break-in Recovery</strong>
                  When conversation turns happen, new Diffie-Hellman ratchets inject fresh entropy, regaining confidentiality even after a temporary compromise.
                </div>
              </div>
              <p className="text-xs text-[#52665F]">
                <em>Crucial note:</em> Deleting ephemeral message keys prevents recovering recorded raw ciphertext, but does not wipe plaintext chat history already stored on a compromised phone.
              </p>
            </div>
          )}
        </div>

        {/* F. AUTHENTICATION & THE TAG */}
        <div className="rounded-2xl bg-white border border-[#D3CDC2] p-5 shadow-xs">
          <button
            onClick={() => toggleTopic('F')}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <div>
              <span className="text-xs font-mono text-[#176B50] font-bold uppercase tracking-wider block">
                Topic F
              </span>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-[#153A32]">
                What is an authentication tag and how does it detect tampering?
              </h3>
            </div>
            {activeTopic === 'F' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {activeTopic === 'F' && (
            <div className="mt-4 pt-4 border-t border-[#E3EDE3] text-sm text-[#52665F] space-y-3">
              <p>
                Think of the authentication tag as a cryptographic wax seal. The tag is not secret—it travels openly with the ciphertext.
              </p>
              <p className="text-xs">
                What is secret is the ability to generate a <em>valid</em> tag matching the ciphertext and header data. In AES-GCM, the recipient computes the expected tag from the received ciphertext and the shared message key.
              </p>
              <div className="p-3 rounded-xl bg-[#F7F4EC] border border-[#D3CDC2] text-xs">
                <strong>Failure Types:</strong> An authentication failure can stem from random network bitrot, deliberate tampering, or attempting decryption with an incorrect key. Cryptographic checks detect that data is invalid without knowing who altered it.
              </div>
            </div>
          )}
        </div>

        {/* G. WHOSE KEY IS THIS? (Fingerprints & Key Transparency) */}
        <div className="rounded-2xl bg-white border border-[#D3CDC2] p-5 shadow-xs">
          <button
            onClick={() => toggleTopic('G')}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <div>
              <span className="text-xs font-mono text-[#176B50] font-bold uppercase tracking-wider block">
                Topic G
              </span>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-[#153A32]">
                How do we know the public key belongs to the right person?
              </h3>
            </div>
            {activeTopic === 'G' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {activeTopic === 'G' && (
            <div className="mt-4 pt-4 border-t border-[#E3EDE3] text-sm text-[#52665F] space-y-3">
              <p>
                If an untrusted relay substituted its own public key for Bob's, it could perform a Man-in-the-Middle attack.
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-[#F7F4EC] border border-[#D3CDC2]">
                  <strong>1. Safety Numbers / QR Codes:</strong> Both users compare a 60-digit number or scan a QR code out-of-band (e.g. in person). This hash derives directly from both public identity keys.
                </div>
                <div className="p-3 rounded-xl bg-[#F7F4EC] border border-[#D3CDC2]">
                  <strong>2. Key Transparency:</strong> Modern services maintain auditable, append-only Merkle-tree logs of public keys so clients can automatically verify that the server serves consistent keys to everyone.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* H. LIMITS AND PRACTICAL SECURITY BOUNDARIES */}
        <div className="rounded-2xl bg-white border border-[#D3CDC2] p-5 shadow-xs">
          <button
            onClick={() => toggleTopic('H')}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <div>
              <span className="text-xs font-mono text-[#176B50] font-bold uppercase tracking-wider block">
                Topic H
              </span>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-[#153A32]">
                What are the practical limits of end-to-end encryption?
              </h3>
            </div>
            {activeTopic === 'H' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {activeTopic === 'H' && (
            <div className="mt-4 pt-4 border-t border-[#E3EDE3] text-sm text-[#52665F] space-y-2 text-xs">
              <div>• <strong>Metadata visibility:</strong> Relays necessarily know who is communicating, at what time, and roughly how large packets are.</div>
              <div>• <strong>Delivery disruption:</strong> Relays cannot read packets, but they can drop or block them.</div>
              <div>• <strong>Endpoint compromise:</strong> Malware or screen recording on a phone reveals plaintext after decryption.</div>
              <div>• <strong>Linked devices:</strong> Each companion tablet or desktop is an independent cryptographic endpoint requiring pairwise encryption.</div>
              <div>• <strong>Group chats:</strong> Use Sender Keys and fan-out mechanisms to manage scalability across many participants.</div>
              <div>• <strong>Backups:</strong> Cloud chat backups must be encrypted separately, or they bypass on-device protections.</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
