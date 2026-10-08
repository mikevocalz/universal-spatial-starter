# SUBAGENTS — orchestration plan (v5)

**Rule: always use skills and subagents.** One lane = one subagent = one evidence file. The orchestrator plans, assigns, integrates and reports; it does not implement a lane's work itself and it never fills a missing artifact with prose.

## 1. Operating principles

1. **Read before write.** Every worker starts by reading the installed source for its seam (file + symbol), the pack sections named in its brief, and its lane's skills. It quotes what it read in its evidence file. No API is invented from memory; if a shape is uncertain the worker **stops and asks** the orchestrator, which asks the owner.
2. **Lane isolation.** A worker edits only the paths in its brief. Cross-lane needs become a handoff request, not a drive-by edit.
3. **Evidence is the interface.** Workers communicate through `docs/evidence/<PR>/<lane>.md` and the PR description, not through chat memory. A result without commands, logs, device/OS and media is "NOT VERIFIED" by definition.
4. **Reviewers are adversarial and separate.** The agent that wrote code never signs its own review line. Review agents load only their review skill and the diff.
5. **Parallel by default, serial where ownership demands.** Waves below mark what can run concurrently. API contracts (E12/E1) always precede implementation of the same symbol.
6. **Banned moves.** No `as never`, no empty handlers, no suppressed peer warnings "to be clean", no `pnpm up --latest` blind, no placeholder `.riv`, no simulated XR/camera data, no bare `useState`/`useReducer` for app state (Zustand only; React 19 `useOptimistic`/`useActionState` allowed), no C++ outside Nitro HybridObjects, no uncommitted Nitrogen output, no "Senior/Principal" role language.
7. **Hard gates every worker runs before handoff:** `pnpm install --frozen-lockfile`, `pnpm typecheck` (`tsc --noEmit`), `pnpm lint`, the lane's tests, and the no-ai-slop checklist on its own diff.

## 2. Mechanics

- **Claude Code:** define agents in `.claude/agents/<name>.md` (frontmatter `name`, `description`, `tools`; body = brief). The orchestrator spawns them with the Task tool. Use `everything-claude-code`'s `orchestrate` command and `checkpoint` for wave boundaries (https://github.com/WorldFlowAI/everything-claude-code).
- **Other agents (Codex, Cursor, Gemini CLI, OpenCode):** the same briefs live under `agents/` in the repo; install skills via `npx skills add …` per `SKILLS.md`.
- **Skills per agent** are listed below and are loaded by the agent at start; the orchestrator verifies the ledger line exists before accepting a handoff.
- **Model/compute note:** long-context lanes (E1 audit, E20 device matrix) get the largest context; review agents can run on smaller models with the diff only.

## 3. Agent catalog

### Orchestrator

| Agent | Lanes | Loads | Produces | Never |
|---|---|---|---|---|
| `uss-orchestrator` | E1 (architecture authority) | `ROSTER.md`, `SKILLS.md`, `MASTER_PROMPT_V5.md`, `everything-claude-code/orchestrate`, `engineering:architecture` | Wave plan per PR, task briefs, integration PR, final report (pack §19 "FINAL REQUIRED REPORT" format via `uss-evidence-report`) | Implement a lane; mark PASS without evidence; merge without the sign-off chain |

### Worker agents

