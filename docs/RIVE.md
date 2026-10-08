# Rive: native artwork, interactive panels, games and HUD

> **Implementation guide.** Rive is a **renderer**, not automatically a Game Layout. Most APIs described here are planned starter wrappers, not existing exports. The current NYC-Mon baseline already uses `@rive-app/react-native` and `@rive-app/react-webgl2` and ships simple `RiveStage.native.tsx` / `.web.tsx` wrappers.

[Docs index](README.md) · [Layout system](LAYOUT_SYSTEM.md) · [Kinetrell](KINETRELL_MOTION.md)

## Rive in this architecture

| Content | Renderer | Host |
| --- | --- | --- |
| Animated button | Native Rive or Rive web runtime | Expo native component shell / DOM |
| Interactive Rive panel | Rive artboard and state machine | Adaptive pane or OS spatial window |
| Rive mini-game | Rive state machine + typed game commands | Game Layout's central stage |
| Rive HUD | Rive state machine with data binding | End panel / inspector / in-stage HUD |
| World-space artboard | **Native offscreen GPU renderer** and texture bridge | ViroCore/Eskiu engine surface, only after implementation and device validation |

A React Native `RiveView` nested in JSX **does not** become a Viro node merely through nesting. Native offscreen rendering, texture ownership, pointer mapping and teardown require explicit work. The `viro-external` contract is a starting point; don't advertise it as tested until the host truly renders.

## Runtime ownership

- **Rive runtime** owns artboards, nested animation, state-machine transitions and rendering of `.riv` content.
- **Zustand** holds authoritative application state (scores, selection, panel visibility and game rules). Use typed Rive events to dispatch commands; do not make Rive the only database of product state.
- **Kinetrell** owns presentation of the containing panel, route and inspector. Never animate one property from Rive and Kinetrell at the same time.
- **Spatial host** owns OS windows, native SwiftUI/Compose panes or Viro world surface. Rive does not create Meta `SpatialWindow` instances on its own.

## Proposed component catalog

`RiveButton`, `RiveToggle`, `RiveSlider`, `RiveCard`, `RivePanel`, `RiveGameStage`, `RiveHUD` and `RiveSpatialSurface` should be separate, documented components/capabilities. Require meaningful `accessibilityLabel`, pressed/disabled/focus semantics for controls. Use the actual Rive native runtime, not a WebView surrogate for native button behavior.

## Hybrid example (proposed)

```tsx
<SpatialStandardLayout id="hybrid-demo">
  <StandardPanel id="navigation" position="start"><NativeControls /></StandardPanel>
  <StandardPanel id="center" position="main"><RivePanel source={guideRiv} /></StandardPanel>
  <StandardPanel id="inspector" position="end"><NativeInspector /></StandardPanel>
</SpatialStandardLayout>
```

**Important:** The exact `StandardPanel` composition above is a design goal; implement and typecheck its public contract before publishing it as an example. It is not a verified existing export.

## Game example (proposed)

```tsx
<SpatialGameLayout id="arcade" stage={<RiveGameStage source={gameRiv} />}>
  <GamePanel id="controls" position="start"><NativeControls /></GamePanel>
  <GamePanel id="hud" position="end"><RiveHUD source={hudRiv} /></GamePanel>
</SpatialGameLayout>
```

## Asset and binding standards

- Store reviewed `.riv` assets and generated TypeScript View Model types in `packages/assets/rive/` (or equivalent); document source file and license.
- Prefer typed View Models and Rive data binding. Avoid magic strings scattered through screens; centralize `.riv` names, artboard/state-machine identifiers and event contracts.
- Differentiate loading, missing artboard, invalid state machine, runtime failure, and ready states; show real errors instead of an invisible stage.
- Expose `RiveFileSource` per the current runtime API, not older `RiveAsset` usage. Verify installed version before implementing.
- Sane defaults: `contain` for HUD, intentional `cover` for decorative fills, explicit pixel-density/render-target strategy for immersive.
- Asset preloading is permitted when declared; don't leak a native file/player per rerender.

## 30-second game demonstration

One simple, complete loop: **spot a pattern → tap/select the matching target → earn points → finish at 30 seconds → replay**. The center game uses a Rive state machine; native controls on left and native/Rive HUD on right. Score, timer and result remain readable without animation. Pause on app background. All input paths must work for touch, keyboard and controller when supported. Game must remain usable on compact phones without requiring three visible panels.

## Native immersive bridge checklist

1. Confirm the platform renderer can supply a shareable texture/render target compatible with ViroCore's backend.
2. Allocate/manage the renderer lifetime on its owning thread; expose a ready native session handle, not a partially initialized object.
3. Define texture pixel size, color space, alpha composition, depth mode and sync/fence behavior.
4. Map gaze/pinch/controller/raycast UV into artboard coordinates with correct aspect fit and rotation.
5. Forward discrete state-machine inputs/events; control rate of layout/game updates. World anchors remain engine-owned.
6. Explicit `stop`/`dispose`, idempotent teardown and tests for remount, device loss, app background and failed init.
7. Run physical Quest/PICO/visionOS as appropriate. Browser unit tests cannot establish native compositing support.

## GPU Canvas and performance

Rive GPU Canvas capabilities differ by runtime. Gate effects using runtime capability evidence, test artboards on each target, and provide **visual quality degradation only where optional effects are concerned**. Do not silently substitute prerecorded animation for required interactivity. Record GPU utilization, startup/load latency, artboard count and memory before/after disposal. Avoid unnecessary separate WebGL contexts for each simple button.

## Accessibility

Interactive Rive graphics are **not automatically semantic native buttons**. Expose a native interaction wrapper with accessible label, role, disabled/pressed state, focus, keyboard/controller path and reduced-motion outcomes. Announce game status via native accessibility rather than relying on tiny text baked into artwork. Ensure Rive content is optional for understanding critical app data.

## Debugging and docs

Provide a Storybook story for each control, every `.riv` asset, and one full hybrid/game integration fixture. Record expected View Model properties/events and show examples of success, failure and teardown. Keep a small catalog of required artboards and screenshots. Never claim that an offscreen Rive/Viro host exists merely because interfaces compile.

Sources: [Rive React Native docs](https://rive.app/docs/runtimes/react-native/react-native) · [Rive docs index](https://rive.app/docs/llms.txt) · [Viro External contracts](https://github.com/mikevocalz/viro-external/tree/main/packages/xr-platform-contract/src/rive.ts).
