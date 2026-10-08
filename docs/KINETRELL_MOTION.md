# Kinetrell motion language

> **Integration specification.** The starter should reuse the APIs in [Kinetrell](https://github.com/mikevocalz/Kinetrell); examples below are based on the current repository. This is not proof that the fork or all five animations are already implemented.

[Documentation index](README.md) · [Rive](RIVE.md) · [Testing](TESTING.md)

## Philosophy: one motion language, three rendering responsibilities

- **Kinetrell:** page entrances, navigation, pane and inspector transitions, scroll reveals, parallax, local chrome choreography, and shared motion timelines.
- **Rive:** authored artboard state machines, interactive button artwork, HUD feedback and in-artboard transitions. Kinetrell may animate the containing panel, **never the same property inside Rive simultaneously**.
- **ViroCore / Eskiu:** engine-owned pose and world transforms. Do not drive headset OS window anchors every frame. Kinetrell can animate UI content within system windows.

**No second app-level motion system.** On web, GSAP and Lenis are accessed **through Kinetrell's adapters**. On native, the execution backend is Reanimated + Worklets. Never introduce a second competing scroll smoothing/controller stack; no Tamagui or Bento.

## Supported entry points verified from the repository

| Entry | Intended environment | Purpose |
| --- | --- | --- |
| `kinetrell/core` | Universal / server-safe pure code | `defineMotion`, `compileMotion`, deterministic motion definitions |
| `kinetrell/native` | React Native | `useMotion`, `Motion.View`, `Motion.Text`, `Motion.Image` |
| `kinetrell/native/gesture` | React Native | `useMotionPanGesture` and input interruption policies |
| `kinetrell/web/react` | Browser-only client boundary | `GsapMotionProvider`, DOM `Motion` elements |
| `kinetrell/web/gsap` | Browser | Actual GSAP timeline adapter |
| `kinetrell/web/lenis` | Browser | Owned Lenis integration |
| `kinetrell/web/gsap-lenis` | Browser | One ticker bridge for GSAP + existing Lenis |

Inspect current exports and [native docs](https://github.com/mikevocalz/Kinetrell/blob/main/docs/native-runtime.md) / [web docs](https://github.com/mikevocalz/Kinetrell/blob/main/docs/react-dom-bindings.md) before implementing. Don't invent API methods.

## Shared timeline example

```tsx
// Shared motion definition: can be imported by native and web hosts.
import { defineMotion, compileMotion } from 'kinetrell/core';

export const panelReveal = defineMotion({
  id: 'panel-reveal',
  initial: { panel: { opacity: 0, y: 16, scale: 0.985 } },
  tracks: [
    { target: 'panel', to: { opacity: 1, y: 0, scale: 1 }, durationMs: 360, ease: 'cubic.out' },
  ],
});

export const compiledPanelReveal = compileMotion(panelReveal);
```

```tsx
// Native client component (simplified). 
import { Motion, useMotion } from 'kinetrell/native';
import { panelReveal } from '../motion/panelReveal';

export function AnimatedPane() {
  const motion = useMotion(panelReveal, {
    autoplay: true,
    reducedMotion: 'system',
  });
  return <Motion.View motion={motion} target="panel" />;
}
```

```tsx
// Next.js client component: do NOT import web adapters into Server Components.
'use client';
import { GsapMotionProvider, Motion } from 'kinetrell/web/react';
import { compiledPanelReveal } from '../motion/panelReveal';

export function AnimatedWebPane() {
  return (
    <GsapMotionProvider motion={compiledPanelReveal} autoplay>
      <Motion.main target="panel">Content</Motion.main>
    </GsapMotionProvider>
  );
}
```

## Five-screen choreography

| Screen | Primary motion | Secondary motion | Never do |
| --- | --- | --- | --- |
| **01 Showcase** | Choreographed hero/editorial reveal and responsive cards | Subtle parallax; staggered focus cues | Excessive continuous glow and scroll hijacking |
| **02 Native** | Rail expand/collapse, pane selection, native inspector arrival | Dividers and subtle pressed feedback | Animate actual fold geometry or break keyboard navigation |
| **03 Hybrid** | Motion-led arrival of the center Rive panel | Synchronize outer chrome to **discrete** Rive events | JS per-frame artboard property mirroring |
| **04 Game** | Start / pause / completion overlays and game HUD entry | Short result reveal; Rive gameplay animation internal | Animate state by setting React state 60 times/second |
| **05 Immersive** | Native tool/HUD transitions, user-invoked spatial chrome | Native/non-immersive responsive transition | Per-frame resizing/re-anchoring Meta system windows |

## Motion tokens (proposed design defaults)

| Token | Value | Intended use |
| --- | --- | --- |
| `micro` | 120–180 ms | Press, hover, focus feedback |
| `standard` | 240–360 ms | Card, sheet, inspector, dock interaction |
| `narrative` | 420–650 ms | Screen-scale first entrance |
| `overshoot` | Subtle and bounded | Raised scan camera action, noncritical emphasis |

Defaults are **design targets**, not animation-framework guarantees. Test physically before freezing values.

## Native gestures, scroll and interruption

- Leave native scroll physics native. `useKinetrellScroll` observes offset and `useScrollScrub` feeds the native playhead on the UI runtime.
- If a pan interrupts a timeline, use Kinetrell's gesture integration; consumers own `Gesture.Simultaneous` vs `Exclusive` relationships.
- One owner of snapping per axis. Cancel stale programmatic scroll requests when a user begins dragging.
- High-frequency UI state belongs on the UI/runtime side, not Zustand or a server component.
- Rive pointer/keyboard inputs retain semantic focus; reduced-motion users still get clear outcome feedback.

## SSR, caching and Next.js 16.4

Keep `kinetrell/core` pure. Define/compile portable motion definitions on a server-safe path if useful, but mount GSAP/Lenis adapters only in `'use client'` components. Cache **data**, not native motion handles, DOM nodes, or player instances. Check hydration for mismatch; the no-JS HTML shell must have meaningful content.

## Accessibility and battery

Honor the OS reduced-motion setting by default (`reducedMotion: 'system'`); decorative motion should settle to a final state. Respect VoiceOver/TalkBack, focus restoration, color contrast, `prefers-reduced-motion`, background/foreground lifecycle and low-power/thermal conditions. Avoid ambient permanent animation loops in side panels. Pause when offscreen.

## Release proof

- Unit-test deterministic core and timeline compilation.
- Record native gesture-interruption/cleanup evidence on Android and iOS devices; no claim of FPS from unit tests.
- Browser-verify SSR hydration, one owned Lenis/GSAP ticker, scroll interruption, reduced-motion, and layout shifts.
- Capture p50/p95/p99 frame time and memory for 20/100/300-target scenes, and content-heavy navigation/inspector transitions on real hardware.
- Include animation screenshots/video in each PR and test **all five** demo routes.

Sources: [Kinetrell README](https://github.com/mikevocalz/Kinetrell) · [Capabilities](https://github.com/mikevocalz/Kinetrell/blob/main/docs/capabilities.md) · [Performance](https://github.com/mikevocalz/Kinetrell/blob/main/docs/performance.md).
