import { create } from 'zustand';
import { initialLabSnapshot, reduceLab, type LabEvent, type LabSnapshot } from './lab-machine';

/**
 * Camera Lab's single source of truth. Holds the state-machine snapshot only;
 * frames, streams and model handles never enter the store.
 */
export const useCameraLabStore = create<LabSnapshot & { dispatch: (event: LabEvent) => void }>((set) => ({
  ...initialLabSnapshot,
  dispatch: (event) => set((s) => reduceLab({ state: s.state, attempt: s.attempt }, event)),
}));

/** Dispatch outside React (platform sessions, native callbacks). */
export function dispatchLab(event: LabEvent): void {
  useCameraLabStore.getState().dispatch(event);
}
