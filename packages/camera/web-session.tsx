'use client';
/**
 * Browser camera session: getUserMedia preview plus MediaPipe Tasks Vision
 * ObjectDetector (EfficientDet-Lite0) on a 10 Hz timer, outside React's
 * render loop. Lazy-loaded by CameraLab.web.tsx after the overlay opens and
 * mounted once per attempt; unmounting stops every track and closes the
 * detector. Frames are never copied out of the video element or stored.
 */
import { useEffect, useRef } from 'react';
import type { ObjectDetector } from '@mediapipe/tasks-vision';
import { INFERENCE_INTERVAL_MS, KEYBOARD_LABEL, MIN_KEYBOARD_SCORE, mapCoverBox } from './detection';
import type { CameraUnavailableReason } from './lab-machine';
import { dispatchLab, useCameraLabStore } from './lab-store';
import { MEDIAPIPE_WASM_BASE_URL, WEB_MODEL_URL } from './web-config';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** getUserMedia DOMException names -> Camera Lab states. */
function classifyMediaError(error: unknown): { denied: true } | { denied: false; reason: CameraUnavailableReason } {
  const name = error instanceof DOMException ? error.name : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') return { denied: true };
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return { denied: false, reason: 'no-camera' };
  if (name === 'NotReadableError' || name === 'AbortError') return { denied: false, reason: 'in-use' };
  return { denied: false, reason: 'error' };
}

async function createDetector(): Promise<ObjectDetector> {
  const { FilesetResolver, ObjectDetector } = await import('@mediapipe/tasks-vision');
  const fileset = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_BASE_URL);
  // CPU (wasm SIMD) delegate. In headless Chromium the GPU delegate scored a
  // test keyboard photo as "dining table 0.21" while CPU returned
  // "keyboard 0.83" for the same pixels. The 10 Hz cap bounds the CPU cost.
  return ObjectDetector.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: WEB_MODEL_URL, delegate: 'CPU' },
    runningMode: 'VIDEO',
    maxResults: 1,
    scoreThreshold: MIN_KEYBOARD_SCORE,
    categoryAllowlist: [KEYBOARD_LABEL],
  });
}

export default function WebKeyboardSession() {
  const status = useCameraLabStore((s) => s.state.status);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<ObjectDetector | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const disposedRef = useRef(false);

  // 0. Release everything on unmount. Declared first so a StrictMode remount
  //    resets the flag before the session effects below run again.
  useEffect(() => {
    disposedRef.current = false;
    const video = videoRef.current;
    return () => {
      disposedRef.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (video) video.srcObject = null;
      detectorRef.current?.close();
      detectorRef.current = null;
    };
  }, []);

  // 1. Permission + stream (the browser prompt is the permission request).
  useEffect(() => {
    if (status !== 'requesting-permission') return;
    let cancelled = false;
    if (!window.isSecureContext) {
      dispatchLab({ type: 'camera-unavailable', reason: 'insecure-context' });
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      dispatchLab({ type: 'camera-unavailable', reason: 'unsupported-browser' });
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } })
      .then(async (stream) => {
        if (cancelled || disposedRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
        }
        dispatchLab({ type: 'permission-granted' });
      })
      .catch((error: unknown) => {
        if (cancelled || disposedRef.current) return;
        const outcome = classifyMediaError(error);
        if (outcome.denied) dispatchLab({ type: 'permission-denied', canAskAgain: true });
        else dispatchLab({ type: 'camera-unavailable', reason: outcome.reason, detail: errorMessage(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [status]);

  // 2. Detector, then the capped inference loop.
  useEffect(() => {
    if (status !== 'model-loading') return;
    let cancelled = false;
    createDetector()
      .then((detector) => {
        if (cancelled || disposedRef.current) {
          detector.close();
          return;
        }
        detectorRef.current = detector;
        dispatchLab({ type: 'model-ready' });

        const tick = () => {
          if (disposedRef.current) return;
          const video = videoRef.current;
          if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
            try {
              const result = detector.detectForVideo(video, performance.now());
              const hit = result.detections.find((d) => d.categories.some((c) => c.categoryName === KEYBOARD_LABEL));
              const score = hit?.categories.find((c) => c.categoryName === KEYBOARD_LABEL)?.score;
              const box =
                hit?.boundingBox &&
                mapCoverBox(
                  { x: hit.boundingBox.originX, y: hit.boundingBox.originY, width: hit.boundingBox.width, height: hit.boundingBox.height },
                  { width: video.videoWidth, height: video.videoHeight },
                  { width: video.clientWidth, height: video.clientHeight },
                );
              dispatchLab({ type: 'inference', detection: box && score !== undefined ? { confidence: score, box } : null });
            } catch (error) {
              dispatchLab({ type: 'model-failed', detail: errorMessage(error) });
              return;
            }
          }
          timerRef.current = setTimeout(tick, INFERENCE_INTERVAL_MS);
        };
        tick();
      })
      .catch((error: unknown) => {
        if (!cancelled && !disposedRef.current) dispatchLab({ type: 'model-failed', detail: errorMessage(error) });
      });
    return () => {
      // Only guards the pending load; once loaded, the loop runs until unmount.
      cancelled = true;
    };
  }, [status]);

  return (
    <video
      ref={videoRef}
      aria-hidden
      muted
      playsInline
      autoPlay
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
}
