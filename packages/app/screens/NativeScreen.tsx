'use client';

import { BottomSheet, useLayoutSize } from '@acme/ui';
import { resolveWorkspaceLayout } from './workspace-layout';
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
  const { size, onLayout } = useLayoutSize();
  const layout = resolveWorkspaceLayout(size.width);
  const wide = layout.split;
  const { query, selectedId, inspectorOpen, setQuery, select, toggleInspector } = useWorkspaceStore();
  const needle = query.trim().toLowerCase();
  const rows = needle ? SURFACES.filter((s) => `${s.name} ${s.placement} ${s.ui}`.toLowerCase().includes(needle)) : SURFACES;
  const selected = SURFACES.find((s) => s.id === selectedId) ?? null;

  const list = (
    <Panel label="Surfaces" className="flex-1">
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search surfaces"
        aria-label="Search surfaces"
        className="min-h-12 border border-ink-600 bg-ink-950 px-4 text-base text-silver-50 placeholder:text-silver-500 focus:border-royal-400"
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
              className={`min-h-14 justify-center border-l-2 px-4 ${s.id === selectedId ? 'border-royal-400 bg-royal-500/20' : 'border-transparent active:bg-ink-800 hover:bg-ink-800'}`}
            >
              <Text className={`text-base ${s.id === selectedId ? 'font-semibold text-silver-50' : 'text-silver-300'}`}>{s.name}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </Panel>
  );

  const detail = selected ? (
    <Panel label={selected.name} className="flex-1">
      <View className={wide ? 'hidden' : ''}>
        <ActionButton tone="quiet" label="Back to surfaces" onPress={() => select(null)} />
      </View>
      <View className="gap-3 border-b border-ink-800 pb-5">
        <Text className="text-xs font-semibold uppercase tracking-[0.18em] text-royal-300">Selected surface</Text>
        <Text role="heading" aria-level={2} className="font-display text-3xl text-silver-50 md:text-4xl">{selected.name}</Text>
        <Text className="text-base leading-7 text-silver-300">{selected.placement}.</Text>
      </View>
      <View className="flex-row gap-3">
        <View className="flex-1 border border-ink-700 bg-ink-950 p-4">
          <Text className="text-xs uppercase tracking-[0.14em] text-silver-500">Layout</Text>
          <Text className="mt-2 text-sm font-semibold text-silver-100">Adaptive</Text>
        </View>
        <View className="flex-1 border border-ink-700 bg-ink-950 p-4">
          <Text className="text-xs uppercase tracking-[0.14em] text-silver-500">Status</Text>
          <Text className="mt-2 text-sm font-semibold text-carolina-300">Configured</Text>
        </View>
      </View>
      <ActionButton tone="quiet" label={inspectorOpen ? 'Hide inspector' : 'Show inspector'} onPress={toggleInspector} />
    </Panel>
  ) : (
    <Panel label="Detail" className="flex-1">
      <Text className="text-base text-silver-300">Pick a surface to see where each layout family lands on it.</Text>
    </Panel>
  );

  const inspectorBody = selected ? (
    <>
        <Text className="text-sm text-royal-300">Renderer</Text>
        <Text className="text-base text-silver-50">{selected.ui}</Text>
        <Text className="text-sm text-royal-300">Hardware status</Text>
        <Text className="text-base text-silver-50">Not verified on a device yet</Text>
    </>
  ) : null;

  // Overlay width is relative to this workspace, never the app window or the detail pane.
  // The underlying 40/60 columns retain exactly the same geometry when it opens.
  const showInspector = selected != null && inspectorOpen;
  const inspector = !showInspector ? null : wide ? (
    <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: layout.inspectorWidth, zIndex: 10 }}>
      <Panel label="Inspector" className="flex-1 border-royal-400 bg-ink-950">
        <ActionButton tone="quiet" label="Close inspector" onPress={toggleInspector} />
        {inspectorBody}
      </Panel>
    </View>
  ) : (
    <BottomSheet open onClose={toggleInspector} closeLabel="Close inspector" title="Inspector" tone="royal">
      <View className="gap-4 pb-4">{inspectorBody}</View>
    </BottomSheet>
  );

  return (
    <ScreenFrame title="Native Workspace" purpose="A 40/60 workspace with a 30% inspector overlay. Compact windows show one full-width pane.">
      <View onLayout={onLayout} className="relative min-w-0">
        <View className="flex-row items-stretch">
          {wide || !selected ? <View style={{ width: wide ? layout.listWidth : '100%', paddingRight: wide ? 8 : 0 }}>{list}</View> : null}
          {wide || selected ? <View style={{ width: wide ? layout.detailWidth : '100%', paddingLeft: wide ? 8 : 0 }}>{detail}</View> : null}
        </View>
        {inspector}
      </View>
    </ScreenFrame>
  );
}
