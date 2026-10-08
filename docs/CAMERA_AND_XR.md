# Camera Lab and real-world object detection

> **Status:** implementation specification; not a claim that the native adapters have been built or tested on hardware. Camera Lab is launched by the **raised center Scan button**; it is a modal experience, **not a sixth route**. No simulated, stock, prerecorded, screen-captured passthrough or phone-relayed camera feed is accepted as XR detection input.

[Back to the docs](README.md) · [Main README](../README.md)

## Design decision: sensing is not synonymous with raw camera access

A headset can recognize a real object **without providing application-readable raw passthrough frames**. Apple Vision Pro provides this capability through ARKit's `ObjectTrackingProvider`, available beginning with visionOS 2. It consumes system-camera sensing internally and publishes `ObjectAnchor` updates for specific trained real-world objects. **No enterprise main-camera entitlement is needed for that public object-tracking workflow.** Apple independently restricts the *main-camera frame feed* (`CameraFrameProvider`) to eligible enterprise apps with the main-camera entitlement. Both statements are true.

This distinction is essential: **do not incorrectly mark visionOS object tracking as unavailable just because unrestricted raw frames are unavailable.** Do not claim that `react-native-vision-camera` exposes raw Vision Pro passthrough frames without a demonstrated supported adapter.

Sources:

