import type { SensingHost } from './lab-machine';

/** The Android `Build` facts React Native exposes on `Platform.constants`. */
export interface AndroidBuildFacts {
  manufacturer: string;
  brand: string;
  model: string;
}

/**
 * Classifies a native host from build facts, without loading Viro.
 *
 * The Quest/PICO rules mirror the vendored Viro fork's classifier
 * (@reactvision/react-viro dist/components/Utilities/ViroXRRuntime.js,
 * `classifyAndroidXRBuild`), which is what `isMetaHorizonXR` / `isPico` in
 * packages/spatial/viro.ts resolve to. @acme/spatial does not export those
 * flags from its index, and importing the Viro runtime here would pull the
 * whole native renderer into the camera package for two booleans.
 */
export function classifyNativeHost(input: {
  os: 'ios' | 'android' | 'other';
  isVision: boolean;
  android?: AndroidBuildFacts;
}): SensingHost {
  if (input.isVision) return 'visionos';
  if (input.os !== 'android' || !input.android) return 'phone';

  const manufacturer = input.android.manufacturer.trim().toLowerCase();
  const brand = input.android.brand.trim().toLowerCase();
  const model = input.android.model.trim().toLowerCase();

  const isPico =
    manufacturer === 'pico' ||
    brand === 'pico' ||
    model === 'a9210' ||
    model === 'a92y0' ||
    model === 'sparrow' ||
    /\bpico\b/.test(model);
  if (isPico) return 'pico';

  const isMetaHorizon =
    manufacturer === 'oculus' || brand === 'oculus' || /\bquest\b/.test(model) || manufacturer === 'meta' || brand === 'meta';
  if (isMetaHorizon) return 'meta-horizon';

  return 'phone';
}
