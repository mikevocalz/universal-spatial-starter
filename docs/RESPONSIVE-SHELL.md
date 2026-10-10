# Responsive shell contract

## Navigation

Web uses a persistent brand header with destination links from 768px upward and a menu below that. Phone-width web (under 600px) additionally shows bottom tabs. **Web never shows a side rail**, including wide browsers and browsers reporting window segments.

Native ordinary phones use bottom tabs. Native tablets, every foldable posture (including a closed cover), and headsets keep a physical right rail. RTL does not move that rail. Use stable hardware capability rather than only the current width or active hinge. Android reads hinge-sensor/supported-posture capability. UIKit includes inactive division regions, and observed fold identity is retained. Duo's actual right hardware-column width replaces the normal rail width; the inset is consumed once. The navigation group is vertically centered.

The header is outside the scrolling route content. The small-screen menu dismisses on selection, explicit close, Escape on web, and Android back.

## Content and inspectors

Editorial content fills the available compact width and caps at `max-w-4xl` when wide. Showcase cards measure their own available width before switching to two columns. `EditorialCard` provides a reusable 60% media-left / 40% text-right recipe without product-specific data.

Native Workspace measures its content row. At 600dp and above it keeps a 40/60 list/detail split; below that, the selected detail fills the row with a back action. The inspector is an absolute right overlay at 30% of the complete content row. Opening or closing it never changes the main columns' geometry. Compact flat windows use a sheet. This is the workspace screen's recipe, not a mandatory override of all adaptive-pane consumers.

Hybrid, Game and Immersive measure their available row width before placing controls beside the stage; narrower containers stack full-width panels. Game and Orbit preview frames are square at every width, and authored Rive artboard ratios are retained. Gallery close and navigation controls must clear native safe areas, and carousel navigation hit targets must not overlap close.

## Spatial boundaries and startup

The starter's established Quest app window remains **1280×800dp**, `orientation: 'default'`, with `expo-horizon-core`. Keep app-window dimensions independent of Viro scene object dimensions and placement. Merge platform manifest metadata and verify generated variants after plugin edits.

Orbit Lab registers materials/animations only after mounting with an available renderer. Builds without Viro's native managers show a renderer-unavailable message instead of attempting the navigator. React render state uses per-instance Zustand stores; native resources stay in refs.

## Validation recorded 2026-10-10

- 220 UI tests and 8 app tests pass, including native device-family rules, web rail exclusion, and workspace proportions.
- App, UI, spatial and mobile TypeScript checks pass. Changed app/UI/spatial sources lint without errors.
- Android `:reserved-regions:compileDebugKotlin` passes.
- `node tooling/verify-spatial-android.mjs` passes for mobile, Quest and PICO flavor configuration.
- Chromium checked at 390×844 and 1440×1000: mobile menu opens and selecting Hybrid closes it and navigates; mobile bottom tabs remain visible. Desktop has header links, no rail, and no horizontal overflow. Header navigation to Native and Immersive works.
- Responsive browser matrix: all five routes checked at 320, 390, 600, 768, 1024 and 1440 CSS pixels (30 combinations), without horizontal overflow. Game and Orbit stage aspect ratios remain 1.0 throughout; the open Orbit canvas fills the 576px square frame with a 574px square drawing area inside its border. Tests used a separate offscreen frame and restored normal preview resizing.
- Orbit Lab opens a rendered blue cube in the browser and its close button returns to the placeholder.
- Inspector open/close checked in Chromium: list/detail widths remained 339.1953/508.7969 CSS pixels; inspector width was 254.3984 (30% of the 848px content row, within browser rounding).

Native headset/simulator UI was not validated for this starter in this pass. Quest was disconnected. Native command preflight is blocked by the missing private Nitro Rive GPU bridge (`nitro-canvas-in-Vision`); the local neighboring checkout does not expose the GPU bridge signatures this starter requires. No claim of complete headset build/runtime validation follows from the Kotlin module compile or browser checks.
