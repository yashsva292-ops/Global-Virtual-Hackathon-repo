import React, { useState } from 'react';
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
} from 'lucide-react';

export interface WhatsAppPhoneChatProps {
  onSendMessage: (message: string) => void;
  onClose?: () => void;
  isZoomed?: boolean;
}

const QUICK_CHIPS = ['MEET AT DAWN', 'SECRET KEY 42', 'E2EE IS SAFE'];

export const WhatsAppPhoneChat: React.FC<WhatsAppPhoneChatProps> = ({
  onSendMessage,
  onClose,
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

  const handleChipClick = (chip: string) => {
    setSentHistory((prev) => [...prev, chip]);
    onSendMessage(chip);
    setInputText('');
  };

  return (
    <div className="relative w-full max-w-[380px] sm:max-w-[410px] h-[640px] sm:h-[690px] bg-[#111b21] rounded-[48px] p-3 shadow-[0_30px_90px_rgba(0,0,0,0.6)] border-[5px] border-[#202c33] flex flex-col overflow-hidden select-none">
      {/* Phone Screen Container */}
      <div className="relative w-full h-full rounded-[38px] overflow-hidden flex flex-col bg-[#efeae2]">
        {/* Top Status Bar (inside #075e54) */}
        <div className="w-full h-8 bg-[#075e54] text-white px-5 flex items-center justify-between text-[11px] font-sans font-semibold pt-1 relative z-40">
          {/* Left: 9:41 */}
          <span className="tracking-tight">9:41</span>

          {/* Center: Black Pill Dynamic Island with subtle camera dots */}
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#000000] rounded-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#111b21] mr-3" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#111b21]/70" />
          </div>

          {/* Right: 5G and full 100% battery icon */}
          <div className="flex items-center gap-1.5 opacity-90">
            <span className="text-[10px] font-bold">5G</span>
            <div className="w-5 h-2.5 border border-white rounded-sm p-0.5 flex items-center">
              <div className="w-full h-full bg-white rounded-xs" />
            </div>
          </div>
        </div>

        {/* WhatsApp Header (#075e54) - NO CLOSE (X) BUTTON! */}
        <div className="w-full h-15 bg-[#075e54] text-white px-3 flex items-center justify-between shadow-md z-30">
          <div className="flex items-center gap-1.5">
            {/* White back arrow (triggers zoom-out) */}
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            {/* Circular dark-teal avatar with bold white B & small green online dot */}
            <div className="relative w-9 h-9 rounded-full bg-[#2b4c5e] flex items-center justify-center text-white font-bold text-sm shadow-inner border border-white/20">
              <span>B</span>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#25d366] rounded-full border-2 border-[#075e54]" />
            </div>

            {/* Contact title: Bob (Recipient) with subtitle: online */}
            <div className="flex flex-col text-left ml-1">
              <span className="text-sm font-semibold tracking-wide leading-tight">Bob (Recipient)</span>
              <span className="text-[11px] text-[#d9fdd3] opacity-90 leading-tight">online</span>
            </div>
          </div>

          {/* Right Action Icons: video call, voice call, vertical 3-dot menu */}
          <div className="flex items-center gap-3 pr-1 text-white/95">
            <button className="hover:text-[#d9fdd3] transition-colors cursor-pointer" title="Video call">
              <Video className="w-4.5 h-4.5" />
            </button>
            <button className="hover:text-[#d9fdd3] transition-colors cursor-pointer" title="Voice call">
              <Phone className="w-4 h-4" />
            </button>
            <button className="hover:text-[#d9fdd3] transition-colors cursor-pointer" title="Menu">
              <MoreVertical className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Chat Canvas */}
        <div className="relative flex-1 p-3 overflow-y-auto flex flex-col justify-between">
          {/* Authentic WhatsApp Doodle Wallpaper Texture */}
          <div
            className="absolute inset-0 z-0 pointer-events-none opacity-25"
            style={{
              backgroundImage: 'url(/whatsapp-doodle.jpg)',
              backgroundSize: '340px 340px',
              backgroundRepeat: 'repeat',
            }}
          />

          {/* Messages Container */}
          <div className="relative z-10 flex flex-col gap-3 w-full">
            {/* Top Centered Yellow Encryption Notice Pill (#fff3c4) */}
            <div className="mx-auto my-1 max-w-[94%] bg-[#fff3c4] border border-[#f5dfa8] rounded-lg p-2 text-center shadow-xs flex items-start gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#594d00] shrink-0 mt-0.5" />
              <p className="text-[11px] leading-tight text-[#594d00] font-sans">
                Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
              </p>
            </div>

            {/* Centered Date Pill: TODAY */}
            <div className="mx-auto bg-white/90 shadow-xs px-2.5 py-0.5 rounded-md text-[10px] font-semibold text-[#54656f] uppercase tracking-wider">
              TODAY
            </div>

            {/* Incoming Message from Bob with Speech Tail */}
            <div className="self-start max-w-[84%] bg-white rounded-2xl rounded-tl-xs px-3 py-2 shadow-xs text-left relative text-[#111b21] border border-black/5">
              <p className="text-xs leading-relaxed">
                Hey Alice! Can you show me how end-to-end encryption actually protects our messages?
              </p>
              <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#667781]">
                <span>10:41 AM</span>
              </div>
            </div>

            {/* Previously Sent Messages */}
            {sentHistory.map((msg, idx) => (
              <div
                key={idx}
                className="self-end max-w-[84%] bg-[#d9fdd3] rounded-2xl rounded-tr-xs px-3 py-2 shadow-xs text-left relative text-[#111b21] border border-[#b2e7a9]/40"
              >
                <p className="text-xs leading-relaxed">{msg}</p>
                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#667781]">
                  <span>10:42 AM</span>
                  <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                </div>
              </div>
            ))}
          </div>

          {/* Quick-reply chip row near the bottom above the input bar */}
          <div className="relative z-10 flex flex-wrap items-center gap-1.5 my-2">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => handleChipClick(chip)}
                className="px-2.5 py-1 rounded-full bg-white/95 hover:bg-[#d9fdd3] text-[#075e54] text-[10px] font-semibold border border-[#00a884]/40 shadow-xs transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Input Bar */}
        <div className="w-full bg-[#f0f2f5] px-2 py-2 flex items-center gap-2 border-t border-[#e9edef] z-30">
          {/* White rounded pill */}
          <div className="flex-1 bg-white rounded-full flex items-center px-3 py-2 shadow-xs border border-[#e9edef]">
            {/* Smiley emoji icon */}
            <Smile className="w-5 h-5 text-[#8696a0] mr-2 cursor-pointer hover:text-[#54656f] transition-colors" />
            {/* Text input with placeholder */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-xs text-[#111b21] placeholder-[#8696a0] outline-none font-sans"
              autoFocus
            />
            {/* Paperclip icon */}
            <Paperclip className="w-4.5 h-4.5 text-[#8696a0] mx-1.5 cursor-pointer hover:text-[#54656f] transition-colors" />
            {/* Camera icon */}
            <Camera className="w-4.5 h-4.5 text-[#8696a0] ml-1 cursor-pointer hover:text-[#54656f] transition-colors" />
          </div>

          {/* Circular WhatsApp Green (#00a884) Send Button with white paper-plane icon */}
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
