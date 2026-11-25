import React from 'react';

interface CharacterProps {
  type: 'sender' | 'recipient';
  className?: string;
  size?: number;
}

/**
 * Editorial Science Exhibit Vector Characters
 *
 * Sender: Young man, warm brown skin (#9C6442), short dark hair (#241C16),
 * forest-green overshirt (#176B50), cream T-shirt (#F7F4EC), charcoal trousers (#3A4440),
 * holding a modern mobile device. Facing slightly inward.
 *
 * Recipient: Young woman, warm brown skin (#9C6442), tied-back dark hair (#241C16),
 * muted terracotta top (#B85D43), cream trousers (#EDE8DE), holding a phone.
 * Facing slightly inward.
 */
export const ExhibitCharacter: React.FC<CharacterProps> = ({ type, className = '', size = 180 }) => {
  if (type === 'sender') {
    return (
      <svg
        width={size}
        height={size * 1.3}
        viewBox="0 0 160 210"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`select-none ${className}`}
        aria-label="Illustration of sender: young man holding a phone"
        role="img"
      >
        {/* Shadow base */}
        <ellipse cx="80" cy="202" rx="46" ry="6" fill="#153A32" fillOpacity="0.08" />

        {/* Legs / Charcoal trousers */}
        <path d="M64 125 L60 195 L72 195 L76 130 Z" fill="#323C38" />
        <path d="M84 130 L88 195 L100 195 L96 125 Z" fill="#29322E" />
        {/* Shoes */}
        <rect x="52" y="193" width="22" height="7" rx="3" fill="#1B221F" />
        <rect x="86" y="193" width="22" height="7" rx="3" fill="#1B221F" />

        {/* Torso / Inner Cream T-Shirt */}
        <path d="M62 62 Q80 66 98 62 L96 128 L64 128 Z" fill="#EDE9DF" stroke="#D3CDC2" strokeWidth="1" />

        {/* Forest Green Overshirt */}
        <path d="M54 62 L64 128 L56 126 L44 80 Z" fill="#176B50" />
        <path d="M106 62 L96 128 L104 126 L116 80 Z" fill="#135942" />
        <path d="M54 62 L74 62 L68 126 L62 126 Z" fill="#176B50" />
        <path d="M106 62 L86 62 L92 126 L98 126 Z" fill="#135942" />

        {/* Arms holding phone */}
        <path d="M48 76 Q42 105 70 114" stroke="#9C6442" strokeWidth="11" strokeLinecap="round" />
        <path d="M112 76 Q118 105 90 114" stroke="#9C6442" strokeWidth="11" strokeLinecap="round" />

        {/* Neck */}
        <path d="M73 50 L87 50 L87 64 L73 64 Z" fill="#9C6442" />

        {/* Head */}
        <ellipse cx="80" cy="40" rx="15" ry="17" fill="#9C6442" />
        {/* Short Dark Hair */}
        <path d="M64 36 C64 22 73 18 83 18 C93 18 97 25 96 36 C92 34 88 35 84 35 C78 35 70 33 64 36 Z" fill="#241C16" />
        <path d="M64 36 L66 43 L69 41 L68 36 Z" fill="#241C16" />

        {/* Expressive minimal face (facing slightly right towards center) */}
        <ellipse cx="84" cy="38" rx="1.6" ry="2.2" fill="#241C16" />
        <path d="M82 34 Q85 33 87 34" stroke="#241C16" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M81 44 Q85 47 87 44" stroke="#7A4C30" strokeWidth="1.3" strokeLinecap="round" />

        {/* Mobile Device held inward */}
        <rect x="70" y="98" width="20" height="34" rx="4" fill="#153A32" stroke="#2E638F" strokeWidth="1.5" />
        <rect x="72" y="102" width="16" height="26" rx="2" fill="#E3EDE3" />
        {/* Screen chat bubble preview */}
        <rect x="74" y="107" width="12" height="4" rx="1.5" fill="#176B50" />
        <rect x="74" y="113" width="9" height="3" rx="1" fill="#2E638F" />

        {/* Thumbs holding phone */}
        <ellipse cx="70" cy="112" rx="3" ry="2" fill="#9C6442" />
        <ellipse cx="90" cy="112" rx="3" ry="2" fill="#9C6442" />
      </svg>
    );
  }

  // Recipient: Young woman
  return (
    <svg
      width={size}
      height={size * 1.3}
      viewBox="0 0 160 210"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      aria-label="Illustration of recipient: young woman holding a phone"
      role="img"
    >
      {/* Shadow base */}
      <ellipse cx="80" cy="202" rx="46" ry="6" fill="#153A32" fillOpacity="0.08" />

      {/* Legs / Cream Trousers */}
      <path d="M64 125 L61 195 L73 195 L77 130 Z" fill="#EDE8DE" stroke="#D3CDC2" strokeWidth="0.8" />
      <path d="M83 130 L87 195 L99 195 L96 125 Z" fill="#E4DED4" stroke="#D3CDC2" strokeWidth="0.8" />
      {/* Shoes */}
      <rect x="54" y="193" width="21" height="7" rx="3" fill="#6A5342" />
      <rect x="85" y="193" width="21" height="7" rx="3" fill="#6A5342" />

      {/* Torso / Muted Terracotta Top */}
      <path d="M60 64 Q80 67 100 64 L96 128 L64 128 Z" fill="#B85D43" />
      <path d="M68 64 Q80 72 92 64 Z" fill="#9C6442" />

      {/* Arms holding phone */}
      <path d="M50 78 Q44 105 70 114" stroke="#9C6442" strokeWidth="10" strokeLinecap="round" />
      <path d="M110 78 Q116 105 90 114" stroke="#9C6442" strokeWidth="10" strokeLinecap="round" />

      {/* Neck */}
      <path d="M74 50 L86 50 L86 64 L74 64 Z" fill="#9C6442" />

      {/* Tied-back Hair behind head */}
      <circle cx="89" cy="34" r="8" fill="#241C16" />
      <rect x="85" y="32" width="4" height="6" rx="2" fill="#B85D43" />

      {/* Head */}
      <ellipse cx="80" cy="40" rx="14" ry="16" fill="#9C6442" />
      {/* Hair on top/front */}
      <path d="M66 36 C66 22 75 19 82 19 C89 19 94 24 94 36 C89 33 83 33 78 34 C72 35 68 36 66 36 Z" fill="#241C16" />

      {/* Expressive minimal face (facing slightly left towards center) */}
      <ellipse cx="76" cy="38" rx="1.6" ry="2.2" fill="#241C16" />
      <path d="M73 34 Q76 33 79 34" stroke="#241C16" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M73 44 Q76 47 79 44" stroke="#7A4C30" strokeWidth="1.3" strokeLinecap="round" />

      {/* Mobile Device held inward */}
      <rect x="70" y="98" width="20" height="34" rx="4" fill="#153A32" stroke="#176B50" strokeWidth="1.5" />
      <rect x="72" y="102" width="16" height="26" rx="2" fill="#E3EDE3" />
      {/* Screen chat bubble preview */}
      <rect x="74" y="107" width="12" height="4" rx="1.5" fill="#176B50" />
      <rect x="74" y="113" width="10" height="3" rx="1" fill="#A86B16" />

      {/* Thumbs holding phone */}
      <ellipse cx="70" cy="112" rx="2.8" ry="2" fill="#9C6442" />
      <ellipse cx="90" cy="112" rx="2.8" ry="2" fill="#9C6442" />
    </svg>
  );
};
