# Source provenance

| Item | Value |
| --- | --- |
| Source repository | https://github.com/mikevocalz/nyc-mon |
| Source commit | `b3e2446cf1e0cca71ca4365daee443455968ed37` (`main`, "feat(web): premium NYC-MON campaign site redesign (#8)") |
| Viro tarball | `vendor/reactvision-react-viro-3.0.2-moyo.1.tgz`, sha256 `fd53e9ea8541e68bacb41dd3c4109b60518f02f238dd4c0ae1a45444b8e321d4` |
| License | MIT, `LICENSE` kept unchanged (copyright Gursel Cakar) |
| Third-party notices | `packages/ui/THIRD-PARTY-NOTICES.md` kept unchanged (NeonBlade attribution) |
| Spec | `docs/spec/` holds the v5 bundle: master prompt, roster, skills, subagents, full pack, Viro External playbook and archived v1–v4 packs |

The fork keeps the full NYC-MON git history. Do not publish it as a public template until the history has been audited for secrets and NYC-MON IP (pack §12, step 9).

## Baseline before extraction

Run on the source commit with Node 26.8.2 and pnpm 12.8.1, before anything was deleted:

| Command | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | pass |
| `pnpm typecheck` | pass, 14/14 tasks |
| `pnpm test` | pass, 11/11 tasks |

The root `package.json` declares Node `>=24.15.0 <26`. The baseline ran on 26.8.2, outside that range.

## Removed in the extraction

| Removed | Why |
| --- | --- |
| `apps/admin-vite`, `packages/{auth,content,core,payload,mcp-server}` | Auth, CMS and backend are out of scope. Only the old screens imported them. |
| Every Expo route under `apps/mobile/app` and every Next.js route under `apps/web/app/(site)` | Replaced by the five starter routes |
| `packages/app/features/*`, `apps/mobile/components`, `apps/web/components`, `apps/web/lib/waitlist*` | Implementations behind the old screens |
| `apps/mobile/src/navigation/split-view` | Only the old split route used it. Recover it from history for PR2 (StandardWorkspace). |
| District scene, district store, home copy, spatial audio in `packages/spatial` | NYC-MON world content. Orbit Lab replaces the scene. |
| `docs/` (canon, ADRs, briefs, design research), `.devin`, `tooling/site-qa`, `scripts/shoot-home.mjs` | NYC-MON planning and marketing-site tooling |

`docs/design/CONTRAST.md` and `docs/DESIGN_SYSTEM.md` were restored because the theme contrast test checks them against `packages/theme/contrast.ts`. Both still describe the NYC-MON palette.

## Removed in the IP cleanup

The NYC-MON logo, creature art, NYC photos, H-Lynk chrome, nav header and footer, signage, the city backgrounds and the `nyc-carousel` native module are gone from `packages/ui` and `packages/assets`. The app and web icons are a neutral orbit mark.

## Still carrying NYC-MON material

- The `District` type (`downtown | midtown | harlem | megacity`) still drives tone presets across about 170 files in `packages/ui`, so the district names remain as prop values, defaults and story controls. Renaming them is a separate PR.
- `packages/theme` still exports `hlynk`, `led`, `signage` and `concrete` tokens, and `docs/design/CONTRAST.md` and `docs/DESIGN_SYSTEM.md` still describe the NYC-MON palette.
- The `@acme/*` package scope stays as it is for now (pack §11 puts the rename in a separate PR).
