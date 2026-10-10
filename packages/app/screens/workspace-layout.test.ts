import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveWorkspaceLayout } from './workspace-layout.ts';

test('workspace preserves 40/60 columns and a 30% overlay across resized content areas', () => {
  for (const width of [600, 768, 896, 1280]) {
    const layout = resolveWorkspaceLayout(width);
    assert.equal(layout.split, true);
    assert.equal(layout.listWidth + layout.detailWidth, width);
    assert.equal(layout.inspectorWidth / width, 0.3);
    assert.ok(Math.abs(layout.listWidth / width - 0.4) < 1e-9);
  }
});
test('compact covers and phones use one full-width pane', () => {
  for (const width of [0, 320, 390, 599]) assert.equal(resolveWorkspaceLayout(width).split, false);
});
