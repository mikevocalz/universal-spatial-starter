import type { RiveArtboardKey } from './contract';

/**
 * Web: same-origin URLs. tooling/build-rive.mjs copies each built .riv into
 * apps/web/public/rive/, which Next serves at /rive/<file>.riv.
 */
export const riveFiles = {
  signalStudio: '/rive/signal-studio.riv',
  pulseCatch: '/rive/pulse-catch.riv',
  gameHud: '/rive/game-hud.riv',
  gameControls: '/rive/game-controls.riv',
} as const satisfies Record<RiveArtboardKey, string>;
