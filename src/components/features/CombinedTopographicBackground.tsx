import React, { useEffect, useRef } from 'react';
import { TopographicFlow } from '../topographic-flow';

interface CombinedTopographicBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  is3dShaded?: boolean;
}

export const CombinedTopographicBackground: React.FC<CombinedTopographicBackgroundProps> = ({
  children,
  className = '',
  is3dShaded = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // High performance pointer forwarding without React state re-renders (zero React lag)
  useEffect(() => {
    let ticking = false;

    const handlePointerMove = (e: PointerEvent) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Forward synthetic pointermove directly to TopographicFlow host element
          const hostEl = containerRef.current?.querySelector('.topographic-flow');
          if (hostEl) {
            hostEl.dispatchEvent(
              new PointerEvent('pointermove', {
                clientX: e.clientX,
                clientY: e.clientY,
                pointerType: e.pointerType || 'mouse',
                bubbles: false,
              })
            );
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      const hostEl = containerRef.current?.querySelector('.topographic-flow');
      if (hostEl) {
        hostEl.dispatchEvent(
          new PointerEvent('pointerdown', {
            clientX: e.clientX,
            clientY: e.clientY,
            pointerType: e.pointerType || 'mouse',
            bubbles: false,
          })
        );
      }
    };

    const handlePointerLeave = () => {
      const hostEl = containerRef.current?.querySelector('.topographic-flow');
      if (hostEl) {
        hostEl.dispatchEvent(new PointerEvent('pointerleave', { bubbles: false }));
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  return (
    <div className={`relative w-full min-h-screen ${className}`}>
      {/* Fixed Full-Viewport Topographic Flow Canvas */}
      <div ref={containerRef} className="fixed inset-0 -z-10 h-screen w-screen overflow-hidden">
        {/* Layer 1: Static lightweight ambient lighting gradient */}
        {is3dShaded && (
          <div
            className="absolute inset-0 pointer-events-none opacity-50 mix-blend-multiply"
            style={{
              backgroundImage: `
                radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.08) 0%, transparent 60%),
                radial-gradient(circle at 20% 20%, rgba(0, 0, 0, 0.06) 0%, transparent 50%),
                linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(220, 226, 235, 0.3) 100%)
              `,
            }}
          />
        )}

        {/* 
          Layer 2: ReactDrops Topographic Flow with exact 33.33% : 33.33% : 33.33% ratio:
          - 33.33% Pure Solid Black lines (#000000)
          - 33.33% WhatsApp Vibrant Green lines (#25D366)
          - 33.33% WhatsApp Dark Emerald Green lines (#0b5c48)
        */}
        <TopographicFlow
          animateEntrance={true}
          scale={460}
          density={4.6}
          speed={1.9}
          distortion={2.5}
          lineWidth={1.4}
          opacity={1}
          dashLength={7}
          dashGap={8}
          seed={42}
          gradientDiffusion={0}
          paused={false}
          hover={0.7}
          hoverRadius={200}
          hoverFollow={0.15}
          hoverFade={0.7}
          hoverEffect={'rings'}
          backgroundColor={'#ffffff'}
          backgroundImage={'none'}
          gradientColors={[]}
          grain={0}
          lineColor={'#000000'}
          accentColor={'#25D366'}
          linePalette={[
            '#000000', // Pure Solid Black (33.33%)
            '#25D366', // WhatsApp Vibrant Green (33.33%)
            '#0b5c48', // WhatsApp Deep Dark Green (33.33%)
          ]}
          lineStyle={'solid'}
          className="h-full w-full"
        />

        {/* Soft atmospheric gradient to blend into page sections */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white/20" />
      </div>

      {/* Page Content Layer */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};
