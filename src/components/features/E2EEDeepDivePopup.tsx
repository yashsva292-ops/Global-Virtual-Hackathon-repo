import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ArrowRight, X, Sparkles, Lock } from 'lucide-react';

interface E2EEDeepDivePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterSimulator: () => void;
}

export const E2EEDeepDivePopup: React.FC<E2EEDeepDivePopupProps> = ({
  isOpen,
  onClose,
  onEnterSimulator,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94vw] max-w-lg"
        >
          {/* Frosted Glass Floating Card */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/40 bg-[#0B141A]/90 p-5 shadow-[0_20px_60px_-15px_rgba(7,94,84,0.5)] backdrop-blur-2xl ring-1 ring-white/10">
            {/* Ambient WhatsApp Glow inside card */}
            <div className="pointer-events-none absolute -top-12 -left-12 h-36 w-36 rounded-full bg-emerald-500/15 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-12 -right-12 h-36 w-36 rounded-full bg-teal-500/15 blur-2xl" />

            <div className="relative flex items-start gap-4">
              {/* Glowing WhatsApp Padlock Icon */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-500/25 ring-1 ring-white/20">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>

              {/* Text content */}
              <div className="flex-1 space-y-1 pr-6">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono font-medium text-emerald-400">
                    <Sparkles className="h-3 w-3" />
                    Reading Complete
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">Next Step</span>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">
                  Let's take a deep dive
                </h3>
                <p className="text-xs leading-relaxed text-slate-300">
                  Ready to see how message encryption, public-private keypairs, and zero-knowledge transmission function under the hood?
                </p>

                {/* Primary CTA Button */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={onEnterSimulator}
                    className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/25 transition-all hover:brightness-110 active:scale-95 cursor-pointer"
                  >
                    <Lock className="h-3.5 w-3.5 text-slate-950" />
                    <span>Enter Simulator Page</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </button>

                  <button
                    onClick={onClose}
                    className="rounded-xl px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Keep reading
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                aria-label="Close notification"
                className="absolute top-0 right-0 p-1 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
