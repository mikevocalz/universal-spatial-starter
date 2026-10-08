import type { RiveArtboardKey } from './contract';

declare const require: (path: string) => number;

/** Native: Metro asset numbers (`riv` is in apps/mobile/metro.config.js assetExts). */
export const riveFiles = {
  signalStudio: require('./signal-studio.riv'),
  pulseCatch: require('./pulse-catch.riv'),
  gameHud: require('./game-hud.riv'),
  gameControls: require('./game-controls.riv'),
} as const satisfies Record<RiveArtboardKey, number>;
