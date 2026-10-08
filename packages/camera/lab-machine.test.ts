import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  LOST_AFTER_MISSES,
  initialLabSnapshot,
  needsSession,
  reduceLab,
  type KeyboardDetection,
  type LabEvent,
  type LabSnapshot,
} from './lab-machine.ts';

const run = (events: LabEvent[], from: LabSnapshot = initialLabSnapshot) => events.reduce(reduceLab, from);
const found: KeyboardDetection = { confidence: 0.82, box: { x: 10, y: 20, width: 100, height: 40 } };
const toScanning: LabEvent[] = [{ type: 'open', host: 'phone' }, { type: 'permission-granted' }, { type: 'model-ready' }];

test('phone and web open into the permission request and count the attempt', () => {
  for (const host of ['phone', 'web'] as const) {
    const s = run([{ type: 'open', host }]);
    assert.deepEqual(s.state, { status: 'requesting-permission' });
    assert.equal(s.attempt, 1);
    assert.equal(needsSession(s.state), true);
  }
});

test('headsets open into sensing-unavailable and never start a session', () => {
  for (const host of ['meta-horizon', 'pico', 'visionos'] as const) {
    const s = run([{ type: 'open', host }, { type: 'permission-granted' }, { type: 'model-ready' }]);
    assert.deepEqual(s.state, { status: 'sensing-unavailable', host });
    assert.equal(needsSession(s.state), false);
  }
});

test('happy path: permission -> model loading -> scanning -> keyboard found', () => {
  const s = run([...toScanning, { type: 'inference', detection: found }]);
  assert.deepEqual(s.state, { status: 'keyboard-found', detection: found, misses: 0 });
});

test('detections are ignored until the model is ready', () => {
  const s = run([{ type: 'open', host: 'phone' }, { type: 'permission-granted' }, { type: 'inference', detection: found }]);
  assert.equal(s.state.status, 'model-loading');
});

test(`a found keyboard drops back to scanning after ${LOST_AFTER_MISSES} empty inferences`, () => {
  let s = run([...toScanning, { type: 'inference', detection: found }]);
  for (let i = 1; i < LOST_AFTER_MISSES; i++) {
    s = reduceLab(s, { type: 'inference', detection: null });
    assert.equal(s.state.status, 'keyboard-found');
  }
  s = reduceLab(s, { type: 'inference', detection: null });
  assert.deepEqual(s.state, { status: 'scanning' });
});

test('a new detection resets the miss counter', () => {
  const s = run([...toScanning, { type: 'inference', detection: found }, { type: 'inference', detection: null }, { type: 'inference', detection: found }]);
  assert.equal(s.state.status === 'keyboard-found' && s.state.misses, 0);
});

test('permission denied, then retry starts a fresh attempt', () => {
  const denied = run([{ type: 'open', host: 'phone' }, { type: 'permission-denied', canAskAgain: false }]);
  assert.deepEqual(denied.state, { status: 'permission-denied', canAskAgain: false });
  assert.equal(needsSession(denied.state), true, 'session stays mounted to notice access granted in Settings');
  const retried = reduceLab(denied, { type: 'retry' });
  assert.deepEqual(retried.state, { status: 'requesting-permission' });
  assert.equal(retried.attempt, denied.attempt + 1);
});

test('access granted in Settings moves straight to model loading', () => {
  const s = run([{ type: 'open', host: 'phone' }, { type: 'permission-denied', canAskAgain: false }, { type: 'permission-granted' }]);
  assert.equal(s.state.status, 'model-loading');
});

test('camera unavailable and model failed end the session and allow retry', () => {
  const cam = run([{ type: 'open', host: 'web' }, { type: 'camera-unavailable', reason: 'in-use' }]);
  assert.deepEqual(cam.state, { status: 'camera-unavailable', reason: 'in-use', detail: undefined });
  assert.equal(needsSession(cam.state), false);
  assert.equal(reduceLab(cam, { type: 'retry' }).state.status, 'requesting-permission');

  const model = run([...toScanning, { type: 'model-failed', detail: 'boom' }]);
  assert.deepEqual(model.state, { status: 'model-failed', detail: 'boom' });
  assert.equal(needsSession(model.state), false);
});

test('close from any state returns to closed; late events are ignored', () => {
  const s = run([...toScanning, { type: 'inference', detection: found }, { type: 'close' }]);
  assert.deepEqual(s.state, { status: 'closed' });
  for (const late of [
    { type: 'inference', detection: found },
    { type: 'model-ready' },
    { type: 'permission-granted' },
    { type: 'camera-unavailable', reason: 'error' },
    { type: 'retry' },
  ] as LabEvent[]) {
    assert.deepEqual(reduceLab(s, late).state, { status: 'closed' });
  }
});

test('open while already open is a no-op (no double session)', () => {
  const once = run([{ type: 'open', host: 'phone' }]);
  assert.equal(reduceLab(once, { type: 'open', host: 'phone' }), once);
});

test('retry is ignored where it has no meaning', () => {
  const scanning = run(toScanning);
  assert.equal(reduceLab(scanning, { type: 'retry' }), scanning);
});
