import type { Metadata } from 'next';
import { HybridScreen } from '@acme/app';

export const metadata: Metadata = { title: 'Hybrid Rive' };

export default function Page() {
  return <HybridScreen />;
}
