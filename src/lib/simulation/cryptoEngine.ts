/**
 * Real Web Crypto Implementation of End-to-End Encryption
 *
 * Mechanisms:
 * - ECDH P-256 for key pair generation and ephemeral key agreement
 * - HKDF-SHA-256 for deriving a 256-bit symmetric AES-GCM key from shared secret
 * - AES-GCM (256-bit key, 96-bit fresh nonce) for authenticated encryption
 * - Additional Authenticated Data (AAD) bound to the ciphertext
 *
 * Demonstrates real cryptography running purely in the browser.
 */

export interface KeyPairResult {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  publicKeyJwk: JsonWebKey;
  publicKeyHex: string;
}

export interface EncryptedPacket {
  version: string;
  senderId: string;
  recipientId: string;
  timestamp: number;
  nonceHex: string;
  nonceBytes: Uint8Array;
  ciphertextHex: string;
  ciphertextBytes: Uint8Array;
  tagHex: string;
  tagBytes: Uint8Array;
  aad: string;
  senderPublicJwk: JsonWebKey;
  recipientPublicJwk: JsonWebKey;
}

export interface DecryptionResult {
  success: boolean;
  plaintext?: string;
  error?: string;
  tagMatches?: boolean;
}

// Convert ArrayBuffer / Uint8Array to Hex string
export function bytesToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert Hex string to Uint8Array
export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/[^0-9a-fA-F]/g, '');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16);
  }
  return bytes;
}

// Convert ArrayBuffer / Uint8Array to Binary string representation
export function bytesToBinary(bytes: Uint8Array, maxBytes: number = 4): string {
  return Array.from(bytes.slice(0, maxBytes))
    .map((b) => b.toString(2).padStart(8, '0'))
    .join(' ');
}

// Short fingerprint hash of a public key (SHA-256 truncated to 16 hex digits formatted)
export async function computeFingerprint(jwk: JsonWebKey): Promise<string> {
  const enc = new TextEncoder();
  const raw = enc.encode(JSON.stringify(jwk));
  const digest = await window.crypto.subtle.digest('SHA-256', raw);
  const hex = bytesToHex(digest).toUpperCase();
  // Formatted in 4 groups of 4 digits: ABCD 1234 EF56 7890
  return `${hex.slice(0, 4)} ${hex.slice(4, 8)} ${hex.slice(8, 12)} ${hex.slice(12, 16)}`;
}

/**
 * 1. Generate an ECDH P-256 Keypair for an endpoint
 */
export async function generateEndpointKeyPair(): Promise<KeyPairResult> {
  const keyPair = await window.crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true, // extractable
    ['deriveKey', 'deriveBits']
  );

  const publicKeyJwk = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const rawPub = await window.crypto.subtle.exportKey('raw', keyPair.publicKey);
  const publicKeyHex = bytesToHex(rawPub);

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
    publicKeyJwk,
    publicKeyHex,
  };
}

/**
 * 2. Derive Shared Secret using ECDH and HKDF-SHA-256
 */
export async function deriveSymmetricMessageKey(
  myPrivateKey: CryptoKey,
  theirPublicKey: CryptoKey,
  saltStr: string = 'e2ee-educational-model-v1',
  infoStr: string = 'message-encryption-key'
): Promise<{ key: CryptoKey; rawKeyHex: string }> {
  // Step A: ECDH derive shared bits (256 bits)
  const sharedBits = await window.crypto.subtle.deriveBits(
    { name: 'ECDH', public: theirPublicKey },
    myPrivateKey,
    256
  );

  // Step B: Import shared bits as HKDF key material
  const hkdfKey = await window.crypto.subtle.importKey(
    'raw',
    sharedBits,
    { name: 'HKDF' },
    false,
    ['deriveKey']
  );

  const encoder = new TextEncoder();
  const salt = encoder.encode(saltStr);
  const info = encoder.encode(infoStr);

  // Step C: Derive 256-bit AES-GCM key
  const aesKey = await window.crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt,
      info,
    },
    hkdfKey,
    { name: 'AES-GCM', length: 256 },
    true, // extractable for inspection
    ['encrypt', 'decrypt']
  );

  const rawAesKey = await window.crypto.subtle.exportKey('raw', aesKey);
  return {
    key: aesKey,
    rawKeyHex: bytesToHex(rawAesKey),
  };
}

/**
 * 3. Encrypt Plaintext using AES-GCM with fresh 96-bit nonce and authenticated headers
 */
