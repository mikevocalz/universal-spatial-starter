
---

# V3 EXTENSION — KINETRELL MOTION SYSTEM + PRINCIPAL-LEVEL VIRO EXTERNAL API MODERNIZATION

> **Date:** 2026-10-08. **Overrides:** These sections supersede conflicting v1/v2 references to animation ownership, design acceptance and `viro-external` change strategy. The five routes remain exactly the same. The companion [`VIRO_EXTERNAL_API_MODERNIZATION_PLAYBOOK.md`](../engineering/VIRO_EXTERNAL_API_MODERNIZATION_PLAYBOOK.md) is the independent, repo-specific plan for `mikevocalz/viro-external`. No source repository or PR is claimed modified by producing these documents.

## 31. Design ambition: recognizable, premium, technically credible

The target is an **award-caliber universal reference experience**, not a UI made noisy by adding every effect. Treat awards as an aspiration: success is judged by usable interfaces, memorable art direction, platform correctness and measured performance—not by claiming an award was won.

### Positioning: `Spatial Atelier`

- **Visual character:** precision-instrument design meets editorial product storytelling: clear typography, confident whitespace, considered color, real depth cues and playful interaction. Not a generic neon-cyberpunk template.
- **Signature moment:** a unified “scene to surface” transition, in which a miniature spatial model/scene from Showcase expands into a native panel, Rive game or immersive Viro view. The *same timing grammar* is reused, but destination presentation is platform-native.
- **Theme:** neutral daylight default + striking restrained accent, thoughtfully designed dark mode. A secondary electric color is reserved for focus, simulation feedback and meaningful status; do not apply glow to every card.
- **Composition:** Showcase has selective editorial bento *layout* (no Bento dependency). Workspace screens have precise, hinge-aware grids. Game Layout uses stage-first composition with atmospheric treatment around the stage, not generic dashboard tiles.
- **Typography:** one purposeful display face + a legible text face with clear fluid scale, tightly managed measure and line height. Avoid crowded captions, tiny controls and decorative type inside gameplay.
- **Surfaces:** native Compose/SwiftUI controls look native; Rive surfaces deliberately look interactive and authored; Viro controls obey real 3D ergonomics. The visual language remains consistent through shared semantic color, typography, radii, depth and motion tokens.
- **Imagery:** bespoke procedural, Rive or original assets, physically plausible light and spatial depth; avoid watermarked stock, unrelated decorative imagery and generic “AI” gradients.
- **Accessibility is part of beauty:** ≥44 pt / appropriate dp-equivalent comfortable minimum for touch, larger XR targets as platform recommends; contrast, high-contrast mode, legible focus, Dynamic Type, VoiceOver/TalkBack, keyboard/controller access, and semantic states.

