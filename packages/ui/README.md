# @acme/ui

The starter's UI kit. It lives in `packages/ui` and is published inside the
monorepo as `@acme/ui`. One set of components runs on web (Next.js,
Storybook) and native (Expo), styled with Tailwind 4 through Uniwind, with
Skia and three.js for the charts and the terrain background. Colours come
from `@acme/theme`.

## Import

```tsx
import { Button, Card, TextField } from '@acme/ui';
import { HolographicTerrain } from '@acme/ui/three';
import { View, Text } from '@acme/ui/tw';
```

Other entry points: `@acme/ui/primitives`, `@acme/ui/neon`,
`@acme/ui/elements`, `@acme/ui/progress`, `@acme/ui/gpu`, `@acme/ui/icons`,
`@acme/ui/haptics`. See `package.json` for the full `exports` map.

## Storybook

```sh
pnpm --filter storybook dev
```

Storybook runs on http://localhost:6006. Stories sit next to their components
in this folder. Start at **Foundation** for colours, type and spacing.

## Inspired by NeonBlade UI

Many components here started as ports of
[NeonBlade UI](https://neonbladeui.neuronrush.com) by
[vprix21](https://github.com/vprix21/neonblade-ui), an MIT-licensed set of
neon, sci-fi React components. Thank you, vprix21, for building it and for
releasing it openly.

- **Three.js background.** `HolographicTerrain` is a port of NeonBlade's
  Holographic Terrain: the same three.js scene, camera, fog, lighting and
  pointer response.
- **Shape.** The corner-cut buttons and cards, the notch card geometry, the
  neon colour presets and glow intensities all follow NeonBlade. So does the
  square-by-default look: components have no rounded corners unless asked.
- **Cursors.** The `cursors/` components follow NeonBlade's fox cursor: a
  drawn cursor that chases the pointer, hides the native one, and takes the
  same `hideNativeCursor`, `disabled`, `containerRef` and `glowIntensity`
  props.

The kit reimplements these components for React Native and web; it does not
depend on the NeonBlade package. Most ports keep NeonBlade's prop names, so
its docs still describe how they behave. Credit for the original designs
belongs to NeonBlade.

The per-component list of ports and NeonBlade's MIT licence text are in
[THIRD-PARTY-NOTICES.md](./THIRD-PARTY-NOTICES.md).
