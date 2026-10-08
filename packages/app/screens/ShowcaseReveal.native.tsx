import { createContext, use, type ReactNode } from 'react';
import { MotionView, useMotion, type NativeMotionHandle } from 'kinetrell/native';
import { showcaseReveal } from '../motion';

const RevealContext = createContext<NativeMotionHandle | null>(null);

export function ShowcaseReveal({ children }: { children: ReactNode }) {
  const motion = useMotion(showcaseReveal, { autoplay: true, reducedMotion: 'system' });
  return <RevealContext value={motion}>{children}</RevealContext>;
}

export function RevealTarget({ target, children }: { target: string; children: ReactNode }) {
  const motion = use(RevealContext);
  if (!motion) throw new Error('RevealTarget must be rendered inside ShowcaseReveal');
  return <MotionView motion={motion} target={target}>{children}</MotionView>;
}
