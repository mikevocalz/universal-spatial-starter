'use client';

import type { ReactNode } from 'react';
import { Platform } from 'react-native';
import { Link } from 'solito/link';
import { usePathname } from 'solito/navigation';
import { CameraLab } from '@acme/camera';
import { SafeArea } from '@acme/ui';
import { Nav, Pressable, Text, View } from '@acme/ui/tw';
import { useCameraLabStore } from '../state';

const DESTINATIONS = [
  { href: '/', label: 'Showcase', short: 'Home' },
  { href: '/native', label: 'Native', short: 'Native' },
  { href: '/hybrid', label: 'Hybrid', short: 'Hybrid' },
  { href: '/game', label: 'Game', short: 'Game' },
  { href: '/immersive', label: 'Immersive', short: '3D' },
] as const;

function Destination({ href, label, short, active, compact = false }: { href: string; label: string; short: string; active: boolean; compact?: boolean }) {
  const link = (
    <Link href={href}>
      <View
        aria-current={active ? 'page' : undefined}
        aria-label={label}
        className={`min-h-12 items-center justify-center rounded-xl ${compact ? 'px-0' : 'px-3'} ${active ? 'bg-ink-800' : 'hover:bg-ink-900'}`}
      >
        <Text numberOfLines={1} className={`${compact ? 'whitespace-nowrap text-xs' : 'text-sm'} ${active ? 'font-semibold text-silver-50' : 'text-silver-400'}`}>
          {compact ? short : label}
        </Text>
      </View>
    </Link>
  );
  // The dock shares its width evenly; the rail sizes each item to its label.
  return compact ? <View className="min-w-0 flex-1">{link}</View> : link;
}

function ScanButton({ raised }: { raised: boolean }) {
  const setOpen = useCameraLabStore((s) => s.setOpen);
  return (
    <Pressable
      role="button"
      aria-label="Scan with Camera Lab"
      onPress={() => setOpen(true)}
      className={`items-center justify-center rounded-full bg-royal-500 active:bg-royal-600 focus-visible:outline-2 focus-visible:outline-silver-50 ${
        raised ? '-mt-8 h-[72px] w-[72px] shrink-0 border-4 border-ink-950' : 'min-h-12 px-5'
      }`}
    >
      <Text className="text-sm font-semibold text-silver-50">Scan</Text>
    </Pressable>
  );
}

/** Camera Lab is native-only, so the web build shows no Scan action. */
const HAS_CAMERA = Platform.OS !== 'web';

/**
 * Navigation for the five screens plus the Camera Lab overlay. Compact widths
 * get a bottom dock with the raised Scan action in the middle; from 1024 wide
 * the destinations move to a leading rail with Scan at its foot.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/';
  const open = useCameraLabStore((s) => s.open);
  const setOpen = useCameraLabStore((s) => s.setOpen);
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  const [first, ...rest] = DESTINATIONS;
  const left = [first, rest[0], rest[1]];
  const right = [rest[2], rest[3]];

  return (
    <SafeArea edges={['top', 'bottom']} className="min-h-0 flex-1 bg-ink-950 lg:flex-row">
      <Nav aria-label="Demos" className="hidden w-44 gap-1 border-r border-ink-800 p-4 lg:flex">
        {DESTINATIONS.map((d) => (
          <Destination key={d.href} {...d} active={isActive(d.href)} />
        ))}
        {HAS_CAMERA ? (
          <View className="mt-auto">
            <ScanButton raised={false} />
          </View>
        ) : null}
      </Nav>
      <View className="min-h-0 flex-1">{children}</View>
      <Nav aria-label="Demos" className="flex-row items-center border-t border-ink-800 bg-ink-950 px-1 pb-2 lg:hidden">
        {left.map((d) => (
          <Destination key={d.href} {...d} active={isActive(d.href)} compact />
        ))}
        {HAS_CAMERA ? <ScanButton raised /> : null}
        {right.map((d) => (
          <Destination key={d.href} {...d} active={isActive(d.href)} compact />
        ))}
      </Nav>
      {HAS_CAMERA ? <CameraLab open={open} onClose={() => setOpen(false)} /> : null}
    </SafeArea>
  );
}
