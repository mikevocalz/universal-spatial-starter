'use client';

import { SegmentedControl, Slider, Switch } from '@acme/ui';
import { Text, View } from '@acme/ui/tw';
import { useSignalStore, type SignalMode } from '../state';
import { Panel, ScreenFrame } from './parts';

const MODES = [
  { value: 'calm', label: 'Calm' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'burst', label: 'Burst' },
] as const satisfies readonly { value: SignalMode; label: string }[];

export function HybridScreen() {
  const { mode, intensity, playing, setMode, setIntensity, setPlaying } = useSignalStore();

  return (
    <ScreenFrame title="Hybrid Rive" purpose="Native controls write the values a Rive artboard reads in the centre pane.">
      <View className="gap-4 md:flex-row md:items-start">
        <Panel label="Signal controls" className="md:w-80">
          <SegmentedControl tone="royal" aria-label="Mode" options={MODES} value={mode} onChange={setMode} />
          <Slider tone="royal" label="Intensity" value={intensity} min={0} max={100} step={1} onValueChange={setIntensity} />
          <Switch tone="royal" label="Playing" value={playing} onChange={setPlaying} />
        </Panel>
        {/* ponytail: signal-studio.riv is not authored yet (PR3). The pane says so instead of faking an animation. */}
        <Panel label="Signal studio" className="min-h-80 flex-1 items-center justify-center">
          <Text className="text-center font-display text-2xl text-silver-50">signal-studio.riv is not bundled yet</Text>
          <Text className="max-w-md text-center text-base leading-7 text-silver-300">
            When the artboard ships, it reads mode {mode}, intensity {intensity} and {playing ? 'playing' : 'paused'} from
            these controls.
          </Text>
        </Panel>
      </View>
    </ScreenFrame>
  );
}