**Reference workflow:** Collect relevant real patterns with [Mobbin](https://mobbin.com/) for onboarding, adaptive navigation, game HUD and inspectors. Analyze underlying information architecture and motion logic, not pixels. Use [Impeccable](https://github.com/pbakaus/impeccable) for deliberate polish and [no-ai-slop](https://github.com/petergyang/no-ai-slop) to remove generic UI/copy. Build a visual benchmark board and specific notes; do not clone another app.

### Art-direction tokens (starter defaults, not hard requirements)

| Token | Default direction | Use |
|---|---|---|
| Surface 0 | warm near-white or graphite near-black | major canvas/background only |
| Surface 1 | subtly tinted neutral | primary panels / mobile sheets |
| Accent | saturated cobalt/iris | one primary call to action, focus target or game status |
| Secondary accent | restrained orange/coral | contrasting selection and gameplay feedback |
| Text | high-contrast neutral | reading and data |
| Radius | small 8–12 / medium 16–20 / hero 24–32 | intentional hierarchy, not every component pill-shaped |
| Grid | 4-point spacing system, responsive tokens | predictable rhythm |
| Depth | 2–3 optical elevations | clear relationships without excessive shadows |
| Content | comfortable readable column width | no edge-to-edge long-form text |
| Motion | named semantic recipes from §32 | never scattered hardcoded random durations |

Persist tokens through the existing theme package and web/native platform adapters. `@expo/ui` native controls should inherit appropriately translated theme values; Rive artboards use synchronized View Model palette inputs or asset-defined semantic colors. Avoid duplicating hex values in components.

## 32. Kinetrell is THE cross-platform animation language

**Source verified:** [`mikevocalz/Kinetrell`](https://github.com/mikevocalz/Kinetrell) README and docs, accessed 2026-10-08. Current public paths from its package exports include:

- `kinetrell` or `kinetrell/core`: `defineMotion`, `compileMotion`, `evaluateMotion`.
- `kinetrell/native`: `useMotion`, `Motion.View`, `Motion.Text`, `Motion.Image` using Reanimated shared-value playheads.
- `kinetrell/compat/gsap`: `recordGsap` portable recorder.
- `kinetrell/web/gsap`, `kinetrell/web/react`: GSAP execution, provider and DOM components.
- `kinetrell/web/lenis`, `kinetrell/web/gsap-lenis`: one owned Lenis instance/GSAP synchronization; compatible with caller-owned ReactLenis when correctly configured.
- `kinetrell/native/gesture`: interruption-aware pan/gesture bridge.
- Existing native helpers: `useKinetrellScroll`, `useScrollScene`, `useScrollScrub`, `useParallax`, `useNativeScrollController` (verify exact entrypoint/exposed typings at the installed commit before use).

**Platform execution policy:**

| Platform/surface | Animation owner | What it animates | Does not own |
|---|---|---|---|
| iOS / Android RN | `kinetrell/native` → Reanimated/Worklets | panel, toolbar, inspector, content, transitions | OS gestures, native scroll physics |
| Next.js 16.4 DOM client islands | `kinetrell/web/react` → GSAP | storytelling, reveal, stagger, editorial motion | server components, app data fetching |
| Web scroll | Kinetrell's GSAP/Lenis bridge | desktop smoothing and scroll-based editorial choreography | nested native scroll if touch/accessibility requires it |
| Meta / PICO OS spatial window chrome | Kinetrell native RN inside window | content reveal, HUD elements, selection affordances | OS window anchor, window pose or platform compositor |
| Rive `.riv` file | Rive state machines + View Models | characters, stateful buttons, authored stage/game motion | app navigation, host panel geometry, authoritative game state |
| Viro / Eskiu immersive scene | Viro/Eskiu engine update or a **new explicitly built Kinetrell transform adapter** | world-space visual objects, stage props | React Native `Motion.View` (not a Viro node), XR frame pose source |
| Static / accessible alternative | completed styles and explicit state | stable final presentation | decorative looping |

**No competing library policy:** don't introduce another general-purpose animation abstraction. Native uses Reanimated through Kinetrell. Web uses GSAP/Lenis through Kinetrell; if GSAP/Lenis are in `package.json`, they are adapter dependencies, not separate hand-authored scene systems. Skia, Three.js, Rive and Viro retain their specialized rendering clocks, not competing UI-motion engines.

### Define motion once, adapt to renderer

```ts
// packages/motion/src/recipes/panel-enter.ts
import { defineMotion } from 'kinetrell/core';

/** A panel's entrance is visual-only; interaction remains native. */
export const panelEnter = defineMotion({
  id: 'panel-enter',
  initial: { panel: { opacity: 0, y: 20, scale: 0.985 } },
  tracks: [{
    target: 'panel',
    to: { opacity: 1, y: 0, scale: 1 },
    durationMs: 360,
    ease: 'cubic.out',
  }],
});
```

```tsx
// packages/motion/src/native/AnimatedPanel.native.tsx
import { Motion, useMotion } from 'kinetrell/native';
import { panelEnter } from '../recipes/panel-enter';

export function AnimatedPanel({ children }: { children: React.ReactNode }) {
  const motion = useMotion(panelEnter, {
    autoplay: true,
    reducedMotion: 'system',
  });
  return <Motion.View motion={motion} target="panel">{children}</Motion.View>;
}
```

For web, import `compileMotion` from `kinetrell/core`, and `GsapMotionProvider, Motion` from `kinetrell/web/react` **only in a `'use client'` component**. Compile portable definitions on the server when useful; never import `kinetrell/web/*`, GSAP, Lenis, DOM globals, or native Reanimated into an RSC module. Verify SSR + hydration with the Kinetrell `examples/next-ssr` fixture, then run it on Next 16.4 (the current Kinetrell fixture was documented with Next 16.3.8).

```tsx
// App Router client island; JSX is illustrative of the documented public API
'use client';
import { compileMotion } from 'kinetrell/core';
import { GsapMotionProvider, Motion } from 'kinetrell/web/react';
import { panelEnter } from '../recipes/panel-enter';

const compiled = compileMotion(panelEnter);
export function EditorialPanel({ children }: { children: React.ReactNode }) {
  return (
    <GsapMotionProvider motion={compiled} autoplay reducedMotion="system">
      <Motion.main target="panel">{children}</Motion.main>
    </GsapMotionProvider>
  );
}
```

**Never:** call `window` on the server; register GSAP globally during RSC evaluation; drive content transforms from `setState` at 90Hz; animate window anchors from head pose; create a Lenis/GSAP ticker for every panel; or hard-enable experimental Reanimated shared-element/platform transition flags across the app.

### Motion recipes (design defaults, subject to device testing)

| Semantic motion | Target length | Feel | Stop / fallback |
|---|---:|---|---|
| `control-feedback` | 90–160 ms | immediate, tactile | final pressed/selected state |
| `navigation-select` | 180–260 ms | clear, grounded | no spatial travel when reduced motion |
| `panel-enter` | 300–400 ms | a crisp spatial reveal | instantaneous accessible layout |
| `inspector-open` | 240–340 ms | anchored from logical trailing edge | sheet just appears for reduced motion |
| `adaptive-reflow` | 240–420 ms | continuity, not a jump | reposition when reduced motion or fold transition unstable |
| `stage-focus` | 420–620 ms | cinematic emphasis, restrained | fade or cut to stage |
| `success-feedback` | 350–650 ms | authored Rive burst + native status | static status and accessible announcement |
| `scroll-reveal` | progress-driven | content follows reading | content visible without scroll effect |
| `ambient` | subtle/optional | only at idle; low frequency | stop on background, reduced motion, low power |

These are **design targets, not claims about achieved timing**. Use a shared `MotionRecipe` catalog and named `MotionIntent` enum/literal union if typed consumers need it. Reserve GPU budget for the game/Rive main stage rather than animating every surface simultaneously.

### Input and lifecycle

- Gesture Handler claims pointer ownership; Kinetrell pan control handles progression/settling; native scroll retains momentum. Choose the correct `Gesture.Simultaneous` / `Exclusive` relationship explicitly.
- Rive receives semantic commands such as `select`/`attack`; it does not mutate host panel transforms or game authority directly.
- App backgrounding pauses ambient/timeline motion. On return, Kinetrell resumes only legitimately owned motions; game progress and HUD state remain in Zustand, not in an animation clock.
- Reduced-motion preference changes mid-session must be honored. Kinetrell's native policy supports finishing a motion to its stable final state or pausing it when appropriately configured.
- Only animate opaque spatial-window **contents**. OS-level window creation, anchoring, priority and capacity stay managed by Meta/PICO/visionOS adapters.
- On fold/tabletop posture updates, compute a new hinge-safe layout once, then animate the *within-pane* visual continuity; avoid animating the hinge boundary itself into an unsafe frame.

## 33. Five-screen premium motion and visual specs

**Keep exactly five navigable application screens.** Components, previews, Storybook examples and inspector sheets do not become extra routes.

### Screen 01 — Showcase: editorial entry

- Art direction: architectural typography, scene preview object, a deliberately asymmetric *selective* tile layout, coherent device presentation badges, three high-value focal layers.
- Hero reveal: staggered heading/key message/panel preview. A stage preview subtly responds to pointer/gyroscope only if available; no constant dramatic spin.
- Hover/touch: cards use a restrained scale/depth response, not a huge glow; press feedback should be immediate on phones.
- Transition: select card → same semantic `stage-focus` choreography before route, preserve route restoration and keyboard focus. If view transitions are experimental, use deterministic page navigation fallback.
- Mobile: stacked editorial preview, bottom navigation, generous hit targets, safe-area awareness, native contextual menu and haptic confirmation. No desktop-only hover dependency.

### Screen 02 — Native Workspace: crafted productivity

- Native-first controls with an exceptionally legible visual hierarchy; desktop can show two/three panes, mobile can show a pane + native inspector sheet.
- Left rail highlights the selected item using Kinetrell's `navigation-select`; content entry uses `panel-enter`; inspector uses `inspector-open` from trailing edge.
- Resizable divider: pointer drag must not be blocked by animation; ongoing gestures interrupt/cancel prior Kinetrell playback cleanly.
- Fold/dual-screen: visual pane boundary snaps to actual hinge-safe geometry; navigation rail stays on the correct reserved physical edge.
- Accessibility: focus stays in the active logical pane, labels remain meaningful independent of animation; reduced motion does not hide results.

### Screen 03 — Hybrid Workspace: the Rive centerpiece

- Native discovery list left; interactive Rive middle panel; contextual inspector right. The design contrast is intentional, not a mismatched theme.
- Page entry: native shell reveals with Kinetrell; Rive file becomes interactive only after its actual ready state. Use a skeleton with purpose-built style; don't silently leave a black rectangle on load error.
- Interaction: selecting a native list row updates typed Zustand state, Rive View Model, right inspector and accessible announcer. Kinetrell animates the *host response*, Rive animates authored art inside its own surface.
- Mobile: Rive stage first, controls in bottom sheet or adaptive preceding route pane, inspector via trailing sheet; retains loaded stage across sheet toggles.

### Screen 04 — Game Workspace: game-first, not app-first

- Center has strongest optical weight; side controls and HUD are simpler, lower-contrast companions. Playable 30-second game loop from the prior pack remains binding.
- Rive state machine handles attack/collect/feedback art; Kinetrell handles layout enter/exit, stage focus, native HUD appearance, controller highlight and transitions to results.
- One sequence with deliberate timing: ready → focus → input → feedback → score change → reset. Never play long decorative animations that delay player control.
- Phone landscape: full-bleed stage and accessible floating HUD; portrait: stage plus reachable lower controls. Tabletop: stage on upper region, controls below when physically feasible; book posture: controls/master on one physical region, stage on the other.
- Explicit pause/resume/reset. Background/foreground must not restart the Rive game or duplicate ticker subscriptions.

### Screen 05 — Immersive Workspace: quietly convincing spatiality

- Refined placement of left and right companion surfaces along a comfortable stable arc; native 2D fallback remains visually complete.
- Kinetrell animates host UI chrome and intro cards, while Viro/Eskiu owns world transforms, input collisions and scene resources. A dedicated bridge may play Kinetrell-authored transform recipes in the Viro engine if actually implemented/tested—not by nesting native Motion.View inside ViroNode.
- Do not continuously chase head pose; settle placement, avoid motion sickness and respect user pin/recenter controls.
- Clear cross-platform capability summary and honest live indicator of whether true spatial windows and immersive content are actually available.

## 34. Motion package and API implementation plan

Add a focused package or subpath (in the starter fork only), not a second UI kit:

```text
packages/motion/
  src/
    recipes/                  reveal, panel-enter, navigation-select, inspector, game-stage
    tokens/                   durations/easings and accessibility policies
    native/                   RN/Reanimated host adapters and gesture continuity
    web/                      GSAP/Lenis client boundaries
    spatial/                  explicitly implemented engine transform mapping (initially marked experimental)
    types/                    typed intent + resolved capability data
    index.ts                   re-exports only; no runtime logic
  README.md
  package.json
```

Use the existing `kinetrell` Git dependency pinned to a reviewed commit unless a verified npm stable package is available. The wider v2 npm latest-vs-compatible matrix rule **still applies**: report source pin, npm current stable dist-tag, selected version, peer compatibility and CI proof. Do not claim Kinetrell is published stable based solely on its Git version metadata (`0.1.0-alpha.1` at the inspected repository HEAD). Run its own `verify`, current-package tests and consumer smoke tests before pin changes.

### App composition

- In apps, `packages/motion` owns choreography; `packages/ui` owns controls and visual variants; Rive native runtime owns `.riv` stage animation and interactive state machines; `packages/spatial` owns adapter selection and Viro/Eskiu surfaces.
- Do not store React SharedValues or GPU handles in Zustand; store semantic selected panel, current game phase, score, selected artifact and optional animation *intent* only.
- SSR-friendly motion recipe functions in portable `kinetrell/core` can be imported from Next Server Components; DOM playback requires `'use client'` islands, and Rive/Viro/WebGPU bundles require client-only boundaries.
- Spatial layout rerenders should not destroy Rive/Three/Viro resource trees. Stable keys, load state, timeouts and ownership must be tested.

## 35. Quality thresholds for visual and motion systems

**Performance targets (must be measured; never assert already achieved):**

- Native smooth motion on representative modern phones at their available refresh rate, and high-confidence steady XR motion on target headsets without missed-frame bursts. Record actual FPS/frame deadlines instead of claiming an unmeasured 60/72/90/120 FPS guarantee.
- On a reference 60 Hz phone, monitor 16.7 ms frame deadline; on 90 Hz headset, ~11.1 ms. These are timing budgets, not promises.
- Profile separate CPU/JS, UI runtime, Rive renderer and GPU costs. Log p50/p95/p99 frame time and retained memory after transitions/disposal.
- Compare idle screen with and without ambient effects. Decorative animation cannot make inputs sluggish or permanently drain battery.
- Confirm no Kinetrell GSAP/Lenis double ticker, no Rive `.riv` file load per selection, no layout thrash in fold mode, no per-frame RN state update, and no dangling listeners after leaving a route.

**Design sign-off:** every screen must have (a) a unique visual purpose, (b) clear task hierarchy, (c) compelling before/after storyboard, (d) mobile portrait and landscape captures, (e) wide/dual-screen/fold/inspector state, (f) reduced-motion and high-contrast state, (g) real interactions not dead-end demos, and (h) detailed design-review notes with remediated issues. Use Mobbin as research; Impeccable for polish; no-ai-slop to challenge overdecorated/generated-looking patterns.

**Screenshot review rubric:** compare states at 360, 390, 768, 1024, 1440 px and actual foldable window regions. Assess baseline alignment, clipped type, focal weighting, press/focus, safe areas, loading/empty/error, inspector occlusion, RTL, stage aspect ratio, readable Rive controls, motion-to-still completion and whether the mobile experience is truly native, not a squeezed desktop screenshot.

## 36. Viro External API modernization: separate upstream engineering track

The new companion document [`VIRO_EXTERNAL_API_MODERNIZATION_PLAYBOOK.md`](../engineering/VIRO_EXTERNAL_API_MODERNIZATION_PLAYBOOK.md) is binding source reading for the upstream `viro-external` project, while the starter remains a consumer proving the contracts. All API changes in that library must be done in reviewed, backward-compatible PRs whenever possible; the starter must not silently maintain a competing private fork of the new public interfaces.

### Inspected API improvement priorities

1. Unify meaning of legacy `SpatialWorkspaceIntent` and newer `WorkspaceDefinition` without breaking consumers. Keep the newer strict role/presentation/fallback/capability/lifecycle union and discover typed runtime negotiation.
2. Clarify the Rive native-surface resource ownership: `createRiveSpatialSurface` and `disposeRiveSpatialSurface` are currently separate, while `ViroCoreRiveSpatialAdapter` holds the native mapping. Design a future ready session with `dispose()` and stable error semantics without breaking the old factory in place.
3. Review `SpatialPanel`’s overlapping movable/draggable/pinned/closed state, typed world-unit dimensions, stable placement, correct drag semantics and render-time `registerPremiumMaterials`.
4. Fix known semantic parity gaps before describing glasses controls as native equivalents: `GlassesSwitch` currently aliases `GlassesCheckbox`, several button geometry variants share one implementation, and the slider is tap-to-increment rather than truly draggable.
5. Resolve the `PanelButton` `dragType={"Gizmo" as never}` and no-op `onDrag` by fixing underlying Viro API typings/gesture pipeline, not suppressing type errors.
6. Change `SpatialScrollView`'s virtualized children identity strategy (currently keyed by slice index) to a stable item identity where child state exists.
7. Refine `xr-platform-contract/src/index.ts` toward export-only barrels, deliberate public package entrypoints and a backward-compatible TypeDoc API inventory. Clarify premium facade vs underlying packages.
8. Add optional Kinetrell adapter integration for native/web motion **without** coupling the pure XR contract to Reanimated, GSAP, Lenis, or DOM.
9. Audit package publish readiness: compiled distribution, `exports`, ESM/CJS requirements, semver changesets, test fixtures, Metro resolution, native binary dependencies and accurate device capability evidence.
10. Preserve licensed third-party work and Git provenance. Archive obsolete implementation prompt documents under `docs/archive` when no longer needed instead of pretending AI-assisted work did not occur.

### Viro External PR sequence

| PR | Mission | Observable result |
|---|---|---|
| VXP-01 | Margelo API inventory, 3 consumer call sites, public type snapshot | Baseline report and **no runtime behavior change** |
| VXP-02 | Workspace contracts and runtime negotiation | Platform parity tests, explicit failure/fallback, migration |
| VXP-03 | Rive session factory and native resource lifetime | Error/cleanup lifecycle tests, no leaked native ID/texture |
| VXP-04 | Panel/control semantics, gestures and virtualization | Working switch/slider, drag typing, keyboard/gaze/controller parity |
| VXP-05 | Optional Kinetrell motion adapter | Shared recipes, reduced motion, no per-frame bridge |
| VXP-06 | CI, publishing, documentation, repo polish | Consumer smoke tests, package exports, contributor guide, third-party notices |
| VXP-07 | Hardware/performance proof | Quest/PICO/visionOS/Android/web matrix with actual evidence or `NOT VERIFIED` |

**Skills:** Margelo API Design must be loaded **before** authoring exported types. Pair with Margelo Nitro when native APIs require it, Expo skills, Matt Pocock TypeScript, Argent device agent, Impeccable, no-ai-slop, and user-owned Kinetrell. All exported API types need JSDoc, valid links, actual stable error semantics, cleanup guarantees and migration notes. Split packages and components by domain, not fashionable folder naming.

## 37. Repo aesthetics: what “highest-level engineering” means

Make professionalism visible through **quality evidence**, not hiding development history:

- One precise `README.md` explaining what is stable/experimental; fast installation, compatibility table, 3 real examples (plain panel, Rive, full spatial workspace) and links to advanced guides.
- A coherent `CONTRIBUTING.md` and ADRs for public API evolution, breaking changes, capability detection, Eskiu/Rive/GPU ownership and platform windowing.
- Small conceptual packages with releaseable entrypoints and explicit dependencies. No giant umbrella `index.ts` containing unrelated implementation.
- Strict package export tests, TypeDoc/API extractor, native/Metro/SSR import checks, ABI and codegen consistency, tests with real fixtures, size/performance monitoring and release checklists.
- Correct error handling, unit-bearing types, discriminated unions, idempotent resource cleanup and realistic callback ownership; no `as never` or empty event handlers to bypass a correctness issue.
- Source-level design consistency, crisp Storybook/demo screenshots, accessibility, labeled verified vs unverified platform support and motion quality.
- Root-level audit for duplicative files, abandoned branches and historical prompt sprawl; move dated planning docs under `docs/archive`, preserving credit and links. **Do not delete commit history, hide contributors, or falsify authorship.**

## 38. Additional design & engineering roster

**Design:** Principal creative director, principal product designer, senior motion designer (Kinetrell), senior Rive designer/HMI engineer, XR spatial ergonomics designer, typography/art director, interaction/content designer, accessibility specialist and visual QA lead. Their deliverables are mood board, tokens, state boards, motion grammar, artboards, prototypes and comparative screenshots—not only a prompt describing beauty.

**Engineering:** Staff Expo/universal-platform architect; Next.js Server Components & Cache Components expert; senior RN/Reanimated/Kinetrell engineer; senior Web GSAP/Lenis integration engineer; Meta UI Set/Compose and Android XR engineer; Apple SwiftUI/visionOS/split-view engineer; foldable/posture/WindowManager specialist; Rive native/graphics engineer; ViroCore/Eskiu/OpenXR renderer engineer; TS library/API ergonomics engineer; platform/device QA and performance engineer; CI/release/documentation owner.

**Design review cadence:** lead designer proposes / motion engineer checks feasibility / accessibility reviewer checks alternatives / platform engineer verifies native truth / QA captures actual device evidence / principal architect signs off on API stability. No single “looks good” screenshot can close the review.

## 39. Integrated PR/agent requirements — append to existing §19 and §29 prompts

```text
V3 BINDING ADDENDUM — KINETRELL + PREMIUM DESIGN + VIRO EXTERNAL PRINCIPAL API QUALITY

Read prior Universal Spatial Starter Full Pack v3 and the companion VIRO_EXTERNAL_API_MODERNIZATION_PLAYBOOK.md in full. Continue to build ONLY FIVE STARTER SCREENS. No NYC-Mon lore or assets are to leak into the extracted starter. Original NYC-Mon repo remains untouched.

VISUAL QUALITY: Target award-caliber quality, never claim awards. Art direction is Spatial Atelier: clarity, great type, selective editorial bento composition (no Bento dependency), restrained focus accent, sophisticated light/dark, thoughtful native materials, clean hierarchy, beautiful Rive artwork, purposeful Viro spatial depth. Use research with Mobbin, design critique, Impeccable and no-ai-slop. Demonstrate real button/input/inspector/game behavior. Screens must be visually distinct yet cohesive.

MOTION NONNEGOTIABLE: Kinetrell is the single cross-platform motion *orchestration* system. Read mikevocalz/Kinetrell README, docs/native-runtime.md, docs/react-dom-bindings.md, docs/ssr-verification.md, docs/native-scroll.md, docs/accessibility.md, docs/performance.md, docs/gesture-interruption.md and docs/native-lifecycle.md. Use defineMotion/compileMotion portable recipes; kinetrell/native Reanimated on iOS/Android; kinetrell/web/react GSAP and Lenis adapters on browser client islands; Kinetrell core only in Server Components. Rive state machines own Rive art/interactive mini-game behavior; Viro/Eskiu owns immersive scene transforms and frame loop. NO GSAP/Lenis direct parallel motion system, NO Tamagui/Bento, NO UI-thread-to-React per-frame animation bridge, NO live head-pose-driven OS window repositioning. Respect reduced motion and app background lifecycle.

FIVE SCREEN SIGNATURES: (1) Showcase editorial reveal + tactile nav; (2) Native Workspace rail/inspector clarity; (3) Hybrid native controls + Rive center with synchronized state; (4) Game Layout stage-first with 30-second playable Rive loop, Rive/Kinetrell separation; (5) Immersive Viro/Three.js stage with native/Rive companions and honest XR fallback. Make phone/foldable/tablet experiences independently beautiful. Hinge-safe reflow and inspector must survive screen transformations with correct focus and preserved Rive instances.

PERFORMANCE: Establish budget from 16.7 ms 60Hz, 11.1 ms 90Hz timing constraints as context, then MEASURE actual p50/p95/p99 and retained memory on actual devices. Kinetrell must not create multiple global tickers. Rive resources must not remount on inspector toggle or posture change. Nothing can masquerade as verified Quest/PICO/visionOS hardware results without evidence.

VIRO EXTERNAL (SEPARATE REPO TRACK): Read Margelo api-design skill first and execute VXP-01..VXP-07 from the companion guide in mikevocalz/viro-external when repository actions are authorized. Protect old callers, maintain explicit semver/migrations, and do not make the starter's convenience API into the lower-level library contract. Survey every public export, confirm all specific defects against current HEAD, and add a compatibility-preserving test-first plan. Focus on workspace contract unity, Rive resource lifecycle, proper native controls semantics, PanelButton drag typing, SpatialScrollView identity, package build/export maturity, official native backend boundaries and attractive honest docs. No cosmetic rewrite that merely conceals git history or authorship.

UPGRADE RULES: Continue to honor the v2 latest-stable-on-npm audit with Expo/RN/toolchain compatibility exceptions documented, and Next 16.4 Cache Components/Partial Prefetching for web. Ensure Kinetrell pinned git commit is validated in its own consumer tests; do not falsely claim stable npm publication.

PR REQUIREMENTS: For every change supply public API examples, migration or compatibility impact, visual before/after (when relevant), accessibility and motion-reduction evidence, exact tests/builds, devtools/performance trace, device conditions and explicit PASS/FAIL/NOT VERIFIED. CI and real behavior matter more than glossy code aesthetics.
```

## 40. V3 completion criteria and status

The starter's five functional screens, Next 16.4 and audited npm latest-compatible dependencies, Expo-native and optional Expo RSC boundaries, Moyo-derived foldable/dual-screen rail+Inspector behavior, native/Rive/immersive Game Layouts and mobile-first UX **remain binding from v2**. Additionally, v3 requires:

- All presentation motion uses a Kinetrell-designed recipe and appropriate documented runtime adapter; Rive retains authored internal state-machine animation and Viro/Eskiu retains immersive scene rendering.
- Every screen has premium visual direction with documented interaction timings, mobile/desktop/XR composition, reduced-motion states and actual before/after visual QA artifacts.
- No competing animation system, accidental SSR motion import, double ticker, untracked resources or fake rendered spatial support.
- `viro-external` improvement is tracked in its own independently reviewable PR series, with Margelo skill output, typed API inventory and clean consumer compatibility; no claim that producing this pack refactored the repository.
- Real user testing and representative device results are recorded where available, otherwise `NOT VERIFIED`.

**Documentation status:** v3 pack + companion modernization playbook. **Implementation status:** no fork, upstream PR, native binary, GPU integration or device tests are claimed completed here.

*End of full engineering pack — v3, October 8, 2026.*
