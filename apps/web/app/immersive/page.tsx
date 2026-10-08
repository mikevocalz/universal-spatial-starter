import type { Metadata } from 'next';
import { ImmersiveScreen } from '@acme/app';

export const metadata: Metadata = { title: 'Immersive Workspace' };

export default function Page() {
  return <ImmersiveScreen />;
}
