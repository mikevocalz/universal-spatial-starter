import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveAdaptiveNavigationPlacement, type ResolveAdaptiveNavigationPlacementInput } from './adaptive-navigation.ts';

const base: ResolveAdaptiveNavigationPlacementInput = {
  platform: 'android', sizeClass: 'compact', heightDp: 800, folds: [], isRTL: false,
};
const resolve = (patch: Partial<ResolveAdaptiveNavigationPlacementInput>) =>
  resolveAdaptiveNavigationPlacement({ ...base, ...patch });

test('ordinary native phones keep bottom tabs in portrait and wide landscape', () => {
  for (const platform of ['ios', 'android'] as const) {
    for (const sizeClass of ['compact', 'medium', 'expanded', 'large'] as const) {
      assert.equal(resolve({ platform, sizeClass, isTablet: false, heightDp: 420 }).position, 'bottom');
    }
  }
});

test('folded, unfolded and tabletop foldables retain a physical right rail including RTL', () => {
  for (const platform of ['ios', 'android'] as const) {
    for (const sizeClass of ['compact', 'medium', 'expanded', 'large'] as const) {
      for (const isRTL of [false, true]) {
        assert.equal(resolve({ platform, sizeClass, isFoldable: true, isTablet: false, isRTL, heightDp: 420 }).position, 'right');
      }
    }
  }
  assert.equal(resolve({ folds: [{ orientation: 'horizontal', state: 'halfOpened', posture: 'tabletop', separating: true, x: 0, y: 400, width: 900, height: 0 }] }).position, 'right');
});

test('tablets and headsets retain rails in narrow windows', () => {
  assert.equal(resolve({ isTablet: true }).position, 'right');
  assert.equal(resolve({ isHeadset: true }).position, 'right');
});

test('Duo hardware column width is consumed on the right once', () => {
  const result = resolve({ platform: 'ios', hardwareEdge: { edge: 'right', width: 84 }, isRTL: true });
  assert.equal(result.kind, 'apple-hardware-rail');
  assert.equal(result.hardwareWidth, 84);
  assert.equal(result.expanded, false);
  const leftColumn = resolve({ platform: 'ios', hardwareEdge: { edge: 'left', width: 84 } });
  assert.equal(leftColumn.position, 'right');
  assert.equal(leftColumn.hardwareWidth, 0);
});

test('web never gets a rail: header navigation wide, header plus tabs at phone widths', () => {
  for (const isFoldable of [false, true]) {
    for (const sizeClass of ['compact', 'medium', 'expanded', 'large', 'extraLarge'] as const) {
      const result = resolve({ platform: 'other', sizeClass, isFoldable });
      assert.equal(result.rail, false);
      assert.equal(result.position, sizeClass === 'compact' ? 'bottom' : 'top');
      assert.equal(result.kind, sizeClass === 'compact' ? 'bottom-compact' : 'header-only');
    }
  }
});
