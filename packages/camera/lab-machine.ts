/**
 * Camera Lab state machine. Pure: no React, no platform imports, so node:test
 * runs it directly and both platform sessions drive the same transitions.
 */

/** Why no camera stream could be opened. */
export type CameraUnavailableReason =
  | 'no-camera'
  | 'in-use'
  | 'error';

/**
 * A rectangle in preview-view coordinates (dp on native, CSS px on web),
 * origin at the preview's top-left corner.
 */
export interface ViewRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** One keyboard detection produced by the on-device model for one frame. */
export interface KeyboardDetection {
  /** Model score for the `keyboard` class, 0..1. */
  confidence: number;
  /** Detection box mapped into preview-view coordinates. */
  box: ViewRect;
}

export type LabState =
  | { status: 'closed' }
  | { status: 'requesting-permission' }
  | { status: 'permission-denied'; canAskAgain: boolean }
  | { status: 'camera-unavailable'; reason: CameraUnavailableReason; detail?: string }
  | { status: 'model-loading' }
  | { status: 'model-failed'; detail: string }
  | { status: 'scanning' }
  | { status: 'keyboard-found'; detection: KeyboardDetection; misses: number };

export type LabStatus = LabState['status'];

export type LabEvent =
  | { type: 'open' }
  | { type: 'close' }
  | { type: 'permission-granted' }
  | { type: 'permission-denied'; canAskAgain: boolean }
  | { type: 'camera-unavailable'; reason: CameraUnavailableReason; detail?: string }
  | { type: 'model-ready' }
  | { type: 'model-failed'; detail: string }
  | { type: 'inference'; detection: KeyboardDetection | null }
  | { type: 'retry' };

/**
 * `attempt` increments on every open and retry. Platform sessions key their
 * camera/model lifetime on it, so a retry tears the old session down and
 * starts a fresh one instead of patching a half-failed one.
 */
export interface LabSnapshot {
  state: LabState;
  attempt: number;
}

export const initialLabSnapshot: LabSnapshot = { state: { status: 'closed' }, attempt: 0 };

/**
 * Consecutive empty inferences before a found keyboard drops back to
 * scanning. At the 10 Hz inference cap this holds the last real box for at
 * most ~200 ms, which stops the label flickering on a single missed frame.
 */
export const LOST_AFTER_MISSES = 2;

const SESSION_STATES: ReadonlySet<LabStatus> = new Set<LabStatus>([
  'requesting-permission',
  'permission-denied',
  'camera-unavailable',
  'model-loading',
  'model-failed',
  'scanning',
  'keyboard-found',
]);

export function reduceLab(snapshot: LabSnapshot, event: LabEvent): LabSnapshot {
  const { state, attempt } = snapshot;
  const to = (next: LabState, nextAttempt = attempt): LabSnapshot => ({ state: next, attempt: nextAttempt });

  switch (event.type) {
    case 'open':
      if (state.status !== 'closed') return snapshot;
      return to({ status: 'requesting-permission' }, attempt + 1);

    case 'close':
      return state.status === 'closed' ? snapshot : to({ status: 'closed' });

    case 'permission-granted':
      if (state.status === 'requesting-permission' || state.status === 'permission-denied') {
        return to({ status: 'model-loading' });
      }
      return snapshot;

    case 'permission-denied':
      if (state.status !== 'requesting-permission') return snapshot;
      return to({ status: 'permission-denied', canAskAgain: event.canAskAgain });

    case 'camera-unavailable':
      if (!SESSION_STATES.has(state.status)) return snapshot;
      return to({ status: 'camera-unavailable', reason: event.reason, detail: event.detail });

    case 'model-ready':
      return state.status === 'model-loading' ? to({ status: 'scanning' }) : snapshot;

    case 'model-failed':
      if (state.status === 'model-loading' || state.status === 'scanning' || state.status === 'keyboard-found') {
        return to({ status: 'model-failed', detail: event.detail });
      }
      return snapshot;

    case 'inference': {
      if (state.status !== 'scanning' && state.status !== 'keyboard-found') return snapshot;
      if (event.detection) {
        return to({ status: 'keyboard-found', detection: event.detection, misses: 0 });
      }
      if (state.status === 'scanning') return snapshot;
      const misses = state.misses + 1;
      return misses >= LOST_AFTER_MISSES ? to({ status: 'scanning' }) : to({ ...state, misses });
    }

    case 'retry':
      if (
        state.status === 'permission-denied' ||
        state.status === 'model-failed' ||
        state.status === 'camera-unavailable'
      ) {
        return to({ status: 'requesting-permission' }, attempt + 1);
      }
      return snapshot;
  }
}

/** True while a platform session (camera stream + detector) should exist. */
export function needsSession(state: LabState): boolean {
  return SESSION_STATES.has(state.status) && state.status !== 'camera-unavailable' && state.status !== 'model-failed';
}
