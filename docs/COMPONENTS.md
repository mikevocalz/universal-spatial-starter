# Component catalog and API contracts

The public React API must be specific, typed and discoverable. **Margelo's [api-design skill](https://github.com/margelo/react-native-skills/tree/main/skills/api-design) is a merge gate**, not a suggestion. Native technology belongs behind components or explicit resources.

## Catalog

| Family | Proposed exports | Responsibility |
| --- | --- | --- |
| Layout | `SpatialStandardLayout`, `SpatialGameLayout`, `GamePanel` | Semantics and stage lifecycle |
| Adaptive | `AdaptivePanes`, `AdaptivePanes.Inspector`, `NavigationRail` | Width/posture-driven composition |
| Standard native | `UIButton`, `UICard`, `UITextField`, `UIMenu`, `UIDialog` | Semantic native controls |
| Rive | `RiveButton`, `RivePanel`, `RiveGameStage`, `RiveHUD` | Authored `.riv` state machines |
| Engine | `ViroGameStage`, `SpatialPanel`, `SpatialWorkspaceSlotNode` | World-space stage and controls |
| Camera | `RaisedCameraAction`, `CameraLabOverlay`, `DetectionOverlay` | Explicit live-camera interaction |

Names beginning `SpatialGameLayout`, `UIButton`, `RaisedCameraAction`, etc. are **planned exports**; don't import them from upstream until the package actually provides them.

## API-design rules

- Use string literal unions and **discriminated unions** for resource state; no cluster of nullable fields.
- React props describe intent. Post-negotiation results report actual host/window placement.
- Names are semantic and platform-neutral. Prefer `widthDp`, `durationMs`, `distanceM` for numeric units.
- Events from a long-running session use a subscription returning an idempotent `remove()`; stop/destroy are explicit.
- A created `CameraSession`/`RiveSession` must be initialized on success or return a failure. Do not expose half-ready sessions.
- Unsupported requirements throw named `Error` instances or reject. Optional preferences may degrade only when that does not change the requested outcome.
- Public package root files only re-export; one concern per feature/type file; export JSDoc with lifecycle, defaults, platform semantics and examples.
- Nitro's public specs are the API; do not add silent JS coercion facades over public native HybridObjects.
- Publish integration fixtures proving examples work on web and native, including cleanup/error paths.

## Important state example

```typescript
/** Proposed contract: an active camera feed always has a real source. */
type LiveCameraState =
  | { kind: 'idle' }
  | { kind: 'requesting-permission' }
  | { kind: 'initializing' }
  | { kind: 'streaming'; sourceId: string; lens: 'back' | 'front' | 'xr-left' | 'xr-right' }
  | { kind: 'permission-denied'; canOpenSettings: boolean }
  | { kind: 'camera-unavailable'; reason: 'hardware' | 'os' | 'entitlement' | 'runtime' }
  | { kind: 'failed'; error: Error };
```

A `streaming` state cannot exist with an absent source ID. A camera-unavailable state must not trigger simulated XR feeds.

## Mobile camera action (proposed)

```tsx
<NavigationDock
  primaryDestinations={['native', 'hybrid', 'game', 'immersive']}
  centerAction={
    <RaisedCameraAction
      accessibilityLabel="Scan surroundings"
      onPress={() => setCameraLabOpen(true)}
    />
  }
/>
<CameraLabOverlay open={cameraLabOpen} onClose={() => setCameraLabOpen(false)} />
```

`CameraLabOverlay` is modal content, **not a sixth Expo Router screen**. On XR the scan command invokes a real device camera session and presents detection results in a native HUD/system window/engine panel as appropriate.

## Rive event bridge

Typed Rive view-model properties or state-machine triggers dispatch actions into the app's small Zustand store. Never put full video frames, a GPU pointer, or a native renderer handle into a serializable global store. Keep game state and animation state logically separate. See [Rive](RIVE.md).

## Versioning and breakage policy

API additions require one success example, one unsupported requirement example, and one teardown example. Breaking exports require an adapter/migration, deprecation documentation, `changeset`/changelog and downstream integration check (Moyo, Harlem Might, NYC-Mon) before removal. Avoid drive-by public renames.
