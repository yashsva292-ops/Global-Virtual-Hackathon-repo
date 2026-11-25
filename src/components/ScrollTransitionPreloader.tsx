import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Cryptography and Transition words cycling during the scroll threshold
const SCROLL_WORDS = [
  'Establishing Channel',
  'Diffie-Hellman Key Exchange',
  'Caesar Shift Matrix',
  'Double Ratchet Protocol',
  'End-to-End Handshake',
  'Decrypted Channel Ready',
];

interface ScrollTransitionPreloaderProps {
  isVisible: boolean;
  onAnimationComplete?: () => void;
}

export const ScrollTransitionPreloader: React.FC<ScrollTransitionPreloaderProps> = ({
  isVisible,
  onAnimationComplete,
}) => {
  const [index, setIndex] = useState(0);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setDimension({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      setDimension({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isVisible) {
      setIndex(0);
      return;
    }

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SCROLL_WORDS.length);
    }, 280);

    return () => clearInterval(timer);
  }, [isVisible]);

  const initialPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height + 240} 0 ${dimension.height} L0 0`;
  const exitCurvePath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} 0 0 ${dimension.height} L0 0`;

  return (
    <AnimatePresence onExitComplete={onAnimationComplete}>
      {isVisible && (
        <motion.div
          key="scroll-preloader"
          initial={{ y: '100vh' }}
          animate={{
            y: 0,
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
          }}
          exit={{
            y: '-100vh',
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.1 },
          }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          style={{
            backgroundColor: 'rgba(239, 234, 226, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#00a884] mb-3 font-bold">
              Connecting Devices
            </span>
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.16 }}
              className="text-3xl sm:text-5xl font-black text-[#0b141a] tracking-tight"
              style={{
                fontFamily:
                  'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              }}
            >
              {SCROLL_WORDS[index]}
            </motion.p>
          </div>

          {dimension.width > 0 && (
            <svg className="absolute top-0 left-0 w-full h-[calc(100%+240px)] pointer-events-none -z-10 fill-[#efeae2]/90">
              <motion.path
                initial={{ d: initialPath }}
                animate={{ d: initialPath }}
                exit={{
                  d: exitCurvePath,
                  transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
                }}
              />
            </svg>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
