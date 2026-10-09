import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BAND, PERIOD_MS, SESSION_MS, initialPulseState, reducePulse, type PulseState } from './pulse-catch.ts';

const run = (state: PulseState, ms: number) => {
  let s = state;
  for (let t = 0; t < ms; t += 50) s = reducePulse(s, { type: 'tick', dtMs: 50 });
  return s;
};
const inBandMs = PERIOD_MS * ((BAND.from + BAND.to) / 2);

test('a catch inside the band scores once per pulse', () => {
  let s = run(reducePulse(initialPulseState, { type: 'start' }), inBandMs);
  s = reducePulse(s, { type: 'catch' });
  s = reducePulse(s, { type: 'catch' });
  assert.equal(s.score, 1);
  assert.equal(s.misses, 0);
});

test('a catch outside the band is a miss and spends the pulse', () => {
  let s = run(reducePulse(initialPulseState, { type: 'start' }), 100);
  s = reducePulse(s, { type: 'catch' });
  s = run(s, inBandMs - 100);
  s = reducePulse(s, { type: 'catch' });
  assert.deepEqual([s.score, s.misses], [0, 1]);
});

test('pause freezes the clock and blocks catches', () => {
  let s = reducePulse(run(reducePulse(initialPulseState, { type: 'start' }), inBandMs), { type: 'pause' });
  const frozen = run(s, 5_000);
  assert.equal(frozen.elapsedMs, s.elapsedMs);
  assert.equal(reducePulse(frozen, { type: 'catch' }).score, 0);
  s = reducePulse(reducePulse(frozen, { type: 'resume' }), { type: 'catch' });
  assert.equal(s.score, 1);
});

test('the session ends at SESSION_MS even when a frame overshoots it', () => {
  const s = reducePulse(reducePulse(initialPulseState, { type: 'start' }), { type: 'tick', dtMs: 60_000 });
  assert.equal(s.elapsedMs, SESSION_MS);
  assert.equal(s.status, 'over');
  assert.equal(reducePulse(s, { type: 'catch' }), s);
});

test('slow frames count their full elapsed time instead of stretching the session', () => {
  let s = reducePulse(initialPulseState, { type: 'start' });
  for (let i = 0; i < SESSION_MS / 200; i++) s = reducePulse(s, { type: 'tick', dtMs: 200 });
  assert.equal(s.status, 'over');
});
