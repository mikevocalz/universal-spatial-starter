'use client';

import { lazy, Suspense } from 'react';
import type { CameraLabProps } from './CameraLabProps';
import { needsSession, type SensingHost } from './lab-machine';
import { dispatchLab, useCameraLabStore } from './lab-store';
import { LabOverlay, useLabLifecycle } from './lab-ui';

// The session (getUserMedia + MediaPipe) is a separate chunk that only loads
// after the overlay opens, so nothing camera-related runs during SSR.
const WebKeyboardSession = lazy(() => import('./web-session'));

const resolveWebHost = (): SensingHost => 'web';
const onAction = () => dispatchLab({ type: 'retry' });

/**
 * Camera Lab in the browser: getUserMedia preview plus MediaPipe Tasks
 * Vision EfficientDet-Lite0 keyboard detection, client-only.
 */
export function CameraLab({ open, onClose }: CameraLabProps) {
  useLabLifecycle(open, resolveWebHost);
  const state = useCameraLabStore((s) => s.state);
  const attempt = useCameraLabStore((s) => s.attempt);
  if (!open) return null;

  return (
    <LabOverlay
      surface="web"
      onClose={onClose}
      onAction={onAction}
      preview={
        needsSession(state) ? (
          <Suspense fallback={null}>
            <WebKeyboardSession key={attempt} />
          </Suspense>
        ) : null
      }
    />
  );
}
