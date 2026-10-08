import { copyFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Copies the Rive WebGL2 runtime wasm into apps/web/public/rive so the web
 * build never fetches it from a CDN. RivePanel.web.tsx points the runtime at
 * /rive/rive.wasm. The file is generated, so it is gitignored.
 */
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const spatialRequire = createRequire(join(root, 'packages/spatial/package.json'));
const webgl2Require = createRequire(spatialRequire.resolve('@rive-app/react-webgl2'));

let wasm;
try {
  wasm = join(dirname(webgl2Require.resolve('@rive-app/webgl2/package.json')), 'rive.wasm');
} catch {
  process.exit(0);
}
const out = join(root, 'apps/web/public/rive');
await mkdir(out, { recursive: true });
await copyFile(wasm, join(out, 'rive.wasm'));
