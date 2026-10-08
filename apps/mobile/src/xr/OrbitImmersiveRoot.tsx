import { useEffect, useMemo } from 'react';
import { BackHandler } from 'react-native';
import { ViroVRSceneNavigator } from '@reactvision/react-viro';
import { exitImmersiveScene } from '@expo-pico/core';
import { OrbitLabScene } from '@acme/spatial';

/**
 * Root of VRActivity on PICO, registered as "VRQuestScene" in index.js.
 *
 * Hardware back (and controller B, which the overlay routes to onBackPressed)
 * calls exitImmersiveScene(), which finishes VRActivity and returns to the
 * panel. react-viro's exitVRScene() is a no-op without a VRLauncher module.
 */
export function OrbitImmersiveRoot() {
  const initialScene = useMemo(() => ({ scene: OrbitLabScene }), []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      void exitImmersiveScene();
      return true;
    });
    return () => sub.remove();
  }, []);

  // Navigator host props are a style object, not a className target.
  return <ViroVRSceneNavigator initialScene={initialScene} style={{ flex: 1 }} />;
}
