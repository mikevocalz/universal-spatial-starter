# 1. Camera Lab detector per platform

Date: 2026-10-08

## Status

Accepted. Web detection verified in headless Chromium against a recorded keyboard feed. Native detection NOT VERIFIED on any device.

## Context

Camera Lab (`packages/camera`, `@acme/camera`) is the full-screen overlay behind the raised Scan button. It must find a physical keyboard (COCO class `keyboard`) from real camera frames and draw boxes only from model output (docs/CAMERA_AND_XR.md; MASTER_PROMPT_V5 "CAMERA LAB"). The workspace runs Expo SDK 58, React Native 0.88.0-rc.3, react-native-nitro-modules 0.37.1, react-native-worklets 0.13.0 and Next.js 16.3.8.

Constraints found while choosing:

- VisionCamera v5 is the Nitro rewrite. npm `latest` is 5.2.3 (2026-08-20), built with nitrogen and nitro-modules 0.37.0. Its peers are `*` for React, React Native, nitro-modules and nitro-image. It ships no Expo config plugin; the official Expo setup is `ios.infoPlist.NSCameraUsageDescription` plus the Android `CAMERA` permission.
- Frame processors need `react-native-vision-camera-worklets` 5.2.3 and Software Mansion's `react-native-worklets` (0.13.0 peers on RN 0.86–0.88).
- `react-native-fast-tflite` 3.0.1 (Margelo, MIT) is a Nitro module (`TfliteModel` HybridObject with `runSync(ArrayBuffer[])`), callable from a VisionCamera worklet. It was generated with nitrogen ^0.35.2 and peers on nitro-modules `*`; compiling its generated C++ against Nitro 0.37.1 has not been tried.
- MediaPipe's own EfficientDet-Lite0 build has no in-graph NMS (raw outputs `[1,19206,4]` and `[1,19206,90]`). Using it natively would mean reimplementing anchor decoding and NMS in a worklet. The TF Hub "detection metadata" build ends in `TFLite_Detection_PostProcess` and emits final boxes, classes, scores and count.
- `apps/mobile/metro.config.js` registers `bin` but not `tflite` as an asset extension, and this change was limited to `app.config.ts` and dependencies in `apps/mobile`.
- fast-tflite's `require()` path hands the asset URI to `URL(path).readBytes()` on Android, which only works for the dev-server http URL. A release build gives a resource name instead.

## Decision

| Platform | Camera | Detector | Versions |
|---|---|---|---|
| iOS, Android phones | VisionCamera v5 `<Camera>` + `useFrameOutput` (VGA 4:3; `'yuv'` on iOS, `'native'` on Android) | EfficientDet-Lite0 TF Hub detection-metadata build, `react-native-fast-tflite` CPU delegate (`[]`), run on a VisionCamera `AsyncRunner` thread | react-native-vision-camera 5.2.3, -worklets 5.2.3, -resizer 5.2.3, react-native-nitro-image 0.15.2, react-native-fast-tflite 3.0.1 |
| Web (Next.js, Expo web) | `getUserMedia`, back camera preferred, started only after the overlay opens | MediaPipe Tasks Vision `ObjectDetector`, EfficientDet-Lite0 int8 v1, CPU delegate, `VIDEO` mode | @mediapipe/tasks-vision 1.1.0; wasm from jsDelivr pinned to 1.1.0; model from its versioned GCS path |
| Meta Horizon OS (Quest), PICO | none | none; `sensing-unavailable` state | n/a |
| visionOS | none | none; `sensing-unavailable` (no trained `.referenceobject` in this build) | n/a |

Details:

- **Frame to tensor.** The VisionCamera Resizer converts each sampled frame to a 320×320 RGB `uint8` interleaved buffer on the GPU (Metal, Vulkan) with `scaleMode: 'stretch'`. It applies the frame's orientation and mirroring itself.
- **Coordinates.** `detection.ts#uprightToFrameNormalized` inverts the Resizer shader's sampling (`ResizerKernels.metal`: undo rotation, then undo mirroring) to take each box corner back to raw-buffer pixels. `Frame.convertFramePointToCameraPoint` runs on the worklet thread and `CameraRef.convertCameraPointToViewPoint` on the JS thread, so VisionCamera owns rotation, crop and preview scaling. On web, `mapCoverBox` maps video pixels through the `object-fit: cover` transform.
- **Rate.** At most one inference per 100 ms on both platforms. Natively, frames that arrive inside the interval or while the AsyncRunner is busy are disposed immediately. Results reach React through `scheduleOnRN` and a Zustand store; React never renders per frame.
- **Lifetime.** The session component is keyed on an attempt counter and mounted only while the overlay is open in a session state. Unmounting stops every web track and closes the MediaPipe detector. Natively it closes a worklets `Synchronizable` gate and disposes the model and resizer on the AsyncRunner thread, which is serial, so disposal never overlaps an inference.
- **Model file.** Vendored as `packages/camera/assets/efficientdet_lite0.bin`, byte-identical to the upstream `.tflite`. It is loaded with `expo-asset` (`Asset.loadAsync` gives a `file://` URI in debug and release) and passed to fast-tflite as `{ url }`. Provenance, license, sha256 and tensor signature are in `packages/camera/assets/MODEL.md`.
- **Web delegate.** CPU. In headless Chromium the GPU delegate scored a full keyboard photo as `dining table 0.21`; the CPU delegate returned `keyboard 0.83` for the same image.
- **Headset detection** reuses the Viro fork's `classifyAndroidXRBuild` rules on `Platform.constants` (`packages/camera/sensing-host.ts`) instead of importing Viro. The native session module is `React.lazy`-loaded, so VisionCamera and TFLite objects are never created on a headset.

## Consequences

- One model family on every platform with a camera, but two files: the TF Hub build natively (post-processing in the graph) and MediaPipe's build on web (MediaPipe decodes it). Scores can differ slightly between them.
- The web overlay downloads about 4.6 MB of model plus the MediaPipe wasm from third-party CDNs on first open. A strict CSP would need `cdn.jsdelivr.net` and `storage.googleapis.com` allowed. Vendoring both into `apps/web/public` is the alternative if offline web use matters.
- CPU inference everywhere keeps behavior predictable. GPU delegates (`core-ml`, `android-gpu` via the fast-tflite config plugin) stay unused until someone measures them on devices.
- If the Resizer cannot be created (no Metal, or no Vulkan with `AHardwareBuffer`), Camera Lab shows "The detector did not load". There is no CPU resize fallback.
- The Android `CAMERA` permission was already in the main manifest (the Viro plugin writes it for AR mode), so all flavors declare it. Camera Lab never opens the camera on Quest or PICO.
- Open risks, all NOT VERIFIED: fast-tflite 3.0.1 (nitrogen 0.35) compiling and running against Nitro 0.37.1; `GPUFrame.getPixelBuffer()` being tightly packed (320×320×3 bytes) on every GPU; frame worklet behavior under the React Compiler; preview/box alignment on real devices in each orientation. The first native device run must check these before any detection claim is made for phones.
