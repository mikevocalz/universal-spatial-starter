/**
 * Phone camera session: VisionCamera v5 preview + frame output, GPU resize
 * to the model input, EfficientDet-Lite0 via react-native-fast-tflite on a
 * VisionCamera AsyncRunner thread. Imported lazily by CameraLab.native.tsx
 * and mounted once per attempt; unmounting stops the session and releases
 * the model and resizer.
 */
import { useEffect, useMemo, useRef } from 'react';
import { AppState, Platform, StyleSheet, type LayoutChangeEvent } from 'react-native';
import { Asset } from 'expo-asset';
import { loadTensorflowModel, type TfliteModel } from 'react-native-fast-tflite';
import {
  Camera,
  CommonResolutions,
  VisionCamera,
  getCameraDevice,
  useAsyncRunner,
  useFrameOutput,
  type AsyncRunner,
  type CameraDevice,
  type CameraRef,
  type Frame,
  type Point,
} from 'react-native-vision-camera';
import { createResizer, type Resizer } from 'react-native-vision-camera-resizer';
import { createSynchronizable, scheduleOnRN, type Synchronizable } from 'react-native-worklets';
import { create } from 'zustand';
import {
  INFERENCE_INTERVAL_MS,
  MODEL_INPUT_SIZE,
  boundsInView,
  boxCorners,
  pickKeyboard,
  uprightToFrameNormalized,
} from './detection';
import { dispatchLab, useCameraLabStore } from './lab-store';

// Stored as .bin: apps/mobile/metro.config.js already registers `bin` as an
// asset extension. Byte-identical to the upstream .tflite (see assets/MODEL.md).
// eslint-disable-next-line @typescript-eslint/no-require-imports
const MODEL_ASSET: number = require('./assets/efficientdet_lite0.bin');

interface DetectorResources {
  device: CameraDevice;
  model: TfliteModel;
  resizer: Resizer;
}

/**
 * Native handles for the mounted session. A store (not React state) so the
 * frame worklet re-captures them when they arrive; never persisted.
 */
const useSessionResources = create<{ resources: DetectorResources | null }>(() => ({ resources: null }));

