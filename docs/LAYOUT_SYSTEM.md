# Layout system: standard and game

> A layout family is a semantic contract; Rive is a renderer, not a layout family.

## Standard Workspace

`master` selects an item, `content` shows the selected work, `inspector` exposes contextual detail. Optimized for reading, productivity, browsing and teaching. Navigation can collapse to bottom tabs on narrow screens, a rail on tablets, and spatial side windows on supported XR devices.

## Game Workspace

`controls` selects actions and inputs; `stage` owns the active simulation/game; `hud` reports score, status, inventory or feedback. The **stage must remain mounted while control/HUD panels promote, collapse, or move**. Game Layout owns pause/resume, stage-first focus, controller and gesture priority, accessible HUD announcements and interaction suspension while backgrounded. A Rive artboard in a standard layout does *not* turn it into Game Layout.

## Example: mixed renderer (proposed)

```tsx
<SpatialGameLayout
  id="object-hunt"
  stage={<RiveGameStage source={huntRiveSource} />}
  presentation="auto"
>
  <GamePanel id="actions" position="start" fallback="inline">
    <NativeGameControls />
  </GamePanel>
  <GamePanel id="hud" position="end" fallback="inline">
    <RivePanel source={hudRiveSource} />
  </GamePanel>
</SpatialGameLayout>
```

The names above are **proposed public contracts** to be implemented and type-tested.

## One authored layout → resolved placement

| Host | Stage/content | Start/controls | End/HUD/inspector |
| --- | --- | --- | --- |
| Compact phone | Primary screen | Collapsible controls | Trailing sheet |
| Tablet | Main detail | Rail or column | Inspector overlay |
| Duo / two panels | Main usable physical region | Leading physical region / accessible drawer | Trailing overlay inside last region |
| Android trifold | Preserve three logical panes | Hinge-aligned when feasible | Avoid hinge occlusion |
| Meta Quest | Main React window | Auxiliary `SpatialWindow` | Auxiliary `SpatialWindow` |
| PICO | Native container or Viro host | Supported subwindow/engine panel | Supported subwindow/engine panel |
| visionOS | SwiftUI window/scene | Scene/window where allowed | Scene/window where allowed |
| Viro immersive | Central Viro stage | Left world-space panel | Right world-space panel |

## Resolver invariants

1. Exactly one main/stage surface. Never promote it as an auxiliary OS window.
2. Every surface has a stable unique identity, ownership, semantic role, focus/back policy, and inline/drop policy for **layout placement only**. This is separate from the scanner's **no simulated-camera** rule.
3. Distinguish `requires` (must be available; error if absent) from `prefers` (best effort with reported result). For live XR scanning, `requires: ["raw-camera-frames", "camera-permission", "on-device-inference"]` is non-negotiable.
4. Preserve stable OS geometry. Animate interior opacity/content with Kinetrell or Rive, not OS window position every frame.
5. Keep focus and back behavior consistent when an auxiliary panel loses promotion, the user folds a device, or a panel is hidden.
6. Respect the Meta main + two auxiliary window budget; do not fake extra system windows.
7. For mobile choose behavior by measured width, height, hinge geometry and posture—not by phone brand or guessed hardware model.

## API negotiation model

```typescript
/** Proposed public types, not implementation. */
type PresentationIntent = {
  preference: 'auto' | 'adaptive' | 'spatial';
  requirements?: readonly ('native-window' | 'immersive-stage' | 'raw-camera-frames')[];
};

type ResolvedPlacement =
  | { kind: 'adaptive'; panelIds: readonly string[] }
  | { kind: 'spatial'; promotedIds: readonly string[]; inlineIds: readonly string[] }
  | { kind: 'immersive'; surfaceIds: readonly string[] };
```

See [Mobile](MOBILE_AND_FOLDABLES.md), [Components](COMPONENTS.md) and [Camera](CAMERA_AND_XR.md).
