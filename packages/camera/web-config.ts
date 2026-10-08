/**
 * Pinned remote sources for the web detector. The wasm runtime version must
 * equal the installed @mediapipe/tasks-vision version (web-config.test.ts
 * enforces it), and the model URL names an immutable, versioned object.
 */
export const MEDIAPIPE_TASKS_VISION_VERSION = '1.1.0';

export const MEDIAPIPE_WASM_BASE_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_TASKS_VISION_VERSION}/wasm`;

/** MediaPipe's EfficientDet-Lite0 int8 object detector, model version 1 (COCO, Apache-2.0). */
export const WEB_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/int8/1/efficientdet_lite0.tflite';
