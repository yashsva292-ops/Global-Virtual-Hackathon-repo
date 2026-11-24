import React, { useState, useRef } from 'react';
import { E2EEHomePage } from './components/features/E2EEHomePage';
import { E2EEMainPage } from './components/features/E2EEMainPage';
import { CaesarCipherInteraction } from './components/features/CaesarCipherInteraction';

export const App: React.FC = () => {
  // Direct immediate arrival: no loading interstitials, Hello, or percentage preloaders
  const [currentView, setCurrentView] = useState<'home' | 'main' | 'simulator'>('home');
  const simulatorRef = useRef<HTMLDivElement>(null);

  // Directly navigate to simulator from homepage
  const handleStartSimulator = () => {
    setCurrentView('simulator');
  };

  return (
    <div className="relative w-full min-h-screen bg-[#F7F4EC] text-[#153A32] selection:bg-[#176B50] selection:text-white">
      {/* 
        View Routing:
        - 'home': Recreated Reference Hero Page with Centered Title, Side Characters (Aarav & Meera), 
                  WhatsApp chat doodles background, live encrypted floating message journey, and instant arrival.
        - 'main': The Main Page (Lazarev-inspired Doodle frame, Hero Question, 1:1 WhatsApp Chat, E2EE Journey)
        - 'simulator': Technical E2EE Simulator Lab with Caesar / AES interactive cipher tools
      */}
      {currentView === 'home' && (
        <E2EEHomePage
          onNavigateToSimulator={handleStartSimulator}
        />
      )}

      {currentView === 'main' && (
        <E2EEMainPage
          onBackToHome={() => setCurrentView('home')}
          onNavigateToSimulator={() => setCurrentView('simulator')}
        />
      )}

      {currentView === 'simulator' && (
        <div ref={simulatorRef} className="relative w-full min-h-screen">
          <CaesarCipherInteraction onScrollToTop={() => setCurrentView('home')} />
        </div>
      )}
    </div>
  );
};

export default App;
