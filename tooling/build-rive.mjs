import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Rebuilds every Rive project under packages/assets/rive-src/ with the Rive CLI
 * (`rive <dir> --once`, unsigned, no scripts) and writes:
 *   packages/assets/rive/<name>.riv   the file native code requires
 *   apps/web/public/rive/<name>.riv   the same bytes, served to the web runtime
 *   packages/assets/rive/manifest.json  artboards, state machines and view models
 *                                       per file, read back with `rive inspect --json`
 * Needs the `rive` CLI on PATH. CI does not run this; it checks the committed
 * output with tooling/verify-rive-assets.mjs.
 */
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcRoot = join(root, 'packages/assets/rive-src');
const outDir = join(root, 'packages/assets/rive');
const webDir = join(root, 'apps/web/public/rive');

const rive = (args) => execFileSync('rive', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 << 20 });

let cliVersion;
try {
  cliVersion = rive(['--version']).trim();
} catch {
  console.error('[build-rive] the `rive` CLI is not on PATH. Install it from https://releases.rive.app/cli/install.sh and retry.');
  process.exit(1);
}

const KIND = {
  ViewModelPropertyNumber: 'number',
  ViewModelPropertyBoolean: 'boolean',
  ViewModelPropertyString: 'string',
  ViewModelPropertyTrigger: 'trigger',
  ViewModelPropertyEnumCustom: 'enum',
  ViewModelPropertyColor: 'color',
};

/** Reduces `rive inspect --json` to the names a host binds to. */
export function describeProject(tree) {
  const enums = Object.fromEntries(
    tree.roots
      .filter((r) => r.type === 'DataEnumCustom')
      .map((e) => [e.id, (e.children ?? []).filter((c) => c.type === 'DataEnumValue').map((c) => c.key)]),
  );
  const viewModels = Object.fromEntries(
    tree.roots
      .filter((r) => r.type === 'ViewModel')
      .map((vm) => [
        vm.id,
        {
          name: vm.name,
          properties: Object.fromEntries(
            (vm.children ?? [])
              .filter((c) => c.type.startsWith('ViewModelProperty'))
              .map((c) => [c.name, KIND[c.type] ?? c.type]),
          ),
          enums: Object.fromEntries(
            (vm.children ?? []).filter((c) => c.type === 'ViewModelPropertyEnumCustom').map((c) => [c.name, enums[c.enumId] ?? []]),
          ),
        },
      ]),
  );
  return {
    defaultArtboard: tree.defaultArtboard?.name,
    artboards: tree.artboards.map((a) => {
      const machines = (a.children ?? []).filter((c) => c.type === 'StateMachine');
      return {
        name: a.name,
        stateMachines: machines.map((m) => m.name),
        defaultStateMachine: machines.find((m) => m.id === a.defaultStateMachineId)?.name,
        viewModel: viewModels[a.viewModelId]?.name,
      };
    }),
    viewModels: Object.fromEntries(Object.values(viewModels).map(({ name, ...rest }) => [name, rest])),
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  mkdirSync(outDir, { recursive: true });
  mkdirSync(webDir, { recursive: true });
  const projects = readdirSync(srcRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(srcRoot, d.name, 'rive.yaml')))
    .map((d) => d.name)
    .sort();

  const files = {};
  for (const name of projects) {
    const dir = join(srcRoot, name);
    const tree = JSON.parse(rive(['inspect', dir, '--json']));
    if (tree.problems.length > 0) {
      console.error(`[build-rive] ${name}: rive inspect reports problems:\n${JSON.stringify(tree.problems, null, 2)}`);
      process.exit(1);
    }
    rive([dir, '--once', '--quiet']);
    const built = join(dir, 'build', `${name}.riv`);
    if (!existsSync(built)) {
      console.error(`[build-rive] ${name}: expected ${built} after --once`);
      process.exit(1);
    }
    copyFileSync(built, join(outDir, `${name}.riv`));
    copyFileSync(built, join(webDir, `${name}.riv`));
    const bytes = readFileSync(built);
    files[name] = {
      sha256: createHash('sha256').update(bytes).digest('hex'),
      byteSize: bytes.length,
      ...describeProject(tree),
    };
    console.log(`[build-rive] ${name}.riv ${bytes.length} bytes`);
  }

  writeFileSync(join(outDir, 'manifest.json'), `${JSON.stringify({ generatedBy: cliVersion, files }, null, 2)}\n`);
  console.log(`[build-rive] wrote manifest for ${projects.length} files`);
}
