import React, { useRef } from 'react';
import Iridescence, { type IridescenceProps } from '../Iridescence';

export type WhatsAppBackgroundPreset =
  | 'whatsapp-iridescent'
  | 'whatsapp-dual'
  | 'whatsapp-dark';

export interface E2EEPageBackgroundProps {
  children?: React.ReactNode;
  preset?: WhatsAppBackgroundPreset;
  color?: string | [number, number, number];
  accentColor?: string | [number, number, number];
  cyanColor?: string | [number, number, number];
  darkColor?: string | [number, number, number];
  whiteColor?: string | [number, number, number];
  hueShift?: number;
  speed?: number;
  amplitude?: number;
  stir?: number;
  sheen?: number;
  opacity?: number;
  className?: string;
  iridescenceProps?: Partial<IridescenceProps>;
}

export const E2EEPageBackground: React.FC<E2EEPageBackgroundProps> = ({
  children,
  preset = 'whatsapp-iridescent',
  color,
  accentColor,
  cyanColor,
  darkColor,
  whiteColor,
  hueShift,
  speed = 0.65,
  amplitude = 0,
  stir = 0,
  sheen = 0,
  opacity = 0.92,
  className = '',
  iridescenceProps = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // WhatsApp & Cyan silk color configurations
  let activeColor = color;
  let activeAccent = accentColor;
  let activeCyan = cyanColor;
  let activeDark = darkColor;
  let activeWhite = whiteColor;
  let activeHue = hueShift;

  if (preset === 'whatsapp-iridescent') {
    // Harmonious blend of WhatsApp green, radiant mint, oceanic cyan, deep emerald, and soft silk glints
    activeColor = activeColor ?? '#1da860';
    activeAccent = activeAccent ?? '#2dd4bf';
    activeCyan = activeCyan ?? '#06b6d4';
    activeDark = activeDark ?? '#03261e';
    activeWhite = activeWhite ?? '#dcfce7';
    activeHue = activeHue ?? 0;
  } else if (preset === 'whatsapp-dual') {
    activeColor = activeColor ?? '#064e3b';
    activeAccent = activeAccent ?? '#10b981';
    activeCyan = activeCyan ?? '#06b6d4';
    activeDark = activeDark ?? '#02130e';
    activeWhite = activeWhite ?? '#ffffff';
    activeHue = activeHue ?? 0;
  } else if (preset === 'whatsapp-dark') {
    activeColor = activeColor ?? '#080e12';
    activeAccent = activeAccent ?? '#0f766e';
    activeCyan = activeCyan ?? '#22d3ee';
    activeDark = activeDark ?? '#040b08';
    activeWhite = activeWhite ?? '#ffffff';
    activeHue = activeHue ?? 90;
  }

  return (
    <div className={`relative w-full min-h-screen text-white ${className}`}>
      {/* Fixed Fullscreen Page Background Layer (Non-interactive ambient canvas) */}
      <div
        ref={containerRef}
        className="fixed inset-0 -z-10 h-screen w-screen overflow-hidden pointer-events-none select-none bg-[#070b0e]"
      >
        <Iridescence
          color={activeColor}
          accentColor={activeAccent}
          cyanColor={activeCyan}
          darkColor={activeDark}
          whiteColor={activeWhite}
          hueShift={activeHue}
          speed={speed}
          amplitude={amplitude}
          stir={stir}
          sheen={sheen}
          scale={1}
          detail={5}
          warp={0.32}
          rotation={-35}
          saturation={1.05}
          contrast={1.05}
          brightness={1.18}
          mouseReact={false}
          clickSwirl={false}
          grain={0}
          fade={0}
          opacity={opacity}
          className="h-full w-full pointer-events-none"
          {...iridescenceProps}
        />

        {/* Soft dark crease vignette that preserves the silk ripples */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 35%, rgba(3, 16, 12, 0.15) 0%, rgba(3, 16, 12, 0.55) 100%),
              linear-gradient(to bottom, rgba(3, 14, 10, 0.35) 0%, transparent 40%, rgba(2, 10, 8, 0.65) 100%)
            `,
          }}
        />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 w-full min-h-screen">{children}</div>
    </div>
  );
};
