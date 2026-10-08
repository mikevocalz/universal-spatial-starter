import type { Metadata } from 'next';
import { AppShell } from '@acme/app';
import { Document } from './Document';
import './rn-globals';
import './globals.css';

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
