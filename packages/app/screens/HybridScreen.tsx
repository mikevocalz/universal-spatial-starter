'use client';

import { riveContract, riveFiles } from '@acme/assets/rive';
import { RivePanel } from '@acme/spatial';
import { SegmentedControl, Slider, Switch, useLayoutSize, useReducedMotion } from '@acme/ui';
import { Text, View } from '@acme/ui/tw';
import { useSignalStore, type SignalMode } from '../state';
import { Panel, ScreenFrame } from './parts';

const MODES = [
  { value: 'calm', label: 'Calm' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'burst', label: 'Burst' },
] as const satisfies readonly { value: SignalMode; label: string }[];

const MODE_COPY: Record<SignalMode, string> = {
  calm: 'one slow ring',
  pulse: 'three rings',
  burst: 'five fast rings',
};

export function HybridScreen() {
  const { size, onLayout } = useLayoutSize();
  const split = size.width >= 640;
  const { mode, intensity, playing, setMode, setIntensity, setPlaying } = useSignalStore();
  const reduceMotion = useReducedMotion();
  // Reduced motion holds the still diagram; mode and intensity still change what it draws.
  const animate = playing && !reduceMotion;

  return (
    <ScreenFrame title="Hybrid Rive" purpose="Native controls write the values a Rive artboard reads in the centre pane.">
      <View onLayout={onLayout} className="gap-4" style={{ flexDirection: split ? 'row' : 'column', alignItems: split ? 'flex-start' : 'stretch' }}>
        <View style={{ width: split ? (size.width - 16) * 0.4 : '100%' }}>
        <Panel label="Signal controls">
          <View className="flex-row gap-3">
            <View className="flex-1 border border-ink-700 bg-ink-950 p-3">
              <Text className="text-xs uppercase tracking-[0.14em] text-silver-500">Mode</Text>
              <Text className="mt-1 font-display text-xl capitalize text-silver-50">{mode}</Text>
            </View>
            <View className="flex-1 border border-ink-700 bg-ink-950 p-3">
              <Text className="text-xs uppercase tracking-[0.14em] text-silver-500">Power</Text>
              <Text className="mt-1 font-display text-xl text-royal-300">{intensity}%</Text>
            </View>
          </View>
          <SegmentedControl tone="royal" aria-label="Mode" options={MODES} value={mode} onChange={setMode} />
          <Slider tone="royal" label="Intensity" value={intensity} min={0} max={100} step={1} onValueChange={setIntensity} />
          <Switch tone="royal" label="Playing" value={playing} onChange={setPlaying} />
          {reduceMotion ? (
            <Text className="text-sm leading-6 text-silver-400">Reduce motion is on, so the rings hold still.</Text>
          ) : null}
        </Panel>
        </View>
        <View style={{ width: split ? (size.width - 16) * 0.6 : '100%' }}>
        <Panel label="Signal studio">
          <RivePanel
            source={riveFiles.signalStudio}
            contract={riveContract.signalStudio}
            values={{ mode, intensity, playing: animate }}
            label={`Signal rings: ${MODE_COPY[mode]} at intensity ${intensity}, ${animate ? 'moving' : 'held still'}.`}
            aspectRatio={640 / 400}
          />
        </Panel>
        </View>
      </View>
    </ScreenFrame>
  );
}
