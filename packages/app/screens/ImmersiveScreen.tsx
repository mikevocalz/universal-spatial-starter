'use client';

import { getSpatialForkCapabilities, SpatialViroExperience } from '@acme/spatial';
import { Text, View } from '@acme/ui/tw';
import { useOrbitStore } from '../state';
import { ActionButton, Panel, ScreenFrame } from './parts';

export interface ImmersiveScreenProps {
  /**
   * Hands Orbit Lab to a headset's immersive activity. Resolves true when it
   * did (PICO through expo-pico), false to fall back to the inline stage.
   * Only the Expo app passes this.
   */
  enterImmersive?: () => Promise<boolean>;
}

export function ImmersiveScreen({ enterImmersive }: ImmersiveScreenProps = {}) {
  const { open, setOpen } = useOrbitStore();
  const host = getSpatialForkCapabilities();

  return (
    <ScreenFrame title="Immersive Workspace" purpose="One object on an orbit. Tap or click it to change its material.">
      <View className="gap-4 lg:flex-row lg:items-start">
        <Panel label="Orbit Lab" className="lg:w-72">
          <ActionButton
            label={open ? 'Close Orbit Lab' : 'Open Orbit Lab'}
            onPress={async () => {
              if (!open && enterImmersive && (await enterImmersive())) return;
              setOpen(!open);
            }}
          />
          <Text className="text-sm leading-6 text-silver-400">
            {host.metaSpatialWindows ? 'Running in a Meta spatial window.' : 'Running inline. Headsets open their own immersive view.'}
          </Text>
        </Panel>
        <View className="min-h-[460px] flex-1 overflow-hidden rounded-2xl border border-ink-800 bg-ink-900">
          {open ? (
            <SpatialViroExperience onExit={() => setOpen(false)} />
          ) : (
            <View className="flex-1 items-center justify-center p-8">
              <Text className="text-center text-base text-silver-300">Open Orbit Lab to start the 3D stage.</Text>
            </View>
          )}
        </View>
      </View>
    </ScreenFrame>
  );
}
