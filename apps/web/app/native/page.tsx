import type { Metadata } from 'next';
import { NativeScreen } from '@acme/app';

export const metadata: Metadata = { title: 'Native Workspace' };

export default function Page() {
  return <NativeScreen />;
}
