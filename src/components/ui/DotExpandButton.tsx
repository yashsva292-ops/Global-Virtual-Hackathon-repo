import React, { useState } from 'react';

interface DotExpandButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  text?: string;
  className?: string;
}

/**
 * DotExpandButton Component
 * Recreates the pill button with a trailing dot:
 * - Idle state: Forest green pill (#176B50) with white text and a white dot on the right.
 * - Hover state: The white dot expands horizontally to the left, becoming an inner white pill
 *   that covers the button, while the text inside smoothly inverts to forest green (#176B50).
 * - Active state: Tactile micro-press.
 */
export const DotExpandButton: React.FC<DotExpandButtonProps> = ({
  onClick,
  text = 'Scroll to find out in 2 minutes',
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative inline-flex items-center justify-center rounded-full bg-[#176B50] p-[3px] shadow-[0_4px_16px_rgba(23,107,80,0.25)] hover:shadow-[0_8px_24px_rgba(23,107,80,0.35)] transition-all duration-300 cursor-pointer select-none active:scale-[0.98] ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif",
      }}
    >
      {/* Base Layer: Forest Green background with White Text and trailing White Dot */}
      <div className="flex items-center gap-3.5 px-6 sm:px-7 py-3 sm:py-3.5 text-white font-medium text-sm sm:text-base tracking-tight">
        <span>{text}</span>
        <span
          className={`w-2 h-2 rounded-full bg-white transition-opacity duration-200 ${
            isHovered ? 'opacity-0' : 'opacity-100'
          }`}
        />
      </div>

      {/* Expanding White Pill Layer (expands from right to left) */}
      <div
        className="absolute right-[3px] top-[3px] bottom-[3px] rounded-full bg-white overflow-hidden pointer-events-none transition-all duration-400 ease-[cubic-bezier(0.86,0,0.07,1)]"
        style={{
          width: isHovered ? 'calc(100% - 6px)' : '0px',
          opacity: isHovered ? 1 : 0,
        }}
      >
        {/* Inverted Green Text placed at the exact identical coordinate relative to the right edge */}
        <div className="absolute right-0 top-0 bottom-0 flex items-center gap-3.5 px-6 sm:px-7 text-[#176B50] font-semibold text-sm sm:text-base tracking-tight whitespace-nowrap">
          <span>{text}</span>
          <span className="w-2 h-2 rounded-full bg-[#176B50] opacity-0" />
        </div>
      </div>
    </button>
  );
};

export default DotExpandButton;
