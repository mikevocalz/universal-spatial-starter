'use client';
// Live shell-navigation placement: window size class, window height, native
// fold posture and any Apple hardware edge column, resolved through the pure
// policy in ./adaptive-navigation.ts.
// SOT: ./adaptive-navigation.ts · ./adaptive-panes/README.md (Navigation rail)
// SOT-KEYWORDS: adaptive navigation placement hook rail bottom fold posture
import { useEffect } from 'react';
import { create } from 'zustand';
import { Dimensions, I18nManager, Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  resolveAdaptiveNavigationPlacement,
  type AdaptiveNavigationPlacement,
  type HardwareEdgeColumn,
} from './adaptive-navigation';
import { foldLayoutsFromRegions } from './adaptive-panes/fold-layout';
import { useWindowSizeClass } from './adaptive-panes/use-window-size-class';
import { useDeviceCapabilities } from './device-capabilities';
import { useReservedRegions } from './reserved-regions';

/**
 * A safe-area inset this wide is a system-reserved control column, not a
 * cutout. 64 dp clears every notch and rounded-corner inset in landscape.
 */
const HARDWARE_EDGE_COLUMN_MIN_DP = 64;
const useDeviceFamily = create(() => ({ foldable: false }));

function hardwareEdgeColumn(left: number, right: number): HardwareEdgeColumn | null {
  if (Platform.OS !== 'ios') return null;
  const leftColumn = left >= HARDWARE_EDGE_COLUMN_MIN_DP ? left : 0;
  const rightColumn = right >= HARDWARE_EDGE_COLUMN_MIN_DP ? right : 0;
  if (leftColumn === 0 && rightColumn === 0) return null;
  return leftColumn > rightColumn
    ? { edge: 'left', width: leftColumn }
    : { edge: 'right', width: rightColumn };
}

/**
 * Where the app's primary navigation belongs right now: a bottom bar, a
 * collapsed rail, an expanded rail, or (Apple) a sidebar or hardware column.
 * Re-renders on resize, fold and posture change.
 *
 * @see {@linkcode resolveAdaptiveNavigationPlacement} for the policy.
 */
export function useAdaptiveNavigationPlacement(): AdaptiveNavigationPlacement {
  const sizeClass = useWindowSizeClass();
  const { height } = useWindowDimensions();
  const { left, right } = useSafeAreaInsets();
  const regions = useReservedRegions();
  const capabilities = useDeviceCapabilities();
  const screen = Dimensions.get('screen');
  const rememberedFold = useDeviceFamily((state) => state.foldable);
  const hasFold = Boolean(capabilities?.isFoldable || regions.some((region) => region.kind === 'division') || hardwareEdgeColumn(left, right));
  useEffect(() => { if (hasFold) useDeviceFamily.setState({ foldable: true }); }, [hasFold]);

  return resolveAdaptiveNavigationPlacement({
    platform: Platform.OS === 'android' ? 'android' : Platform.OS === 'ios' ? 'ios' : 'other',
    sizeClass,
    heightDp: height,
    folds: foldLayoutsFromRegions(regions),
    hardwareEdge: hardwareEdgeColumn(left, right),
    isRTL: I18nManager.isRTL,
    isFoldable: hasFold || rememberedFold,
    isHeadset: capabilities?.isHeadset,
    isTablet: Platform.OS === 'ios' ? Platform.isPad
      : capabilities?.isTablet ?? Math.min(screen.width, screen.height) >= 600,
  });
}
