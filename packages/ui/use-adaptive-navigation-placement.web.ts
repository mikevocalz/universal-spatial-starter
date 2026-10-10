'use client';

import { useSyncExternalStore } from 'react';
import { I18nManager, useWindowDimensions } from 'react-native';
import { resolveAdaptiveNavigationPlacement, type AdaptiveNavigationPlacement } from './adaptive-navigation';
import { useWindowSizeClass } from './adaptive-panes/use-window-size-class';

let hydrated = false;
const hydrationListeners = new Set<() => void>();
const subscribeToHydration = (listener: () => void) => {
  hydrationListeners.add(listener);
  if (!hydrated) {
    queueMicrotask(() => {
      hydrated = true;
      hydrationListeners.forEach((notify) => notify());
    });
  }
  return () => hydrationListeners.delete(listener);
};

export function useAdaptiveNavigationPlacement(): AdaptiveNavigationPlacement {
  const liveSizeClass = useWindowSizeClass();
  const { height } = useWindowDimensions();
  const mounted = useSyncExternalStore(subscribeToHydration, () => hydrated, () => false);

  return resolveAdaptiveNavigationPlacement({
    platform: 'other',
    sizeClass: mounted ? liveSizeClass : 'compact',
    heightDp: mounted ? height : 800,
    folds: [],
    hardwareEdge: null,
    isRTL: I18nManager.isRTL,
  });
}
