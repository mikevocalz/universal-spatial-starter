/**
 * The names app code binds to in each authored `.riv`: artboard, state machine,
 * view model and every view model property with its kind.
 *
 * Screens read names from here instead of repeating strings, and
 * `tooling/verify-rive-assets.mjs` fails when a built file stops matching it.
 * Sources live in `packages/assets/rive-src/<file name>/`.
 */
export const riveContract = {
  signalStudio: {
    file: 'signal-studio',
    artboard: 'SignalStudio',
    stateMachine: 'Signal',
    viewModel: 'SignalStudio',
    properties: { mode: 'enum', intensity: 'number', playing: 'boolean' },
    enums: { mode: ['calm', 'pulse', 'burst'] },
  },
  pulseCatch: {
    file: 'pulse-catch',
    artboard: 'PulseCatch',
    stateMachine: 'Pulse',
    viewModel: 'PulseCatch',
    properties: { phase: 'number', bandFrom: 'number', bandTo: 'number', status: 'enum', score: 'number' },
    enums: { status: ['ready', 'running', 'paused', 'over'] },
  },
  gameHud: {
    file: 'game-hud',
    artboard: 'GameHud',
    stateMachine: 'Hud',
    viewModel: 'GameHud',
    properties: { score: 'number', misses: 'number', secondsLeft: 'number' },
    enums: {},
  },
  gameControls: {
    file: 'game-controls',
    artboard: 'GameControls',
    stateMachine: 'Controls',
    viewModel: 'GameControls',
    properties: { status: 'enum', press: 'trigger' },
    enums: { status: ['ready', 'running', 'paused', 'over'] },
  },
} as const satisfies Record<string, RiveArtboardContract>;

/** One authored artboard and the view model surface the app binds to. */
export interface RiveArtboardContract {
  /** Base name of the built file, without `.riv`. */
  readonly file: string;
  readonly artboard: string;
  readonly stateMachine: string;
  readonly viewModel: string;
  /** View model property name to its kind, as the runtime reports it. */
  readonly properties: Readonly<Record<string, 'number' | 'boolean' | 'enum' | 'string' | 'trigger'>>;
  /** Allowed keys for each enum property, in authored order. */
  readonly enums: Readonly<Record<string, readonly string[]>>;
}

/** Key of {@linkcode riveContract}: one per authored artboard. */
export type RiveArtboardKey = keyof typeof riveContract;
