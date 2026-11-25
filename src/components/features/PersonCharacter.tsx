import React from 'react';
import { motion } from 'motion/react';
import { Smartphone } from 'lucide-react';

interface PersonProps {
  isPhoneZoomed?: boolean;
  onPhoneClick?: () => void;
  className?: string;
}

/**
 * PersonSender:
 * Alice (Left Character) styled after reference photo 1:
 * - Casual green jacket with white undershirt
 * - Light blue trousers
 * - Holding smartphone in hands with interactive click / zoom glow
 */
export const PersonSender: React.FC<PersonProps> = ({
  isPhoneZoomed = false,
  onPhoneClick,
  className = '',
}) => {
  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Character Illustration SVG */}
      <svg
        viewBox="0 0 200 420"
        className="w-48 sm:w-56 md:w-64 h-auto drop-shadow-xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft Ground Shadow */}
        <ellipse cx="100" cy="405" rx="65" ry="12" fill="#0b141a" fillOpacity="0.12" />

        {/* Legs / Jeans */}
        {/* Left Leg (straight/supporting) */}
        <path
          d="M82 225 L75 365 L70 388 L92 388 L96 365 L98 225 Z"
          fill="#8ba3c7"
          stroke="#5a77a1"
          strokeWidth="2.5"
        />
        {/* Right Leg (cross/lean pose as in photo) */}
        <path
          d="M102 225 L118 310 L94 370 L115 372 L132 305 L118 225 Z"
          fill="#7d96bb"
          stroke="#5a77a1"
          strokeWidth="2.5"
        />

        {/* Shoes */}
        <path
          d="M66 386 C66 386 64 398 75 398 L94 398 C97 398 97 386 97 386 Z"
          fill="#d8c5aa"
          stroke="#8c785b"
          strokeWidth="2"
        />
        <path
          d="M93 370 C93 370 94 382 105 382 L120 382 C123 382 122 370 122 370 Z"
          fill="#d8c5aa"
          stroke="#8c785b"
          strokeWidth="2"
        />

        {/* Torso / Clothes */}
        {/* White Inner T-shirt */}
        <path
          d="M88 120 L112 120 L116 230 L84 230 Z"
          fill="#f7f9fa"
          stroke="#d1d7db"
          strokeWidth="2"
        />
        {/* Green Outer Jacket (as in photo 1) */}
        <path
          d="M72 122 C64 135 60 160 58 226 L86 226 L88 122 Z"
          fill="#4a7c59"
          stroke="#2e5439"
          strokeWidth="2"
        />
        <path
          d="M128 122 C136 135 140 160 142 226 L114 226 L112 122 Z"
          fill="#4a7c59"
          stroke="#2e5439"
          strokeWidth="2"
        />

        {/* Arms holding phone forward */}
        {/* Left Arm */}
        <path
          d="M62 135 C52 165 65 195 86 198 L88 184 C74 180 66 160 72 138 Z"
          fill="#4a7c59"
        />
        {/* Right Arm */}
        <path
          d="M138 135 C148 165 135 195 114 198 L112 184 C126 180 134 160 128 138 Z"
          fill="#4a7c59"
        />

        {/* Hands */}
        <ellipse cx="89" cy="195" rx="7" ry="6" fill="#f0c29f" />
        <ellipse cx="111" cy="195" rx="7" ry="6" fill="#f0c29f" />

        {/* Neck */}
        <rect x="93" y="102" width="14" height="22" rx="4" fill="#e8b692" />

        {/* Head */}
        <ellipse cx="100" cy="80" rx="19" ry="24" fill="#f4cbab" />

        {/* Hair (Short auburn/brown hair styled forward as in photo) */}
        <path
          d="M80 75 C80 52 95 48 112 50 C125 52 125 65 122 76 C116 70 108 68 100 68 C90 68 84 72 80 75 Z"
          fill="#a45a2a"
        />
        <path
          d="M81 72 C77 78 78 88 81 92 C82 85 84 80 88 77 Z"
          fill="#8c471c"
        />

        {/* Facial profile (looking down at phone) */}
        <ellipse cx="96" cy="84" rx="2" ry="2" fill="#333" />
        <path d="M93 92 Q98 95 104 92" stroke="#a36340" strokeWidth="1.5" strokeLinecap="round" />
        {/* Ear */}
        <ellipse cx="81" cy="82" rx="4" ry="6" fill="#f4cbab" />
      </svg>

      {/* Phone in hands (Interactive anchor that zooms in) */}
      <motion.div
        onClick={onPhoneClick}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          scale: isPhoneZoomed ? [1, 1.2, 1] : 1,
          boxShadow: isPhoneZoomed
            ? '0 0 25px rgba(37,211,102,0.8)'
            : '0 4px 15px rgba(0,0,0,0.2)',
        }}
        transition={{ repeat: isPhoneZoomed ? Infinity : 0, duration: 1.8 }}
        style={{
          position: 'absolute',
          top: '42%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        className="w-8 h-14 bg-[#111b21] rounded-lg border-2 border-[#00a884] flex flex-col items-center justify-between p-0.5 cursor-pointer z-20 group shadow-md"
        title="Click to zoom in phone"
      >
        {/* Mini screen simulation with WhatsApp green glow */}
        <div className="w-full h-full bg-[#075e54] rounded flex flex-col items-center justify-center p-0.5 relative overflow-hidden">
          <div className="w-2 h-0.5 bg-white/40 rounded-full mb-1" />
          <div className="w-4 h-2 bg-white/20 rounded-sm" />
          <div className="w-3 h-1.5 bg-[#d9fdd3] rounded-sm mt-1 self-end mr-0.5" />
        </div>

        {/* Hover Click Hint */}
        <span className="absolute -bottom-6 whitespace-nowrap bg-[#075e54] text-white text-[10px] font-medium px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow pointer-events-none">
          Click to Zoom Chat
        </span>
      </motion.div>
    </div>
  );
};

