'use client';

import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Pressable, Text, View } from '@acme/ui/tw';
import { BAND, pulsePhase, remainingMs } from '../game/pulse-catch';
import { usePulseStore } from '../state';
import { ActionButton, Panel, ScreenFrame } from './parts';

const STAGE = 280;

/** Drives the game clock with requestAnimationFrame while a session runs. */
function usePulseClock(running: boolean) {
  const dispatch = usePulseStore((s) => s.dispatch);
  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    let frame = requestAnimationFrame(function step(now) {
      dispatch({ type: 'tick', dtMs: now - last });
      last = now;
      frame = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(frame);
  }, [running, dispatch]);
}

/** Space catches on a keyboard, P pauses and resumes. Web only; native uses the on-screen controls. */
function useKeyboardControls() {
  const dispatch = usePulseStore((s) => s.dispatch);
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (e: KeyboardEvent) => {
      const { status } = usePulseStore.getState().game;
      if (e.code === 'Space' && status === 'running') {
        e.preventDefault();
        dispatch({ type: 'catch' });
      } else if (e.code === 'KeyP') {
        dispatch({ type: status === 'paused' ? 'resume' : 'pause' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dispatch]);
}

export function GameScreen() {
  const game = usePulseStore((s) => s.game);
  const dispatch = usePulseStore((s) => s.dispatch);
  usePulseClock(game.status === 'running');
  useKeyboardControls();

  // ponytail: the ring re-renders through React each frame; move it to a Reanimated shared value once the Rive stage replaces it.
  const ring = Math.max(8, pulsePhase(game.elapsedMs) * STAGE);
  const seconds = Math.ceil(remainingMs(game) / 1000);

  return (
    <ScreenFrame title="Game Workspace" purpose="Catch the ring while it crosses the blue band. Thirty seconds, one catch per pulse.">
      <View className="gap-4 lg:flex-row lg:items-start">
        <Panel label="Controls" className="lg:w-64">
          {game.status === 'running' ? (
            <ActionButton tone="quiet" label="Pause" onPress={() => dispatch({ type: 'pause' })} />
          ) : game.status === 'paused' ? (
            <ActionButton label="Resume" onPress={() => dispatch({ type: 'resume' })} />
          ) : (
            <ActionButton label={game.status === 'over' ? 'Play again' : 'Start'} onPress={() => dispatch({ type: 'start' })} />
          )}
          <Text className="text-sm leading-6 text-silver-400">Tap the stage or press Space to catch. P pauses.</Text>
        </Panel>

        <Pressable
          role="button"
          aria-label="Catch the pulse"
          disabled={game.status !== 'running'}
          onPress={() => dispatch({ type: 'catch' })}
          className="flex-1 items-center justify-center rounded-2xl border border-ink-800 bg-ink-900 py-8"
        >
          <View className="items-center justify-center" style={{ width: STAGE, height: STAGE }}>
            <View
              className="absolute rounded-full border-8 border-royal-500/40"
              style={{ width: STAGE * ((BAND.from + BAND.to) / 2), height: STAGE * ((BAND.from + BAND.to) / 2) }}
            />
            <View className="absolute rounded-full border-2 border-silver-100" style={{ width: ring, height: ring }} />
            {game.status !== 'running' ? (
              <Text className="font-display text-2xl text-silver-50">
                {game.status === 'over' ? `${game.score} caught` : game.status === 'paused' ? 'Paused' : 'Ready'}
              </Text>
            ) : null}
          </View>
        </Pressable>

        <Panel label="Score" className="flex-row justify-between lg:w-56 lg:flex-col">
          <Text aria-live="polite" className="font-display text-4xl text-silver-50">{game.score}</Text>
          <Text className="text-base text-silver-300">{game.misses} missed</Text>
          <Text className="text-base text-silver-300">{seconds}s left</Text>
        </Panel>
      </View>
    </ScreenFrame>
  );
}