| Agent | Lanes | Loads (from `SKILLS.md`) | Owns paths | Handoff artifact |
|---|---|---|---|---|
| `uss-audit-provenance` | E1, E18, E19 | `engineering:architecture`, `engineering:tech-debt`, Callstack `github`, no-ai-slop | `docs/adr/`, `docs/OWNERSHIP.md`, `LICENSE*`, `NOTICE*` | PR0 audit, risk register, provenance clearance |
| `uss-dependency-matrix` | E3, E11, E15 | Callstack `upgrading-react-native`, Expo `upgrading-expo`, Next upgrade codemods, `expo-cicd-workflows` | `pnpm-workspace.yaml`, `package.json*`, `patches/`, `.github/workflows/`, `docs/UPGRADE_MATRIX.*` | latest-vs-compatible matrix + CI baseline |
| `uss-api-contracts` | E12, E1 | Margelo `api-design`, Pocock skills, Vercel `composition-patterns` | `packages/*/src/index.ts`, `packages/*/src/types/`, `tests/types/` | Typed API sketches, call sites, negative fixtures, API snapshots |
| `uss-routes-web` | E11, E10, E1 | `building-native-ui`, Vercel `react-best-practices`, `webapp-testing`, `use-dom` | `apps/web/`, `apps/mobile/app/`(route files only) | Five routes both targets; cache/prefetch policy + tests; bundle report |
| `uss-standard-workspace` | E7, E8, E1 | `expo-module`, Margelo `kotlin`/`swift`, `expo-ui-swift-ui`, `figma-design-to-code` | `packages/ui/workspace/`, `packages/ui/adaptive/`, native adaptive modules | `StandardWorkspace`, resolver fixtures, rail/Inspector, posture tests |
| `uss-horizon-spatial` | E6, E9 | `expo-module`, Margelo `kotlin`, `viroreact-device-quality-profiles` | `packages/spatial/meta/`, Android flavor config, Gradle plugin wiring | Quest window promotion/fallback evidence, duplicate-plugin audit |
| `uss-apple-platforms` | E8, E14 (visionOS path) | `expo-ui-swift-ui`, `expo-module`, Margelo `swift`, `figma-swiftui` | `packages/spatial/apple/`, iOS/visionOS native targets | SwiftUI scene adapter, visionOS `ObjectTrackingProvider` report, iOS split-view verdict |
| `uss-rive` | E5, D5 | Margelo `api-design`, Rive docs index, `uss-rive-asset-contract` | `packages/rive/`, `assets/rive/`, `MANIFEST.json` | `RivePanel`/`RiveButton`/`RiveGameStage`, four `.riv` assets, typed manifests, leak report |
| `uss-game-core` | E13 | `tdd-workflow`, `engineering:testing-strategy`, Fiedler/Swink sources | `packages/game-core/` | Deterministic Pulse Catch reducer, invariant tests, fixed-timestep notes |
| `uss-motion` | E4, D4 | Kinetrell docs, `uss-motion-policy`, `figma-implement-motion` | `packages/motion/`, recipe files per screen | Recipes, single-ticker test, SSR import test, reduced-motion alternates |
| `uss-immersive` | E9, E10, D3 | `viroreact-*` in-scope set, Margelo `cpp`, three.js/WebGPU docs | `packages/spatial/immersive/`, `packages/three/` | Orbit Lab (Viro + three.js fallback), zone sheet, capability truth table |
| `uss-camera-lab` | E14, E18 | Margelo `react-native-vision-camera`, `build-nitro-modules`, `viroreact-comfort-safety-privacy` | `packages/perception/`, model assets + licenses | Camera Lab overlay, detector pipeline, permission/consent flow, model checksum |
| `uss-nitro` | E2 | Margelo `build-nitro-modules`, `cpp`, `swift`, `kotlin` | `packages/*/nitrogen/`, `packages/*/cpp/`, `packages/*/ios|android` native HybridObjects | Nitrogen output committed, ABI matrix, RAII ownership notes — **only when a seam truly needs Nitro** |
| `uss-design` | D1, D2, D6, D7, D8, D10 | Design sequence §B, Mobbin §C, `frontend-design`, `theme-factory`, `figma-generate-design`, `figma-generate-library`, `figma-code-connect`, Impeccable | `docs/design/`, Figma file, Storybook stories | 00–06 artifacts per screen, Code Connect maps, handoff specs |
| `uss-docs-dx` | E19 | `engineering:documentation`, `doc-coauthoring`, Vercel `writing-guidelines`, marketingskills, no-ai-slop, `skill-creator` | `README.md`, `docs/` (non-evidence), `.claude/skills/uss-*` | Diátaxis docs, compiled README examples, project-local skills |
| `uss-release` | E15 | `engineering:deploy-checklist`, Callstack `github-actions`, Expo `expo-deployment` | `.github/`, EAS config, release scripts | Checklist, artifact pipelines, rollback triggers |

### Reviewer agents (adversarial; diff + skill only)

| Agent | Lane | Loads | Signs |
|---|---|---|---|
| `review-api` | E12 | Margelo `api-design` checklist (pack §7) | API stability, barrels, unions, cleanup, JSDoc |
| `review-slop` | E19 | no-ai-slop; "reader test" | No placeholders, no invented APIs, no narration, docs honest |
| `review-a11y` | E17, D9 | `design:accessibility-review`, WCAG 2.2, XAUR | Modality alternatives, focus, reduced motion |
| `review-perf` | E16 | Callstack `react-native-best-practices`, `viroreact-device-quality-profiles` | Trace present for every perf claim; budgets met or NOT VERIFIED |
| `review-security-license` | E18 | OWASP MASVS, SPDX, `engineering:code-review` | Secrets, IP leakage, notices, RSC security |
| `review-devices` | E20 | Argent `agent-device`, `uss-capability-truth` | Every PASS has device/OS/build/command/media; else NOT VERIFIED |
| `review-design` | D10 | `design:design-critique`, Mobbin sheets | Critique closed, Mobbin re-check done, visuals match handoff |

## 4. Wave plan per PR (DAG)