/**
 * PersonReceiver:
 * Bob (Right Character) styled after reference photo 1:
 * - Salmon / warm coral sweater
 * - Dark skirt / trousers
 * - Ponytail hair
 * - Holding smartphone awaiting message delivery
 */
export const PersonReceiver: React.FC<{
  hasReceived?: boolean;
  className?: string;
}> = ({ hasReceived = false, className = '' }) => {
  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Character Illustration SVG */}
      <svg
        viewBox="0 0 200 420"
        className="w-48 sm:w-56 md:w-64 h-auto drop-shadow-xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft Ground Shadow */}
        <ellipse cx="100" cy="405" rx="65" ry="12" fill="#0b141a" fillOpacity="0.12" />

        {/* Legs / Lower Body */}
        <path
          d="M84 225 L80 375 L76 390 L98 390 L102 370 L102 225 Z"
          fill="#475569"
          stroke="#334155"
          strokeWidth="2.5"
        />
        <path
          d="M106 225 L106 370 L104 390 L126 390 L122 375 L118 225 Z"
          fill="#475569"
          stroke="#334155"
          strokeWidth="2.5"
        />

        {/* Shoes */}
        <path
          d="M72 388 C72 388 70 398 82 398 L98 398 C101 398 101 388 101 388 Z"
          fill="#e2e8f0"
          stroke="#94a3b8"
          strokeWidth="2"
        />
        <path
          d="M104 388 C104 388 102 398 114 398 L128 398 C131 398 131 388 131 388 Z"
          fill="#e2e8f0"
          stroke="#94a3b8"
        />

        {/* Torso: Salmon / Coral Sweater (as in photo 1) */}
        <path
          d="M76 126 C68 140 64 175 66 226 L134 226 C136 175 132 140 124 126 Z"
          fill="#e76f51"
          stroke="#c95537"
          strokeWidth="2"
        />

        {/* Arms holding phone */}
        <path
          d="M68 138 C58 168 70 198 90 200 L94 186 C80 182 72 162 76 142 Z"
          fill="#e76f51"
        />
        <path
          d="M132 138 C142 168 130 198 110 200 L106 186 C120 182 128 162 124 142 Z"
          fill="#e76f51"
        />

        {/* Hands */}
        <ellipse cx="91" cy="196" rx="6" ry="5" fill="#f0c29f" />
        <ellipse cx="109" cy="196" rx="6" ry="5" fill="#f0c29f" />

        {/* Neck */}
        <rect x="94" y="105" width="12" height="22" rx="4" fill="#e8b692" />

        {/* Head */}
        <ellipse cx="100" cy="82" rx="18" ry="23" fill="#f4cbab" />

        {/* Ponytail / Hair (styled back and to the side as in photo 1) */}
        <path
          d="M82 76 C82 52 96 50 114 50 C128 50 134 68 130 84 C138 82 148 92 144 112 C140 126 128 130 124 128 C128 112 124 96 120 90 Z"
          fill="#2b4c5e"
        />
        <path
          d="M82 76 C80 84 82 92 84 94 C85 88 88 82 92 78 Z"
          fill="#1f3744"
        />

        {/* Facial profile looking down */}
        <ellipse cx="95" cy="85" rx="2" ry="2" fill="#333" />
        <path d="M92 93 Q97 96 103 93" stroke="#a36340" strokeWidth="1.5" strokeLinecap="round" />
        <ellipse cx="82" cy="83" rx="4" ry="5" fill="#f4cbab" />
      </svg>

      {/* Receiver Phone in hands */}
      <motion.div
        animate={{
          scale: hasReceived ? [1, 1.25, 1] : 1,
          boxShadow: hasReceived
            ? '0 0 25px rgba(37,211,102,0.9)'
            : '0 4px 15px rgba(0,0,0,0.15)',
        }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'absolute',
          top: '42%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        className="w-8 h-14 bg-[#111b21] rounded-lg border-2 border-[#8696a0] flex flex-col items-center justify-between p-0.5 z-20 shadow-md"
      >
        <div className="w-full h-full bg-[#075e54] rounded flex flex-col items-center justify-center p-0.5 relative overflow-hidden">
          <div className="w-2 h-0.5 bg-white/40 rounded-full mb-1" />
          <div className="w-4 h-2 bg-white/20 rounded-sm" />
          {hasReceived && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-3.5 h-2 bg-[#d9fdd3] rounded-sm mt-1 self-start ml-0.5"
            />
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PersonSender;
