import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BAND, PERIOD_MS } from './game/pulse-catch.ts';
import { useGameModeStore, usePulseStore } from './state.ts';

const tick = (ms: number) => {
  for (let t = 0; t < ms; t += 50) usePulseStore.getState().dispatch({ type: 'tick', dtMs: 50 });
};

test('switching Mixed and Full Rive leaves the running game untouched', () => {
  const { dispatch } = usePulseStore.getState();
  dispatch({ type: 'start' });
  tick(PERIOD_MS * ((BAND.from + BAND.to) / 2));
  dispatch({ type: 'catch' });
  const before = usePulseStore.getState().game;
  assert.equal(before.score, 1);

  useGameModeStore.getState().setUi('rive');
  assert.equal(usePulseStore.getState().game, before);
  useGameModeStore.getState().setUi('mixed');
  assert.equal(usePulseStore.getState().game, before);

  // A second catch on the same pulse after the round trip still does not score.
  dispatch({ type: 'catch' });
  assert.equal(usePulseStore.getState().game.score, 1);
  assert.equal(usePulseStore.getState().game.elapsedMs, before.elapsedMs);
});
