'use client';

import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from '@acme/ui/tw';

export function ScreenFrame({ title, purpose, children }: { title: string; purpose: string; children: ReactNode }) {
  return (
    <ScrollView
      className="flex-1 bg-ink-950"
      contentContainerClassName="relative mx-auto w-full max-w-4xl gap-8 overflow-hidden px-4 py-7 md:px-6 md:py-10"
    >
      <View aria-hidden className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-royal-500/10" />
      <View aria-hidden className="absolute right-24 top-12 h-40 w-40 rounded-full bg-carolina-400/5" />
      <View className="gap-5 border-b border-ink-800/80 pb-7 md:items-start">
        <View className="min-w-0 max-w-3xl flex-1 gap-3">
          <Text className="text-xs font-semibold uppercase tracking-[0.24em] text-royal-300">Spatial systems lab</Text>
          <Text role="heading" aria-level={1} className="font-display text-4xl leading-tight text-silver-50 md:text-6xl">
            {title}
          </Text>
          <Text className="max-w-2xl text-base leading-7 text-silver-300 md:text-lg md:leading-8">{purpose}</Text>
        </View>
        <View className="self-start border border-ink-700 bg-ink-900/80 px-3 py-2 shadow-card">
          <Text className="text-xs font-medium uppercase tracking-[0.18em] text-silver-400">Live workspace</Text>
        </View>
      </View>
      {children}
    </ScrollView>
  );
}

export function Panel({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <View role="region" aria-label={label} className={`overflow-hidden border border-ink-700/80 bg-ink-900/90 shadow-card ${className}`}>
      <View className="flex-row items-center gap-3 border-b border-ink-800 px-5 py-4">
        <View aria-hidden className="h-2 w-2 bg-royal-400 shadow-glow-royal" />
        <Text className="text-xs font-semibold uppercase tracking-[0.18em] text-silver-300">{label}</Text>
      </View>
      <View className="gap-5 p-5 md:p-6">{children}</View>
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
      className={`min-h-12 items-center justify-center border px-6 shadow-card transition-colors focus-visible:outline-2 focus-visible:outline-royal-300 ${
        tone === 'solid'
          ? 'border-royal-400 bg-royal-500 active:bg-royal-600 hover:bg-royal-400'
          : 'border-ink-600 bg-ink-900 active:bg-ink-800 hover:border-royal-500 hover:bg-ink-800'
      } ${disabled ? 'opacity-40' : ''}`}
    >
      <Text className={`text-sm font-semibold uppercase tracking-[0.12em] ${tone === 'solid' ? 'text-silver-50' : 'text-silver-200'}`}>
        {label}
      </Text>
    </Pressable>
  );
}
