import { NativeModules } from 'react-native';

export function isViroAvailable(): boolean {
  return Boolean(NativeModules.VRTMaterialManager && NativeModules.VRTAnimationManager && NativeModules.VRTSceneNavigatorModule);
}
