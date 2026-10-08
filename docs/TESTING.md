# Testing, release quality and design review

[Docs index](README.md) · [Platforms](PLATFORMS.md) · [Camera & XR](CAMERA_AND_XR.md)

> **Release rule:** Passing TypeScript is necessary, never sufficient. A platform is not certified until its native build and required hardware-dependent behaviors are validated. This documentation is a checklist, not a report claiming tests already ran.

## Core gates

| Gate | Required proof |
| --- | --- |
| TypeScript/API | Public exports typecheck; proposed examples compile; generated API docs have no broken symbols |
| Unit tests | Workspace/resolver rules, priorities, capability negotiation, size classes, hinge geometry, state-machine logic |
| Component | Storybook visual/interaction stories for controls, Rive states, inspector and camera dock |
| Native | iOS + Android clean prebuild, build, launch, navigation, memory/session teardown |
| Web | Next.js 16.4 production build, cache behavior, RSC/SSR/hydration, routing, responsive a11y |
| XR | Real window creation and input on hardware; optional simulator results separately labeled |
| Sensing | Real authorized camera frames or real ARKit object anchor; permission grant/denial/revocation |
| A11y | VoiceOver/TalkBack/keyboard, focus, dynamic type, contrast, touch target, reduced motion |
| Performance | Frame time p50/p95/p99, memory before/after long sessions, camera inference and thermal impact |
| Security/licensing | No private NYC-Mon data/assets, no secret env vars, model/Rive/brand licenses listed |

## Five-screen acceptance matrix

1. **Showcase:** four demos discoverable; meaningful HTML/server shell on web; responsive editorial hero; proper raised Scan action on compact phone; reduced motion.
2. **Native Workspace:** selection list → details, inspector open/close; rail and RTL; navigation/back order; hinge safety and saved selection after fold.
3. **Hybrid:** native side UI changes center Rive state machine; center event changes native inspector; no duplicate authoritative state; invalid artboard visibly errors.
4. **Game:** real playable 30-second loop with score, pause/resume, replay; touch/keyboard/controller as applicable; stage remains mounted through side-panel relocation.
5. **Immersive:** Viro/Three central renderer when available, with appropriate app-window behavior on non-headset devices; honest capability report, real input mapping and correct native resource teardown.

**Camera Lab is not a sixth screen:** raised button opens a modal/sheet/immersive tool; real detector recognizes an actual object; draws *only actual inference results* and emits source-specific typed output. For visionOS, physically trained keyboard target must produce an `ObjectAnchor`; no simulated camera feed. Missing permissions produce actionable, honest error UI.

## Negative tests that must be present

- Invalid Rive source/artboard/state machine; Rive controller disposed while a callback is in flight.
- Meta only supports fewer promoted windows than requested, content falls inline per priority, never disappears silently.
- Fold during active game; inspector reopen; multitasking/resizing; RTL and large text.
- Camera permission denied or revoked; no camera; OS camera busy; lost foreground; inference overload.
- XR device without required real sensing capability; no demo feed or 'pretend pass' can satisfy a hard capability requirement.
- 30-second game session paused in background does not score ghost points.
- Next.js cached public content does not leak private/session-specific data between users.

## Performance methodology

- Record release-mode hardware tests, OS/driver, native dependency hashes and device refresh rates.
- Observe input-to-visible-response for press, rail/inspector interactions and camera detection.
- Record CPU/GPU/heap/texture memory across repeated `open → interact → close` cycles.
- Benchmark Kinetrell target scenes (20, 100, 300 nodes), long scroll, dynamic gesture interruption and reduced-motion settling.
- Report raw numbers and failing cases, not unsupported blanket “60fps everywhere” claims.
- Use TraceSift/Perfetto/native profilers where supported; compare before/after for refactors.

## Documentation & PR review gate

Require: problem statement, API-design sketch and examples, platform owner, user-visible screenshots, tests and reproducible commands, before/after performance evidence where relevant, correct changelog and migration/deprecation plan. Reject `as never`, untyped event bags, unowned subscription lifecycles, dangling Promise state, broad public breaking changes, untracked shader/renderer allocations, fake XR camera sources, and decorative screenshots standing in for functional tests.

## Manual verification checklist

- [ ] Works with system reduced-motion on and off.
- [ ] Native focus order and logical navigation are preserved on all five routes.
- [ ] Raised center camera target is tappable, labeled and safe-area correct.
- [ ] Real sensing starts only with permission and stops on exit.
- [ ] Main stage remains stable during rail/inspector/window changes.
- [ ] Clean install, reproducible lockfile, no hidden peer warning suppression.
- [ ] Web server produces meaningful HTML before hydration.
- [ ] Third-party attributions include source IP/NeonBlade ports/model assets where used.
- [ ] Device verification report clearly labels tested vs unverified targets.

Reference: [Margelo API Design](https://github.com/margelo/react-native-skills/tree/main/skills/api-design) · [Kinetrell performance guide](https://github.com/mikevocalz/Kinetrell/blob/main/docs/performance.md).
