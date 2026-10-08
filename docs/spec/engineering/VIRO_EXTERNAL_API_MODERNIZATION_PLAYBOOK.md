# VIRO EXTERNAL — PUBLIC API & REPOSITORY MODERNIZATION PLAYBOOK

**October 8, 2026 · Companion to `UNIVERSAL_SPATIAL_STARTER_FULL_PACK_V3.md`**  
**Source:** [mikevocalz/viro-external](https://github.com/mikevocalz/viro-external)  
**Primary review rubric:** [Margelo react-native-skills / api-design](https://github.com/margelo/react-native-skills/tree/main/skills/api-design)  
**Scope:** Improve `viro-external` as a library independently of the five-screen Universal Spatial Starter. No repository writes or PRs are represented as completed by this document.

## 1. Mission and non-goals

Make `viro-external` a predictable, fully typed, testable spatial UI / native XR toolkit with a deliberately small public API, explicit ownership of GPU and platform resources, and consumers that can integrate it without studying internal files. In its documentation, architecture, tests and pull requests, require the discipline of a Fellow-level RN systems library team held to the creator/spec-author bar in `prompts/ROSTER.md`. **Do not merely rename everything, bulk-reformat code, erase provenance, or rewrite working functionality for aesthetic purposes.**

Keep the existing feature inventory: Viro engine panels, Eskiu, Rive surfaces, QuickDraw, Logitech Muse support, media/Mux, panoramas, Gaussian splats, Meta and PICO layout adapters, web spatial fallbacks, glasses and Viture inputs. Audit and reconcile overlap rather than removing user workflows.

## 2. Facts inspected on current repository default branch

- `packages/xr-platform-contract/src/index.ts` defines platform capability types, intent contracts, pure functions and exports all other contract modules from one file. `packages/xr-platform-contract/src/workspaceSurface.ts` also implements a stricter second-generation workspace contract. The two APIs need an explicit migration/compatibility strategy.
- `packages/ui/src/SpatialPanel.tsx` exposes inherited `MovableProps` **plus** `movable`, `draggable`, `resizable`, `defaultPinned`, local close state, width/height, and geometry options. These states overlap conceptually. It also invokes `registerPremiumMaterials()` during render; the real initialization semantics should be documented/controlled.
- `packages/ui/src/SpatialWorkspace.tsx` has a useful world-arc transform utility, `worldSlot(slot, headPosition, headYawDeg, options)`, with positional arguments and implicit meters/degrees in several props. Existing usage must be retained while introducing clearer types and unit-marked fields in a versioned API.
- `packages/ui/src/RiveSpatialSurface.ts` exports `createRiveSpatialSurface(adapter, config)` / `disposeRiveSpatialSurface(adapter, handle)`. `packages/ui/src/RiveNativeHost.ts` holds native IDs in a `WeakMap` and exposes `mount/unmount`, direct playback commands, and pointer-driven dragging. Native lifetime and post-disposal call behavior need deterministic tests.
- `packages/xr-platform-contract/src/rive.ts` uses `RiveSource` as URL or an `asset` of `number | string`, unnamed width/height/depth units, `timestamp` rather than `timestampMs`, and a handle whose methods return `void`. These are **API-review targets**, not a claim that runtime behavior is broken.
- `packages/ui/src/WearableUIKit.tsx` has `GlassesSwitch` mapped to a checkbox, geometry variants that currently forward to the same `PanelButton`, and a slider whose button handler increments value. These are **not behaviorally equivalent** to genuine native switch/slider/variant semantics; either implement the actual interaction or mark them as limited/experimental.
- `packages/ui/src/PanelButton.tsx` uses `dragType={"Gizmo" as never}` and an empty `onDrag`, indicating a typing/interaction workaround that should be resolved against Viro's actual native input types.
- `packages/ui/src/SpatialScrollView.tsx` uses `key={index}` for virtualized visible children. When the visible window advances, local child state may be reused for a different logical item; add stable data identity and coverage.
- `packages/premium/src/index.ts` re-exports many UI/core/media symbols, while individual packages also expose their own roots. Clarify canonical import paths, public vs advanced symbols, and versioning rules.
- `packages/ui/package.json` currently exposes TypeScript source as its package entry point, with a `typecheck` script but no package-specific compiled/publish artifact. That may be fine for a private workspace but is a release gate for independent npm consumers.
- The root scripts include typechecks, workspace/Rive contract tests, Metro resolution checks and TraceSift hooks. Extend the existing facilities instead of replacing them with an unproven QA layer.
- `DECISIONS.md` documents a 3.0.1 Viro baseline while the NYC-Mon starter currently uses a pinned Viro 3.0.2 fork artifact. Reconcile *current* compatibility against official releases and CI before changing dependency ranges.

## 3. Margelo skill rules that bind every PR

1. Design the public TypeScript/React interface **before** native internals. Show three real consumer examples, including failure and disposal.
2. Prefer discriminated unions for required modes and state; no clusters of optional booleans, no `any`, opaque string commands or broad catch-all objects.
3. Distinguish **intent** (what the caller requires/prefers), runtime **capabilities**, and **resolved** presentation. A required capability failure throws a named `Error`; optional preferences may degrade with a reported reason.
4. Use units in names: `widthM` for world units, `widthDp` for layout units, `durationMs` and `timestampMs` for times, `yawDeg` for angular intent. Never infer a hinge angle from hardware geometry.
5. Resource creation is async if setup crosses a fallible native/thread boundary; the returned resource is ready. A mounted session owns `dispose()`; a disposed session rejects subsequent imperative calls with a stable typed error, rather than silently invoking a stale native ID.
6. Event subscriptions return an idempotent `{remove(): void}` object. React hooks adapt the *same* core API and clean up on unmount. Avoid imperative calls from React render.
7. Each public export gets truthful JSDoc (behavior, units, defaults, cleanup, failure, platform differences, example) and valid TypeDoc links.
8. Index files are re-export-only barrels. Split implementation and domain types into focused modules. Avoid `export *` indiscriminately when the public root is important.
9. Nitro interfaces should be defined 1:1 in the Nitro spec when Nitro is part of the public API. Do not paper over a poor Nitro spec with a silently-transforming TypeScript facade. Higher-level React composition is a valid separate API.
10. Preserve compatibility with explicit deprecation, migration guides, API Extractor/public type snapshots, and semver policy. No large breaking rename without a documented `vNext` release.
11. No unverified OS-level parity claims. Headset performance, input hit testing, transparent panels, native Rive GPU texture bridge, and window lifecycle need real hardware or honest `NOT VERIFIED` status.

## 4. Proposed boundaries (evolutionary, not abrupt package moves)

```text
@viro-external/xr-contract      semantic features, intents, capability reports, resolved outcomes
@viro-external/core             engine-owned transform, geometry, node and surface primitives
@viro-external/ui               user-facing XR panels, ergonomic React components
@viro-external/rive             typed Rive composition and native-surface lifecycle (new focused package)
@viro-external/meta-layout      Meta OS window resolver and adapter
@viro-external/pico-layout      PICO subwindow/container adapter
@viro-external/web-layout       web browser/spatial layout adapter
@viro-external/media           provider-neutral video/panorama interfaces
@viro-external/premium         curated convenient facade (no shadow implementations)
@viro-external/devtools        optional runtime diagnostics, not production dependency (optional)
```

No inter-package circular dependencies. The contract package never imports a renderer, Meta/PICO SDK, Rive runtime, React Native view implementation, or app state. Unidirectional dependency enforcement required in CI.

## 5. Public API revision proposal: workspace

**Keep older `SpatialWorkspaceIntent` + newer `WorkspaceDefinition` readable while migration occurs.** Select the newer discriminated presentation contract as the eventual preferred interface; publish a deprecation timeline, a lossless conversion helper only where semantics truly match, and explicit errors otherwise.

```ts
/** Semantic surface with required placement behavior. */
type WorkspaceSurface = {
  id: string;
  role: 'main' | 'discover' | 'detail' | 'assistant' | 'tools';
  presentation:
    | { kind: 'main' }
    | { kind: 'window'; widthDp: number; heightDp: number; anchor: 'start' | 'end'; priority: number }
    | { kind: 'layer'; region: 'overlay' | 'leading' | 'trailing' };
  fallback: { kind: 'inline'; region: 'overlay' | 'leading' | 'trailing' | 'sheet' } | { kind: 'drop' };
  lifecycle: { owner: 'workspace' } | { owner: 'user' } | { owner: 'selection'; selectionKey: string };
};
```

**Illustrative shape only.** Preserve the current `requires` and `focus` contracts in the actual implementation, include validations, and do not flatten richer `WorkspaceSurfaceSize` percent cases. The example is intentionally scoped to show semantic boundaries, not to replace production source.

For runtime negotiation, prefer `resolveWorkspace({definition,activity,capabilities,preferences})` returning `{kind:'spatial'|'adaptive', surfaces: ..., reasons: ...}`. Preserve existing `resolveMetaWorkspace` behavior and add parity adapters rather than treating Meta internals as the shared type.

## 6. Public API revision proposal: native Rive lifecycle

`createRiveSpatialSurface(adapter, config)` may remain as a legacy synchronous adapter seam; do not force an async breaking change in-place. For consumers requiring real native GPU resource setup, provide a separately named session factory with *explicit readiness* and ownership:

```ts
interface RiveSession {
  readonly capabilities: RiveSessionCapabilities;
  play(): void;
  pause(): void;
  setInput(input: {kind:'number'; name:string; value:number} | {kind:'boolean'; name:string; value:boolean} | {kind:'trigger'; name:string}): void;
  dispatchPointer(pointer: SpatialPointerEvent): void;
  addOnErrorListener(listener: (error: Error) => void): {remove(): void};
  dispose(): Promise<void>;
}

interface RiveRuntime {
  createSession(options: RiveSessionOptions): Promise<RiveSession>;
}
```

The `RiveSessionOptions` implementation MUST declare source, fit, artboard/state machine, spatial size units, required/proffered render capabilities, input permissions, and lifecycle policy with documented defaults. Distinguish Rive asset creation, native GPU texture creation, scene attachment, and node disposal. A surface mounted through Eskiu/ViroCore is not automatically an OS window. Avoid duplicating each texture in two GPU contexts. No implicit persistence of GPU handles in Zustand.

**Migration:** test the old factory, add new session API, wrap only where necessary for a high-level React component, migrate samples and consumers, release a semver minor, then schedule removal of legacy helpers for the next major if requested.

## 7. Public API revision proposal: panel interaction

Review `SpatialPanel` and its inherited `MovableProps` so callers can express these separable ideas: `(a) placement policy`, `(b) gesture permissions`, `(c) dimensions`, `(d) header actions`, `(e) visual appearance`, `(f) controlled/open state`.

- New options should use a discriminated `placement` (`world-fixed` / `follow-user` / `anchored`) only when each variant truly has distinct required data; do not add aliases merely for branding.
- Give dimensions semantic world units (`widthM`, `heightM`) and layout-native units separately (`widthDp`, `heightDp`). Document conversions at adapter boundaries.
- Controlled/uncontrolled panel visibility should behave like normal React components. The current `closed` state that returns an empty `ViroNode` should be reviewed for focus, event, and resource cleanup semantics.
- Pinned/follow behavior must match what the UI label promises. Validate grab/release/cancel with simultaneous gaze/controller input, tracked-hand pinch and headset-loss recovery.
- Remove or properly type `dragType={'Gizmo' as never}`; do not leave no-op drag handlers to coerce a gesture capture path. Add regression tests before change.
- Resolve material registration in an explicit idempotent host init, with correct teardown when relevant; prevent hidden side effects in React render.

## 8. Fix parity gaps rather than rebranding placeholders

- `GlassesSwitch` needs switch semantics and focus/pressed state, or should be explicitly experimental; a checkbox alias is not a completed switch.
- The round, rectangular and capsule button variants should have distinct geometry or be described as semantic aliases with no shape claim until implemented.
- `GlassesSlider` should support continuous/discrete position, clamping, step, min/max validation, accessibility alternative, genuine drag/controller controls, and correct disabled semantics. Current tap-to-increment must not be advertised as full slider parity.
- For `SpatialScrollView`, use stable item identity through virtualization, test two cells with different local state, scroll, scroll back and verify no state jumps. Keep keyboard, wheel, controller and gaze paths.
- Consolidate `WearableUIKit` and `viro-external-gui` catalog overlap without silently dropping affordances. Prefer composable primitives over dozens of hollow wrappers.

## 9. Repository professionalism as an engineering outcome

Proposed top-level structure after careful, non-breaking reorganization:

```text
.github/
  workflows/                   typecheck, unit, API snapshot, lint, consumer fixtures, performance smoke
  ISSUE_TEMPLATE/               bug, API proposal, cross-platform compatibility
  PULL_REQUEST_TEMPLATE.md      motivation, API before/after, testing, screenshots, migrations
changeset/ or .changeset/       version & consumer migration record when publishing
apps/
  playground/                   one integration host, accessible repro scenarios
  storybook/                    UI parity stories where renderable
packages/                       focused library packages, one responsibility each
examples/                       hello, native-panel, Rive, Meta/PICO, game-stage, web
benchmarks/                     measured target scenes, memory lifecycle, frame pacing
docs/
  architecture/                 ADRs, dependency map, resource ownership, capability resolution
  api/                          TypeDoc output, compatibility and migration guides
  quality/                      hardware matrix and current verified statuses
  design/                       tokens, interaction, motion, accessibility
  archive/                      historical implementation prompts/dated plans when worth retaining
scripts/                        reusable deterministic checks, no hidden repo-root scaffolding
README.md                       developer quick start + exact working demos
CONTRIBUTING.md                 code rules, PR process, review/quality thresholds
LICENSE / THIRD_PARTY_NOTICES   attribution always preserved
```

**Do not erase authorship.** Preserve git history, source licenses, credits, authorship and legitimate contributor tooling. De-clutter root-level drafts and stale prompts by archiving or moving them with explanation, not purging history. Remove dead implementations after reference search, migration plan and test verification. A polished repository demonstrates reproducible builds and restrained APIs, not a hidden development history.

## 10. Test gates (required before claiming improvement)

| Category | Minimum checks |
|---|---|
| API | TypeScript declaration tests, API snapshot diff, TypeDoc links, source import boundaries, public root exports |
| Resource lifetime | load/mount/fail/retry/unmount/dispose, double-dispose, commands after dispose, device suspend/resume, GPU texture counts |
| Geometry | Invalid sizes, arc, curved panels, negative/zero dimensions, meter/dp conversions, RTL, stable anchors |
| Input | hover/click, gaze/pinch, pointer coordinate mapping, simultaneous drag, accessibility alternative, cancel/up/exit |
| Rive | URL/asset config, missing state machine, data binding, transparent/windowed behavior, GPU fallback, background/foreground |
| Workspace | 1 main, max auxiliary slots, priority, missing capability, fallback, selection-owned panes, stable IDs |
| Mobile | compact, regular, fold, separating hinge, RTL inspector, one-screen and two-screen continuity |
| Web | Next SSR import safety, DOM vs engine code isolation, Viro WASM resolution, reduced motion, no hydration mismatch |
| Builds | Expo prebuild clean twice, iOS + Android compile, Quest/PICO variants, web build, npm pack consumer smoke |
| Performance | scene 20/100/300 controls, p50/p95/p99 frame times, allocation spikes, RAM/VRAM after teardown, no unsupported 72/90 FPS claim |

Native Rive-to-Viro, physical Quest/PICO, visionOS spatial scenes, and glasses device testing remain `NOT VERIFIED` until actual runs are recorded.

## 11. Recommended staged PR stack for `mikevocalz/viro-external`

| PR | Theme | Acceptance |
|---|---|---|
| VXP-01 | API inventory, consumer map and baseline tests | `docs/api/API_INVENTORY.md`, exported symbol snapshots, sample compile; zero runtime changes |
| VXP-02 | Contract consolidation | versioned intent/resolved workspace types, Meta/PICO/Web parity tests, old API compatibility |
| VXP-03 | Rive session and native lifetime | factory/session contract, stable disposal/errors, GPU/resource tests, current callers preserved |
| VXP-04 | Premium panel semantics and controls | fix slider/switch/button variants, drag typing, virtualization identity, accessibility |
| VXP-05 | Kinetrell motion adapters | optional `motion` peer integration, native/web reduced motion, no per-frame JS bridge, no Kinetrell dependency in core contract |
| VXP-06 | Publish/repo hygiene | TypeDoc, package entrypoints/dist, side effects/exports, CI matrix, notices/README/CONTRIBUTING, clean root |
| VXP-07 | Real device consumer fixtures | Meta/PICO/visionOS/Android XR/web; record tested and unverified cases honestly |

Keep PRs surgical, with strict behavior-preservation unless the PR explicitly addresses a proven defect. Separate design tokens/style demos from low-level API breaking work.

## 12. Cross-platform Kinetrell policy for Viro External

Kinetrell is the **standard ergonomic motion layer**, not the engine render loop. Use `kinetrell/core` for portable motion intent. Use `kinetrell/native` via Reanimated/Worklets for native surface or RN/Compose hosting transitions; use `kinetrell/web/react` for DOM client islands and GSAP, optionally the caller-owned Lenis bridge. In Viro immersive panels, animate through the engine's own transform/texture update surface via an explicitly implemented adapter; do not claim that `Motion.View` runs inside a Viro node. Avoid writing head-pose-triggered positions into React state every frame. Keep stage/world transforms settled, and reserve Rive's own state machine for interactive art and character/game animations.

Kinetrell should be an optional peer or adapter module dependency, not a forced dependency of platform-neutral type contracts. Reuse the user's Kinetrell runtime and refrain from shipping competing GSAP/Lenis animation frameworks as alternate first-class systems.

## 13. Mandatory skill and reference set

- Canonical roster and skills: [`prompts/ROSTER.md`](../prompts/ROSTER.md), [`prompts/SKILLS.md`](../prompts/SKILLS.md), [`prompts/SUBAGENTS.md`](../prompts/SUBAGENTS.md) — embedded in every prompt for this track.
- [Margelo API Design](https://github.com/margelo/react-native-skills/tree/main/skills/api-design) — first, for each exported API.
- Margelo `build-nitro-modules`, `cpp`, `swift`, `kotlin` (https://github.com/margelo/react-native-skills) — only where implementing Nitro resources; "C++ is Nitro"; Nitrogen codegen committed first.
- [Callstack agent-skills](https://github.com/callstackincubator/agent-skills) — `react-native-best-practices` for every performance claim (traces attached), `create-react-native-library` for new packages, `github`/`github-actions` for CI artifacts.
- [WorldFlowAI everything-claude-code](https://github.com/WorldFlowAI/everything-claude-code) — `orchestrate`, `tdd-workflow`, `code-review`, `checkpoint`.
- ReactVision `viroreact-*` XR skill pack (session bundle) — `premium-spatial-design`, `spatial-layout-system`, `scene-composition`, `comfort-safety-privacy`, `device-quality-profiles`, `enterprise-xr-polish` for any Viro/Eskiu API that shapes spatial UI.
- [Expo skills](https://github.com/expo/skills) for SDK, Expo Module 2, native universal UI and config plugins.
- [Matt Pocock skills](https://github.com/mattpocock/skills) for public TS ergonomics.
- [Argent agent-device](https://github.com/Argent/agent-device) for devices / video / screenshots.
- [Corey Haines marketing skills](https://github.com/coreyhaines31/marketingskills) for library positioning/docs site only, not runtime API.
- [Impeccable](https://github.com/pbakaus/impeccable) and [no-ai-slop](https://github.com/petergyang/no-ai-slop) for design/repo presentation and editorial cleanup.
- [Kinetrell](https://github.com/mikevocalz/Kinetrell) for motion authoring; no Tamagui, Bento, or alternative parallel motion layer.
- [Meta VR Layout](https://developers.meta.com/vr/documentation/android-apps/meta-vr-layout-sdk/), [Meta UI Set](https://developers.meta.com/vr/documentation/android-apps/meta-vr-ui-set-sdk/), [Expo UI Universal](https://docs.expo.dev/versions/latest/sdk/ui/universal/), [Rive documentation index](https://rive.app/docs/llms.txt).

## 14. Copy-ready `viro-external` Fellow-level execution prompt

```text
ROLE: Hold the Fellow / Distinguished-Architect lanes E12 (TypeScript & API Ergonomics — Hejlsberg/Rosenwasser/Cavanaugh bar, Margelo api-design, Stripe-level predictability), E2 (Nitro/JSI/C++ ABI — "C++ is Nitro", oracle Marc Rousavy), E9 (OpenXR/ViroCore/Eskiu — Khronos WGs, ReactVision), E16 (Performance & Memory — Callstack Ultimate Guide, Perfetto, Instruments) and E19 (DX & Documentation — Diátaxis, no-ai-slop) from prompts/ROSTER.md. "Senior"/bare "Principal" role language is banned. Use subagents per prompts/SUBAGENTS.md (uss-api-contracts, uss-nitro, uss-immersive, uss-docs-dx; reviewers review-api, review-slop, review-perf, review-security-license). Work in mikevocalz/viro-external; do not alter nyc-mon directly.

MANDATORY FIRST STEP: Read https://github.com/margelo/react-native-skills/tree/main/skills/api-design and apply its full workflow; load Margelo build-nitro-modules/cpp/swift/kotlin where a Nitro resource exists, Matt Pocock TS skills, Callstack react-native-best-practices for any performance claim, Callstack create-react-native-library for any new publishable package, and petergyang/no-ai-slop for every PR. Record each in docs/evidence/<PR>/SKILLS.md per prompts/SKILLS.md §L; mark unavailable skills "SKILL NOT AVAILABLE — followed documented practice from <link>". Verify current official runtime APIs against installed source before touching code; tsc --noEmit is a hard gate; Nitrogen output is committed before any native HybridObject implementation.

OBJECTIVE: Modernize public contracts, lifecycle, testability, package boundaries, accessibility and repository quality to a level sustainable by a top-tier SDK engineering team. Maintain existing production workflows (Viro/Eskiu/Rive/Mux/QuickDraw/Muse/Meta/PICO/Web/glasses). NO cosmetic mass rewrite and NO unexplained breaking changes.

AUDIT AND REPORT: Inspect ALL package exports and consumer call sites. Report current APIs, ambiguous states, units, async/cleanup, feature capabilities, intentional placeholders, semver/release state, native resource ownership and multi-platform correctness. Begin with concrete targets in this document; confirm each against current HEAD. Produce docs/api/API_INVENTORY.md, docs/api/CONSUMER_MAP.md, docs/api/PROPOSED_CONTRACTS.md and tests.

API DESIGN: Design 2-3 consumer call sites per API with cleanup/error/unavailable variants. Use literal unions/discriminated unions, named units and stable host-independent types. Keep root index files re-export-only. Add specific error semantics, idempotent cleanup and explicit capability resolution. Where resources are created asynchronously, return fully ready owned handles. TypeDoc/JSDoc for every imported declaration. Preserve existing consumers by adapters with explicit migration docs; do not invent a feature-complete implementation from a type alone.

ENGINEERING: Resolve source-level overlaps (legacy/new workspace contracts), no-op/placeholder WearableUIKit controls, Viro dragType cast/no-op, virtualization keys, React-render material registration and the Rive native session lifetime; validate actual defects before claiming fixes. Do not confuse Meta/PICO OS windows with Viro engine panels or Rive textures. Never silently degrade a required rendering capability.

MOTION: Standardize on Kinetrell for portable presentation choreography, native Reanimated playback and browser GSAP/Lenis. Rive owns .riv state machines; Viro/Eskiu own scene transforms; don't create extra RAF loops, worklet runtimes or duplicate GPU resources. Expose reduced motion and pause-on-background lifecycle.

QUALITY: Add API declaration snapshot tests; consumer fixture compilation; protocol/contract tests; device matrix; CI typecheck/lint/test/package/Metro/Expo prebuild; performance and memory lifetime fixtures; SSR safety. Never claim devices were tested without device outputs. No `as never` to defeat runtime typing, fake handlers, swallowed errors, stale docs, fake sliders or dead-end UX. Retain legal notices and provenance.

REPO PRESENTATION: Clean and coherent README, typed quickstart, example gallery, architecture diagrams, dev scripts, meaningful test harnesses and changelog. Move historical root prompts to docs/archive if not needed; do not pretend AI tools were never used or rewrite commit history. Preserve git blame and credit. No sprawling autogenerated markdown, ornamental patterns or flashy code at expense of clarity.

DELIVERY: Make VXP-01 through VXP-07 small draft PRs/branches if permitted. Each must include problem statement, before/after API, migration/compatibility impact, exact tests and evidence, screenshot/video where visual, benchmarks where performance claims, remaining NOT VERIFIED items, and rollback instructions. Do not merge without approved gates. Provide a final concise compatibility matrix, list of remaining risks, and example consumer code.
```

---

**Status:** Repo-specific analysis + implementation plan. This file does **not** claim the repository has been changed, tests passed or PRs opened.
