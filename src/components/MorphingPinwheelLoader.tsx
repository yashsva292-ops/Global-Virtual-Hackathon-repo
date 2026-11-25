import React from 'react';
import { motion } from 'framer-motion';

/**
 * Geometric Morphing Pinwheel Loader
 * Faithfully re-creates the exact morphing animation from the user's video:
 * A 3x3 array of central dots surrounded by 4 satellite orbital pills/dots
 * that morph, rotate, stretch into rounded bars, and contract in synchronized harmony.
 * Rendered in solid bold black (#000000).
 */
export const MorphingPinwheelLoader: React.FC<{ size?: number }> = ({ size = 32 }) => {
  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      <motion.svg
        viewBox="-50 -50 100 100"
        className="w-full h-full overflow-visible"
        animate={{ rotate: 360 }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {/* Central Core Dot */}
        <circle cx="0" cy="0" r="4.5" fill="#000000" />

        {/* 4 Inner Cross Dots */}
        {[
          { cx: 0, cy: -15 },
          { cx: 15, cy: 0 },
          { cx: 0, cy: 15 },
          { cx: -15, cy: 0 },
        ].map((pt, i) => (
          <circle key={`cross-${i}`} cx={pt.cx} cy={pt.cy} r="4" fill="#000000" />
        ))}

        {/* 4 Inner Diagonal Dots */}
        {[
          { cx: -13, cy: -13 },
          { cx: 13, cy: -13 },
          { cx: 13, cy: 13 },
          { cx: -13, cy: 13 },
        ].map((pt, i) => (
          <circle key={`diag-${i}`} cx={pt.cx} cy={pt.cy} r="3.5" fill="#000000" />
        ))}

        {/* 4 Outer Morphing Satellite Arms: Expanding from dots to rounded pills and rotating */}
        {[0, 90, 180, 270].map((angle, idx) => (
          <motion.g
            key={`arm-${idx}`}
            transform={`rotate(${angle})`}
          >
            <motion.rect
              x="-4"
              y="-38"
              width="8"
              height="18"
              rx="4"
              ry="4"
              fill="#000000"
              animate={{
                height: [8, 22, 8],
                y: [-30, -42, -30],
                rx: [4, 4, 4],
              }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: idx * 0.1,
              }}
            />
          </motion.g>
        ))}
      </motion.svg>
    </div>
  );
};
