import { lazy, Suspense } from 'react';
import { Linking, Platform } from 'react-native';
import type { CameraLabProps } from './CameraLabProps';
import type { StatusAction } from './copy';
import { needsSession, type SensingHost } from './lab-machine';
import { dispatchLab, useCameraLabStore } from './lab-store';
import { LabOverlay, useLabLifecycle } from './lab-ui';
import { classifyNativeHost } from './sensing-host';

// Loaded only on phones, so VisionCamera, the TFLite runtime and their Nitro
// objects are never created on Quest, PICO or Vision Pro.
const NativeKeyboardSession = lazy(() => import('./native-session'));

function resolveNativeHost(): SensingHost {
  const constants = Platform.constants as Partial<Record<'Manufacturer' | 'Brand' | 'Model', string>>;
  return classifyNativeHost({
    os: Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'other',
    isVision: (Platform as { isVision?: boolean }).isVision === true,
    android:
      Platform.OS === 'android'
        ? { manufacturer: constants.Manufacturer ?? '', brand: constants.Brand ?? '', model: constants.Model ?? '' }
        : undefined,
  });
}

function onAction(action: StatusAction) {
  if (action === 'open-settings') {
    // The session re-checks permission when the app returns to the foreground.
    void Linking.openSettings();
    return;
  }
  dispatchLab({ type: 'retry' });
}

/**
 * Camera Lab on iOS and Android: VisionCamera v5 preview plus on-device
 * EfficientDet-Lite0 keyboard detection. Headsets get `sensing-unavailable`.
 */
export function CameraLab({ open, onClose }: CameraLabProps) {
  useLabLifecycle(open, resolveNativeHost);
  const state = useCameraLabStore((s) => s.state);
  const attempt = useCameraLabStore((s) => s.attempt);
  if (!open) return null;

  return (
    <LabOverlay
      surface="native"
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
