import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { E2EEHomePage } from './components/features/E2EEHomePage';
import { MainGuidedSimulator } from './components/features/MainGuidedSimulator';
import { DeeperExplorationSection } from './components/features/DeeperExplorationSection';
import { WhyPrivacyMattersStory } from './components/features/WhyPrivacyMattersStory';
import { ClosingSectionAndFooter } from './components/features/ClosingSectionAndFooter';
import { GreetingPreloader } from './components/GreetingPreloader';
import { WordsPreloader, type WordPreloaderPhase } from './components/WordsPreloader';
import { Persistent3DTransition } from './components/features/Persistent3DTransition';
import { MOTION_CONFIG, prefersReducedMotion } from './motion.config';

gsap.registerPlugin(ScrollTrigger);

/**
 * Unified Transition State Model:
 * HOME -> ENTERING_LOADER -> LOADING -> REVEALING_SIMULATOR -> SIMULATOR
 * Normal forward progression never passes through HOME after LOADING!
 */
export type AppTransitionState =
  | 'HOME'
  | 'ENTERING_LOADER'
  | 'LOADING'
  | 'REVEALING_SIMULATOR'
  | 'SIMULATOR';

export const App: React.FC = () => {
  // Original Greeting Preloader ('Hello', 'Bonjour', ...) plays at calm natural cadence
  const [hasVisited, setHasVisited] = useState(false);

  // Single explicit coordinated transition state
  const [appState, setAppState] = useState<AppTransitionState>('HOME');

  const [preloaderPhase, setPreloaderPhase] = useState<WordPreloaderPhase>('idle');
  const [triggerType, setTriggerType] = useState<'button' | 'scroll'>('button');
  const [scrollFraction, setScrollFraction] = useState<number>(0);
  const [isInteractiveScroll, setIsInteractiveScroll] = useState<boolean>(false);
  const [buttonOrigin, setButtonOrigin] = useState<{ x: number; y: number } | null>(null);
  const [simulatorScrollProgress, setSimulatorScrollProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const simulatorRef = useRef<HTMLDivElement>(null);
  const transitionActiveRef = useRef(false);

  // Inertial smooth scrolling with Lenis driven by GSAP ticker & synced with ScrollTrigger
  useEffect(() => {
    const isReduced = prefersReducedMotion();
    if (isReduced) {
      const onScroll = () => setScrollY(window.scrollY || 0);
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }

    const lenis = new Lenis({
      lerp: MOTION_CONFIG.lenis.lerp,
      smoothWheel: MOTION_CONFIG.lenis.smoothWheel,
    });

    lenis.on('scroll', (e: { scroll: number }) => {
      setScrollY(e.scroll);
      ScrollTrigger.update();
    });

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
    };
  }, []);

  // 1. User clicks the "Find out in 2 minutes" primary button on HomePage -> instant transition cover
  const handleStartDeepDive = (origin?: { x: number; y: number }) => {
    if (appState !== 'HOME' || transitionActiveRef.current) return;
    transitionActiveRef.current = true;

    if (origin) {
      setButtonOrigin(origin);
      setTriggerType('button');
    } else {
      setTriggerType('button');
    }

    setIsInteractiveScroll(false);
    setScrollFraction(1);
    setSimulatorScrollProgress(0);

    // Immediately activate transition surface cover
    setAppState('ENTERING_LOADER');
    setPreloaderPhase('expanding');
  };

  // Scroll detection on HomePage:
  // - Interactive scrubbing: scrolling down moves Biscotti cream boundary upward in real-time
  // - Reversible: user can scroll back up before 50%
  // - Automatic smooth retraction: if user stops scrolling and hasn't reached >= 50%, smoothly retract to 0
  // - Lock-in threshold: when reaching >= 50% (halfway point), automatically locks and advances smoothly to 100%
  useEffect(() => {
    if (!hasVisited || appState !== 'HOME') return;

    let accumulatedScroll = 0;
    const maxScrollDistance = 450;
    let retractTimer: ReturnType<typeof setTimeout> | null = null;
    let retractAnimFrame: number | null = null;

    const smoothlyRetract = () => {
      if (accumulatedScroll <= 0 || appState !== 'HOME') {
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
      }, 350);
    };

    const handleWheel = (e: WheelEvent) => {
      if (appState !== 'HOME' || transitionActiveRef.current) return;
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

      if (fraction >= 0.50) {
        transitionActiveRef.current = true;
        setTriggerType('scroll');
        setScrollFraction(1);
        setAppState('ENTERING_LOADER');
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
      if (appState !== 'HOME' || transitionActiveRef.current) return;
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

      if (fraction >= 0.50) {
        transitionActiveRef.current = true;
        setTriggerType('scroll');
        setScrollFraction(1);
        setAppState('ENTERING_LOADER');
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
  }, [hasVisited, appState]);

  // 2. Loading curtain reaches full screen -> enters stable LOADING state
  const handleBubbleExpanded = () => {
    setAppState('LOADING');
    setPreloaderPhase('loading');
  };

  // 3. Compiling reaches 100% -> enter REVEALING_SIMULATOR continuously
  const handleLoadingComplete = () => {
    // Simulator mounts beneath the cover immediately
    setAppState('REVEALING_SIMULATOR');

    const isReduced = prefersReducedMotion();
    if (isReduced) {
      setSimulatorScrollProgress(1);
      setPreloaderPhase('exiting');
      return;
    }

    // Brief, intentional pause to let visitor register 100% and SCROLL lock (~200ms)
    setTimeout(() => {
      let start: number | null = null;
      const duration = 850; // Smooth 0.85s continuous reveal
      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(1, elapsed / duration);
        setSimulatorScrollProgress(progress);

        if (progress >= 1) {
          setPreloaderPhase('exiting');
        } else {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    }, 200);
  };

  // 4. Preloader exiting animation completes -> enter pure SIMULATOR state
  const handlePreloaderExited = () => {
    setAppState('SIMULATOR');
    setPreloaderPhase('idle');
    setIsInteractiveScroll(false);
    setScrollFraction(0);
    setSimulatorScrollProgress(1);
    transitionActiveRef.current = false;
  };

  // Helper for clicking "SCROLL" button on loading page
  const handleAdvanceSimulatorScroll = () => {
    if (appState !== 'LOADING' && appState !== 'REVEALING_SIMULATOR') return;
    let start: number | null = null;
    const duration = 800;
    const initialP = simulatorScrollProgress;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(1, initialP + (1 - initialP) * (elapsed / duration));
      setSimulatorScrollProgress(progress);
      if (progress >= 1) {
        setPreloaderPhase('exiting');
      } else {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  };

  const handleBackToHome = () => {
    // Smooth reset returning to HOME
    setAppState('HOME');
    setPreloaderPhase('idle');
    setSimulatorScrollProgress(0);
    setScrollFraction(0);
    setIsInteractiveScroll(false);
    transitionActiveRef.current = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const transitionStage: 'hero' | 'card' | 'simulator' =
    appState === 'SIMULATOR' || appState === 'REVEALING_SIMULATOR'
      ? 'simulator'
      : appState === 'ENTERING_LOADER' || appState === 'LOADING'
      ? 'card'
      : 'hero';

  // Simulator is mounted in REVEALING_SIMULATOR and SIMULATOR
  const isSimulatorMounted = appState === 'REVEALING_SIMULATOR' || appState === 'SIMULATOR';

  // Staggered reveal when simulator enters
  useEffect(() => {
    if (!isSimulatorMounted || !simulatorRef.current) return;
    const isReduced = prefersReducedMotion();
    const targets = simulatorRef.current.querySelectorAll('.sim-reveal');
    if (targets.length === 0) return;

    gsap.fromTo(
      targets,
      { opacity: 0, y: isReduced ? 0 : 24 },
      {
        opacity: 1,
        y: 0,
        duration: isReduced ? 0.25 : 0.6,
        stagger: isReduced ? 0 : 0.08,
        ease: 'power2.out',
        clearProps: 'transform',
      }
    );
  }, [isSimulatorMounted]);

  return (
    <div className="relative w-full min-h-screen bg-[#F7F4EC] text-[#153A32] selection:bg-[#176B50] selection:text-white">
      {/* 
        Persistent 3D Bubble Scene across Card and Simulator:
        Never visible on HOME; clipped strictly during LOADING; smoothly continuous during REVEALING_SIMULATOR;
        confined to simulator background during SIMULATOR.
      */}
      {transitionStage !== 'hero' && (
        <Persistent3DTransition
          stage={transitionStage}
          scrollProgress={simulatorScrollProgress}
          scrollY={scrollY}
        />
      )}

      {/* 
        Initial Visitor Arrival: Original Greeting Preloader
      */}
      {!hasVisited && (
        <GreetingPreloader onComplete={() => setHasVisited(true)} />
      )}

      {/* 
        Full-Viewport Transition Surface Cover:
        Active throughout ENTERING_LOADER, LOADING, and REVEALING_SIMULATOR.
        Guarantees the homepage is NEVER exposed during or after loading!
      */}
      {(appState === 'ENTERING_LOADER' || appState === 'LOADING' || appState === 'REVEALING_SIMULATOR') && (
        <div
          className="fixed inset-0 z-[100] bg-[#F7F4EC] pointer-events-none transition-opacity duration-300"
          style={{
            opacity: appState === 'REVEALING_SIMULATOR' ? 1 - simulatorScrollProgress : 1,
          }}
          aria-hidden="true"
        />
      )}

      {/* 
        Compiling Studio Preloader:
      */}
      <WordsPreloader
        phase={preloaderPhase}
        buttonOrigin={buttonOrigin}
        triggerType={triggerType}
        scrollFraction={scrollFraction}
        isInteractiveScroll={isInteractiveScroll}
        simulatorScrollProgress={simulatorScrollProgress}
        onExpanded={handleBubbleExpanded}
        onLoadingComplete={handleLoadingComplete}
        onExited={handlePreloaderExited}
        onScrollRequested={handleAdvanceSimulatorScroll}
      />

      {/* 
        Homepage View:
        Only interactive and visible during HOME.
      */}
      {appState === 'HOME' && (
        <div className="relative z-[1]">
          <E2EEHomePage
            onNavigateToSimulator={handleStartDeepDive}
            isInitialReady={hasVisited}
          />
        </div>
      )}

      {/* 
        Simulator Section:
        Mounted beneath the cover during REVEALING_SIMULATOR, fully interactive during SIMULATOR.
      */}
      {isSimulatorMounted && (
        <div
          ref={simulatorRef}
          className="fixed inset-0 z-[10] w-full min-h-screen bg-[#E9EEE5]/90 backdrop-blur-xs pt-8 pb-0 px-4 sm:px-8 overflow-y-auto"
          style={{ willChange: 'opacity' }}
        >
          {/* Top Return Button */}
          <div className="sim-reveal max-w-6xl mx-auto mb-6 flex items-center justify-between">
            <button
              onClick={handleBackToHome}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D3CDC2] bg-white text-[#153A32] text-xs font-semibold hover:bg-[#E3EDE3] transition-colors cursor-pointer shadow-xs"
            >
              &larr; Back to Home
            </button>
            <span className="text-xs font-mono text-[#52665F]">
              Step-by-Step Educational Lab
            </span>
          </div>

          {/* 1. Main Guided Simulator (Aarav & Meera with 5-step cryptographic journey) */}
          <MainGuidedSimulator />

          {/* 2. Deeper Technical Exploration Section (Topics A-H + Tiny DH) */}
          <DeeperExplorationSection />

          {/* 3. Why Privacy Matters Story (Aarav & Meera with friend vs relay views) */}
          <WhyPrivacyMattersStory />

          {/* 4. Closing Section, Model Disclosures, Sources, and Footer */}
          <ClosingSectionAndFooter
            onRestartSimulator={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onExploreMechanism={() => {
              const el = document.getElementById('deeper-exploration');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>
      )}
    </div>
  );
};

export default App;
