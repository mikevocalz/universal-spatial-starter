'use client';

import { useEffect, type ReactNode } from 'react';
import { AccessibilityInfo } from 'react-native';
import { Modal } from '@acme/ui';
import { Pressable, Text, View } from '@acme/ui/tw';
import { describeLabState, formatConfidence, type CopySurface, type StatusAction } from './copy';
import { dispatchLab, useCameraLabStore } from './lab-store';
import type { SensingHost } from './lab-machine';

/**
 * Mirrors the `open` prop into the store: open dispatches once per opening
 * with the resolved host, close (or unmount) returns the machine to `closed`.
 */
export function useLabLifecycle(open: boolean, resolveHost: () => SensingHost): void {
  useEffect(() => {
    if (!open) return;
    dispatchLab({ type: 'open', host: resolveHost() });
    return () => dispatchLab({ type: 'close' });
  }, [open, resolveHost]);
}

function Button({ label, onPress, tone }: { label: string; onPress: () => void; tone: 'solid' | 'quiet' }) {
  return (
    <Pressable
      role="button"
      aria-label={label}
      onPress={onPress}
      className={`min-h-12 min-w-12 items-center justify-center rounded-full px-6 focus-visible:outline-2 focus-visible:outline-royal-300 ${
        tone === 'solid' ? 'bg-royal-500 active:bg-royal-600' : 'border border-ink-700 bg-ink-900/80 active:bg-ink-800'
      }`}
    >
      <Text className={`text-base font-semibold ${tone === 'solid' ? 'text-silver-50' : 'text-silver-200'}`}>{label}</Text>
    </Pressable>
  );
}

/** Real detection box from the latest inference; nothing renders without one. */
function DetectionBox() {
  const state = useCameraLabStore((s) => s.state);
  if (state.status !== 'keyboard-found') return null;
  const { box, confidence } = state.detection;
  return (
    <View
      aria-hidden
      pointerEvents="none"
      className="absolute rounded-lg border-2 border-royal-500"
      style={{ left: box.x, top: box.y, width: box.width, height: box.height }}
    >
      <View className="absolute -top-8 left-0 rounded-md bg-royal-500 px-2 py-1">
        <Text className="text-sm font-semibold text-silver-50">{`Keyboard ${formatConfidence(confidence)}`}</Text>
      </View>
    </View>
  );
}

/**
 * Full-screen Camera Lab frame shared by native and web: the platform
 * session's preview fills the back, the real detection box sits over it, and
 * the status panel (an aria-live region) reports the current state.
 */
export function LabOverlay({
  surface,
  onClose,
  onAction,
  preview,
}: {
  surface: CopySurface;
  onClose: () => void;
  onAction: (action: StatusAction) => void;
  preview: ReactNode;
}) {
  const state = useCameraLabStore((s) => s.state);
  const copy = describeLabState(state, surface);
  const found = state.status === 'keyboard-found';

  // iOS ignores live regions; announce the found/lost transition explicitly.
  useEffect(() => {
    if (found) AccessibilityInfo.announceForAccessibility('Keyboard found');
  }, [found]);

  return (
    <Modal visible transparent animationType="none" presentationStyle="overFullScreen" onRequestClose={onClose} statusBarTranslucent>
      {/* On web the react-native-web modal container computes to
          position: relative with content height in this app, so the root pins
          itself to the viewport there. */}
      <View
        role="dialog"
        aria-modal
        aria-label="Camera Lab"
        className={`bg-ink-950 ${surface === 'web' ? 'fixed inset-0 z-50 flex' : 'flex-1'}`}
      >
        <View className="absolute inset-0 overflow-hidden">
          {preview}
          <DetectionBox />
        </View>

        <View className="flex-row items-center justify-between gap-4 px-4 pt-12 md:px-8">
          {/* Scrim keeps the title legible over a bright camera feed. */}
          <View className="rounded-full bg-ink-950/75 px-4 py-2">
            <Text role="heading" aria-level={2} className="font-display text-2xl text-silver-50">
              Camera Lab
            </Text>
          </View>
          <Button label="Close" tone="quiet" onPress={onClose} />
        </View>

        <View className="flex-1" />

        {copy ? (
          <View className="px-4 pb-10 md:px-8">
            <View
              role="status"
              aria-live="polite"
              className="mx-auto w-full max-w-xl gap-3 rounded-2xl border border-ink-800 bg-ink-900/90 p-5"
            >
              <Text className="text-lg font-semibold text-silver-50">{copy.title}</Text>
              <Text className="text-base leading-6 text-silver-300">{copy.body}</Text>
              {copy.action ? (
                <View className="flex-row">
                  <Button label={copy.action.label} tone="solid" onPress={() => onAction(copy.action!.kind)} />
                </View>
              ) : null}
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}
