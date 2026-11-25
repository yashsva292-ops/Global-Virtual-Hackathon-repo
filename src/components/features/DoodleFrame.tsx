import React from 'react';

interface DoodleFrameProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * DoodleFrame:
 * Provides a Lazarev-inspired framing around the viewport:
 * - Outer border styled with the authentic WhatsApp doodle wallpaper
 * - Inner card styled in clean WhatsApp Biscotti Cream (#efeae2) with rounded corners and smooth shadow
 */
export const DoodleFrame: React.FC<DoodleFrameProps> = ({ children, className = '' }) => {
  return (
    <div className="relative w-full min-h-screen bg-[#e5ddd5] overflow-x-hidden p-2.5 sm:p-4 md:p-6 lg:p-7 select-none">
      {/* 
        Outer Border Background: WhatsApp Doodle Wallpaper
        Pattern overlay on soft cream backdrop with subtle opacity 
      */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: 'url(/whatsapp-doodle.jpg)',
          backgroundSize: '400px 400px',
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Subtle outer gradient framing */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#075e54]/10 via-transparent to-[#075e54]/15" />

      {/* 
        Inner Canvas:
        Biscotti Cream (#efeae2) with rounded corners, subtle border and deep shadow
      */}
      <div
        className={`relative z-10 w-full min-h-[calc(100vh-1.25rem)] sm:min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-3.5rem)] bg-[#efeae2] rounded-[24px] sm:rounded-[32px] md:rounded-[38px] border border-[#d1d7db]/80 shadow-[0_20px_60px_-15px_rgba(11,20,26,0.18)] overflow-hidden flex flex-col ${className}`}
      >
        {children}
      </div>
    </div>
  );
};

export default DoodleFrame;
