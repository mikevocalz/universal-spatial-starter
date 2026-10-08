# Platform support and native-host contracts

> **Implementation / verification matrix.** A documented adapter is not automatically a production-ready renderer or a verified device. Always report actual runtime capabilities and tests; don't infer all XR camera access from the presence of VisionCamera.

[Docs index](README.md) · [Layout system](LAYOUT_SYSTEM.md) · [Camera & XR](CAMERA_AND_XR.md)

## Cross-platform host matrix

| Platform | Standard + Game layout placement | Native UI / Rive | Required sensing path for Camera Lab |
| --- | --- | --- | --- |
| iPhone | AdaptivePanes, native sheets | Expo UI / Rive RN | VisionCamera, actual camera frames, native inference |
| Android phone | AdaptivePanes, bottom dock | Compose/Expo UI / Rive RN | VisionCamera + native inference |
| iPad | Sidebars, inspector, adaptive content | SwiftUI / Rive RN | Supported native camera acquisition |
| Android foldable / dual-screen | Hinge-aware panes, physical right navigation rail | Compose / Rive RN | Supported live camera, never fold-sensitive fake preview |
| Web | Responsive panes and inspector | DOM/React + Rive WebGL2 | Browser camera access only with permission; not XR headset passthrough by assumption |
| Meta Quest 3 / 3S | Main window + up to 2 prioritized `SpatialWindow`s | Meta Compose UI Set + Rive native | Supported native passthrough camera path (e.g. authorized Camera2) **verified per hardware/OS** |
| PICO | PICO window/subwindow or Viro immersive panels | Android native + Rive | Verify `XR_PICO_camera_image`/supported vendor path on actual device |
| Android XR | Android XR spatial layout | Compose for XR / Rive native | Runtime/device-provided authorized camera service if available; **never assume** |
| Apple Vision Pro | SwiftUI windows/full immersive space and ARKit anchors | Rive Apple runtime + native visionOS | **ARKit `ObjectTrackingProvider` for trained `.referenceobject` objects**, World Sensing permission and Full Space; raw main camera is separate/restricted |
| Viro immersive | Engine-managed world panels on shared comfort arc | Viro/Three + Rive offscreen integration (planned) | Native authorized camera or provider-specific native real-world detection |

## Host selection

App screen provides `WorkspaceDefinition`/intent. Resolver interrogates a **runtime capability report**, prioritizes requested auxiliary windows, and returns `spatial`, `adaptive`, `immersive`, `inline` or a named unsupported requirement. The center `main`/`stage` is never promoted to a Meta auxiliary window. A system-managed `SpatialWindow` is not a Viro quad.

When XR camera access is a required feature, refuse to start without a verified real source and required permissions. This can present an **honest error state**; it must not switch to stock footage, synthetic passthrough, remote phone streaming, or an engine-simulated detection. If a device supplies native tracking results but no raw frames, use a correctly typed **reference-object tracking** workflow rather than pretend it is arbitrary pixel inference.

## Surface + session lifecycles

1. Resolve capabilities before allocating native renderer resources.
2. Create exactly one main surface and fit prioritized side surfaces to available slots.
3. Initialize Rive/Three/Viro only when the chosen host can render it; report errors.
4. Anchor/resize system windows at event boundaries, not on every animation frame. Kinetrell/Rive animate **inside** them.
5. Pause/stop camera and animation resources on background/device loss.
6. On unmount/permission revocation, dispose subscriptions, native textures, retained pointers and listeners. Test repeated entry/exit without memory growth.

## Feature availability results

Use stable capability names (`system-window`, `immersive-rendering`, `reference-object-tracking`, `raw-camera-frames`, `on-device-inference`, `controller-input`, `hand-tracking`) where the host actually supports them. States should distinguish `supported`, `unsupported`, `permission-required`, `temporarily-unavailable`, and `unverified` rather than conflating them. Never publish a static type that permanently forbids future platforms from gaining support.

## Required verification evidence

For each promoted platform, record device and OS version, hardware mode, build commit, app runtime/native package version, permissions, render mode, Rive loaded/interacted with, window-placement behavior, memory, frame timing, and reproduction steps. Simulator success may be listed as a simulator result, never as proof of physical object tracking or controller/focus accuracy.

## Apple object-tracking distinction

ARKit visionOS object tracking operates on real objects through the OS without granting the app unrestricted passthrough raw frames. A Create ML-trained `.referenceobject` asset lets `ObjectTrackingProvider` emit anchor poses; its concrete recognized object and model availability differ from generic COCO category detection. The main-camera frame API has a separate entitlement and licensing model. See [Camera & XR](CAMERA_AND_XR.md) and [Apple object tracking](https://developer.apple.com/documentation/visionos/implementing-object-tracking-in-your-app).

## Dependency + operating constraints

The fork initially inherits Expo SDK 58, Next.js and React Native dependencies from NYC-Mon. Its build is not proven compatible with *unbounded* npm `latest`; upgrade to latest **compatible stable** releases, record exceptions, pin the lockfile, and run `expo install --fix`, type checks and native build tests. Rive/Nitro and Worklets/Reanimated peer constraints are explicit first-class acceptance gates.
