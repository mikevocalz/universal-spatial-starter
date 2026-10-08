# SKILLS — Universal Spatial Starter (canonical registry, v5)

**Every prompt in this bundle names these skills explicitly, with the output each must produce. "Use relevant skills" is not an instruction; this file is.** The subagent that owns a lane loads that lane's skills before it edits anything (see `ROSTER.md` and `SUBAGENTS.md`).

## Availability and honesty (binding)

- A skill is *used* only if its `SKILL.md` was actually loaded in the executing environment (installed via `npx skills add …`, a Claude Code `/plugin install …`, a session plugin bundle, or read from a checked-out path). Otherwise the agent writes **`SKILL NOT AVAILABLE — followed documented practice from <link>`** in the PR's skill ledger. Claiming a skill ran when it was only linked fails the PR.
- The `design:*`, `engineering:*`, `figma:*` and `viroreact-*` names below are **plugin bundles that exist inside Claude chat / Cowork sessions**. They are not published GitHub repos and are not installed as local slash commands in a Claude Code workspace unless explicitly installed there (`/code-review` is bundled in Claude Code; `frontend-design` is on the official Anthropic marketplace). Prompts must not assume otherwise; the fallback is the oracle source in `ROSTER.md`.
- Skills are read, then applied, then **evidenced**: each skill named for a PR has a line in `docs/evidence/<PR>/SKILLS.md` → `skill · loaded from · applied to files/symbols · artifact produced`.
- Skill outputs live in sensible docs per PR (`docs/design/`, `docs/evidence/`, `docs/api/`), never as dozens of root-level generated markdown files.

Install shorthand used below: **`skills`** = `npx skills add <repo>` (any agent); **`plugin`** = Claude Code `/plugin marketplace add <repo>` then `/plugin install <name>@<marketplace>`; **`bundle`** = session plugin bundle (Claude chat / Cowork); **`read`** = read `SKILL.md` from the linked path.

---

## A. Standing toolkit — must appear in every prompt written for this project

