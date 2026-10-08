'use client';

import { Link } from 'solito/link';
import { ScrollView, Text, View } from '@acme/ui/tw';

const DEMOS = [
  { href: '/native', title: 'Native Workspace', layout: 'Standard layout', line: 'Search a list, open a detail, pull out an inspector. All native controls.' },
  { href: '/hybrid', title: 'Hybrid Rive', layout: 'Standard layout', line: 'Native controls drive an authored Rive artboard in the centre pane.' },
  { href: '/game', title: 'Game Workspace', layout: 'Game layout', line: 'A 30-second catch game: controls, a central stage and a live HUD.' },
  { href: '/immersive', title: 'Immersive Workspace', layout: 'Game layout', line: 'One object on an orbit, rendered by Viro on headsets and in the browser.' },
] as const;

export function ShowcaseScreen() {
  return (
    <ScrollView className="flex-1 bg-ink-950" contentContainerClassName="mx-auto w-full max-w-screen-xl gap-12 px-4 py-12 md:px-8 md:py-20">
      <View className="max-w-3xl gap-5">
        <Text role="heading" aria-level={1} className="font-display text-5xl leading-tight text-silver-50 md:text-7xl">
          Five screens, two layouts, every surface.
        </Text>
        <Text className="text-lg leading-8 text-silver-300">
          A reference app for Expo, Next.js, Rive and Viro. Each demo below runs offline and shows one way to compose native
          UI, authored animation and 3D space.
        </Text>
      </View>
      <View role="list" className="border-t border-ink-800">
        {DEMOS.map((demo) => (
          <View role="listitem" key={demo.href} className="border-b border-ink-800">
            <Link href={demo.href}>
              <View className="gap-2 py-6 hover:bg-ink-900 md:flex-row md:items-baseline md:gap-8 md:px-4 md:py-8">
                <Text className="font-display text-2xl text-silver-50 md:w-80">{demo.title}</Text>
                <Text className="text-sm text-royal-300 md:w-36">{demo.layout}</Text>
                <Text className="flex-1 text-base leading-7 text-silver-300">{demo.line}</Text>
              </View>
            </Link>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
