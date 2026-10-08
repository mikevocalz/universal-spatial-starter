# Mobile, iPhone Duo concepts, Android dual-screen and foldables

> **Status:** porting/design requirements based on the existing [Moyo Learn AdaptivePanes implementation](https://github.com/mikevocalz/moyolearn/tree/main/packages/ui/adaptive-panes). An “iPhone Duo” layout is a **future hardware/design target**, not a claim of a generally available Apple dual-screen device or public hinge API.

[Docs index](README.md) · [Components](COMPONENTS.md) · [Camera](CAMERA_AND_XR.md)

## Compact-phone signature: raised center camera action

A polished bottom navigation dock has two logical destinations per side of a **raised center Scan action**. This is a real camera tool, not an extra route:

```text
       ┌──────┐
       │  ◉   │       Raised camera button (~72dp design target)
┌──────┴──────┴─────────┐
│ Home  Native   Game  XR│  Dock shape adapts to safe areas and orientation
└───────────────────────┘
```

**Behavior:** camera launches an accessible full-screen/modal `CameraLabOverlay`, requests permissions just-in-time, renders authorized real imagery/object anchors and an on-device detector, then tears down the session on close. Use native touch target hit boxes even if the visual circle floats above the dock; account for the home indicator, keyboard and Android gesture inset. A quick haptic, brief Kinetrell elevation, and Rive scan-confirmation are optional feedback. The Scan command must be available through a keyboard/toolbar action too.

**Do not** let a dock appear over camera preview controls if it obstructs Stop, permissions or detection guidance. When camera is open, navigation is disabled or routed through a clear Close/Back interaction; cleanup comes first.

## Width classes and pane policies

Adapt Moyo's five width classes as design policy, not device-brand inference:

| Width class | Minimum dp | Standard layout | Game layout |
| --- | ---: | --- | --- |
| `compact` | 0 | One visible pane; bottom dock | Full-width stage + drawer/sheet controls/HUD |
| `medium` | 600 | Detail + narrow rail where room allows | Stage + optional controls rail |
| `expanded` | 840 | List/detail; contextual inspector | Stage + controls or HUD, inspector overlay |
| `large` | 1200 | Wider list/detail and inspector | Stage + two companion panels if space allows |
| `extraLarge` | 1600 | Expanded navigation and full pane composition | Full three-pane composition |

Window **height** matters too: short landscape and tabletop conditions may require short bottom navigation even when width is expanded. The exact breakpoint values must remain centralized in design tokens and tested; never duplicate the definitions in screens.

## Right rail and inspector

For Android, port the existing Moyo rule: a true phone-width compact window (~under 480dp) uses the bottom dock; a wide dual-screen panel can keep a physical **right-side navigation rail**. Medium/large windows use a rail; extraLarge gets labeled/expanded rail. For ordinary iPads use a logical leading sidebar. An Apple hardware-reserved control column, if actually exposed by a supported OS/device, can take precedence while retaining its physical side.

`AdaptivePanes.Inspector` is a **trailing overlay** when narrow, not a fake fourth tiled column. It opens from the logical trailing edge, respecting RTL; on a separating vertical hinge it is capped to the trailingmost usable display region. Preserve mounted interactive state when hiding, while stopping/pause-rendering expensive GPU surfaces appropriately. Expose an inspector toggle in navigation and a keyboard shortcut on desktop/tablet.

## Fold and hinge safety

Reuse the Moyo Expo Modules v2 `ReservedRegions` approach: Android Jetpack WindowManager `WindowInfoTracker` and every `FoldingFeature`; Apple public reserved occlusion/division information where supported. Normalize units px → dp and preserve every hinge, including a trifold. Don't invent hinge angle (not provided by WindowManager). Test separating vs nonseparating, full occlusion vs none, left/right region, RTL, book/tabletop, and window resize.

For a separating vertical hinge, snap **pane boundaries** to physical hinge lines where the composition remains usable, and reserve any opaque hinge width. For tabletop posture, let the feature screen decide semantic assignment (stage above, controls below for a game; lesson above, form below for productivity). Don't globally rotate every layout.

## iPhone Duo target

Treat this as a **capability-led design exercise** until publicly documented hardware and OS layout APIs establish exact behavior. Any supposed future Apple dual-screen device should use reserved regions when genuinely available; otherwise behave like an ordinary resizable iOS layout. Do not hardcode a nonexistent “Duo” device identifier, pretend UIKit gives Android-like hinge metadata, or report it device verified.

## Behavior continuity requirements

- Selection survives fold/unfold and size-class changes.
- Rive/interactive game state survives relocation of side panels; do not restart the central stage when inspector appears.
- Focus moves to the opened inspector and returns to the action that opened it.
- Search/text input wins Back until dismissed; after that close inspector, then walk back pane history, then exit route.
- Device rotation/keyboard resize must not place tap targets behind hinges or camera cutouts.
- Use Kinetrell for local chrome/scroll/transition choreography, Rive inside artboards; never animate hinge coordinates.
- Camera scanning stops/suspends safely during interruption; real XR sensing is never replaced by simulated content.

## Verification fixtures

Test 390dp iPhone-like compact; 540dp wide single Duo-like panel; 600, 840, 1200 and 1600dp widths; short 420dp-height landscape; Android foldable emulator book/tabletop; physical foldable; dual separating hinges; RTL; large text; system reduced motion; portrait-to-landscape; background/resume. Screenshots are required in every mode, but screenshots alone do not prove native gestures or hardware sensing.

Sources: [Moyo AdaptivePanes](https://github.com/mikevocalz/moyolearn/tree/main/packages/ui/adaptive-panes) · [Moyo adaptive navigation](https://github.com/mikevocalz/moyolearn/blob/main/packages/ui/adaptive-navigation.ts) · [Expo Router Split View](https://docs.expo.dev/versions/latest/sdk/router/split-view/).