- [Apple: Explore object tracking for visionOS (WWDC24)](https://developer.apple.com/videos/play/wwdc2024/10101/)
- [Apple: Implementing object tracking in your app](https://developer.apple.com/documentation/visionos/implementing-object-tracking-in-your-app)
- [Apple: Using a reference object with ARKit](https://developer.apple.com/documentation/visionos/using-a-reference-object-with-arkit-in-visionos)
- [Apple: Exploring object tracking sample](https://developer.apple.com/documentation/visionos/exploring_object_tracking_with_arkit)
- [Apple: Accessing the main camera (enterprise)](https://developer.apple.com/documentation/visionos/accessing-the-main-camera)
- [Apple: Setting up access to ARKit data](https://developer.apple.com/documentation/visionos/setting-up-access-to-arkit-data)
- [Community reference: visionOS 2 engine bay object tracking](https://www.reddit.com/r/VisionPro/comments/1ft0tcm/visionos_2_object_detection_showcase_anchoring/)

## Product interaction

1. Tap the **raised Scan camera action** in the compact mobile dock, or open the same Scan tool from a native/spatial toolbar on larger or headset displays. One accessible semantic action, not separate fake UX features.
2. Show a just-in-time explanation and request the appropriate camera/world-sensing permission.
3. Start an **actual authorized sensing session**, and display the *real supported output*: camera preview with bounding boxes for pixel-level detection; anchored Rive/Viro artwork for ARKit object tracking.
4. Detect a small target set; the reference demo is **a physical keyboard**. The raw-frame classifier may recognize keyboards generically, whereas visionOS recognizes a *particular trained reference keyboard*—never imply these two are identical AI capabilities.
5. Confirm detection with a brief Rive feedback animation, Kinetrell panel transition, accessible spoken/text label, and an inspector showing the source, confidence when available, and pose/bounds **only when actually provided**.
6. Explicit Stop/Close tears down camera sessions, subscriptions, inference, allocated GPU textures, and 3D anchors.

No Rive UI animation should run its own object classifier. Rive is presentation; detection happens in the platform perception backend.

## Platform implementation contracts

| Environment | Real-world sensing path | What application receives | Required gate |
|---|---|---|---|
| iPhone / Android phone | VisionCamera native camera session plus frame processor / on-device object detector | Image-space classes and boxes | Camera permission and available camera |
| Quest 3 / 3S (eligible Horizon versions) | Native authorized passthrough camera via Meta-supported Camera2 path; integrate with VisionCamera only if actual platform tests prove support | Camera frames, then native detector outputs | OS/API support, permission, device verification |
| PICO | Device-specific supported camera access / `XR_PICO_camera_image` where available and verified | Frames or platform-specific image data | Extension/model/runtime capability + authorization |
| Android XR | Android camera API if its runtime **actually exposes** the required camera on target hardware | Frame or supported platform result | Feature/permission verification on device |
| **Apple Vision Pro** | **ARKit `ObjectTrackingProvider` using trained `.referenceobject` assets** | **Real-world `ObjectAnchor` ID, pose and tracking updates** | World Sensing authorization + Full Space + `isSupported` |
| Vision Pro enterprise-only raw camera | `CameraFrameProvider` with enterprise main-camera entitlement | Stereo frames | Enterprise approval/license/entitlement; **not required for ARKit object tracking** |

A supported native **object-tracking backend is not a fallback** for a raw-frame backend. These are first-class perception capabilities with different input/outputs. If a specific app workflow *requires* raw image pixels, fail that requirement on a device that only exposes object anchors rather than pretending otherwise.

## Detection model strategy

### A. Frame-based generic category detection

- Start with **EfficientDet-Lite0** (LiteRT) or another validated lightweight detector with a documented model license, exact runtime format and checksum.
- **v5 alternative (ADR-gated):** ReactVision's `ViroObjectDetector` (YOLOE via ONNX Runtime, companion package `@reactvision/react-viro-onnx`, ViroReact ≥ 2.57.0 — https://github.com/reactvision/viro/releases/tag/v2.57.0) is acceptable **only** when the Camera Lab overlay is hosted inside a `ViroARSceneNavigator` that already owns the camera: it shares that feed rather than opening its own, reports label/confidence/normalized box plus a `screenBoundingBox` in dp, and at that release its 3D `worldPosition` raycast is iOS-only. Verify the installed version's signatures; record the choice, model license and checksum in an ADR (pack §45).
- The capture layer on phones/Android XR is **VisionCamera v5** (Nitro rewrite). Apply Margelo's `react-native-vision-camera` skill; any v4-era pattern in generated code is a finding.
- Use a native inference pipeline (TFLite / platform acceleration as supported) from real VisionCamera camera frames. Run independently of the React render loop; cap inference rate and account for rotation, color format, cropping and preview/analysis coordinate transforms.
- Display only the actual supported model classes. The demo's chosen generic category is `keyboard`; ship confidence threshold tuning against real devices, not fabricated accuracy metrics.
- If Camera2/VisionCamera is incompatible with the headset's camera API, build and validate a platform-native capture adapter rather than treating VisionCamera as a magic bypass of vendor restrictions.

### B. visionOS 3D reference-object tracking

- Use a physical, textured, asymmetric object where practical; e.g., a known keyboard with a matching 3D model. Generic COCO object detection **cannot substitute for a trained 3D reference**.
- Create or import its correctly scaled **USDZ** model. Train a **Create ML Object Tracking** model and bundle the resulting **`.referenceobject`** file.
- Add the **World Sensing** capability / usage description, open a Full Space, request needed ARKit authorization, verify `ObjectTrackingProvider.isSupported`, start an `ARKitSession` with the provider, and subscribe to its anchor updates.
- Send a typed update containing the known reference object's stable ID, detection/tracking state, and native world pose. Place native/Rive/Viro augmentations at that pose through a validated spatial transform adapter.
- Apple's documented provider limits and higher-frequency tracking settings are **version- and performance-dependent**; do not imply unlimited target objects or general-purpose COCO classifications.
- Use real objects and device testing. The visionOS simulator does not prove physical object tracking.

## Portable public API (proposed; types are intentionally illustrative)

```ts
export type TrackedObject =
  | {
      kind: 'image-detection';
      id: string;
      label: string;
      confidence: number;
      bounds: { x: number; y: number; width: number; height: number };
    }
  | {
      kind: 'reference-object';
      id: string;
      referenceId: string;
      transform: readonly number[]; // 4x4 matrix; define conventions in type docs
      tracking: 'tracked' | 'limited';
    };

export type PerceptionRequirement =
  | { kind: 'generic-object-detection'; labels: readonly string[] }
  | { kind: 'reference-object-tracking'; referenceIds: readonly string[] };

export type PerceptionSession = {
  addOnObjectChangedListener(
    listener: (result: TrackedObject) => void,
  ): { remove(): void };
  stop(): Promise<void>;
};

// Factory opens/authorizes a fully ready native session or rejects with
// a descriptive capability/permission error. No simulated result path.
export declare function startPerceptionSession(
  requirement: PerceptionRequirement,
): Promise<PerceptionSession>;
```

**Margelo API-design requirements:** discriminated input/output types; units and coordinate-space docs; no undifferentiated `CameraResult` with dozens of nullable fields; explicit permission errors; ready-session factory; idempotent listener removal; resource ownership; named capability reporting. Keep the native source/renderer separate from React components.

## Acceptance and negative tests

- Validate a **real keyboard** on iPhone, Android and each claimed supported headset. Record detection mode, hardware, OS, library versions, permissions, frame times, thermal behavior and session teardown.
- visionOS: detect the specific trained reference object on **physical Vision Pro**, add a stable world-space label, move around it to verify anchoring, then remove world-sensing permission and verify an honest error state.
- Raw camera access not granted: **never** render fake preview, mock detections, cached detections, or passthrough screenshots as live data.
- Not recognized yet: display scanning/target guidance, not an invented result.
- Handle app pause/resume, display orientation, fold/hinge transitions, competing camera apps, low memory, and slow inference without dropping accessibility or native focus.
- Rive visual confirmation respects reduced motion. Kinetrell animates surrounding UI, not system camera imagery or system-owned XR windows.
- **Do not claim `VisionCamera` raw-frame compatibility on visionOS** merely because Vision Pro can track objects through ARKit.

## Documentation status

This document **corrects a previously overbroad claim** that Vision Pro real-world object detection requires enterprise camera access. That is incorrect for public ARKit `ObjectTrackingProvider` reference-object tracking. Raw stereo camera frames remain subject to a separate restricted API path. The starter must support the former as a first-class real XR sensing implementation, while keeping the latter explicitly gated.
