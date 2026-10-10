// Primary shell-navigation placement policy. Pure: no react-native import, so
// node --test covers every platform/posture/width combination.
// SOT: ./adaptive-panes/README.md (Navigation rail)
// SOT-KEYWORDS: adaptive navigation material rail bottom bar posture tabletop extra large
import type { WindowSizeClass } from './adaptive-panes/constants.ts';
import type { FoldLayout } from './adaptive-panes/fold-layout.ts';

/** Which navigation chrome a window gets. */
export type AdaptiveNavigationKind =
  | 'header-only'
  | 'bottom-compact'
  | 'bottom-medium'
  | 'rail-collapsed'
  | 'rail-expanded'
  | 'apple-hardware-rail'
  | 'apple-sidebar';

/** A full-height system-reserved column on a PHYSICAL edge (Apple). */
export interface HardwareEdgeColumn {
  edge: 'left' | 'right';
  width: number;
}

/**
 * The resolved placement, returned by
 * {@linkcode resolveAdaptiveNavigationPlacement}.
 */
export interface AdaptiveNavigationPlacement {
  kind: AdaptiveNavigationKind;
  /** Where the navigation sits. Rails use the physical right edge, including RTL. */
  position: 'top' | 'bottom' | 'left' | 'right';
  /** True for any side placement (rail, sidebar, hardware column). */
  rail: boolean;
  /** True when the rail should show labels beside icons (extra-large). */
  expanded: boolean;
  /** Physical column width when Apple has reserved an outer-edge control column. */
  hardwareWidth: number;
}

/** Input to {@linkcode resolveAdaptiveNavigationPlacement}. */
export interface ResolveAdaptiveNavigationPlacementInput {
  platform: 'android' | 'ios' | 'other';
  sizeClass: WindowSizeClass;
  /** Current window height in dp/points. Android compact height is <480dp. */
  heightDp: number;
  folds: readonly FoldLayout[];
  hardwareEdge?: HardwareEdgeColumn | null;
  isRTL: boolean;
  /** Stable capabilities; folding/resizing must not turn these off. */
  isFoldable?: boolean;
  isTablet?: boolean;
  isHeadset?: boolean;
}

/**
 * Navigation follows device family, not fold posture or current window width.
 * Foldables (including closed covers), tablets and headsets keep a physical
 * right rail. Ordinary phones keep bottom tabs, even in landscape. Web uses
 * header links/menu and adds bottom tabs only at phone widths. Web never gets a rail.
 */
export function resolveAdaptiveNavigationPlacement({
  platform, sizeClass, folds, hardwareEdge, isFoldable, isTablet, isHeadset,
}: ResolveAdaptiveNavigationPlacementInput): AdaptiveNavigationPlacement {
  if (platform === 'other') {
    const compact = sizeClass === 'compact';
    return { kind: compact ? 'bottom-compact' : 'header-only', position: compact ? 'bottom' : 'top', rail: false, expanded: false, hardwareWidth: 0 };
  }
  const foldable = isFoldable || folds.length > 0 || Boolean(hardwareEdge?.width);
  const hardwareWidth = platform === 'ios' && hardwareEdge?.edge === 'right'
    ? hardwareEdge.width : 0;
  const identifiedNativePhone = isTablet === false && !foldable && !isHeadset;
  const rail = !identifiedNativePhone && (
    foldable || isTablet || isHeadset || sizeClass !== 'compact'
  );
  const expanded = rail && !hardwareWidth && sizeClass === 'extraLarge';
  return {
    kind: !rail ? 'bottom-compact' : hardwareWidth ? 'apple-hardware-rail'
      : expanded ? 'rail-expanded' : 'rail-collapsed',
    position: rail ? 'right' : 'bottom',
    rail,
    expanded,
    hardwareWidth,
  };
}
