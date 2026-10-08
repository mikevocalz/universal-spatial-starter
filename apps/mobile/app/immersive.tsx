import { ImmersiveScreen } from '@acme/app';
import { enterImmersive } from '../src/xr/enter-immersive';

export default function ImmersiveRoute() {
  return <ImmersiveScreen enterImmersive={enterImmersive} />;
}
