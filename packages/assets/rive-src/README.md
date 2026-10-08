# Rive sources

Each folder here is a Rive CLI project (`rive.yaml` plus `scene.rml`) that compiles to one `.riv`. The markup is the source of truth. Nothing in these files was drawn in the Rive editor.

| Project | Artboard | State machine | View model |
| --- | --- | --- | --- |
| `signal-studio` | `SignalStudio` | `Signal` | `SignalStudio { mode: calm \| pulse \| burst, intensity: 0-100, playing }` |
| `pulse-catch` | `PulseCatch` | `Pulse` | `PulseCatch { phase: 0-1, bandFrom, bandTo, status: ready \| running \| paused \| over, score }` |
| `game-hud` | `GameHud` | `Hud` | `GameHud { score, misses, secondsLeft }` |
| `game-controls` | `GameControls` | `Controls` | `GameControls { status: ready \| running \| paused \| over, press: trigger }` |

The app reads these names from `packages/assets/rive/contract.ts`. Rename something here and the contract has to change with it.

## Rebuild

You need the `rive` CLI on your PATH (`curl -fsSL https://releases.rive.app/cli/install.sh | sh`). No login is needed.

```bash
pnpm rive:build    # rive <dir> --once for every project, then copy the output
pnpm verify:rive   # check the output against contract.ts
```

`rive:build` refuses to build a project whose `rive inspect` report lists problems. For each project it writes:

- `packages/assets/rive/<name>.riv`, which native code loads with `require()`
- `apps/web/public/rive/<name>.riv`, the same bytes, served at `/rive/<name>.riv`
- an entry in `packages/assets/rive/manifest.json` with the sha256, artboards, state machines and view model properties

Commit all three. CI has no Rive CLI, so it runs `pnpm verify:rive` against the committed bytes and manifest. Run locally with the CLI installed, the same command also re-inspects these sources and fails if the manifest is out of date.

## Editing

Check every change three ways before rebuilding:

```bash
rive packages/assets/rive-src/pulse-catch --verify
rive inspect packages/assets/rive-src/pulse-catch --summary   # "problems" must be []
rive packages/assets/rive-src/pulse-catch --screenshot=out.png --advance=30 --data=status=over --data=score=12
```

Screenshots take `--data=<property>=<value>`. A bind is only proven once two different values produce two different pictures. `rive docs` covers the format.

Rules these files follow:

- No Luau. Unsigned scripts are rejected by the web runtime, and these files are built unsigned.
- The art draws what the app tells it and keeps no state of its own. Pulse Catch scoring lives in `packages/app/game/pulse-catch.ts`. The only value going the other way is the `press` trigger on `game-controls`, and the app decides what a press means.
- Palette: ink `#16130F`, mineral white `#F4F1EA`, cobalt `#0047FF`. No gradients, no glow.
- Text uses Space Grotesk from `../../fonts/`, so a font change shows up in every artboard that has text.

`signal-studio`'s ring keyframes are linear in `t = ((frame - offset) mod period) / period`: diameter `28 + 312t`, opacity `0.95(1 - t)`. The comment at the top of its `scene.rml` repeats this, so new rings can be keyed by hand.
