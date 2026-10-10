import type { Metadata } from 'next';
import { AppShell } from '@acme/app';
import { Document } from './Document';
import './rn-globals';
import './globals.css';

// All five routes are fully static: no request-time server rendering on the
// initial shell, on prefetch, or on client navigation. Adding a dynamic read
// to any route fails the build instead of silently degrading.
export const ensureStatic = 'navigation';

export const metadata: Metadata = {
  title: { default: 'Spatial Starter', template: '%s | Spatial Starter' },
  description: 'Five screens, two layouts: native UI, Rive and Viro on Expo and Next.js.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <Document>
      <AppShell>{children}</AppShell>
    </Document>
  );
}