export async function encryptMessage(
  plaintext: string,
  key: CryptoKey,
  senderPublicJwk: JsonWebKey,
  recipientPublicJwk: JsonWebKey,
  senderId: string = 'Sender (Device A)',
  recipientId: string = 'Recipient (Device B)'
): Promise<EncryptedPacket> {
  const encoder = new TextEncoder();
  const encodedPlaintext = encoder.encode(plaintext);

  // Fresh 96-bit (12 bytes) IV / Nonce - NEVER reused
  const nonceBytes = new Uint8Array(12);
  window.crypto.getRandomValues(nonceBytes);

  const timestamp = Date.now();
  const version = '1.0';
  // Additional Authenticated Data (AAD): binds routing metadata into authentication tag
  const aad = JSON.stringify({ version, senderId, recipientId, timestamp });
  const encodedAad = encoder.encode(aad);

  // AES-GCM output contains ciphertext + 16-byte authentication tag appended at the end
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: nonceBytes,
      additionalData: encodedAad,
      tagLength: 128, // 16 bytes auth tag
    },
    key,
    encodedPlaintext
  );

  const encryptedArray = new Uint8Array(encryptedBuffer);
  // Split ciphertext from 16-byte tag
  const ciphertextBytes = encryptedArray.slice(0, encryptedArray.length - 16);
  const tagBytes = encryptedArray.slice(encryptedArray.length - 16);

  return {
    version,
    senderId,
    recipientId,
    timestamp,
    nonceHex: bytesToHex(nonceBytes),
    nonceBytes,
    ciphertextHex: bytesToHex(ciphertextBytes),
    ciphertextBytes,
    tagHex: bytesToHex(tagBytes),
    tagBytes,
    aad,
    senderPublicJwk,
    recipientPublicJwk,
  };
}

/**
 * 4. Decrypt Packet using AES-GCM with authentication check
 */
export async function decryptPacket(
  packet: EncryptedPacket,
  key: CryptoKey
): Promise<DecryptionResult> {
  try {
    const encoder = new TextEncoder();
    const encodedAad = encoder.encode(packet.aad);

    // Recombine ciphertext and 16-byte tag for Web Crypto SubtleCrypto
    const combined = new Uint8Array(packet.ciphertextBytes.length + packet.tagBytes.length);
    combined.set(packet.ciphertextBytes);
    combined.set(packet.tagBytes, packet.ciphertextBytes.length);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: packet.nonceBytes,
        additionalData: encodedAad,
        tagLength: 128,
      },
      key,
      combined
    );

    const decoder = new TextDecoder('utf-8', { fatal: true });
    const plaintext = decoder.decode(decryptedBuffer);

    return {
      success: true,
      plaintext,
      tagMatches: true,
    };
  } catch {
    return {
      success: false,
      tagMatches: false,
      error: 'Authentication tag check failed: data has been altered or decrypted with wrong key.',
    };
  }
}

/**
 * 5. Tamper with Packet (Bit Flip)
 * Flips exactly 1 bit in the specified byte of ciphertext
 */
export function flipBitInPacket(packet: EncryptedPacket, byteIndex: number = 0, bitPosition: number = 0): {
  tamperedPacket: EncryptedPacket;
  originalByte: number;
  tamperedByte: number;
} {
  const tamperedCiphertextBytes = new Uint8Array(packet.ciphertextBytes);
  const targetByteIdx = Math.min(byteIndex, tamperedCiphertextBytes.length - 1);
  const originalByte = tamperedCiphertextBytes[targetByteIdx];

  // XOR with (1 << bitPosition) flips exactly that single bit
  const tamperedByte = originalByte ^ (1 << (bitPosition % 8));
  tamperedCiphertextBytes[targetByteIdx] = tamperedByte;

  return {
    tamperedPacket: {
      ...packet,
      ciphertextBytes: tamperedCiphertextBytes,
      ciphertextHex: bytesToHex(tamperedCiphertextBytes),
    },
    originalByte,
    tamperedByte,
  };
}

/**
 * 6. Interactive Tiny-Number Diffie-Hellman model (educational)
 * p = 23 (prime modulus), g = 5 (generator)
 */
export function tinyDiffieHellman(
  p: number = 23,
  g: number = 5,
  alicePrivate: number = 6,
  bobPrivate: number = 15
) {
  // Modular exponentiation helper: (base^exp) % mod
  const modPow = (base: number, exp: number, mod: number): number => {
    let res = 1;
    base = base % mod;
    let e = exp;
    while (e > 0) {
      if (e % 2 === 1) res = (res * base) % mod;
      e = Math.floor(e / 2);
      base = (base * base) % mod;
    }
    return res;
  };

  const alicePublic = modPow(g, alicePrivate, p); // 5^6 mod 23 = 8
  const bobPublic = modPow(g, bobPrivate, p);     // 5^15 mod 23 = 19

  const aliceShared = modPow(bobPublic, alicePrivate, p); // 19^6 mod 23 = 2
  const bobShared = modPow(alicePublic, bobPrivate, p);   // 8^15 mod 23 = 2

  return {
    p,
    g,
    alicePrivate,
    bobPrivate,
    alicePublic,
    bobPublic,
    aliceShared,
    bobShared,
    matches: aliceShared === bobShared,
  };
}
