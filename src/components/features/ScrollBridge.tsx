import React from 'react';
import { motion } from 'framer-motion';
import { ExhibitCharacter } from './ExhibitCharacter';
import { Smartphone, ArrowDown } from 'lucide-react';

interface ScrollBridgeProps {
  onOpenSimulator: () => void;
}

export const ScrollBridge: React.FC<ScrollBridgeProps> = ({ onOpenSimulator }) => {
  return (
    <section className="relative w-full py-20 px-4 sm:px-8 bg-[#E3EDE3]/40 border-y border-[#D3CDC2]/60 flex flex-col items-center justify-center text-center">
      <div className="w-full max-w-3xl flex flex-col items-center">
        {/* Larger Sender Character */}
        <ExhibitCharacter type="sender" size={200} className="mb-4" />

        {/* Headline beside character */}
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-[#153A32] tracking-tight mb-3">
          Let’s send your first secret message.
        </h2>

        {/* Supporting line */}
        <p className="text-lg sm:text-xl text-[#52665F] max-w-xl leading-relaxed mb-8">
          Write something on my phone. We’ll follow what happens to it.
        </p>

        {/* The phone itself as an accessible interactive button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenSimulator}
          aria-label="Open the encryption simulator"
          className="relative group p-6 rounded-3xl bg-white border-2 border-[#176B50] shadow-md hover:shadow-lg transition-all flex flex-col items-center gap-3 cursor-pointer max-w-xs w-full focus-visible:outline-2 focus-visible:outline-[#176B50]"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#E3EDE3] flex items-center justify-center text-[#176B50]">
            <Smartphone size={32} />
          </div>
          <div className="text-center">
            <span className="font-bold text-base sm:text-lg text-[#153A32] block">
              Enter Sender Device
            </span>
            <span className="text-xs text-[#52665F] block mt-0.5">
              Click to open encryption simulator
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#176B50] group-hover:underline mt-1">
            Open the encryption simulator
            <ArrowDown size={14} />
          </span>
        </motion.button>

        {/* Visible conventional button as well */}
        <div className="mt-5">
          <button
            onClick={onOpenSimulator}
            className="px-6 py-2.5 rounded-xl bg-[#176B50] text-[#F7F4EC] font-semibold text-sm hover:bg-[#135942] active:scale-[0.98] transition-all cursor-pointer"
          >
            Open the encryption simulator
          </button>
        </div>
      </div>
    </section>
  );
};
