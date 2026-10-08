import { create } from 'zustand';
import { initialPulseState, reducePulse, type PulseAction, type PulseState } from './game/pulse-catch';

/** /native: StandardWorkspace selection, search and inspector. */
export const useWorkspaceStore = create<{
  query: string;
  selectedId: string | null;
  inspectorOpen: boolean;
  setQuery: (query: string) => void;
  select: (id: string | null) => void;
  toggleInspector: () => void;
}>((set) => ({
  query: '',
  selectedId: null,
  inspectorOpen: false,
  setQuery: (query) => set({ query }),
  select: (selectedId) => set({ selectedId }),
  toggleInspector: () => set((s) => ({ inspectorOpen: !s.inspectorOpen })),
}));

export type SignalMode = 'calm' | 'pulse' | 'burst';

/** /hybrid: the values the native controls bind into the Rive View Model. */
export const useSignalStore = create<{
  mode: SignalMode;
  intensity: number;
  playing: boolean;
  setMode: (mode: SignalMode) => void;
  setIntensity: (intensity: number) => void;
  setPlaying: (playing: boolean) => void;
}>((set) => ({
  mode: 'pulse',
  intensity: 60,
  playing: true,
  setMode: (mode) => set({ mode }),
  setIntensity: (intensity) => set({ intensity }),
  setPlaying: (playing) => set({ playing }),
}));

/** /game: Pulse Catch. The reducer in game/pulse-catch.ts is the only rule authority. */
export const usePulseStore = create<{ game: PulseState; dispatch: (action: PulseAction) => void }>((set) => ({
  game: initialPulseState,
  dispatch: (action) => set((s) => ({ game: reducePulse(s.game, action) })),
}));

/** /immersive: whether the Orbit Lab stage is mounted. Closed on first render, so SSR never touches the renderer. */
export const useOrbitStore = create<{ open: boolean; setOpen: (open: boolean) => void }>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
