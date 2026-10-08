'use client';

import type { ReactNode } from 'react';
import { Link } from 'solito/link';
import { Pressable, ScrollView, Text, View } from '@acme/ui/tw';

/** Page frame shared by the four demo screens: back to Showcase, title, one-line purpose. */
export function ScreenFrame({ title, purpose, children }: { title: string; purpose: string; children: ReactNode }) {
  return (
    <ScrollView className="flex-1 bg-ink-950" contentContainerClassName="mx-auto w-full max-w-screen-2xl gap-6 px-4 py-6 md:px-8 md:py-10">
      <Link href="/">
        <Text className="text-sm text-royal-300 underline">Showcase</Text>
      </Link>
      <View className="gap-2">
        <Text role="heading" aria-level={1} className="font-display text-4xl text-silver-50 md:text-5xl">
          {title}
        </Text>
        <Text className="max-w-2xl text-base leading-7 text-silver-300">{purpose}</Text>
      </View>
      {children}
    </ScrollView>
  );
}

export function Panel({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <View role="region" aria-label={label} className={`gap-4 rounded-2xl border border-ink-800 bg-ink-900 p-5 ${className}`}>
      {children}
    </View>
  );
}

export function ActionButton({
  label,
  onPress,
  tone = 'solid',
  disabled,
}: {
  label: string;
  onPress: () => void;
  tone?: 'solid' | 'quiet';
  disabled?: boolean;
}) {
  return (
    <Pressable
      role="button"
      aria-label={label}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={onPress}
      className={`min-h-12 items-center justify-center rounded-full px-6 focus-visible:outline-2 focus-visible:outline-royal-300 ${
        tone === 'solid' ? 'bg-royal-500 active:bg-royal-600' : 'border border-ink-700 active:bg-ink-800'
      } ${disabled ? 'opacity-40' : ''}`}
    >
      <Text className={`text-base font-semibold ${tone === 'solid' ? 'text-silver-50' : 'text-silver-200'}`}>{label}</Text>
    </Pressable>
  );
}
