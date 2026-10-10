'use client';

import { useEffect } from 'react';
import { useInstanceStore, useStore } from '@acme/ui';
import { isViroAvailable } from './viro-availability';
import { palette } from '@acme/theme';
import { ViroAmbientLight, ViroAnimations, ViroBox, ViroDirectionalLight, ViroMaterials, ViroNode, ViroScene } from './viro';

/**
 * Orbit Lab: one object on a slow orbit in front of the viewer. Tapping or
 * clicking it cycles its material. The same module runs on web (Viro Web
 * Renderer), phone previews, Quest (Viro XR navigator) and PICO
 * (registerImmersiveScene in apps/mobile/index.js).
 */

const MATERIALS = ['orbitCobalt', 'orbitMineral', 'orbitInk'] as const;

let registered = false;
function registerOrbitResources() {
  if (registered) return;
  ViroMaterials.createMaterials({
    orbitCobalt: { diffuseColor: palette.royal[500], lightingModel: 'Lambert' },
    orbitMineral: { diffuseColor: palette.silver[100], lightingModel: 'Lambert' },
    orbitInk: { diffuseColor: palette.ink[700], lightingModel: 'Lambert' },
    spatialDark: { diffuseColor: palette.ink[950], lightingModel: 'Constant' },
  });
  ViroAnimations.registerAnimations({
    orbitLabSpin: { properties: { rotateY: '+=360' }, duration: 12000, easing: 'Linear' },
  });
  registered = true;
}

export function OrbitLabScene() {
  const store = useInstanceStore(() => ({ material: 0, ready: false }));
  const material = useStore(store, (state) => state.material);
  const ready = useStore(store, (state) => state.ready);
  useEffect(() => {
    if (!isViroAvailable()) return;
    registerOrbitResources();
    store.setState({ ready: true });
  }, [store]);
  if (!ready) return <></>;

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
          onClick={() => store.setState((state) => ({ material: (state.material + 1) % MATERIALS.length }))}
        />
      </ViroNode>
    </ViroScene>
  );
}
