import React from 'react';

/**
 * Three Sliding Squares Puzzle Loader
 * 3 rounded cubes (Coral Red, Olive Green, Amber) in a 2x2 grid framework.
 * Exactly 1 empty slot at any time.
 * The 3 cubes strictly slide past each other along the orthogonal grid tracks
 * into the adjacent empty slot one by one (like a mechanical sliding block puzzle).
 * They NEVER overlap, combine, or morph.
 */
export const ThreeSquaresLoader: React.FC<{ size?: number }> = ({ size = 22 }) => {
  return (
    <div
      className="relative select-none inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <div className="relative w-full h-full">
        {/* Cube 1: Coral Red (starts at top-left [0,0]) */}
        <div className="absolute w-[calc(50%-2px)] h-[calc(50%-2px)] rounded-[3.5px] bg-[#e25860] shadow-xs cube-1" />

        {/* Cube 2: Olive Green (starts at top-right [1,0]) */}
        <div className="absolute w-[calc(50%-2px)] h-[calc(50%-2px)] rounded-[3.5px] bg-[#adbd81] shadow-xs cube-2" />

        {/* Cube 3: Warm Amber/Peach (starts at bottom-left [0,1]) */}
        <div className="absolute w-[calc(50%-2px)] h-[calc(50%-2px)] rounded-[3.5px] bg-[#f9af67] shadow-xs cube-3" />
      </div>

      <style>{`
        /* 
          Grid layout (2x2):
          [0,0] Top-Left  | [1,0] Top-Right
          [0,1] Bottom-Left | [1,1] Bottom-Right (Starts Empty)

          Total cycle: 12 sequential orthogonal shifts (1 cube moves at a time into the empty slot).
          Speed: 2.8s per full 12-step cycle (smooth, visible, physical slide puzzle feel).
          Cubes slide past each other strictly along the perimeter without combining.
        */

        .cube-1 {
          top: 0;
          left: 0;
          animation: slideCube1 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .cube-2 {
          top: 0;
          right: 0;
          animation: slideCube2 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .cube-3 {
          bottom: 0;
          left: 0;
          animation: slideCube3 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        @keyframes slideCube1 {
          0.00%, 8.33% { transform: translate(0, 0); }
          14.83%, 33.33% { transform: translate(calc(100% + 4px), 0); }
          39.83%, 58.33% { transform: translate(calc(100% + 4px), calc(100% + 4px)); }
          64.83%, 83.33% { transform: translate(0, calc(100% + 4px)); }
          89.83%, 100.00% { transform: translate(0, 0); }
        }

        @keyframes slideCube2 {
          0.00% { transform: translate(0, 0); }
          6.50%, 25.00% { transform: translate(0, calc(100% + 4px)); }
          31.50%, 50.00% { transform: translate(calc(-100% - 4px), calc(100% + 4px)); }
          56.50%, 75.00% { transform: translate(calc(-100% - 4px), 0); }
          81.50%, 100.00% { transform: translate(0, 0); }
        }

        @keyframes slideCube3 {
          0.00%, 16.67% { transform: translate(0, 0); }
          23.17%, 41.67% { transform: translate(0, calc(-100% - 4px)); }
          48.17%, 66.67% { transform: translate(calc(100% + 4px), calc(-100% - 4px)); }
          73.17%, 91.67% { transform: translate(calc(100% + 4px), 0); }
          98.17%, 100.00% { transform: translate(0, 0); }
        }
      `}</style>
    </div>
  );
};
