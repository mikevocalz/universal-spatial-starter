import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { describeLabState, formatConfidence } from './copy.ts';
import type { LabState } from './lab-machine.ts';

const NATIVE_MODEL_SHA256 = '2e04c53bfeac0ac2a30c057c7e2a777594ce39baaac35a92f74fb1e8c4fc4e0b';

test('bundled model bytes match the checksum recorded in assets/MODEL.md', () => {
  const bytes = readFileSync(new URL('./assets/efficientdet_lite0.bin', import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), NATIVE_MODEL_SHA256);
  const doc = readFileSync(new URL('./assets/MODEL.md', import.meta.url), 'utf8');
  assert.ok(doc.includes(NATIVE_MODEL_SHA256));
});

test('every state except closed has copy; copy is sentence case with no apologies', () => {
  const states: LabState[] = [
    { status: 'requesting-permission' },
    { status: 'permission-denied', canAskAgain: true },
    { status: 'permission-denied', canAskAgain: false },
    { status: 'camera-unavailable', reason: 'no-camera' },
    { status: 'camera-unavailable', reason: 'in-use' },
    { status: 'camera-unavailable', reason: 'error', detail: 'Camera 0 failed' },
    { status: 'model-loading' },
    { status: 'model-failed', detail: 'Could not read model' },
    { status: 'scanning' },
    { status: 'keyboard-found', detection: { confidence: 0.874, box: { x: 0, y: 0, width: 1, height: 1 } }, misses: 0 },
  ];
  assert.equal(describeLabState({ status: 'closed' }), undefined);
  for (const state of states) {
    const copy = describeLabState(state);
    assert.ok(copy, state.status);
    for (const text of [copy.title, copy.action?.label ?? '']) {
      // Sentence case: no capitalized word after the first, except proper nouns.
      const words = text.split(' ').slice(1).filter((w) => !/^(PICO|Meta|Horizon|OS|Vision|Pro|Settings|Camera|Lab)$/.test(w));
      assert.ok(words.every((w) => w === '' || w[0] === w[0]!.toLowerCase()), `"${text}"`);
    }
    assert.doesNotMatch(`${copy.title} ${copy.body}`, /sorry|apolog|oops|unfortunately/i);
  }
  assert.equal(describeLabState({ status: 'permission-denied', canAskAgain: false })?.action?.kind, 'open-settings');
  assert.equal(describeLabState(states.at(-1)!)?.body, '87% confidence');
});

test('formatConfidence clamps and rounds', () => {
  assert.equal(formatConfidence(0.874), '87%');
  assert.equal(formatConfidence(1.4), '100%');
  assert.equal(formatConfidence(-1), '0%');
});