| Skill set | Link | Install | Owner lanes | Required output |
|---|---|---|---|---|
| **Margelo react-native-skills** — `api-design`, `build-nitro-modules`, `cpp`, `swift`, `kotlin`, `react-native-vision-camera` (v5 Nitro rewrite), `react-native-mmkv`, `nitro-fetch` | https://github.com/margelo/react-native-skills | `skills margelo/react-native-skills` | E2, E5, E6, E7, E8, E9, E12, E14 | `api-design`: typed API sketch + 2–3 compiling call sites + negative fixtures per public export. `build-nitro-modules`/`cpp`: Nitrogen specs committed before any Swift/Kotlin HybridObject; RAII ownership note. `react-native-vision-camera`: Camera Lab session/format/frame-processor plan against the installed v5 API (no v4 `photo={true}`/`useFrameProcessor` patterns). `swift`/`kotlin`: sealed/enum state modelling for every native adapter. `mmkv`/`nitro-fetch`: **not in v1 scope** — load only if a lane proves the need and records it in an ADR. |
| **Callstack agent-skills** — `react-native-best-practices` (from *The Ultimate Guide to React Native Optimization*), `upgrading-react-native`, `github`, `github-actions`, `create-react-native-library`, `assess-react-native-migration`, `react-native-brownfield-migration`, `validate-skills`; plugins `building-react-native-apps`, `testing-react-native-apps` | https://github.com/callstackincubator/agent-skills · guide: https://www.callstack.com/ebooks/the-ultimate-guide-to-react-native-optimization | `plugin callstackincubator/agent-skills` → `react-native-best-practices@callstack-agent-skills` etc. | E3, E15, E16, E20 | `react-native-best-practices`: measured fix list mapped to FPS/TTI/memory with trace files (`references/js-*.md`, `native-*.md`, `bundle-*.md` cited by name). `upgrading-react-native`: upgrade-helper diff log inside `UPGRADE_MATRIX.md`. `github`/`github-actions`: PR workflow + simulator/emulator artifact pipelines. `create-react-native-library`: scaffold only for new publishable packages. `validate-skills`: run on any project-local skill authored in §J. |
| **WorldFlowAI / everything-claude-code** — agents, `orchestrate`, `tdd-workflow`, `code-review`, `test-coverage`, `refactor-clean`, `build-fix`, `checkpoint`, `continuous-learning`, rules, hooks | https://github.com/WorldFlowAI/everything-claude-code (upstream: https://github.com/affaan-m/everything-claude-code) | `plugin` per its README (`/plugin marketplace add …` then `/plugin install everything-claude-code@everything-claude-code`) | Orchestrator, E13, E20 | `orchestrate`: the subagent run plan in `SUBAGENTS.md` format. `tdd-workflow`: failing test committed before the game-core / resolver implementation. `test-coverage`: per-PR coverage delta. `checkpoint`: named checkpoints at each PR gate. |
| **petergyang / no-ai-slop** | https://github.com/petergyang/no-ai-slop | `read` | E19, D1, D8 and **every** lane at PR time | Slop audit per PR: no placeholders/stubs, no hallucinated APIs or package names, no invented data, no narrating comments, no speculative abstractions, no assertion-free tests, no "should work". Plus the *reader* test: the repo must not read as vibe-coded or LLM-authored to a skeptical maintainer. |
| **Kinetrell** (owner's motion language) — README, `docs/native-runtime.md`, `docs/react-dom-bindings.md`, `docs/ssr-verification.md`, `docs/native-scroll.md`, `docs/accessibility.md`, `docs/performance.md`, `docs/gesture-interruption.md`, `docs/native-lifecycle.md` | https://github.com/mikevocalz/Kinetrell | `read` | E4, D4 | `defineMotion`/`compileMotion` recipes per screen; single-ticker test; SSR import test; reduced-motion alternates. |
| **Mobbin** — per-screen real-pattern research | https://mobbin.com/ | web (connector where available) | D2, D1, D10 | See §C: one research sheet per screen, patterns cited by app/flow, no cloned screens. |

---

## B. UX / design skill sequence (standing order, per screen)

Run in this order for **each of the five screens and the Camera Lab overlay**. Each step has a named artifact; the next step may not start until the previous artifact exists.

| Order | Skill | Bundle / source | Input | Required output (path) |
|---|---|---|---|---|
| 1 | `design:user-research` | `bundle` (fallback: Erika Hall, NN/g) | Audience from pack §2, Mobbin sheet (§C) | `docs/design/<screen>/01-research.md` — interview guide, assumptions, 3 target-user scenarios, open questions |
| 2 | `design:design-handoff` | `bundle` (fallback: Figma Dev Mode conventions) | Screen spec from pack §4 / §33 | `docs/design/<screen>/02-handoff.md` — layout grid, tokens used, component props, interaction states, breakpoints (320/375/768/1024/1440 + fold postures + XR slots), edge cases, motion timings |
| 3 | `design:design-system` | `bundle` (fallback: Frost, Curtis) | Token direction (pack §2, §31) | `docs/design/<screen>/03-system.md` — token diffs, new variants/states, naming audit, hardcoded-value findings |
| 4 | `design:ux-copy` | `bundle` (fallback: Podmajersky, Yifrah) | Handoff + capability states | `docs/design/<screen>/04-copy.md` — every label, empty/error/permission/NOT VERIFIED string, CTA wording |
| 5 | `design:accessibility-review` | `bundle` (fallback: WCAG 2.2, XAUR) | Handoff + copy | `docs/design/<screen>/05-a11y.md` — contrast, focus order, target sizes (≥48dp XR), alternative inputs, reduced motion, screen-reader script |
| 6 | `design:design-critique` | `bundle` (fallback: NN/g heuristics) | Storybook/device captures | `docs/design/<screen>/06-critique.md` — hierarchy, consistency, usability findings with severity and fix owner |
| 7 | `engineering:code-review` (`/code-review`) | `bundle` / Claude Code | PR diff | PR review comments + `docs/evidence/<PR>/REVIEW.md` — correctness, perf, security, edge cases |
| 8 | `frontend-design` (Anthropic) | `plugin anthropics/skills` or official marketplace | Everything above | Implemented UI with a stated aesthetic direction (Spatial Atelier), no template defaults; screenshot set in `docs/evidence/<PR>/visual/` |
| + | **Mobbin per screen** (§C) | web | — | `docs/design/<screen>/00-mobbin.md` — runs before step 1 and is re-checked at step 6 |

Design lanes D1–D10 own steps 1–6 and 8; E12/E20 own step 7. Skipping a step or merging two artifacts into one file is a finding.

---

## C. Mobbin protocol (per screen)

For `/`, `/native`, `/hybrid`, `/game`, `/immersive`, and the Camera Lab overlay:

1. Search Mobbin for **at least three** shipped apps with the same job (e.g. three-pane productivity shell; game HUD + controls; AR scanner permission flow; adaptive tablet rail).
2. Record per pattern: app, flow/screen name, what is borrowed (structure, state handling, affordance), what is explicitly **not** borrowed (visual IP, iconography, copy).
3. Produce `docs/design/<screen>/00-mobbin.md` with the pattern table and one paragraph of synthesis.
4. Re-check at critique (step 6): does the implemented screen hold up against the shipped patterns? Any gap becomes a critique finding.
5. Never clone a proprietary screen. Mobbin is research input, not a template.

---

## D. Engineering skill bundle (`engineering:*`)

| Skill | When | Owner | Required output |
|---|---|---|---|
| `engineering:architecture` | PR0 and any ADR-worthy choice (host selection, Nitro vs Expo Module, cache policy, Rive runtime pin) | E1 | `docs/adr/NNNN-<slug>.md` (Nygard format: context, decision, consequences, alternatives) |
| `engineering:system-design` | PR0–PR2 package boundaries, event flow, ownership contract | E1 | `docs/OWNERSHIP.md`, event-flow diagram (Mermaid), data model of `WorkspaceDefinition`/`GameSession` |
| `engineering:testing-strategy` | PR0 (strategy) then every PR | E20, E13 | `docs/TESTING.md` updates: unit / interaction / E2E / device matrix, what each PR must add |
| `engineering:code-review` | Every PR | E12, E20 | Review record (see §B step 7) |
| `engineering:debug` | Any native crash, Rive/Nitro peer conflict, prebuild drift | E2, E3, E5 | `docs/evidence/<PR>/DEBUG-<slug>.md` — reproduce, isolate, root cause, fix, regression test |
| `engineering:tech-debt` | PR0 audit of NYC-Mon extraction and `viro-external` overlaps; PR6 | E1, E19 | Debt register with priority and owner |
| `engineering:deploy-checklist` | PR6 / any release | E15 | Pre-release checklist with rollback triggers |
| `engineering:documentation` | Every PR touching public API or docs | E19 | Diátaxis-sorted docs; README examples compiled in CI |
| `engineering:incident-response` | Device-blocking failures found in QA | E20 | Blameless postmortem for any gate miss |
| `design:research-synthesis` | After Mobbin + research steps across all screens | D2 | Cross-screen synthesis → IA decisions |

---

## E. XR skill pack — ReactVision ViroReact premium skills (`viroreact-*`)

Session bundle. Load **before** any Viro/Eskiu/OpenXR code or any XR layout decision. Oracle fallback: ReactVision source + Apple spatial principles + Meta design guidelines (`ROSTER.md`).

| Skill | In v1 scope | Owner | Required output |
|---|---|---|---|
| `viroreact-premium-spatial-design` | Yes — Immersive screen, Quest/PICO panel design, Camera Lab on XR | D3, E9 | Spatial design review: meters/depth/comfort rationale per XR surface |
| `viroreact-spatial-layout-system` | Yes | E9, D3 | Token mapping: starter semantic tokens ↔ pack spatial tokens; no one-off numbers |
| `viroreact-scene-composition` | Yes — any scene with ≥2 elements | E9 | Zone/placement sheet for Orbit Lab (center stage + companions), collision check |
| `viroreact-comfort-safety-privacy` | Yes — passthrough, permissions, tracking loss, camera feed | E14, E7, E17, E18 | Consent/permission flow, tracking-loss and background behaviour, data-retention statement for Camera Lab |
| `viroreact-device-quality-profiles` | Yes — Quest 2/3/3S/Pro, PICO, ARKit, ARCore budgets | E16, E6, E9 | Per-profile budget table in `docs/evidence/perf/` |
| `viroreact-enterprise-xr-polish` | Yes — loading, error/empty states, resume, recenter, reduced motion | E9, D1 | Polish checklist per XR screen |
| `viroreact-prompt-patterns` | Yes — any AI-authored scene code | E9 | Intent→component recipe used, cited in PR |
| `viroreact-xr-data-visualization` | Partial — Showcase capability inspector in XR only | E9 | Only if the inspector renders in 3D |
| `viroreact-spatial-narrative-experiences` | No (v1) — note for Showcase editorial reveal only | D4 | Record "not used" or a one-paragraph rationale |
| `viroreact-shared-anchors-and-geospatial` | **No** — explicitly excluded from starter v1 (pack §0 scope ladder) | — | Must not appear in code |
| `viroreact-gaussian-splats` | **No** — explicitly excluded from starter v1 | — | Must not appear in code |

---

## F. Expo official skills

https://github.com/expo/skills · https://docs.expo.dev/skills/ · `plugin expo/skills` → `/plugin install expo`, or `skills expo/skills`

| Skill | Owner | Required output |
|---|---|---|
| `building-native-ui` | E1, E3 | Route shell with native Stack/Tabs/toolbars; five thin route files |
| `expo-module` | E2, E6, E7, E8 | Expo Modules API adapters (Compose/SwiftUI hosts); decision note "Expo Module vs Nitro" per native seam |
| `expo-ui-swift-ui` | E8 | SwiftUI `@expo/ui` extensions for Native Workspace controls |
| `expo-dev-client` | E3, E15 | Dev client build recipe per platform/flavor (Quest, PICO, phone) |
| `expo-cicd-workflows` / `expo-deployment` | E15 | EAS workflow YAML; deployment notes (web + optional lab) |
| `upgrading-expo` | E3 | SDK compatibility check log in `UPGRADE_MATRIX.md` |
| `expo-api-routes` | E11 (optional lab only) | Lab-only server function notes; **never** in the five-screen app |
| `use-dom` | E1, E10 | DOM-component decisions for web-only renderers (documented, not default) |

---

## G. Callstack and Vercel performance/web skills

| Skill | Link | Owner | Required output |
|---|---|---|---|
| Callstack `react-native-best-practices` (and its `references/` set) | https://github.com/callstackincubator/agent-skills/blob/main/skills/react-native-best-practices | E16, E3 | Measured optimization list with traces (see §A) |
| Vercel `react-best-practices` | https://github.com/vercel-labs/agent-skills | E10, E11 | Web perf findings (waterfalls, client bundle, hydration) with analyzer output |
| Vercel `react-native-guidelines` | same | E3 | Cross-check of list/scroll/animation/state rules against the starter |
| Vercel `web-design-guidelines` | same | E10, E17 | Web UI audit (a11y, interactions) |
| Vercel `writing-guidelines` | same | E19 | Docs/README review |
| Vercel `composition-patterns` | same | E12 | Component composition review of public React API |
| Vercel `react-view-transitions` | same | E4, E11 | **Evaluate-only**: a note whether React View Transitions can be used *under* Kinetrell's web adapter without creating a second motion system; default is no |

---

## H. Anthropic official skills and Figma skills

Anthropic: https://github.com/anthropics/skills · `plugin anthropics/skills` / official marketplace

| Skill | Owner | Required output |
|---|---|---|
| `frontend-design` | D1, E10, E3 | Implemented UI with explicit aesthetic direction; no generic AI styling |
| `skill-creator` | E19, Orchestrator | Project-local skills in §J, validated with Callstack `validate-skills` |
| `webapp-testing` | E20 | Playwright flows for five web routes, deep links, refresh, 320–1440 widths |
| `theme-factory` | D1, D7 | Token set for Studio Light / Stage Dark derived from pack §2 / §31 |
| `doc-coauthoring` | E19 | README / docs iteration log |

Figma (`figma:*` bundle; Figma MCP server: https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server)

| Skill | Owner | Required output |
|---|---|---|
| `figma:figma-use` (prerequisite for any write) | D7 | — |
| `figma:figma-generate-library` | D7 | Figma variables/tokens + components for the starter design system |
| `figma:figma-generate-design` | D2, D7 | Five screens + Camera Lab as Figma screens, per breakpoint/posture/XR slot |
| `figma:figma-design-to-code` | E3, E10 | Design-context pull before implementing any screen |
| `figma:figma-code-connect` | D7, E12 | `*.figma.tsx` maps for `StandardWorkspace`, `GameWorkspace`, `RivePanel`, `RiveButton`, `RiveGameStage`, `NavigationRail`, `Inspector` |
| `figma:figma-use-motion` / `figma:figma-implement-motion` | D4, E4 | Motion keyframes authored in Figma → Kinetrell recipes (not a second runtime) |
| `figma:figma-generate-diagram` | E1 | Architecture / event-flow / state diagrams in FigJam (also kept as Mermaid in repo) |
| `figma:figma-swiftui` | E8 | SwiftUI parity notes for `@expo/ui` SwiftUI extensions |

---

## I. Supplementary skills (already standing in v1–v4; kept)

| Skill | Link | Owner | Required output |
|---|---|---|---|
| Matt Pocock skills (TypeScript) | https://github.com/mattpocock/skills | E12 | Discriminated unions, type tests, library ergonomics review |
| Argent `agent-device` | https://github.com/Argent/agent-device | E20, E16, E17, D10 | Repeatable device flows, screenshots/video/logs as evidence |
| Impeccable | https://github.com/pbakaus/impeccable | D1, D6 | Design-quality pass per screen |
| marketingskills (Corey Haines) | https://github.com/coreyhaines31/marketingskills | E19 | README/demo positioning copy **only** |
| Next.js official upgrade codemods | https://nextjs.org/docs/app/guides/upgrading | E11 | `@next/codemod` run log in `UPGRADE_MATRIX.md` |

---

## J. Project-local skills to author (with `skill-creator`, validated with `validate-skills`)

Stored in the starter repo under `.claude/skills/` (and mirrored for other agents per the agentskills.io spec: https://agentskills.io/specification). Each is small, source-cited, and tested.

| Skill | Purpose | Owner | Must contain |
|---|---|---|---|
| `uss-layout-resolver` | How `StandardWorkspace`/`GameWorkspace` resolve width + reserved regions + posture + XR slot capacity; the concrete test cases from pack §27 | E1, E7 | Resolver table, fixtures, "no device-name conditionals" rule |
| `uss-capability-truth` | How to report capabilities: requirement vs preference, PASS/FAIL/NOT VERIFIED, no fake badges | E20, D8 | Wording, evidence paths, forbidden phrasings |
| `uss-rive-asset-contract` | `.riv` manifest schema, typed View Model/event unions, lifecycle rules, offscreen-texture P2 boundary | E5, D5 | Manifest schema, examples, leak test recipe |
| `uss-evidence-report` | The per-PR evidence folder layout and the final required report format (pack §19 "FINAL REQUIRED REPORT") | E20, E19 | Templates for `docs/evidence/<PR>/{SKILLS,REVIEW,DEVICES,PERF}.md` |
| `uss-motion-policy` | Kinetrell-only orchestration, Rive/Viro ownership, banned libraries, single-ticker test | E4, D4 | Decision tree + test commands |

---

## K. Skill → PR matrix

| PR | Mandatory skills (owner lane) |
|---|---|
| **PR0 audit/provenance** | `engineering:architecture`, `engineering:system-design`, `engineering:tech-debt` (E1); Callstack `upgrading-react-native` + Expo `upgrading-expo` + Next upgrade codemods (E3/E11); Callstack `github` (E15); no-ai-slop (E19); `design:research-synthesis` + Mobbin ×6 (D2); `skill-creator` → §J skills (Orchestrator) |
| **PR1 neutral source + five routes + Next 16.4** | `building-native-ui` (E3); Vercel `react-best-practices` (E11); Margelo `api-design` (E12); `webapp-testing` (E20); `frontend-design` + `theme-factory` (D1) |
| **PR2 StandardWorkspace + rails/dual-screen/Inspector + native/Meta bridge** | `expo-module`, Margelo `kotlin`/`swift` (E6/E7/E8); `expo-ui-swift-ui` (E8); `viroreact-device-quality-profiles` (E6); design sequence §B for `/native` (D-lanes); `figma:figma-generate-design` + `figma-code-connect` (D7) |
| **PR3 Hybrid Rive panel** | Margelo `api-design` (E12/E5); Rive docs index (E5); `tdd-workflow` for typed event unions (E13); design sequence for `/hybrid`; `figma:figma-implement-motion` only for non-Rive transitions (D4) |
| **PR4 GameWorkspace + playable game** | `tdd-workflow` + `engineering:testing-strategy` (E13/E20); Kinetrell docs (E4); design sequence for `/game` incl. Swink/Vlambeer feel review (D5); Callstack `react-native-best-practices` (E16) |
| **PR5 Immersive stage + spatial adapters** | `viroreact-premium-spatial-design`, `spatial-layout-system`, `scene-composition`, `comfort-safety-privacy`, `enterprise-xr-polish`, `prompt-patterns` (E9/D3); Margelo `cpp` (E9); Vercel `react-best-practices` (E10) |
| **PR5b Camera Lab overlay** | Margelo `react-native-vision-camera` + `build-nitro-modules` (E14); `viroreact-comfort-safety-privacy` (E14/E18); Apple ARKit object-tracking docs (E8); `design:accessibility-review` + `design:ux-copy` (D8/D9) |
| **PR6 quality, docs, Storybook, device validation** | Argent `agent-device` (E20); Callstack `react-native-best-practices` full pass (E16); `engineering:deploy-checklist` (E15); `engineering:documentation` + Vercel `writing-guidelines` + marketingskills (E19); `design:design-critique` ×6 (D10); no-ai-slop reader test (all) |
| **PR7 (optional, isolated) Expo RSC lab** | `expo-api-routes` (E11); `engineering:code-review` with RSC security focus (E18) |
| **Separate track: `viro-external` VXP-01..07** | Margelo `api-design` first; `build-nitro-modules`/`cpp` where Nitro resources exist; Pocock skills; `create-react-native-library` for new packages; no-ai-slop |

---

## L. Skill ledger format (per PR, required)

```md
# docs/evidence/PR3/SKILLS.md
| Skill | Loaded from | Applied to | Artifact |
|---|---|---|---|
| margelo/api-design | .claude/skills/api-design/SKILL.md (npx skills add) | packages/rive/src/RivePanel.tsx, RiveEvent union | docs/api/RIVE_PANEL.md, tests/types/rive-panel.test-d.ts |
| design:ux-copy | Claude session bundle | /hybrid status strings | docs/design/hybrid/04-copy.md |
| viroreact-comfort-safety-privacy | NOT AVAILABLE — followed ReactVision docs + Apple spatial principles | n/a | docs/design/immersive/comfort.md |
```
