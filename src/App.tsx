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
import { WordsPreloader, unlockLoadingAudio, type WordPreloaderPhase } from './components/WordsPreloader';
import { Persistent3DTransition } from './components/features/Persistent3DTransition';
import { MOTION_CONFIG, prefersReducedMotion } from './motion.config';

gsap.registerPlugin(ScrollTrigger);

/**
 * Unified Transition State Model:
 * HOME -> ENTERING_LOADER -> LOADING -> REVEALING_SIMULATOR -> SIMULATOR
 */
export type AppTransitionState =
  | 'HOME'
  | 'ENTERING_LOADER'
  | 'LOADING'
  | 'REVEALING_SIMULATOR'
  | 'SIMULATOR';

export const App: React.FC = () => {
  const [hasVisited, setHasVisited] = useState(false);
  const [appState, setAppState] = useState<AppTransitionState>('HOME');
  const [preloaderPhase, setPreloaderPhase] = useState<WordPreloaderPhase>('idle');
  const [triggerType, setTriggerType] = useState<'button' | 'scroll'>('scroll');
  const [scrollFraction, setScrollFraction] = useState<number>(0);
  const [isInteractiveScroll, setIsInteractiveScroll] = useState<boolean>(false);
  const [buttonOrigin, setButtonOrigin] = useState<{ x: number; y: number } | null>(null);
  const [simulatorScrollProgress, setSimulatorScrollProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState<'guided-simulator' | 'deeper-exploration' | 'why-privacy-matters' | 'closing-takeaway'>('guided-simulator');
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

  // 1. User clicks the primary button on HomePage -> instant transition cover
  const handleStartDeepDive = (origin?: { x: number; y: number }) => {
    unlockLoadingAudio();
    if (appState !== 'HOME' || transitionActiveRef.current) return;
    transitionActiveRef.current = true;

    if (origin) {
      setButtonOrigin(origin);
      setTriggerType('button');
    } else {
      setTriggerType('scroll');
    }

    setIsInteractiveScroll(false);
    setScrollFraction(1);
    setSimulatorScrollProgress(0);
    setAppState('ENTERING_LOADER');
    setPreloaderPhase('expanding');
  };

  // Scroll detection on HomePage:
  // - Interactive scrubbing: scrolling down moves Biscotti cream boundary upward in real-time
  // - Reversible: user can scroll back up before 50%
  // - Lock-in threshold: at >= 50%, automatically locks and advances smoothly to 100%
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
      unlockLoadingAudio();
      if (appState !== 'HOME' || transitionActiveRef.current) return;
      if (retractTimer) clearTimeout(retractTimer);
      if (retractAnimFrame) cancelAnimationFrame(retractAnimFrame);

      accumulatedScroll += e.deltaY * 0.9;
      if (accumulatedScroll < 0) accumulatedScroll = 0;

      const fraction = Math.min(1, accumulatedScroll / maxScrollDistance);
      setScrollFraction(fraction);
      setIsInteractiveScroll(fraction > 0.02);

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
      unlockLoadingAudio();
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
      setIsInteractiveScroll(fraction > 0.02);

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
    setAppState('REVEALING_SIMULATOR');

    const isReduced = prefersReducedMotion();
    if (isReduced) {
      setSimulatorScrollProgress(1);
      setPreloaderPhase('exiting');
      return;
    }

    // Brief, intentional pause to let visitor register 100% and SCROLL lock (~220ms)
    setTimeout(() => {
      let start: number | null = null;
      const duration = 900;
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
    }, 220);
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

  // Close control handler: cleanly dismisses loading screen back to homepage
  const handleClosePreloader = () => {
    setAppState('HOME');
    setPreloaderPhase('idle');
    setIsInteractiveScroll(false);
    setScrollFraction(0);
    setSimulatorScrollProgress(0);
    transitionActiveRef.current = false;
  };

  const handleBackToHome = () => {
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

  const isSimulatorMounted = appState === 'REVEALING_SIMULATOR' || appState === 'SIMULATOR';

  // Track active section for the compact sticky section-navigation bar
  useEffect(() => {
    if (!isSimulatorMounted) return;
    const sectionIds = ['guided-simulator', 'deeper-exploration', 'why-privacy-matters', 'closing-takeaway'] as const;
    const handleScrollSpy = () => {
      const triggerY = window.innerHeight * 0.32;
      let current: typeof sectionIds[number] = 'guided-simulator';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= triggerY) {
            current = id;
          }
        }
      }
      setActiveSection(current);
    };

    handleScrollSpy();
    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, [isSimulatorMounted]);

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
      {/* Initial Visitor Arrival: Original Greeting Preloader */}
      {!hasVisited && (
        <GreetingPreloader onComplete={() => setHasVisited(true)} />
      )}

      {/* Full-Viewport Transition Surface Cover */}
      {(appState === 'ENTERING_LOADER' || appState === 'LOADING' || appState === 'REVEALING_SIMULATOR') && (
        <div
          className="fixed inset-0 z-[100] bg-[#F7F4EC] pointer-events-none transition-opacity duration-300"
          style={{
            opacity: appState === 'REVEALING_SIMULATOR' ? 1 - simulatorScrollProgress : 1,
          }}
          aria-hidden="true"
        />
      )}

      {/* Compiling Studio Preloader */}
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
        onClose={handleClosePreloader}
      />

      {/* Homepage View */}
      {appState === 'HOME' && (
        <div className="relative z-[1]">
          <E2EEHomePage
            onNavigateToSimulator={handleStartDeepDive}
            isInitialReady={hasVisited}
          />
        </div>
      )}

      {/* Simulator & Three Appended Sections in Single Continuous Scroll */}
      {isSimulatorMounted && (
        <div
          ref={simulatorRef}
          className={`${
            appState === 'REVEALING_SIMULATOR'
              ? 'fixed inset-0 overflow-hidden'
              : 'relative'
          } z-0 w-full min-h-screen bg-[#E9EEE5]`}
          style={{ willChange: 'opacity' }}
        >
          {/*
            Persistent 3D Bubble Scene:
            Mounted inside simulatorRef at z-[1] so it sits above #E9EEE5
            and strictly BEHIND the z-[10] simulator cards & z-40 sticky nav.
          */}
          <Persistent3DTransition
            stage="simulator"
            scrollProgress={simulatorScrollProgress}
            scrollY={scrollY}
          />
          {/* Compact Sticky Section-Navigation Bar */}
          <div className="sticky top-3 z-40 px-4 sm:px-8 pt-4 pointer-events-none">
            <nav
              aria-label="Simulator sections"
              className="pointer-events-auto max-w-6xl mx-auto flex items-center justify-between gap-3 px-3 py-2 rounded-2xl bg-[#FFFEF9]/95 border border-[#D3DBCF] shadow-[0_6px_20px_rgba(21,58,50,0.06)] backdrop-blur-xs"
            >
              <button
                type="button"
                onClick={handleBackToHome}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D3DBCF] bg-white text-[#153A32] text-xs font-semibold hover:bg-[#E3EDE3] transition-colors cursor-pointer"
              >
                &larr; Home
              </button>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {[
                  { id: 'guided-simulator', label: 'Simulator' },
                  { id: 'deeper-exploration', label: 'A closer look' },
                  { id: 'why-privacy-matters', label: 'Why it matters' },
                  { id: 'closing-takeaway', label: 'Takeaway' },
                ].map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      aria-current={isActive ? 'location' : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        const el = document.getElementById(item.id);
                        if (el) {
                          el.scrollIntoView({
                            behavior: prefersReducedMotion() ? 'auto' : 'smooth',
                          });
                        }
                      }}
                      className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                        isActive
                          ? 'bg-[#176B50] text-[#FFFEF9]'
                          : 'text-[#153A32] hover:bg-[#E9EEE5]'
                      }`}
                    >
                      {item.label}
                    </a>
                  );
                })}
              </div>
            </nav>
          </div>

          <div className="relative z-[10] pt-6 pb-12 px-4 sm:px-8">
            {/* Existing Simulator */}
            <div id="guided-simulator" className="scroll-mt-24">
              <MainGuidedSimulator />
            </div>
          </div>

          {/* Section 1: There’s more behind “encrypted”. */}
          <div className="relative z-[10]">
            <DeeperExplorationSection />
          </div>

          {/* Section 2: Some messages need an audience of one. */}
          <div className="relative z-[10]">
            <WhyPrivacyMattersStory />
          </div>

          {/* Section 3: The next time you see “end-to-end encrypted,” it’ll mean a little more. */}
          <div className="relative z-[10]">
            <ClosingSectionAndFooter
              onRestartSimulator={() => {
                const el = document.getElementById('guided-simulator');
                if (el) {
                  el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
                } else {
                  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
                }
              }}
              onExploreMechanism={() => {
                const el = document.getElementById('deeper-exploration');
                if (el) el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
