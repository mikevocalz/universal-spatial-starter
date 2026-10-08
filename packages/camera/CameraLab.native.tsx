import { lazy, Suspense } from 'react';
import { Linking } from 'react-native';
import type { CameraLabProps } from './CameraLabProps';
import type { StatusAction } from './copy';
import { needsSession } from './lab-machine';
import { dispatchLab, useCameraLabStore } from './lab-store';
import { LabOverlay, useLabLifecycle } from './lab-ui';

// The VisionCamera session loads only once the overlay opens.
const NativeKeyboardSession = lazy(() => import('./native-session'));

function onAction(action: StatusAction) {
  if (action === 'open-settings') {
    // The session re-checks permission when the app returns to the foreground.
    void Linking.openSettings();
    return;
  }
  dispatchLab({ type: 'retry' });
}

/**
 * Camera Lab on every native target (phones, tablets, Quest, PICO, Vision Pro):
 * VisionCamera v5 preview plus on-device EfficientDet-Lite0 keyboard detection.
 */
export function CameraLab({ open, onClose }: CameraLabProps) {
  useLabLifecycle(open);
  const state = useCameraLabStore((s) => s.state);
  const attempt = useCameraLabStore((s) => s.attempt);
  if (!open) return null;

  return (
    <LabOverlay
      onClose={onClose}
      onAction={onAction}
      preview={
        needsSession(state) ? (
          <Suspense fallback={null}>
            <NativeKeyboardSession key={attempt} />
          </Suspense>
        ) : null
      }
    />
  );
}
