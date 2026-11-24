import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Video,
  Phone,
  MoreVertical,
  Smile,
  Paperclip,
  Camera,
  Send,
  Lock,
  CheckCheck,
  X,
  Sparkles,
} from 'lucide-react';

interface WhatsAppPhoneChatProps {
  onSendMessage: (message: string) => void;
  onClose?: () => void;
  isZoomed?: boolean;
}

export const WhatsAppPhoneChat: React.FC<WhatsAppPhoneChatProps> = ({
  onSendMessage,
  onClose,
  isZoomed = true,
}) => {
  const [inputText, setInputText] = useState('');
  const [sentHistory, setSentHistory] = useState<string[]>([]);

  const handleSend = () => {
    const text = inputText.trim() || 'MEET AT DAWN';
    setSentHistory((prev) => [...prev, text]);
    onSendMessage(text);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const setPreset = (preset: string) => {
    setInputText(preset);
  };

  return (
    <div className="relative w-full max-w-[380px] sm:max-w-[410px] h-[640px] sm:h-[690px] bg-[#111b21] rounded-[44px] p-3 shadow-[0_25px_70px_rgba(0,0,0,0.5)] border-[5px] border-[#202c33] flex flex-col overflow-hidden select-none">
      {/* Phone Hardware Notch / Dynamic Island */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#000000] rounded-full z-40 flex items-center justify-center">
        <div className="w-2.5 h-2.5 rounded-full bg-[#111b21] mr-3" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#111b21]/70" />
      </div>

      {/* Close Zoom Button (top right badge) */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
          title="Zoom out"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Phone Screen Container */}
      <div className="relative w-full h-full rounded-[34px] overflow-hidden flex flex-col bg-[#efeae2]">
        {/* iOS / Android Status Bar */}
        <div className="w-full h-7 bg-[#075e54] text-white px-5 flex items-center justify-between text-[11px] font-sans font-semibold pt-1">
          <span>9:41</span>
          <div className="flex items-center gap-1.5 opacity-90">
            <span className="text-[10px]">5G</span>
            <div className="w-5 h-2.5 border border-white rounded-sm p-0.5 flex items-center">
              <div className="w-full h-full bg-white rounded-xs" />
            </div>
          </div>
        </div>

        {/* WhatsApp App Bar Header */}
        <div className="w-full h-15 bg-[#075e54] text-white px-3 flex items-center justify-between shadow-md z-30">
          <div className="flex items-center gap-1.5">
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            {/* Avatar */}
            <div className="relative w-9 h-9 rounded-full bg-[#2b4c5e] flex items-center justify-center text-white font-bold text-sm shadow-inner border border-white/20">
              <span>B</span>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#25d366] rounded-full border-2 border-[#075e54]" />
            </div>

            {/* Contact Name & Status */}
            <div className="flex flex-col text-left ml-1">
              <span className="text-sm font-semibold tracking-wide leading-tight">Bob (Recipient)</span>
              <span className="text-[11px] text-[#d9fdd3] opacity-90 leading-tight">online</span>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3 pr-1 text-white/95">
            <button className="hover:text-[#d9fdd3] transition-colors cursor-pointer">
              <Video className="w-4.5 h-4.5" />
            </button>
            <button className="hover:text-[#d9fdd3] transition-colors cursor-pointer">
              <Phone className="w-4 h-4" />
            </button>
            <button className="hover:text-[#d9fdd3] transition-colors cursor-pointer">
              <MoreVertical className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Chat Message Scrollable Area */}
        <div className="relative flex-1 p-3 overflow-y-auto flex flex-col justify-between">
          {/* Authentic WhatsApp Doodle Wallpaper Texture */}
          <div
            className="absolute inset-0 z-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'url(/whatsapp-doodle.jpg)',
              backgroundSize: '320px 320px',
              backgroundRepeat: 'repeat',
            }}
          />

          {/* Messages Container */}
          <div className="relative z-10 flex flex-col gap-3 w-full">
            {/* End-to-End Encryption Yellow Notification Banner */}
            <div className="mx-auto my-1 max-w-[92%] bg-[#ffeecd] border border-[#f5dfa8] rounded-lg p-2 text-center shadow-xs flex items-start gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#594d00] shrink-0 mt-0.5" />
              <p className="text-[11px] leading-tight text-[#594d00] font-sans">
                <span className="font-semibold">Messages and calls are end-to-end encrypted.</span>{' '}
                No one outside of this chat, not even WhatsApp, can read or listen to them.
              </p>
            </div>

            {/* Date Badge */}
            <div className="mx-auto bg-white/90 shadow-xs px-2.5 py-0.5 rounded-md text-[10px] font-semibold text-[#54656f] uppercase tracking-wider">
              Today
            </div>

            {/* Incoming Message from Bob */}
            <div className="self-start max-w-[82%] bg-white rounded-2xl rounded-tl-xs px-3 py-2 shadow-xs text-left relative text-[#111b21]">
              <p className="text-xs leading-relaxed">
                Hey Alice! Can you show me how end-to-end encryption actually protects our messages?
              </p>
              <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#667781]">
                <span>10:41 AM</span>
              </div>
            </div>

            {/* Any previously sent messages in this session */}
            {sentHistory.map((msg, idx) => (
              <div
                key={idx}
                className="self-end max-w-[82%] bg-[#d9fdd3] rounded-2xl rounded-tr-xs px-3 py-2 shadow-xs text-left relative text-[#111b21]"
              >
                <p className="text-xs leading-relaxed">{msg}</p>
                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#667781]">
                  <span>10:42 AM</span>
                  <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                </div>
              </div>
            ))}
          </div>

          {/* Preset Quick Chips for Instant Testing */}
          <div className="relative z-10 mb-2 flex flex-wrap gap-1.5 justify-center">
            <span className="text-[10px] text-[#54656f] w-full text-center font-medium">
              💡 Click a sample or type your own:
            </span>
            {['MEET AT DAWN', 'SECRET KEY 42', 'E2EE IS SAFE'].map((chip) => (
              <button
                key={chip}
                onClick={() => setPreset(chip)}
                className="px-2 py-0.5 text-[10px] bg-white/90 hover:bg-[#d9fdd3] border border-[#d1d7db] rounded-full text-[#111b21] font-mono transition-all cursor-pointer shadow-xs active:scale-95"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* WhatsApp Bottom Input Bar */}
        <div className="w-full bg-[#f0f2f5] px-2 py-2 flex items-center gap-2 border-t border-[#e9edef] z-30">
          {/* Input Capsule */}
          <div className="flex-1 bg-white rounded-full flex items-center px-3 py-2 shadow-sm border border-[#e9edef]">
            <Smile className="w-5 h-5 text-[#8696a0] mr-2 cursor-pointer hover:text-[#54656f] transition-colors" />
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-xs text-[#111b21] placeholder-[#8696a0] outline-none font-sans"
              autoFocus
            />
            <Paperclip className="w-4.5 h-4.5 text-[#8696a0] mx-1.5 cursor-pointer hover:text-[#54656f] transition-colors" />
            <Camera className="w-4.5 h-4.5 text-[#8696a0] ml-1 cursor-pointer hover:text-[#54656f] transition-colors" />
          </div>

          {/* Green Send Button */}
          <button
            onClick={handleSend}
            className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#06cf9c] active:scale-95 transition-all text-white flex items-center justify-center shadow-md cursor-pointer shrink-0"
            title="Send message"
          >
            <Send className="w-4.5 h-4.5 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppPhoneChat;
