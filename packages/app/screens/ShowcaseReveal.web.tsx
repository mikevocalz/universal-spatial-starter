'use client';

import type { ReactNode } from 'react';
import { compileMotion } from 'kinetrell';
import { GsapMotionProvider, Motion } from 'kinetrell/web/react';
import { showcaseReveal } from '../motion';

const compiled = compileMotion(showcaseReveal);

export function ShowcaseReveal({ children }: { children: ReactNode }) {
  return <GsapMotionProvider motion={compiled} reducedMotion="system">{children}</GsapMotionProvider>;
}

export function RevealTarget({ target, children }: { target: string; children: ReactNode }) {
  return <Motion.div target={target}>{children}</Motion.div>;
}
