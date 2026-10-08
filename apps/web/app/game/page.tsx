import type { Metadata } from 'next';
import { GameScreen } from '@acme/app';

export const metadata: Metadata = { title: 'Game Workspace' };

export default function Page() {
  return <GameScreen />;
}
