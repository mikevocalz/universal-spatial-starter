import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';
import { describeLabState, formatConfidence } from './copy.ts';
import type { LabState } from './lab-machine.ts';
import { classifyNativeHost } from './sensing-host.ts';
import { MEDIAPIPE_TASKS_VISION_VERSION, MEDIAPIPE_WASM_BASE_URL, WEB_MODEL_URL } from './web-config.ts';

const NATIVE_MODEL_SHA256 = '2e04c53bfeac0ac2a30c057c7e2a777594ce39baaac35a92f74fb1e8c4fc4e0b';

test('bundled model bytes match the checksum recorded in assets/MODEL.md', () => {
  const bytes = readFileSync(new URL('./assets/efficientdet_lite0.bin', import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), NATIVE_MODEL_SHA256);
  const doc = readFileSync(new URL('./assets/MODEL.md', import.meta.url), 'utf8');
  assert.ok(doc.includes(NATIVE_MODEL_SHA256));
});

test('web wasm URL is pinned to the installed @mediapipe/tasks-vision version', () => {
  // The package's exports map hides package.json; read it next to the resolved entry.
  const entry = createRequire(import.meta.url).resolve('@mediapipe/tasks-vision');
  const installed = (JSON.parse(readFileSync(new URL('./package.json', pathToFileURL(entry)), 'utf8')) as { version: string }).version;
  assert.equal(MEDIAPIPE_TASKS_VISION_VERSION, installed);
  assert.ok(MEDIAPIPE_WASM_BASE_URL.includes(`@${installed}/`));
  assert.match(WEB_MODEL_URL, /\/efficientdet_lite0\/int8\/1\/efficientdet_lite0\.tflite$/);
});

test('host classifier: Quest, PICO, Vision Pro and phones', () => {
  const android = (manufacturer: string, brand: string, model: string) =>
    classifyNativeHost({ os: 'android', isVision: false, android: { manufacturer, brand, model } });
  assert.equal(android('Oculus', 'oculus', 'Quest 3'), 'meta-horizon');
  assert.equal(android('Meta', 'meta', 'Unknown'), 'meta-horizon');
  assert.equal(android('PICO', 'pico', 'A9210'), 'pico');
  assert.equal(android('Google', 'google', 'Pixel 9'), 'phone');
  assert.equal(android('samsung', 'samsung', 'SM-S928B'), 'phone');
  assert.equal(classifyNativeHost({ os: 'ios', isVision: true }), 'visionos');
  assert.equal(classifyNativeHost({ os: 'ios', isVision: false }), 'phone');
});

test('every state except closed has copy; copy is sentence case with no apologies', () => {
  const states: LabState[] = [
    { status: 'sensing-unavailable', host: 'meta-horizon' },
    { status: 'sensing-unavailable', host: 'pico' },
    { status: 'sensing-unavailable', host: 'visionos' },
    { status: 'requesting-permission' },
    { status: 'permission-denied', canAskAgain: true },
    { status: 'permission-denied', canAskAgain: false },
    { status: 'camera-unavailable', reason: 'no-camera' },
    { status: 'camera-unavailable', reason: 'in-use' },
    { status: 'camera-unavailable', reason: 'insecure-context' },
    { status: 'camera-unavailable', reason: 'unsupported-browser' },
    { status: 'camera-unavailable', reason: 'error', detail: 'Camera 0 failed' },
    { status: 'model-loading' },
    { status: 'model-failed', detail: 'Could not read model' },
    { status: 'scanning' },
    { status: 'keyboard-found', detection: { confidence: 0.874, box: { x: 0, y: 0, width: 1, height: 1 } }, misses: 0 },
  ];
  assert.equal(describeLabState({ status: 'closed' }, 'native'), undefined);
  for (const surface of ['native', 'web'] as const) {
    for (const state of states) {
      const copy = describeLabState(state, surface);
      assert.ok(copy, state.status);
      for (const text of [copy.title, copy.action?.label ?? '']) {
        // Sentence case: no capitalized word after the first, except proper nouns.
        const words = text.split(' ').slice(1).filter((w) => !/^(PICO|Meta|Horizon|OS|Vision|Pro|Settings|Camera|Lab)$/.test(w));
        assert.ok(words.every((w) => w === '' || w[0] === w[0]!.toLowerCase()), `"${text}"`);
      }
      assert.doesNotMatch(`${copy.title} ${copy.body}`, /sorry|apolog|oops|unfortunately/i);
    }
  }
  assert.equal(describeLabState({ status: 'permission-denied', canAskAgain: false }, 'native')?.action?.kind, 'open-settings');
  assert.equal(describeLabState({ status: 'permission-denied', canAskAgain: false }, 'web')?.action?.kind, 'retry');
  assert.equal(describeLabState(states.at(-1)!, 'web')?.body, '87% confidence');
});

test('formatConfidence clamps and rounds', () => {
  assert.equal(formatConfidence(0.874), '87%');
  assert.equal(formatConfidence(1.4), '100%');
  assert.equal(formatConfidence(-1), '0%');
});
