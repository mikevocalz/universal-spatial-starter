/**
 * Pulse Catch: a ring swells from the centre once per PERIOD_MS. Catch it while
 * it crosses the target band to score. One catch per pulse; a catch outside the
 * band is a miss. A session lasts SESSION_MS of running time.
 *
 * Pure and deterministic: the pulse phase is derived from elapsed time, so the
 * same inputs always give the same score. No React, no platform APIs.
 */

export const SESSION_MS = 30_000;
export const PERIOD_MS = 1_600;
/** Band of the pulse phase (0 = centre, 1 = edge) that counts as a catch. */
export const BAND = { from: 0.68, to: 0.86 } as const;

export type PulseStatus = 'ready' | 'running' | 'paused' | 'over';

export interface PulseState {
  readonly status: PulseStatus;
  readonly elapsedMs: number;
  readonly score: number;
  readonly misses: number;
  /** Pulse index that already scored, so one pulse can't score twice. */
  readonly caughtPulse: number;
}

export type PulseAction =
  | { readonly type: 'start' }
  | { readonly type: 'pause' }
  | { readonly type: 'resume' }
  | { readonly type: 'tick'; readonly dtMs: number }
  | { readonly type: 'catch' };

export const initialPulseState: PulseState = { status: 'ready', elapsedMs: 0, score: 0, misses: 0, caughtPulse: -1 };

export function pulsePhase(elapsedMs: number): number {
  return (elapsedMs % PERIOD_MS) / PERIOD_MS;
}

export function remainingMs(state: PulseState): number {
  return Math.max(0, SESSION_MS - state.elapsedMs);
}

export function reducePulse(state: PulseState, action: PulseAction): PulseState {
  switch (action.type) {
    case 'start':
      return { ...initialPulseState, status: 'running' };
    case 'pause':
      return state.status === 'running' ? { ...state, status: 'paused' } : state;
    case 'resume':
      return state.status === 'paused' ? { ...state, status: 'running' } : state;
    case 'tick': {
      if (state.status !== 'running') return state;
      // Count the full active interval — clamping dtMs would stretch the
      // session at low frame rates. Background gaps are the caller's job:
      // it dispatches 'pause' from the AppState/visibility listener.
      const elapsedMs = Math.min(SESSION_MS, state.elapsedMs + Math.max(action.dtMs, 0));
      return { ...state, elapsedMs, status: elapsedMs >= SESSION_MS ? 'over' : 'running' };
    }
    case 'catch': {
      if (state.status !== 'running') return state;
      const pulse = Math.floor(state.elapsedMs / PERIOD_MS);
      if (pulse === state.caughtPulse) return state;
      const phase = pulsePhase(state.elapsedMs);
      return phase >= BAND.from && phase <= BAND.to
        ? { ...state, score: state.score + 1, caughtPulse: pulse }
        : { ...state, misses: state.misses + 1, caughtPulse: pulse };
    }
  }
}
