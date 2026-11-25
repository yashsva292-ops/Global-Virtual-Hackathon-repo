import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { E2EEHomePage } from './components/features/E2EEHomePage';
import { MainGuidedSimulator } from './components/features/MainGuidedSimulator';
import { InteractiveE2EEJourney } from './components/features/InteractiveE2EEJourney';
import { Floating3DShapes } from './components/features/Floating3DShapes';
import { GreetingPreloader } from './components/GreetingPreloader';
import { WordsPreloader, type WordPreloaderPhase } from './components/WordsPreloader';

export const App: React.FC = () => {
  // Original Greeting Preloader ('Hello', 'Bonjour', ...) plays at calm natural cadence
  const [hasVisited, setHasVisited] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'phonesim' | 'simulator'>('home');
  const [preloaderPhase, setPreloaderPhase] = useState<WordPreloaderPhase>('idle');
  const [triggerType, setTriggerType] = useState<'button' | 'scroll'>('scroll');
  const [scrollFraction, setScrollFraction] = useState<number>(0);
  const [isInteractiveScroll, setIsInteractiveScroll] = useState<boolean>(false);
  const [buttonOrigin, setButtonOrigin] = useState<{ x: number; y: number } | null>(null);
  const [isCompilingFinished, setIsCompilingFinished] = useState(false);
  const simulatorRef = useRef<HTMLDivElement>(null);

  // 1. User clicks the "Find out in 2 minutes" primary button on HomePage -> auto-scrolls to loading page!
  const handleStartDeepDive = (origin?: { x: number; y: number }) => {
    if (preloaderPhase !== 'idle') return;
    if (origin) {
      setButtonOrigin(origin);
      setTriggerType('button');
    } else {
      setTriggerType('scroll');
    }
    setIsInteractiveScroll(false);
    setScrollFraction(1);
    setIsCompilingFinished(false);
    setPreloaderPhase('expanding');
  };

  // Scroll detection on HomePage:
  // - Interactive scrubbing: scrolling down moves Biscotti cream boundary upward in real-time
  // - Reversible: user can scroll back up before 50%
  // - Automatic smooth retraction: if user stops scrolling and hasn't reached >= 50%, smoothly retract to 0
  // - Lock-in threshold: when reaching >= 50% (halfway point), automatically locks and advances smoothly to 100%
  useEffect(() => {
    if (!hasVisited || currentView !== 'home' || preloaderPhase !== 'idle') return;

    let accumulatedScroll = 0;
    const maxScrollDistance = 450; // px of wheel/touch movement to reach 100%
    let retractTimer: ReturnType<typeof setTimeout> | null = null;
    let retractAnimFrame: number | null = null;

    const smoothlyRetract = () => {
      if (accumulatedScroll <= 0 || preloaderPhase !== 'idle') {
        accumulatedScroll = 0;
        setScrollFraction(0);
        setIsInteractiveScroll(false);
        return;
      }

      accumulatedScroll = Math.max(0, accumulatedScroll - 20);
      const frac = accumulatedScroll / maxScrollDistance;
      setScrollFraction(frac);

      if (accumulatedScroll > 0) {
        retractAnimFrame = requestAnimationFrame(smoothlyRetract);
      } else {
        setIsInteractiveScroll(false);
      }
    };

    const scheduleRetract = () => {
      if (retractTimer) clearTimeout(retractTimer);
      if (retractAnimFrame) cancelAnimationFrame(retractAnimFrame);
      retractTimer = setTimeout(() => {
        smoothlyRetract();
      }, 350); // After 350ms of inactivity below threshold, smoothly retract
    };

    const handleWheel = (e: WheelEvent) => {
      if (retractTimer) clearTimeout(retractTimer);
      if (retractAnimFrame) cancelAnimationFrame(retractAnimFrame);

      accumulatedScroll += e.deltaY * 0.9;
      if (accumulatedScroll < 0) accumulatedScroll = 0;

      const fraction = Math.min(1, accumulatedScroll / maxScrollDistance);
      setScrollFraction(fraction);

      if (fraction > 0.02) {
        setIsInteractiveScroll(true);
      } else {
        setIsInteractiveScroll(false);
      }

      // Halfway point (50% / 0.50): automatically begins loading transition
      if (fraction >= 0.50) {
        setTriggerType('scroll');
        // Keep isInteractiveScroll true or transition smoothly so baselineY doesn't jump!
        setScrollFraction(1);
        setIsCompilingFinished(false);
        setPreloaderPhase('expanding');
      } else {
        scheduleRetract();
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (retractTimer) clearTimeout(retractTimer);
      if (retractAnimFrame) cancelAnimationFrame(retractAnimFrame);
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;
      accumulatedScroll += deltaY * 1.3;
      touchStartY = touchY;
      if (accumulatedScroll < 0) accumulatedScroll = 0;

      const fraction = Math.min(1, accumulatedScroll / maxScrollDistance);
      setScrollFraction(fraction);

      if (fraction > 0.02) {
        setIsInteractiveScroll(true);
      } else {
        setIsInteractiveScroll(false);
      }

      // Halfway point (50%) auto-scroll commitment
      if (fraction >= 0.50) {
        setTriggerType('scroll');
        setScrollFraction(1);
        setIsCompilingFinished(false);
        setPreloaderPhase('expanding');
      }
    };

    const handleTouchEnd = () => {
      const fraction = accumulatedScroll / maxScrollDistance;
      if (fraction < 0.50) {
        scheduleRetract();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      if (retractTimer) clearTimeout(retractTimer);
      if (retractAnimFrame) cancelAnimationFrame(retractAnimFrame);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [hasVisited, currentView, preloaderPhase]);

  // 2. Rolling curtain reaches full screen -> opens compiling studio card
  const handleBubbleExpanded = () => {
    setPreloaderPhase('loading');
  };

  // 3. Compiling reaches 100% -> mark compiling finished
  const handleLoadingComplete = () => {
    setIsCompilingFinished(true);
  };

  // 4. Scrolling down triggers navigation ONLY AFTER compiling finishes
  useEffect(() => {
    if (preloaderPhase !== 'loading' || !isCompilingFinished) return;

    let accumulatedDelta = 0;
    const handleWheel = (e: WheelEvent) => {
      // User must scroll down
      if (e.deltaY > 15) {
        accumulatedDelta += e.deltaY;
        if (accumulatedDelta > 45) {
          setPreloaderPhase('exiting');
        }
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      if (touchStartY - touchY > 40) {
        setPreloaderPhase('exiting');
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [preloaderPhase, isCompilingFinished]);

  // When unified curtain exit finishes, lock in phone simulator view and reset preloader
  const handlePreloaderExited = () => {
    setCurrentView('phonesim');
    setPreloaderPhase('idle');
    setIsInteractiveScroll(false);
    setScrollFraction(0);
    setIsCompilingFinished(false);
  };

  // Close control handler: cleanly dismisses loading screen back to homepage
  const handleClosePreloader = () => {
    setPreloaderPhase('idle');
    setIsInteractiveScroll(false);
    setScrollFraction(0);
    setIsCompilingFinished(false);
  };

  const showPhoneSimLayer = currentView === 'phonesim' || preloaderPhase === 'exiting';

  return (
    <div className="relative w-full min-h-screen bg-[#F7F4EC] text-[#153A32] selection:bg-[#176B50] selection:text-white">
      {/* 
        Initial Visitor Arrival: Original Greeting Preloader
        Cycles multilingual greetings ('Hello', 'Bonjour', ...) with calm natural cadence
      */}
      {!hasVisited && (
        <GreetingPreloader onComplete={() => setHasVisited(true)} />
      )}

      {/* 
        Compiling Studio Preloader with Rising WebGL2 Gradient & Lumen Shader Background:
        - Interactive real-time scrubbing with 50% auto-snap threshold
        - Auto-scrolls on clicking 'Scroll to find out in 2 minutes'
      */}
      <WordsPreloader
        phase={preloaderPhase}
        buttonOrigin={buttonOrigin}
        triggerType={triggerType}
        scrollFraction={scrollFraction}
        isInteractiveScroll={isInteractiveScroll}
        onExpanded={handleBubbleExpanded}
        onLoadingComplete={handleLoadingComplete}
        onExited={handlePreloaderExited}
        onClose={handleClosePreloader}
      />

      {/* 
        View Routing:
        - 'home': Human-to-Human E2EE Showcase (Aarav, Meera)
        - 'phonesim': Scroll-Triggered WhatsApp Phone Simulator with live Alice & Bob crypto transit
        - 'simulator': In-depth Guided Cryptographic Lab (5-step interactive lab)
      */}
      {currentView === 'home' && preloaderPhase !== 'exiting' && (
        <E2EEHomePage
          onNavigateToSimulator={handleStartDeepDive}
          isInitialReady={hasVisited}
        />
      )}

      {/* STAGE 1: Phone Simulator (Clean, standalone after loading page, before guided lab) */}
      {showPhoneSimLayer && (
        <motion.div
          ref={simulatorRef}
          initial={preloaderPhase === 'exiting' ? { opacity: 0.45, y: 36, scale: 0.985 } : false}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full min-h-screen bg-[#F7F4EC] py-6 px-4 sm:px-8 overflow-hidden"
        >
          {/* Floating 3D green/white bubbles & sculptural shapes transitioning from loading screen */}
          <Floating3DShapes isTransitioning={preloaderPhase === 'exiting'} />

          <div className="relative z-10 max-w-6xl mx-auto mb-6 flex items-center justify-between">
            <button
              onClick={() => setCurrentView('home')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D3CDC2] bg-white text-[#153A32] text-xs font-semibold hover:bg-[#E3EDE3] transition-colors cursor-pointer shadow-xs"
            >
              &larr; Back to Home
            </button>

            <button
              onClick={() => setCurrentView('simulator')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#176B50] hover:bg-[#153A32] text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-98"
            >
              <span>Explore Cryptography Lab</span>
              &rarr;
            </button>
          </div>

          {/* E2EE Phones & Scrambled Encryption Animation Section */}
          <div className="relative z-10 max-w-6xl mx-auto rounded-3xl bg-[#F7F4EC] border border-[#D3CDC2] shadow-sm overflow-hidden mb-12">
            <InteractiveE2EEJourney onExploreMore={() => setCurrentView('simulator')} />
          </div>
        </motion.div>
      )}

      {/* STAGE 2: Deep Dive Technical Guided Lab (Opened when user chooses to advance) */}
      {currentView === 'simulator' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full min-h-screen bg-[#E9EEE5] py-8 px-4 sm:px-8 overflow-hidden"
        >
          <div className="relative z-10 max-w-6xl mx-auto mb-6 flex items-center justify-between">
            <button
              onClick={() => setCurrentView('phonesim')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D3CDC2] bg-white text-[#153A32] text-xs font-semibold hover:bg-[#E3EDE3] transition-colors cursor-pointer shadow-xs"
            >
              &larr; Back to Phone Simulator
            </button>
            <button
              onClick={() => setCurrentView('home')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D3CDC2] bg-white text-[#153A32] text-xs font-semibold hover:bg-[#E3EDE3] transition-colors cursor-pointer shadow-xs"
            >
              Home
            </button>
          </div>

          <div className="relative z-10">
            <MainGuidedSimulator />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default App;