/** Result the inference thread hands back to the JS thread. */
interface InferenceResult {
  score: number;
  /** Box corners in camera sensor coordinates (VisionCamera's opaque camera space). */
  cameraPoints: Point[];
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function tryDispose(resource: { dispose(): void }): void {
  'worklet';
  try {
    resource.dispose();
  } catch {
    // Already disposed by the other release path; nothing left to free.
  }
}

/**
 * Release order matters: the gate closes first so no new inference starts,
 * then disposal runs on the AsyncRunner thread, which is serial, so it can
 * never overlap an inference. If the runner is busy, the in-flight task sees
 * the closed gate and disposes when it finishes.
 */
function releaseResources(resources: DetectorResources, runner: AsyncRunner, gate: Synchronizable<boolean>): void {
  gate.setBlocking(false);
  const { model, resizer } = resources;
  runner.runAsync(() => {
    'worklet';
    tryDispose(resizer);
    tryDispose(model);
  });
}

async function loadResources(): Promise<DetectorResources | undefined> {
  const factory = await VisionCamera.createDeviceFactory();
  const device =
    getCameraDevice(factory, 'back') ?? getCameraDevice(factory, 'front') ?? getCameraDevice(factory, 'external');
  if (!device) return undefined;

  const [asset] = await Asset.loadAsync(MODEL_ASSET);
  if (!asset?.localUri) throw new Error('The detector model is missing from the app bundle.');

  const [model, resizer] = await Promise.allSettled([
    // Empty delegate list = TFLite's CPU kernels; inference is capped at 10 Hz.
    loadTensorflowModel({ url: asset.localUri }, []),
    createResizer({
      width: MODEL_INPUT_SIZE,
      height: MODEL_INPUT_SIZE,
      channelOrder: 'rgb',
      dataType: 'uint8',
      // 'stretch' maps the whole upright frame onto the model input, which
      // keeps detection.ts's inverse mapping exact.
      scaleMode: 'stretch',
      pixelLayout: 'interleaved',
    }),
  ]);
  if (model.status === 'rejected' || resizer.status === 'rejected') {
    if (model.status === 'fulfilled') tryDispose(model.value);
    if (resizer.status === 'fulfilled') tryDispose(resizer.value);
    const reason = model.status === 'rejected' ? model.reason : (resizer as PromiseRejectedResult).reason;
    throw new Error(errorMessage(reason));
  }

  const input = model.value.inputs[0];
  const expected = [1, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE, 3];
  if (
    !input ||
    input.dataType !== 'uint8' ||
    input.shape.join('x') !== expected.join('x') ||
    model.value.outputs.length !== 4
  ) {
    tryDispose(model.value);
    tryDispose(resizer.value);
    throw new Error('The bundled model does not match the EfficientDet-Lite0 detection signature.');
  }
  return { device, model: model.value, resizer: resizer.value };
}

export default function NativeKeyboardSession() {
  const status = useCameraLabStore((s) => s.state.status);
  const resources = useSessionResources((s) => s.resources);
  const cameraRef = useRef<CameraRef>(null);
  const viewSize = useRef({ width: 0, height: 0 });
  const runner = useAsyncRunner();
  // Open while this session may run inference; closed on unmount.
  const gate = useMemo(() => createSynchronizable(true), []);
  const lastInferenceMs = useMemo(() => createSynchronizable(0), []);

  // 0. Release on unmount (overlay closed, retry, or a terminal state).
  //    Declared first and reopens the gate on mount, so a StrictMode remount
  //    does not leave inference switched off.
  useEffect(() => {
    gate.setBlocking(true);
    return () => {
      const held = useSessionResources.getState().resources;
      useSessionResources.setState({ resources: null });
      if (held) releaseResources(held, runner, gate);
      else gate.setBlocking(false);
    };
  }, [runner, gate]);

  // 1. Permission.
  useEffect(() => {
    if (status !== 'requesting-permission') return;
    let cancelled = false;
    const run = async () => {
      const current = VisionCamera.cameraPermissionStatus;
      if (current === 'authorized') return dispatchLab({ type: 'permission-granted' });
      if (current !== 'not-determined') return dispatchLab({ type: 'permission-denied', canAskAgain: false });
      const granted = await VisionCamera.requestCameraPermission();
      if (cancelled) return;
      if (granted) dispatchLab({ type: 'permission-granted' });
      else
        dispatchLab({
          type: 'permission-denied',
          canAskAgain: VisionCamera.cameraPermissionStatus === 'not-determined',
        });
    };
    run().catch((error: unknown) => {
      if (!cancelled) dispatchLab({ type: 'camera-unavailable', reason: 'error', detail: errorMessage(error) });
    });
    return () => {
      cancelled = true;
    };
  }, [status]);

  // 2. Coming back from Settings with access granted.
  useEffect(() => {
    if (status !== 'permission-denied') return;
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active' && VisionCamera.cameraPermissionStatus === 'authorized') {
        dispatchLab({ type: 'permission-granted' });
      }
    });
    return () => subscription.remove();
  }, [status]);

  // 3. Camera device, model and resizer.
  useEffect(() => {
    if (status !== 'model-loading') return;
    let cancelled = false;
    loadResources()
      .then((loaded) => {
        if (cancelled) {
          if (loaded) {
            tryDispose(loaded.model);
            tryDispose(loaded.resizer);
          }
          return;
        }
        if (!loaded) {
          dispatchLab({ type: 'camera-unavailable', reason: 'no-camera' });
          return;
        }
        useSessionResources.setState({ resources: loaded });
        dispatchLab({ type: 'model-ready' });
      })
      .catch((error: unknown) => {
        if (!cancelled) dispatchLab({ type: 'model-failed', detail: errorMessage(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [status]);

  const onInference = (result: InferenceResult | undefined) => {
    if (!result) {
      dispatchLab({ type: 'inference', detection: null });
      return;
    }
    const preview = cameraRef.current;
    if (!preview) return;
    let points: Point[];
    try {
      points = result.cameraPoints.map((p) => preview.convertCameraPointToViewPoint(p));
    } catch {
      return; // Preview not ready yet; the next inference retries.
    }
    const box = boundsInView(points, viewSize.current.width, viewSize.current.height);
    dispatchLab({ type: 'inference', detection: box ? { confidence: result.score, box } : null });
  };
  const onInferenceError = (message: string) => dispatchLab({ type: 'model-failed', detail: message });

  const model = resources?.model;
  const resizer = resources?.resizer;

  const frameOutput = useFrameOutput({
    targetResolution: CommonResolutions.VGA_4_3,
    // The Resizer needs 'yuv-420-8-bit-full' on iOS ('yuv'); Android takes the
    // zero-copy native format.
    pixelFormat: Platform.OS === 'ios' ? 'yuv' : 'native',
    // Frames dropped by the 10 Hz cap are intentional.
    onFrameDropped: () => {},
    onFrame(frame: Frame) {
      'worklet';
      if (model == null || resizer == null || !gate.getDirty()) {
        frame.dispose();
        return;
      }
      if (Date.now() - lastInferenceMs.getDirty() < INFERENCE_INTERVAL_MS) {
        frame.dispose();
        return;
      }
      const accepted = runner.runAsync(() => {
        'worklet';
        // Must not throw: AsyncRunner only clears its busy flag after a clean return.
        try {
          if (!gate.getDirty()) return;
          lastInferenceMs.setBlocking(Date.now());
          const resized = resizer.resize(frame);
          let outputs: ArrayBuffer[];
          try {
            outputs = model.runSync([resized.getPixelBuffer()]);
          } finally {
            resized.dispose();
          }
          const [boxes, classes, scores, count] = outputs;
          if (!boxes || !classes || !scores || !count) throw new Error('The detector returned fewer than 4 outputs.');
          const pick = pickKeyboard(
            new Float32Array(boxes),
            new Float32Array(classes),
            new Float32Array(scores),
            new Float32Array(count),
          );
          if (!pick) {
            scheduleOnRN(onInference, undefined);
            return;
          }
          const cameraPoints = boxCorners(pick).map((corner) => {
            const n = uprightToFrameNormalized(corner.u, corner.v, frame.orientation, frame.isMirrored);
            return frame.convertFramePointToCameraPoint({ x: n.x * frame.width, y: n.y * frame.height });
          });
          scheduleOnRN(onInference, { score: pick.score, cameraPoints });
        } catch (error) {
          scheduleOnRN(onInferenceError, error instanceof Error ? error.message : String(error));
        } finally {
          frame.dispose();
          if (!gate.getDirty()) {
            tryDispose(resizer);
            tryDispose(model);
          }
        }
      });
      if (!accepted) frame.dispose();
    },
  });

  const onLayout = (event: LayoutChangeEvent) => {
    viewSize.current = { width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height };
  };

  if (!resources) return null;
  return (
    <Camera
      ref={cameraRef}
      style={StyleSheet.absoluteFill}
      onLayout={onLayout}
      device={resources.device}
      isActive
      resizeMode="cover"
      outputs={[frameOutput]}
      onError={(error) => dispatchLab({ type: 'camera-unavailable', reason: 'error', detail: error.message })}
    />
  );
}
