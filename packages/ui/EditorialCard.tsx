'use client';

import type { ReactNode } from 'react';
import { View } from './tw';

/** Story recipe: media stays physically left (60%), text right (40%), even on a cover. */
export function EditorialCard({ media, children }: { media: ReactNode; children: ReactNode }) {
  return (
    <View className="w-full overflow-hidden border border-ink-700 bg-ink-900" style={{ flexDirection: 'row', direction: 'ltr' }}>
      <View className="relative min-w-0 overflow-hidden" style={{ width: '60%', minHeight: 180 }}>{media}</View>
      <View className="min-w-0 justify-center gap-3 p-3" style={{ width: '40%' }}>{children}</View>
    </View>
  );
}
