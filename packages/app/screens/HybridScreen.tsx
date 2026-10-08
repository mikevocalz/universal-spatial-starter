'use client';

import { riveContract, riveFiles } from '@acme/assets/rive';
import { RivePanel } from '@acme/spatial';
import { SegmentedControl, Slider, Switch, useReducedMotion } from '@acme/ui';
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
  const { mode, intensity, playing, setMode, setIntensity, setPlaying } = useSignalStore();
  const reduceMotion = useReducedMotion();
  // Reduced motion holds the still diagram; mode and intensity still change what it draws.
  const animate = playing && !reduceMotion;

  return (
    <ScreenFrame title="Hybrid Rive" purpose="Native controls write the values a Rive artboard reads in the centre pane.">
      <View className="gap-4 md:flex-row md:items-start">
        <Panel label="Signal controls" className="md:w-80">
          <SegmentedControl tone="royal" aria-label="Mode" options={MODES} value={mode} onChange={setMode} />
          <Slider tone="royal" label="Intensity" value={intensity} min={0} max={100} step={1} onValueChange={setIntensity} />
          <Switch tone="royal" label="Playing" value={playing} onChange={setPlaying} />
          {reduceMotion ? (
            <Text className="text-sm leading-6 text-silver-400">Reduce motion is on, so the rings hold still.</Text>
          ) : null}
        </Panel>
        <Panel label="Signal studio" className="flex-1">
          <RivePanel
            source={riveFiles.signalStudio}
            contract={riveContract.signalStudio}
            values={{ mode, intensity, playing: animate }}
            label={`Signal rings: ${MODE_COPY[mode]} at intensity ${intensity}, ${animate ? 'moving' : 'held still'}.`}
            aspectRatio={640 / 400}
          />
        </Panel>
      </View>
    </ScreenFrame>
  );
}
