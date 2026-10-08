import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { riveContract } from '../packages/assets/rive/contract.ts';

/**
 * Checks the committed Rive output against the names app code binds to
 * (packages/assets/rive/contract.ts):
 *   1. every contracted .riv exists in packages/assets/rive/ and apps/web/public/rive/,
 *      starts with the RIVE header, and both copies match the manifest's sha256;
 *   2. the manifest (written by tooling/build-rive.mjs from `rive inspect --json`)
 *      has the artboard, state machine, view model, every property with its kind,
 *      and every enum key the app sets.
 * Runs without the Rive CLI, so CI can run it. When `rive` is on PATH it also
 * re-inspects the sources and fails if the manifest is stale or a source has problems.
 */
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'packages/assets/rive');
const webDir = join(root, 'apps/web/public/rive');
const errors = [];
const fail = (msg) => errors.push(msg);

const manifestPath = join(outDir, 'manifest.json');
if (!existsSync(manifestPath)) {
  console.error('[verify-rive] packages/assets/rive/manifest.json is missing. Run `pnpm rive:build`.');
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

const sha = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');

for (const [key, c] of Object.entries(riveContract)) {
  const entry = manifest.files[c.file];
  if (!entry) {
    fail(`${key}: ${c.file}.riv is not in the manifest. Author packages/assets/rive-src/${c.file}/ and run \`pnpm rive:build\`.`);
    continue;
  }
  for (const [label, path] of [
    ['packages/assets/rive', join(outDir, `${c.file}.riv`)],
    ['apps/web/public/rive', join(webDir, `${c.file}.riv`)],
  ]) {
    if (!existsSync(path)) {
      fail(`${key}: ${label}/${c.file}.riv is missing. Run \`pnpm rive:build\`.`);
      continue;
    }
    if (readFileSync(path).subarray(0, 4).toString('latin1') !== 'RIVE') fail(`${key}: ${label}/${c.file}.riv has no RIVE header.`);
    if (sha(path) !== entry.sha256) fail(`${key}: ${label}/${c.file}.riv does not match the manifest sha256. Run \`pnpm rive:build\` and commit all outputs.`);
  }

  const artboard = entry.artboards.find((a) => a.name === c.artboard);
  if (!artboard) {
    fail(`${key}: artboard "${c.artboard}" not found; the file has ${entry.artboards.map((a) => a.name).join(', ')}.`);
    continue;
  }
  if (!artboard.stateMachines.includes(c.stateMachine))
    fail(`${key}: state machine "${c.stateMachine}" not found on ${c.artboard}; it has ${artboard.stateMachines.join(', ') || 'none'}.`);
  if (artboard.defaultStateMachine !== c.stateMachine)
    fail(`${key}: ${c.artboard} plays "${artboard.defaultStateMachine}" by default, expected "${c.stateMachine}".`);
  if (artboard.viewModel !== c.viewModel) fail(`${key}: ${c.artboard} is bound to view model "${artboard.viewModel}", expected "${c.viewModel}".`);

  const vm = entry.viewModels[c.viewModel];
  if (!vm) {
    fail(`${key}: view model "${c.viewModel}" not found.`);
    continue;
  }
  for (const [prop, kind] of Object.entries(c.properties)) {
    if (!(prop in vm.properties)) fail(`${key}: ${c.viewModel}.${prop} is missing; the view model has ${Object.keys(vm.properties).join(', ')}.`);
    else if (vm.properties[prop] !== kind) fail(`${key}: ${c.viewModel}.${prop} is a ${vm.properties[prop]}, the app binds it as ${kind}.`);
  }
  for (const [prop, keys] of Object.entries(c.enums)) {
    const got = vm.enums[prop] ?? [];
    for (const k of keys) if (!got.includes(k)) fail(`${key}: ${c.viewModel}.${prop} has no enum key "${k}"; it has ${got.join(', ')}.`);
  }
}

let cli = false;
try {
  execFileSync('rive', ['--version'], { stdio: 'ignore' });
  cli = true;
} catch {
  // CI path: no CLI, committed bytes and manifest only.
}
if (cli) {
  const { describeProject } = await import('./build-rive.mjs');
  for (const [name, entry] of Object.entries(manifest.files)) {
    const dir = join(root, 'packages/assets/rive-src', name);
    const tree = JSON.parse(execFileSync('rive', ['inspect', dir, '--json'], { encoding: 'utf8', maxBuffer: 64 << 20 }));
    if (tree.problems.length > 0) fail(`${name}: rive inspect reports ${tree.problems.length} problem(s): ${tree.problems.map((p) => p.message).join('; ')}`);
    const { sha256: _s, byteSize: _b, ...recorded } = entry;
    if (JSON.stringify(describeProject(tree)) !== JSON.stringify(recorded))
      fail(`${name}: rive-src/${name} no longer matches the manifest. Run \`pnpm rive:build\`.`);
  }
}

if (errors.length > 0) {
  console.error(`[verify-rive] ${errors.length} problem(s):\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log(
  `[verify-rive] ${Object.keys(riveContract).length} artboards match the contract${cli ? '; sources re-inspected with the rive CLI' : '; rive CLI not on PATH, checked committed bytes and manifest only'}.`,
);
