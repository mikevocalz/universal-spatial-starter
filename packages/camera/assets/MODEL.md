# Camera Lab detector models

Both platforms run EfficientDet-Lite0 trained on COCO. The demo reads one class: `keyboard`.

## Native (iOS, Android): `efficientdet_lite0.bin`

| Field | Value |
|---|---|
| Model | EfficientDet Lite0 V1, detection, with TFLite metadata ("EfficientDet Lite0 V1" in the embedded metadata) |
| Source URL | https://storage.googleapis.com/download.tensorflow.org/models/tflite/task_library/object_detection/android/lite-model_efficientdet_lite0_detection_metadata_1.tflite |
| Upstream listing | TensorFlow Hub `tensorflow/efficientdet/lite0/detection` (now on Kaggle Models: `tensorflow/efficientdet/tfLite/lite0-detection-metadata/1`) |
| License | Apache License 2.0 (stated in the model's embedded metadata) |
| Size | 4,563,519 bytes |
| sha256 | `2e04c53bfeac0ac2a30c057c7e2a777594ce39baaac35a92f74fb1e8c4fc4e0b` |
| GCS md5 (base64) | `22QJLpBzhRG0IelgEDrUwg==` (matches the `x-goog-hash` header of the source URL) |
| Fetched | 2026-10-08 |

The file is byte-identical to the upstream `.tflite`. It is stored with a `.bin` extension because `apps/mobile/metro.config.js` already registers `bin` as an asset extension and `tflite` is not registered. `support.test.ts` checks the sha256 above against the bundled bytes.

### Signature (read from the flatbuffer)

- Input `serving_default_images:0`: `[1, 320, 320, 3]`, `uint8`, RGB, 0..255. The camera path produces it with the VisionCamera Resizer (`width: 320, height: 320, channelOrder: 'rgb', dataType: 'uint8', pixelLayout: 'interleaved', scaleMode: 'stretch'`).
- The graph ends in the `TFLite_Detection_PostProcess` custom op with `max_detections: 25`, `num_classes: 90`, `nms_iou_threshold: 0.5`, `use_regular_nms: 0`. Outputs, in model order:
  1. `StatefulPartitionedCall:3`: boxes `[1, 25, 4]` as normalized `(yMin, xMin, yMax, xMax)`
  2. `StatefulPartitionedCall:2`: class indices `[1, 25]`
  3. `StatefulPartitionedCall:1`: scores `[1, 25]`
  4. `StatefulPartitionedCall:0`: detection count `[1]`

### Label map

`labelmap.txt` is the `labelmap.txt` embedded in the model (the `.tflite` is also a zip archive), 90 lines, sha256 `f8803ef7900160c629d570848dfda4175e21667bf7b71f73f8ece4938c9f2bf2`. Class index `n` is line `n + 1`; unused COCO ids are `???`. `keyboard` is index 75 (line 76). `detection.test.ts` asserts this.

## Web: loaded from a pinned URL, not vendored

| Field | Value |
|---|---|
| Model | MediaPipe Object Detector, EfficientDet-Lite0 int8, model version 1 |
| URL | https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/int8/1/efficientdet_lite0.tflite |
| License | Apache License 2.0 (MediaPipe model card) |
| Size | 4,602,795 bytes |
| sha256 | `0720bf247bd76e6594ea28fa9c6f7c5242be774818997dbbeffc4da460c723bb` (computed 2026-10-08) |
| Runtime | `@mediapipe/tasks-vision` 1.1.0, wasm from `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.0/wasm` |

This variant has no in-graph post-processing (outputs are raw anchors: boxes `[1, 19206, 4]`, scores `[1, 19206, 90]`); MediaPipe decodes and runs NMS itself, which is why the native path uses the TF Hub build above instead. Its embedded `labels.txt` is identical to `labelmap.txt`.
