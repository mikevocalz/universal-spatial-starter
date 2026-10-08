import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  KEYBOARD_CLASS_INDEX,
  KEYBOARD_LABEL,
  MIN_KEYBOARD_SCORE,
  boundsInView,
  boxCorners,
  mapCoverBox,
  pickKeyboard,
  uprightToFrameNormalized,
  type FrameOrientation,
} from './detection.ts';

const outputs = (dets: { cls: number; score: number; box: [number, number, number, number] }[], max = 25) => {
  const boxes = new Float32Array(max * 4);
  const classes = new Float32Array(max);
  const scores = new Float32Array(max);
  dets.forEach((d, i) => {
    boxes.set(d.box, i * 4);
    classes[i] = d.cls;
    scores[i] = d.score;
  });
  return [boxes, classes, scores, new Float32Array([dets.length])] as const;
};

test('label map line for the keyboard class index is "keyboard"', () => {
  const labels = readFileSync(new URL('./assets/labelmap.txt', import.meta.url), 'utf8').split('\n');
  assert.equal(labels[KEYBOARD_CLASS_INDEX]?.trim(), KEYBOARD_LABEL);
});

test('pickKeyboard returns the best keyboard above threshold, ignoring other classes', () => {
  const pick = pickKeyboard(
    ...outputs([
      { cls: 72, score: 0.99, box: [0, 0, 1, 1] }, // laptop
      { cls: KEYBOARD_CLASS_INDEX, score: 0.61, box: [0.1, 0.2, 0.3, 0.4] },
      { cls: KEYBOARD_CLASS_INDEX, score: 0.77, box: [0.5, 0.25, 0.75, 0.9] },
    ]),
  );
  assert.ok(pick);
  assert.ok(Math.abs(pick.score - 0.77) < 1e-6);
  assert.deepEqual([pick.yMin, pick.xMin, pick.yMax, pick.xMax], [0.5, 0.25, 0.75, 0.8999999761581421]);
});

test('pickKeyboard returns undefined below threshold, past count, or for degenerate boxes', () => {
  assert.equal(pickKeyboard(...outputs([{ cls: KEYBOARD_CLASS_INDEX, score: MIN_KEYBOARD_SCORE - 0.01, box: [0, 0, 1, 1] }])), undefined);
  const [b, c, s] = outputs([{ cls: KEYBOARD_CLASS_INDEX, score: 0.9, box: [0, 0, 1, 1] }]);
  assert.equal(pickKeyboard(b, c, s, new Float32Array([0])), undefined, 'entries beyond count are padding');
  assert.equal(pickKeyboard(...outputs([{ cls: KEYBOARD_CLASS_INDEX, score: 0.9, box: [0.5, 0.5, 0.5, 0.9] }])), undefined);
});

test('pickKeyboard clamps boxes into 0..1', () => {
  const pick = pickKeyboard(...outputs([{ cls: KEYBOARD_CLASS_INDEX, score: 0.9, box: [-0.1, -0.2, 1.2, 1.5] }]));
  assert.deepEqual(pick && [pick.yMin, pick.xMin, pick.yMax, pick.xMax], [0, 0, 1, 1]);
});

// Forward mapping as the Resizer shader defines it, inverted here by hand:
// a raw-buffer point (x, y) shows up at upright (u, v).
const forward = (x: number, y: number, o: FrameOrientation, mirrored: boolean) => {
  const mx = mirrored ? 1 - x : x;
  if (o === 'up') return { u: mx, v: y };
  if (o === 'right') return { u: 1 - y, v: mx }; // inverse 270: x=v, y=1-u
  if (o === 'down') return { u: 1 - mx, v: 1 - y };
  return { u: y, v: 1 - mx }; // left -> inverse 90: x=1-v, y=u
};

test('uprightToFrameNormalized inverts the Resizer mapping for every orientation and mirroring', () => {
  const samples = [
    [0.1, 0.2],
    [0.9, 0.3],
    [0.5, 0.5],
    [0, 1],
  ];
  for (const o of ['up', 'right', 'down', 'left'] as const) {
    for (const mirrored of [false, true]) {
      for (const [x, y] of samples) {
        const { u, v } = forward(x!, y!, o, mirrored);
        const back = uprightToFrameNormalized(u, v, o, mirrored);
        assert.ok(Math.abs(back.x - x!) < 1e-9 && Math.abs(back.y - y!) < 1e-9, `${o} mirrored=${mirrored} (${x},${y})`);
      }
    }
  }
});

test('a portrait phone frame (orientation right) maps the upright top-left to the buffer bottom-left', () => {
  // inverse rotation 270: (u, v) -> (v, 1 - u)
  assert.deepEqual(uprightToFrameNormalized(0, 0, 'right', false), { x: 0, y: 1 });
});

test('boxCorners lists four corners clockwise from top-left', () => {
  assert.deepEqual(boxCorners({ score: 1, xMin: 0.1, yMin: 0.2, xMax: 0.3, yMax: 0.4 }), [
    { u: 0.1, v: 0.2 },
    { u: 0.3, v: 0.2 },
    { u: 0.3, v: 0.4 },
    { u: 0.1, v: 0.4 },
  ]);
});

test('boundsInView clips to the view and rejects boxes fully outside', () => {
  assert.deepEqual(boundsInView([{ x: -10, y: 5 }, { x: 50, y: 500 }], 100, 200), { x: 0, y: 5, width: 50, height: 195 });
  assert.equal(boundsInView([{ x: 150, y: 10 }, { x: 180, y: 20 }], 100, 200), undefined);
  assert.equal(boundsInView([], 100, 100), undefined);
});

test('mapCoverBox matches object-fit: cover (scale to fill, centered crop)', () => {
  // 1280x720 video in a 390x844 portrait view: scale = 844/720, crop sides.
  const scale = 844 / 720;
  const offsetX = (390 - 1280 * scale) / 2;
  const box = mapCoverBox({ x: 600, y: 200, width: 100, height: 100 }, { width: 1280, height: 720 }, { width: 390, height: 844 });
  assert.ok(box);
  assert.ok(Math.abs(box.x - (600 * scale + offsetX)) < 1e-9);
  assert.ok(Math.abs(box.y - 200 * scale) < 1e-9);
  assert.ok(Math.abs(box.width - 100 * scale) < 1e-9);
  // Same aspect: identity scale.
  assert.deepEqual(mapCoverBox({ x: 10, y: 20, width: 30, height: 40 }, { width: 640, height: 480 }, { width: 640, height: 480 }), {
    x: 10,
    y: 20,
    width: 30,
    height: 40,
  });
  // Box entirely in the cropped margin.
  assert.equal(mapCoverBox({ x: 0, y: 0, width: 50, height: 50 }, { width: 1280, height: 720 }, { width: 390, height: 844 }), undefined);
});
