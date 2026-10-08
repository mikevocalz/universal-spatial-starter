'use client';

import { useEffect, useRef, useState } from 'react';
import { Fit, RiveView, useRiveFile, useViewModelInstance, type RiveError, type ViewModelInstance } from '@rive-app/react-native';
import type { RivePanelContract, RivePanelProps, RivePanelStatus, RivePropertyKind } from './RivePanel.types';
import { RivePanelFrame } from './RivePanelFrame';

type Writable = number | boolean | string;
type Setter = { set: (value: never) => void; dispose?: () => void };

/** Property handle for a kind; the Nitro runtime resolves the path lazily. */
function handleFor(instance: ViewModelInstance, name: string, kind: Exclude<RivePropertyKind, 'trigger'>): Setter | undefined {
  switch (kind) {
    case 'number':
      return instance.numberProperty(name);
    case 'boolean':
      return instance.booleanProperty(name);
    case 'enum':
      return instance.enumProperty(name);
    case 'string':
      return instance.stringProperty(name);
  }
}

/**
 * Native fork of {@linkcode RivePanel}: `@rive-app/react-native` `useRiveFile`,
 * `useViewModelInstance(file, { async: true, viewModelName })` and a `RiveView`
 * bound to that instance through `dataBind`. Values are written with each
 * property's `set()` only when they change; trigger listeners are removed and
 * property handles disposed on unmount.
 */
export function RivePanel<C extends RivePanelContract>({ source, contract, values, triggers, label, aspectRatio, className }: RivePanelProps<C>) {
  const [failure, setFailure] = useState<string | null>(null);
  const { riveFile, error: fileError } = useRiveFile(typeof source === 'number' ? source : { uri: source });
  const { instance, error: instanceError } = useViewModelInstance(riveFile, { async: true, viewModelName: contract.viewModel });

  // Property lookups are lazy on native, so check the contract against the file once.
  useEffect(() => {
    if (!instance) return;
    let live = true;
    instance
      .getPropertiesAsync()
      .then((props) => {
        const names = new Set(props.map((p) => p.name));
        const missing = Object.keys(contract.properties).filter((n) => !names.has(n));
        if (live && missing.length > 0) setFailure(`${contract.viewModel} has no ${missing.join(', ')}. Rebuild the .riv with pnpm rive:build.`);
      })
      .catch((e: unknown) => live && setFailure(e instanceof Error ? e.message : String(e)));
    return () => {
      live = false;
    };
  }, [instance, contract]);

  const handles = useRef(new Map<string, Setter>());
  const written = useRef(new Map<string, Writable>());
  useEffect(() => {
    if (!instance) return;
    for (const [name, kind] of Object.entries(contract.properties)) {
      if (kind === 'trigger') continue;
      const value = (values as Record<string, Writable>)[name];
      if (value === undefined || written.current.get(name) === value) continue;
      let handle = handles.current.get(name);
      if (!handle) {
        handle = handleFor(instance, name, kind);
        if (!handle) continue;
        handles.current.set(name, handle);
      }
      handle.set(value as never);
      written.current.set(name, value);
    }
  });

  useEffect(() => {
    const owned = handles.current;
    const seen = written.current;
    return () => {
      owned.forEach((h) => h.dispose?.());
      owned.clear();
      seen.clear();
    };
  }, [instance]);

  const triggersRef = useRef(triggers);
  useEffect(() => {
    triggersRef.current = triggers;
  });
  useEffect(() => {
    if (!instance) return;
    const removers: (() => void)[] = [];
    for (const [name, kind] of Object.entries(contract.properties)) {
      if (kind !== 'trigger') continue;
      const property = instance.triggerProperty(name);
      if (!property) continue;
      removers.push(property.addListener(() => (triggersRef.current as Record<string, (() => void) | undefined> | undefined)?.[name]?.()));
      removers.push(() => property.dispose?.());
    }
    return () => removers.forEach((remove) => remove());
  }, [instance, contract]);

  const loadError = fileError ?? instanceError;
  const status: RivePanelStatus = failure
    ? { kind: 'error', message: failure }
    : loadError
      ? { kind: 'error', message: loadError.message }
      : riveFile && instance
        ? { kind: 'ready' }
        : { kind: 'loading' };

  return (
    <RivePanelFrame status={status} label={label} aspectRatio={aspectRatio} className={className}>
      {riveFile && instance ? (
        <RiveView
          file={riveFile}
          artboardName={contract.artboard}
          stateMachineName={contract.stateMachine}
          dataBind={instance}
          autoPlay
          fit={Fit.Contain}
          onError={(e: RiveError) => setFailure(e.message)}
          style={{ width: '100%', height: '100%' }}
        />
      ) : null}
    </RivePanelFrame>
  );
}
