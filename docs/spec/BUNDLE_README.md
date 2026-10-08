<div align="center">

# ◈ Universal Spatial Starter — Complete Engineering Bundle (v5)

### Five screens. Two layout families. Native + Rive + XR. One motion system. One roster. One skill set. One prompt.

**Expo · Next.js 16.4 · Rive · Kinetrell · Viro/Eskiu · VisionCamera v5 · visionOS ARKit · Meta Layout SDK · Android XR**

[Master prompt](prompts/MASTER_PROMPT_V5.md) · [Roster](prompts/ROSTER.md) · [Skills](prompts/SKILLS.md) · [Subagents](prompts/SUBAGENTS.md) · [Full engineering pack v5](engineering/UNIVERSAL_SPATIAL_STARTER_FULL_PACK_V5.md) · [Viro External playbook](engineering/VIRO_EXTERNAL_API_MODERNIZATION_PLAYBOOK.md) · [Starter README](starter/README.md) · [Docs index](starter/docs/README.md)

</div>

---

## What changed in v5

| Area | v4 | v5 |
|---|---|---|
| **Roster** | "Senior"/"Principal"/"Staff" role table | Creator / spec-author tier only: 20 engineering lanes (E1–E20) and 10 design lanes (D1–D10), each with named oracles and primary sources, loaded skills, required artifact and veto scope. "Senior" banned, bare "Principal" below the bar. [`prompts/ROSTER.md`](prompts/ROSTER.md) |
| **Skills** | Nine links, "use relevant ones" | Every skill named with install source, owner lane, mandatory PR and required output: Margelo (all eight), Callstack, everything-claude-code, no-ai-slop, Kinetrell, Mobbin per screen, the ordered UX/design sequence (user-research → design-handoff → design-system → ux-copy → accessibility-review → design-critique → code-review → frontend-design), `engineering:*`, the ReactVision `viroreact-*` XR pack, Expo, Vercel, Anthropic, Figma, project-local `uss-*` skills. [`prompts/SKILLS.md`](prompts/SKILLS.md) |
| **Subagents** | Not specified | Mandatory: orchestrator + 16 worker agents + 7 adversarial reviewers, wave DAG per PR, handoff contract, Claude Code agent templates. [`prompts/SUBAGENTS.md`](prompts/SUBAGENTS.md) |
| **Prompt** | Three stacked blocks (§19 + §29 + §39) plus a correction | One consolidated copy-as-is prompt embedding roster, skills, subagents, standards and the camera correction. [`prompts/MASTER_PROMPT_V5.md`](prompts/MASTER_PROMPT_V5.md) |
| **Standards** | Zustand single authority; evidence rules | Hardened: Zustand-only (bare `useState`/`useReducer` banned for app state), "C++ is Nitro" with Nitrogen committed first, `tsc --noEmit` hard gate, no-invented-APIs, no-AI-slop definition plus the skeptical-reader test. Pack §44 |
| **Camera Lab** | VisionCamera + TFLite/EfficientDet, visionOS ARKit | VisionCamera **v5** (Nitro) named explicitly; detector choice is an ADR (LiteRT path or ReactVision `ViroObjectDetector`/ONNX when the AR scene already owns the camera). Pack §45 |

## Open these first

| Start | Contents |
|---|---|
| **[Master prompt v5](prompts/MASTER_PROMPT_V5.md)** | The single prompt a coding agent needs; read the three `prompts/` companions in full |
| **[Full engineering pack v5](engineering/UNIVERSAL_SPATIAL_STARTER_FULL_PACK_V5.md)** | Multi-phase architecture, five-screen specs, Next 16.4/RSC, Expo, adaptive mobile, Meta/Quest/PICO, premium design, visionOS sensing correction, QA, and the v5 extension §§41–48 |
| **[Starter README](starter/README.md)** | Future-repo landing page, five screens, quick start, scope and design direction |
| **[Documentation index](starter/docs/README.md)** | Learning path through layout system, components, motion, Rive, camera, platforms and testing |
| **[Viro External API modernization](engineering/VIRO_EXTERNAL_API_MODERNIZATION_PLAYBOOK.md)** | Margelo API-design audit, package/public API roadmap, resource lifecycles, migration and Fellow-level engineering gates |
| **[Contribution standards](starter/CONTRIBUTING.md)** | Code-quality rules, roster/skill gates, PR template, accessibility and honest device support |

