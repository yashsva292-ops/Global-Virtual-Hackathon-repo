/**
 * Centralized Motion Configuration
 * All animation durations, easings, staggers, and scroll parameters.
 */
export const MOTION_CONFIG = {
  durations: {
    // Page & scene transitions (0.6s - 1.2s)
    heroFadeOut: 0.65,
    cardExit: 0.75,
    bubbleSpread: 1.0,
    simulatorEnter: 0.8,
    // Micro-interactions & holds (0.3s - 0.5s)
    holdAt100: 0.3, // 300ms hold when counter hits 100%
    stepCrossFade: 0.38,
    microInteraction: 0.35,
  },
  easings: {
    gsapTransition: 'power3.out',
    gsapSmooth: 'power2.inOut',
    cssTransition: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
  stagger: {
    simulatorElements: 0.08, // 80ms apart
    bubbles: 0.06,
  },
  lenis: {
    lerp: 0.09,
    smoothWheel: true,
  },
} as const;

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
