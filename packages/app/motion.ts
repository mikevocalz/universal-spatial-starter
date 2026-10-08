import { defineMotion } from 'kinetrell';

/**
 * Showcase entrance: headline, then intro, then the demo list. The one
 * orchestrated moment in the app; every other screen opens without motion.
 * Native runs it on Reanimated (kinetrell/native), web on GSAP (kinetrell/web/react).
 */
export const showcaseReveal = defineMotion({
  id: 'showcase-reveal',
  initial: {
    headline: { opacity: 0, y: 24 },
    intro: { opacity: 0, y: 16 },
    demos: { opacity: 0, y: 16 },
  },
  tracks: [
    { target: 'headline', to: { opacity: 1, y: 0 }, durationMs: 520, ease: 'cubic.out' },
    { target: 'intro', to: { opacity: 1, y: 0 }, durationMs: 420, delayMs: 160, ease: 'cubic.out' },
    { target: 'demos', to: { opacity: 1, y: 0 }, durationMs: 420, delayMs: 300, ease: 'cubic.out' },
  ],
});
