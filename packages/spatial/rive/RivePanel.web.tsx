'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alignment,
  Fit,
  Layout,
  RuntimeLoader,
  useRive,
  useViewModel,
  useViewModelInstance,
  type ViewModelInstance,
} from '@rive-app/react-webgl2';
import type { RivePanelContract, RivePanelProps, RivePanelStatus, RivePropertyKind } from './RivePanel.types';
import { RivePanelFrame } from './RivePanelFrame';

// The runtime wasm is served from apps/web/public/rive (copied at install by
// tooling/copy-rive-web-runtime.mjs), so the Rive panes work offline.
RuntimeLoader.setWasmUrl('/rive/rive.wasm');
RuntimeLoader.setWasmFallbackUrl(null);

type Writable = number | boolean | string;

/** The instance's handle for one property, or null when the view model has no such property of that kind. */
function propertyOf(instance: ViewModelInstance, name: string, kind: RivePropertyKind) {
  switch (kind) {
    case 'number':
      return instance.number(name);
    case 'boolean':
      return instance.boolean(name);
    case 'enum':
      return instance.enum(name);
    case 'string':
      return instance.string(name);
    case 'trigger':
      return instance.trigger(name);
  }
}

/**
 * Web fork of {@linkcode RivePanel}: `@rive-app/react-webgl2` `useRive` plus
 * `useViewModel` / `useViewModelInstance`, binding the named view model's default
 * instance to the artboard's state machine. `values` are written straight into
 * that instance whenever they change; the canvas is created once per `source`.
 */
export function RivePanel<C extends RivePanelContract>({ source, contract, values, triggers, label, aspectRatio, className }: RivePanelProps<C>) {
  const [failure, setFailure] = useState<string | null>(null);
  const src = String(source);
  const { rive, RiveComponent } = useRive({
    src,
    artboard: contract.artboard,
    stateMachines: contract.stateMachine,
    autoplay: true,
    autoBind: false,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    onLoadError: () => setFailure(`${src} could not be fetched or parsed. Rebuild it with pnpm rive:build.`),
  });
  const viewModel = useViewModel(rive, { name: contract.viewModel });
  const instance = useViewModelInstance(viewModel, { useDefault: true, rive });

  // A loaded file that does not match the contract is a build mismatch, not a loading state.
  const mismatch = useMemo(() => {
    if (!rive) return null;
    if (!rive.viewModelByName(contract.viewModel)) return `${src} has no view model named ${contract.viewModel}.`;
    if (!instance) return null;
    const missing = Object.entries(contract.properties).filter(([name, kind]) => !propertyOf(instance, name, kind));
    return missing.length > 0 ? `${contract.viewModel} in ${src} has no ${missing.map(([n, k]) => `${k} ${n}`).join(', ')}.` : null;
  }, [rive, instance, contract, src]);

  useEffect(() => {
    if (!instance || mismatch) return;
    for (const [name, kind] of Object.entries(contract.properties)) {
      const value = (values as Record<string, Writable>)[name];
      if (kind === 'trigger' || value === undefined) continue;
      const property = propertyOf(instance, name, kind) as { value: Writable } | null;
      if (property && property.value !== value) property.value = value;
    }
  });

  // Trigger listeners subscribe once per instance; the latest callbacks are read through a ref.
  const triggersRef = useRef(triggers);
  useEffect(() => {
    triggersRef.current = triggers;
  });
  useEffect(() => {
    if (!instance) return;
    const offs: (() => void)[] = [];
    for (const [name, kind] of Object.entries(contract.properties)) {
      if (kind !== 'trigger') continue;
      const property = instance.trigger(name);
      if (!property) continue;
      const onFire = () => (triggersRef.current as Record<string, (() => void) | undefined> | undefined)?.[name]?.();
      property.on(onFire);
      offs.push(() => property.off(onFire));
    }
    return () => offs.forEach((off) => off());
  }, [instance, contract]);

  const problem = failure ?? mismatch;
  const status: RivePanelStatus = problem ? { kind: 'error', message: problem } : instance ? { kind: 'ready' } : { kind: 'loading' };

  return (
    <RivePanelFrame status={status} label={label} aspectRatio={aspectRatio} className={className}>
      <RiveComponent aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
    </RivePanelFrame>
  );
}