```text
PR0  W1 ∥ uss-audit-provenance · uss-dependency-matrix · uss-design(Mobbin×6 + research) · uss-docs-dx(skill-creator → uss-* skills)
     W2   uss-orchestrator integrates → review-slop · review-security-license · review-devices(baseline cmds)
PR1  W1   uss-api-contracts (route/layout types) ─┐
     W2 ∥ uss-routes-web · uss-design(theme/tokens) ← needs W1
     W3   review-api · review-slop · review-design
PR2  W1   uss-api-contracts (StandardWorkspace/WorkspacePanel/Inspector) ─┐
     W2 ∥ uss-standard-workspace · uss-horizon-spatial · uss-apple-platforms · uss-design(/native sequence) · uss-nitro (only if a seam needs it)
     W3   review-api · review-a11y · review-devices · review-design · review-perf
PR3  W1   uss-api-contracts (RivePanel/RiveEvent unions) ─┐
     W2 ∥ uss-rive · uss-game-core(typed event fixtures) · uss-design(/hybrid sequence) · uss-motion(non-Rive transitions)
     W3   review-api · review-slop · review-a11y · review-devices
PR4  W1   uss-game-core (reducer + tests first, tdd-workflow) ─┐
     W2 ∥ uss-rive(game stage, Rive controls/HUD) · uss-standard-workspace(GameWorkspace host) · uss-motion · uss-design(/game sequence)
     W3   review-api · review-perf · review-a11y · review-devices · review-design
PR5  W1 ∥ uss-immersive · uss-camera-lab · uss-apple-platforms(visionOS tracking) · uss-design(/immersive + camera sequence)
     W2   uss-nitro (detector/native bridges if needed) · uss-motion(immersive companions)
     W3   review-perf · review-security-license · review-a11y · review-devices · review-design
PR6  W1 ∥ uss-docs-dx · uss-release · uss-design(critique×6) · review-devices(full matrix) · review-perf(full pass)
     W2   uss-orchestrator final report (uss-evidence-report format)
PR7* W1   uss-routes-web(RSC lab, isolated) → review-security-license   (*optional; cannot block PR6)
```

## 5. Handoff contract (every worker → orchestrator)

```md
# docs/evidence/<PR>/<lane>.md
## Brief received            (link to task brief)
## Sources read              (installed file + symbol list; pack §§; skill SKILL.md paths)
## Skills ledger             (table per SKILLS.md §L)
## Changes                   (files; public API diff if any; ADR links)
## Commands run + results    (install/typecheck/lint/tests; exact output or log path)
## Device evidence           (device, OS, build id, permission state, media path) or NOT VERIFIED
## Open questions / blockers (anything that would have required guessing)
## Requests to other lanes   (what, why, suggested owner)
```

A handoff missing any section is returned, not patched by the orchestrator.

## 6. Agent definition template (Claude Code)

```md
---
name: uss-rive
description: Fellow-level Rive runtime and asset-contract lane (E5/D5) for Universal Spatial Starter. Owns packages/rive and assets/rive. Loads Margelo api-design, the Rive docs index and the uss-rive-asset-contract skill before editing.
tools: Read, Grep, Glob, Edit, Write, Bash
---
You hold lanes E5 (Rive Runtime & Asset Contract) and D5 (Rive & HMI Interactive Design) from prompts/ROSTER.md. Oracles: Luigi Rosso and Guido Rosso (Rive); read https://rive.app/docs/llms.txt and the installed @rive-app/react-native sources before editing.
Scope: packages/rive/**, assets/rive/**, assets/rive/MANIFEST.json. Do not edit other paths; file a request in your handoff instead.
Skills to load now: .claude/skills/api-design/SKILL.md (Margelo), .claude/skills/uss-rive-asset-contract/SKILL.md, and record each in docs/evidence/<PR>/SKILLS.md.
Rules: real .riv files only; typed View Model and event unions; game authority stays in Zustand, never in the Rive VM; dispose on unmount; 20 mount/unmount cycles without growth; explicit loading/error/fallback; the Rive 0.5.x ↔ Nitro peer range is diagnosed, not suppressed. "C++ is Nitro" if you ever touch a native seam — hand that to uss-nitro.
Handoff: docs/evidence/<PR>/E5.md in the SUBAGENTS.md §5 format. Any uncertainty about an API shape → stop and ask; never guess.
```

```md
---
name: review-devices
description: Adversarial device-evidence reviewer (lane E20). Reads only the PR diff and docs/evidence. Loads Argent agent-device and the uss-capability-truth skill. Refuses any PASS without device/OS/build/command/media.
tools: Read, Grep, Glob, Bash
---
You are lane E20 (Quality & Device Verification) acting as reviewer. For every claim of PASS in the PR, find the evidence file, the exact command, the device and OS, the build identifier, the permission state and the media. If any is missing, change the status to NOT VERIFIED in your review and list what evidence would turn it into PASS. Hardware you cannot observe is NOT VERIFIED, never FAIL and never PASS. Write docs/evidence/<PR>/REVIEW-devices.md.
```
