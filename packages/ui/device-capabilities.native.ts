import { useEffect } from 'react';
import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo';
import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import type { DeviceCapabilities } from './device-capabilities.types';

type CapabilityModule = { deviceCapabilities?(): DeviceCapabilities | Promise<DeviceCapabilities> };
const store = createStore(() => ({ capabilities: null as DeviceCapabilities | null }));
let pending: Promise<void> | undefined;

/** Native capability survives an empty FoldingFeature list on the closed cover. */
export function useDeviceCapabilities(): DeviceCapabilities | null {
  const capabilities = useStore(store, (state) => state.capabilities);
  useEffect(() => {
    if (Platform.OS !== 'android' || store.getState().capabilities || pending) return;
    const v2 = (globalThis as typeof globalThis & {
      expoV2?: { modules?: { ReservedRegions?: CapabilityModule } };
    }).expoV2?.modules?.ReservedRegions;
    const native = v2 ?? requireOptionalNativeModule<CapabilityModule>('ReservedRegions');
    if (!native?.deviceCapabilities) return;
    pending = Promise.resolve().then(() => native.deviceCapabilities!()).then((result) => {
      store.setState({ capabilities: result });
    }).finally(() => { pending = undefined; });
    void pending.catch((error: unknown) => console.warn('Could not read device navigation capabilities', error));
  }, []);
  return capabilities;
}