## Documentation map

| Subject | File |
|---|---|
| Architectural ownership | [ARCHITECTURE.md](starter/docs/ARCHITECTURE.md) |
| Standard vs Game layouts | [LAYOUT_SYSTEM.md](starter/docs/LAYOUT_SYSTEM.md) |
| Components, public TypeScript APIs | [COMPONENTS.md](starter/docs/COMPONENTS.md) |
| Kinetrell native/web motion | [KINETRELL_MOTION.md](starter/docs/KINETRELL_MOTION.md) |
| Rive native panels, HUD, Game Stage | [RIVE.md](starter/docs/RIVE.md) |
| Raised camera action, detector, XR object tracking | [CAMERA_AND_XR.md](starter/docs/CAMERA_AND_XR.md) |
| iPhone Duo concept, Android dual-screen, foldables, rail, inspector | [MOBILE_AND_FOLDABLES.md](starter/docs/MOBILE_AND_FOLDABLES.md) |
| Device host/platform contracts | [PLATFORMS.md](starter/docs/PLATFORMS.md) |
| QA, testing, native validation | [TESTING.md](starter/docs/TESTING.md) |

## Revisions

`archive/` holds the earlier full packs (v1, v2, v3, **v4**) and the v3 addendum. **v5 supersedes these** for implementation. The v4 pack remains the historical home of the original §19/§29/§39 prompt text; do not paste it — it carries sub-bar role framing and lacks the v5 roster, skills, subagents and standards. The v4 correction that Apple Vision Pro's public ARKit `ObjectTrackingProvider` tracks trained reference objects without exposing raw camera frames is retained in v5.

## Five screens only

`/` Showcase · `/native` Native Workspace · `/hybrid` Mixed Rive Workspace · `/game` Game Layout · `/immersive` Viro/Three world. The **raised Scan button** opens Camera Lab as an overlay, not a sixth screen. Headset scanning uses **real authorized sensing or explicit unavailability**; no simulated XR feeds.

## Implementation status

**This ZIP is the consolidated design/engineering documentation package. It does not contain an implemented or forked source repository.** It contains plans, illustrative API examples, documentation, review gates, the agent program (roster, skills, subagents, prompt) and references to the existing source repositories. A coding agent/engineering team should fork NYC-Mon, remove app IP/backend-specific pieces, port the relevant Moyo/`viro-external` foundations, implement the five screens, run compatible npm upgrades and device validation, then publish the starter.

### Primary source repositories

- [NYC-Mon](https://github.com/mikevocalz/nyc-mon) — source of the starter's technical structure.
- [Moyo Learn](https://github.com/mikevocalz/moyolearn) — proven adaptive rail, inspector, reserved-regions/fold patterns.
- [Viro External](https://github.com/mikevocalz/viro-external) — XR platform contracts/Meta layout/Rive native host interfaces.
- [Kinetrell](https://github.com/mikevocalz/Kinetrell) — cross-platform motion language and native/web adapters.
- [Margelo react-native-skills](https://github.com/margelo/react-native-skills) — `api-design`, `build-nitro-modules`, `cpp`, `swift`, `kotlin`, `react-native-vision-camera`.
- [Callstack agent-skills](https://github.com/callstackincubator/agent-skills) — `react-native-best-practices` and the upgrade/CI skills.
- [WorldFlowAI everything-claude-code](https://github.com/WorldFlowAI/everything-claude-code) — orchestration, TDD, review commands.
- [no-ai-slop](https://github.com/petergyang/no-ai-slop) — the per-PR slop audit.

---

*Documentation bundle assembled October 8, 2026 (v5). Feature and platform claims are implementation targets unless explicitly identified as tested in a source repository. `ZIP_MANIFEST.sha256` provides checksums for included files.*
