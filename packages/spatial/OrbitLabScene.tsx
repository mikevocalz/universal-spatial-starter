'use client';

import { useState } from 'react';
import { palette } from '@acme/theme';
import { ViroAmbientLight, ViroAnimations, ViroBox, ViroDirectionalLight, ViroMaterials, ViroNode, ViroScene } from './viro';

/**
 * Orbit Lab: one object on a slow orbit in front of the viewer. Tapping or
 * clicking it cycles its material. The same module runs on web (Viro Web
 * Renderer), phone previews, Quest (Viro XR navigator) and PICO
 * (registerImmersiveScene in apps/mobile/index.js).
 */

const MATERIALS = ['orbitCobalt', 'orbitMineral', 'orbitInk'] as const;

ViroMaterials.createMaterials({
  orbitCobalt: { diffuseColor: palette.royal[500], lightingModel: 'Lambert' },
  orbitMineral: { diffuseColor: palette.silver[100], lightingModel: 'Lambert' },
  orbitInk: { diffuseColor: palette.ink[700], lightingModel: 'Lambert' },
  spatialDark: { diffuseColor: palette.ink[950], lightingModel: 'Constant' },
});

ViroAnimations.registerAnimations({
  orbitLabSpin: { properties: { rotateY: '+=360' }, duration: 12000, easing: 'Linear' },
});

export function OrbitLabScene() {
  const [material, setMaterial] = useState(0);

  return (
    <ViroScene>
      <ViroAmbientLight color="#ffffff" intensity={300} />
      <ViroDirectionalLight color="#ffffff" direction={[0, -1, -0.4]} />
      {/* The parent node spins, so the offset child traces the orbit. */}
      <ViroNode position={[0, 0, -2.5]} animation={{ name: 'orbitLabSpin', run: true, loop: true }}>
        <ViroBox
          position={[0.8, 0, 0]}
          scale={[0.35, 0.35, 0.35]}
          materials={[MATERIALS[material]!]}
          onClick={() => setMaterial((m) => (m + 1) % MATERIALS.length)}
        />
      </ViroNode>
    </ViroScene>
  );
}
