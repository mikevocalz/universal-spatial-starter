'use client';

import { Pressable, Text, TextInput, View } from '@acme/ui/tw';
import { useWorkspaceStore } from '../state';
import { ActionButton, Panel, ScreenFrame } from './parts';

/** Content mirrors docs/PLATFORMS.md. Every row is a target; none is hardware-verified yet. */
const SURFACES = [
  { id: 'iphone', name: 'iPhone', placement: 'Adaptive panes and native sheets', ui: 'Expo UI, Rive RN' },
  { id: 'android', name: 'Android phone', placement: 'Adaptive panes and a bottom dock', ui: 'Compose through Expo UI, Rive RN' },
  { id: 'ipad', name: 'iPad', placement: 'Sidebar, content and inspector', ui: 'SwiftUI, Rive RN' },
  { id: 'foldable', name: 'Foldable and dual-screen', placement: 'Hinge-aware panes, rail on the right edge', ui: 'Compose, Rive RN' },
  { id: 'web', name: 'Web', placement: 'Responsive panes and inspector', ui: 'React DOM, Rive WebGL2' },
  { id: 'quest', name: 'Meta Quest 3 and 3S', placement: 'Main window plus up to two spatial windows', ui: 'Meta UI Set, Rive native' },
  { id: 'pico', name: 'PICO', placement: 'Window or Viro immersive panels', ui: 'Android native, Rive' },
  { id: 'androidxr', name: 'Android XR', placement: 'Android XR spatial layout', ui: 'Compose for XR, Rive native' },
  { id: 'visionos', name: 'Apple Vision Pro', placement: 'SwiftUI windows and immersive space', ui: 'Rive Apple runtime, visionOS' },
] as const;

export function NativeScreen() {
  const { query, selectedId, inspectorOpen, setQuery, select, toggleInspector } = useWorkspaceStore();
  const needle = query.trim().toLowerCase();
  const rows = needle ? SURFACES.filter((s) => `${s.name} ${s.placement} ${s.ui}`.toLowerCase().includes(needle)) : SURFACES;
  const selected = SURFACES.find((s) => s.id === selectedId) ?? null;

  const list = (
    <Panel label="Surfaces" className={`lg:w-80 ${selected ? 'hidden lg:flex' : ''}`}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search surfaces"
        aria-label="Search surfaces"
        className="min-h-12 rounded-xl bg-ink-800 px-4 text-base text-silver-50 placeholder:text-silver-500"
      />
      {rows.length === 0 ? (
        <Text className="text-base text-silver-300">No surface matches {`"${query}"`}. Clear the search to see all nine.</Text>
      ) : (
        <View role="list" className="gap-1">
          {rows.map((s) => (
            <Pressable
              role="button"
              key={s.id}
              aria-pressed={s.id === selectedId}
              onPress={() => select(s.id)}
              className={`min-h-12 justify-center rounded-xl px-4 ${s.id === selectedId ? 'bg-royal-500' : 'active:bg-ink-800 hover:bg-ink-800'}`}
            >
              <Text className="text-base text-silver-50">{s.name}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </Panel>
  );

  const detail = selected ? (
    <Panel label={selected.name} className="flex-1">
      <View className="lg:hidden">
        <ActionButton tone="quiet" label="Back to surfaces" onPress={() => select(null)} />
      </View>
      <Text role="heading" aria-level={2} className="font-display text-3xl text-silver-50">{selected.name}</Text>
      <Text className="text-base leading-7 text-silver-300">{selected.placement}.</Text>
      <ActionButton tone="quiet" label={inspectorOpen ? 'Hide inspector' : 'Show inspector'} onPress={toggleInspector} />
    </Panel>
  ) : (
    <Panel label="Detail" className="hidden flex-1 lg:flex">
      <Text className="text-base text-silver-300">Pick a surface to see where each layout family lands on it.</Text>
    </Panel>
  );

  const inspector =
    selected && inspectorOpen ? (
      <Panel label="Inspector" className="lg:w-72">
        <Text className="text-sm text-royal-300">Renderer</Text>
        <Text className="text-base text-silver-50">{selected.ui}</Text>
        <Text className="text-sm text-royal-300">Hardware status</Text>
        <Text className="text-base text-silver-50">Not verified on a device yet</Text>
      </Panel>
    ) : null;

  return (
    <ScreenFrame title="Native Workspace" purpose="The standard layout: navigation, content and an inspector, laid out by window width.">
      <View className="gap-4 lg:flex-row lg:items-start">
        {list}
        {detail}
        {inspector}
      </View>
    </ScreenFrame>
  );
}
