/**
 * Detector constants and the pure math between model output and the preview.
 * Functions marked 'worklet' also run on VisionCamera's frame threads; the
 * directive is an inert string under node:test.
 */
import type { ViewRect } from './lab-machine';

/** COCO label the demo looks for (line 76 of assets/labelmap.txt). */
export const KEYBOARD_LABEL = 'keyboard';
/** Zero-based class index of `keyboard` in the model's label map. */
export const KEYBOARD_CLASS_INDEX = 75;
/** Minimum model score shown as a detection. Tune against real devices. */
export const MIN_KEYBOARD_SCORE = 0.5;
/** Inference cap: at most one detector run per 100 ms (10 Hz) on every platform. */
export const INFERENCE_INTERVAL_MS = 100;
/** EfficientDet-Lite0 input edge, in pixels (input tensor is 1x320x320x3 uint8). */
export const MODEL_INPUT_SIZE = 320;

/** A keyboard box in normalized, upright model-input space (0..1). */
export interface NormalizedBox {
  score: number;
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
}

const clamp01 = (v: number): number => {
  'worklet';
  return v < 0 ? 0 : v > 1 ? 1 : v;
};

/**
 * Picks the highest-scoring `keyboard` detection from the
 * TFLite_Detection_PostProcess outputs of EfficientDet-Lite0:
 * boxes [1,N,4] as (yMin, xMin, yMax, xMax), classes [1,N], scores [1,N], count [1].
 * Returns undefined when no keyboard clears {@link MIN_KEYBOARD_SCORE}.
 */
export function pickKeyboard(
  boxes: Float32Array,
  classes: Float32Array,
  scores: Float32Array,
  count: Float32Array,
): NormalizedBox | undefined {
  'worklet';
  const n = Math.min(Math.round(count[0] ?? 0), scores.length, classes.length, Math.floor(boxes.length / 4));
  let best = -1;
  let bestScore = MIN_KEYBOARD_SCORE;
  for (let i = 0; i < n; i++) {
    const score = scores[i] ?? 0;
    if (Math.round(classes[i] ?? -1) === KEYBOARD_CLASS_INDEX && score >= bestScore) {
      best = i;
      bestScore = score;
    }
  }
  if (best < 0) return undefined;
  const o = best * 4;
  const yMin = clamp01(boxes[o] ?? 0);
  const xMin = clamp01(boxes[o + 1] ?? 0);
  const yMax = clamp01(boxes[o + 2] ?? 0);
  const xMax = clamp01(boxes[o + 3] ?? 0);
  if (xMax <= xMin || yMax <= yMin) return undefined;
  return { score: bestScore, xMin, yMin, xMax, yMax };
}

/** Clockwise rotation of a frame's pixel data relative to upright (VisionCamera `Frame.orientation`). */
export type FrameOrientation = 'up' | 'right' | 'down' | 'left';

const ROTATION_DEGREES: Record<FrameOrientation, number> = { up: 0, right: 90, down: 180, left: 270 };

/**
 * Maps a point in the upright, unmirrored model input back to normalized
 * coordinates in the raw frame buffer. This is the exact mapping the
 * VisionCamera Resizer's sampler uses (react-native-vision-camera-resizer
 * ios/Metal/ResizerKernels.metal: undo rotation, then undo mirroring) for
 * scaleMode 'stretch', so a model coordinate lands on the pixel it came from.
 */
export function uprightToFrameNormalized(
  u: number,
  v: number,
  orientation: FrameOrientation,
  isMirrored: boolean,
): { x: number; y: number } {
  'worklet';
  const inverse = (360 - ROTATION_DEGREES[orientation]) % 360;
  let x = u;
  let y = v;
  if (inverse === 90) {
    x = 1 - v;
    y = u;
  } else if (inverse === 180) {
    x = 1 - u;
    y = 1 - v;
  } else if (inverse === 270) {
    x = v;
    y = 1 - u;
  }
  if (isMirrored) x = 1 - x;
  return { x, y };
}

/** The four corners of a normalized box, clockwise from top-left. */
export function boxCorners(box: NormalizedBox): { u: number; v: number }[] {
  'worklet';
  return [
    { u: box.xMin, v: box.yMin },
    { u: box.xMax, v: box.yMin },
    { u: box.xMax, v: box.yMax },
    { u: box.xMin, v: box.yMax },
  ];
}

/** Axis-aligned bounds of a set of points, clipped to a view of the given size. */
export function boundsInView(points: { x: number; y: number }[], viewWidth: number, viewHeight: number): ViewRect | undefined {
  if (points.length === 0) return undefined;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  const x = Math.max(0, minX);
  const y = Math.max(0, minY);
  const width = Math.min(viewWidth, maxX) - x;
  const height = Math.min(viewHeight, maxY) - y;
  if (!(width > 0) || !(height > 0)) return undefined;
  return { x, y, width, height };
}
