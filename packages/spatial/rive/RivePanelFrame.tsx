'use client';

import type { ReactNode } from 'react';
import { Text, View } from '@acme/ui/tw';
import type { RivePanelStatus } from './RivePanel.types';

/** Ink ground every authored artboard fills itself with (#16130F), so the pane shows no seam around the canvas. */
const RIVE_GROUND = '#16130F';

/**
 * The box both RivePanel forks render into: fixed aspect ratio, ink ground that
 * matches the artboards, and the loading or error copy laid over the canvas.
 * The canvas stays mounted underneath so a status change never remounts it.
 */
export function RivePanelFrame({
  status,
  label,
  aspectRatio,
  className,
  children,
}: {
  status: RivePanelStatus;
  label: string;
  aspectRatio: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <View
      role="img"
      aria-label={label}
      aria-busy={status.kind === 'loading'}
      className={`w-full overflow-hidden rounded-2xl ${className ?? ''}`}
      style={{ aspectRatio, backgroundColor: RIVE_GROUND }}
    >
      {children}
      {status.kind === 'ready' ? null : (
        <View className="absolute inset-0 items-center justify-center gap-2 p-6" style={{ backgroundColor: RIVE_GROUND }}>
          {status.kind === 'loading' ? (
            <Text className="text-center text-base text-silver-300">Loading artwork</Text>
          ) : (
            <>
              <Text className="text-center font-display text-lg text-silver-50">The artwork did not load</Text>
              <Text className="max-w-md text-center text-sm leading-6 text-silver-300">{status.message}</Text>
            </>
          )}
        </View>
      )}
    </View>
  );
}
