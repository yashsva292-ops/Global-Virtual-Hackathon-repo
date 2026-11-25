import React, { useEffect, useState, useRef } from 'react';

interface BlockRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  blockColor?: string;
  isReady?: boolean;
  repeatInterval?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * BlockReveal Component
 * Recreates the stylish block reveal effect:
 * A colored block sweeps across from the left (scaleX 0 -> 1 with transform-origin: left),
 * the text behind it is revealed, and the block pulls away to the right (scaleX 1 -> 0 with transform-origin: right).
 * 
 * Runs EXACTLY ONCE on mount/page load and stays revealed permanently.
 */
export const BlockReveal: React.FC<BlockRevealProps> = ({
  children,
  delay = 100,
  duration = 0.5,
  blockColor = '#176B50',
  isReady = true,
  repeatInterval = 0, // Disabled by default: runs strictly once
  className = '',
  style = {},
}) => {
  const [textOpacity, setTextOpacity] = useState(0);
  const [scaleX, setScaleX] = useState(0);
  const [origin, setOrigin] = useState<'left' | 'right'>('left');
  const [transitionEnabled, setTransitionEnabled] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (!isReady || hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    // 1. Reset origin to left and scale to 0
    setTransitionEnabled(false);
    setOrigin('left');
    setScaleX(0);

    // 2. Expand block from left to right after initial delay
    const t1 = setTimeout(() => {
      setTransitionEnabled(true);
      setScaleX(1);
    }, delay);

    // 3. At peak (when fully covered), reveal text, flip origin to right, and contract block away
    const t2 = setTimeout(() => {
      setTextOpacity(1);
      setOrigin('right');
      setScaleX(0);
    }, delay + duration * 1000 + 40);

    // 4. Mark permanently completed and cleanup overlay
    const t3 = setTimeout(() => {
      setHasCompleted(true);
      setTransitionEnabled(false);
    }, delay + duration * 2000 + 100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isReady, delay, duration]);

  return (
    <span
      className={`relative inline-block overflow-hidden py-0.5 sm:py-1 px-1 sm:px-2 align-middle ${className}`}
      style={{
        ...style,
      }}
    >
      {/* Content to reveal - permanently visible once revealed */}
      <span
        style={{
          opacity: hasCompleted ? 1 : textOpacity,
          display: 'inline-block',
          transition: hasCompleted ? 'none' : 'opacity 0.05s ease',
        }}
      >
        {children}
      </span>

      {/* Sliding reveal block overlay - active only during the single one-time reveal */}
      {!hasCompleted && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: blockColor,
            transformOrigin: origin,
            transform: `scaleX(${scaleX})`,
            transition: transitionEnabled
              ? `transform ${duration}s cubic-bezier(0.86, 0, 0.07, 1)`
              : 'none',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />
      )}
    </span>
  );
};

export default BlockReveal;
