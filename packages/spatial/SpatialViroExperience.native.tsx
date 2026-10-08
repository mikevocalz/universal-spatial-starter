'use client';

import type { ComponentType } from 'react';
import { View } from '@acme/ui/tw';
import { isMetaHorizonXR, isPico, Viro3DSceneNavigator, ViroXRSceneNavigator } from './viro';
import { OrbitLabScene } from './OrbitLabScene';

type HeadsetNavigatorProps = {
  initialScene?: { scene: ComponentType<any> };
  vrInitialScene?: { scene: ComponentType<any> };
  vrModeEnabled?: boolean;
  passthroughEnabled?: boolean;
  handTrackingEnabled?: boolean;
  trackingOrigin?: 'eye' | 'floor';
  onExitViro?: () => void;
  style?: Record<string, unknown>;
};

const HeadsetNavigator =
  ViroXRSceneNavigator as unknown as ComponentType<HeadsetNavigatorProps>;

/**
 * Inline Orbit Lab view. On Quest the XR navigator hands the scene to Viro's VR
 * activity. PICO never reaches here for immersion: stock Viro sends PICO down
 * its AR path, so PICO enters through expo-pico's enterImmersiveScene() with
 * the scene registered in apps/mobile/index.js. Phones and PICO's 2D panel
 * get the flat preview.
 */
export function SpatialViroExperience({ onExit }: { onExit?: () => void } = {}) {
  if (isMetaHorizonXR && !isPico) {
    return (
      <HeadsetNavigator
        initialScene={{ scene: OrbitLabScene }}
        vrInitialScene={{ scene: OrbitLabScene }}
        vrModeEnabled
        passthroughEnabled={false}
        handTrackingEnabled
        trackingOrigin="floor"
        onExitViro={onExit}
        // Navigator host props are a style object, not a className target.
        style={{ flex: 1 }}
      />
    );
  }

  return (
    <View className="relative flex-1">
      <Viro3DSceneNavigator
        initialScene={{ scene: OrbitLabScene as never }}
        onExitViro={onExit}
        // Navigator host props are a style object, not a className target.
        style={{ flex: 1 }}
      />
    </View>
  );
}
