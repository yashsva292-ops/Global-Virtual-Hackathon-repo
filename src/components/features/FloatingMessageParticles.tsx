import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Lock, Key, Shield, CheckCheck, Smile } from 'lucide-react';

interface FloatingMessageParticlesProps {
  scrollYProgress: number; // 0 to 1
  isDissolved?: boolean; // When zoomed in, dissolve slowly
}

interface ParticleConfig {
  id: number;
  type: 'speech' | 'icon' | 'badge';
  content: string | React.ReactNode;
  xPercent: number; // 5 to 90%
  yBasePercent: number; // initial position along vertical track
  speedMultiplier: number;
  scale: number;
  rotateDeg: number;
  bgClass: string;
  textClass: string;
}

const PARTICLES: ParticleConfig[] = [
  {
    id: 1,
    type: 'badge',
    content: (
      <div className="flex items-center gap-1.5 font-sans font-medium text-xs">
        <Lock className="w-3.5 h-3.5 text-[#00a884]" />
        <span>End-to-End</span>
      </div>
    ),
    xPercent: 12,
    yBasePercent: 18,
    speedMultiplier: 0.8,
    scale: 1,
    rotateDeg: -4,
    bgClass: 'bg-white/90 border border-[#d1d7db] shadow-md backdrop-blur-md',
    textClass: 'text-[#111b21]',
  },
  {
    id: 2,
    type: 'speech',
    content: (
      <div className="flex items-center gap-2 text-xs font-sans">
        <span className="font-medium text-[#111b21]">Hey! Are you there?</span>
        <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
      </div>
    ),
    xPercent: 78,
    yBasePercent: 25,
    speedMultiplier: 1.1,
    scale: 1.05,
    rotateDeg: 3,
    bgClass: 'bg-[#d9fdd3] border border-[#b2e7a9] shadow-md',
    textClass: 'text-[#111b21]',
  },
  {
    id: 3,
    type: 'icon',
    content: <MessageSquare className="w-5 h-5 text-white" />,
    xPercent: 20,
    yBasePercent: 42,
    speedMultiplier: 0.9,
    scale: 1.1,
    rotateDeg: -6,
    bgClass: 'bg-[#00a884] shadow-lg shadow-[#00a884]/30',
    textClass: 'text-white',
  },
  {
    id: 4,
    type: 'badge',
    content: (
      <div className="flex items-center gap-1.5 font-mono text-[11px]">
        <Key className="w-3.5 h-3.5 text-[#075e54]" />
        <span>AES-256 GCM</span>
      </div>
    ),
    xPercent: 82,
    yBasePercent: 52,
    speedMultiplier: 1.25,
    scale: 0.95,
    rotateDeg: 4,
    bgClass: 'bg-white/95 border border-[#d1d7db] shadow-md',
    textClass: 'text-[#075e54]',
  },
  {
    id: 5,
    type: 'speech',
    content: (
      <div className="flex items-center gap-1.5 text-xs font-sans">
        <span>🔒 Secret Key Protected</span>
      </div>
    ),
    xPercent: 28,
    yBasePercent: 68,
    speedMultiplier: 0.85,
    scale: 1,
    rotateDeg: -3,
    bgClass: 'bg-[#fff5c4] border border-[#f3e58c] shadow-sm',
    textClass: 'text-[#594d00]',
  },
  {
    id: 6,
    type: 'icon',
    content: <CheckCheck className="w-4 h-4 text-[#00a884]" />,
    xPercent: 72,
    yBasePercent: 74,
    speedMultiplier: 1.15,
    scale: 1.05,
    rotateDeg: -5,
    bgClass: 'bg-white border border-[#d1d7db] shadow-md',
    textClass: 'text-[#00a884]',
  },
  {
    id: 7,
    type: 'speech',
    content: (
      <div className="flex items-center gap-1.5 text-xs font-sans">
        <Smile className="w-3.5 h-3.5 text-[#54656f]" />
        <span>Direct device-to-device</span>
      </div>
    ),
    xPercent: 16,
    yBasePercent: 84,
    speedMultiplier: 0.95,
    scale: 0.95,
    rotateDeg: 5,
    bgClass: 'bg-white/90 border border-[#d1d7db] shadow-md',
    textClass: 'text-[#111b21]',
  },
];

export const FloatingMessageParticles: React.FC<FloatingMessageParticlesProps> = ({
  scrollYProgress,
  isDissolved = false,
}) => {
  return (
    <div
      className={`fixed inset-0 pointer-events-none z-15 transition-opacity duration-700 ${
        isDissolved ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {PARTICLES.map((particle) => {
        // Compute parallax displacement based on scroll
        const yOffset = (scrollYProgress * 280 - 140) * particle.speedMultiplier;

        return (
          <motion.div
            key={particle.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: isDissolved ? 0 : 0.92,
              scale: isDissolved ? 0.6 : particle.scale,
              y: [yOffset - 6, yOffset + 6, yOffset - 6],
              rotate: [particle.rotateDeg - 2, particle.rotateDeg + 2, particle.rotateDeg - 2],
            }}
            transition={{
              opacity: { duration: 0.5 },
              scale: { duration: 0.5 },
              y: { repeat: Infinity, duration: 4 + particle.id * 0.5, ease: 'easeInOut' },
              rotate: { repeat: Infinity, duration: 5 + particle.id * 0.6, ease: 'easeInOut' },
            }}
            style={{
              position: 'absolute',
              left: `${particle.xPercent}%`,
              top: `${particle.yBasePercent}%`,
            }}
            className={`px-3 py-1.5 rounded-2xl flex items-center justify-center select-none ${particle.bgClass} ${particle.textClass}`}
          >
            {particle.content}
          </motion.div>
        );
      })}
    </div>
  );
};

export default FloatingMessageParticles;
