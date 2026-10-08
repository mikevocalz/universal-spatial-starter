'use client';

import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { riveContract, riveFiles } from '@acme/assets/rive';
import { RivePanel } from '@acme/spatial';
import { SegmentedControl } from '@acme/ui';
import { Pressable, Text, View } from '@acme/ui/tw';
import { BAND, pulsePhase, remainingMs, type PulseAction, type PulseStatus } from '../game/pulse-catch';
import { useGameModeStore, usePulseStore, type GameInterface } from '../state';
import { ActionButton, Panel, ScreenFrame } from './parts';

const INTERFACES = [
  { value: 'mixed', label: 'Mixed' },
  { value: 'rive', label: 'Full Rive' },
] as const satisfies readonly { value: GameInterface; label: string }[];

const PRIMARY_LABEL: Record<PulseStatus, string> = { ready: 'Start', running: 'Pause', paused: 'Resume', over: 'Play again' };
const STAGE_LABEL: Record<PulseStatus, string> = { ready: 'Ready', running: 'Ring swelling toward the band', paused: 'Paused', over: 'Over' };

/** What the single primary control does in each status. The art never decides this. */
function primaryAction(status: PulseStatus): PulseAction {
  return status === 'running' ? { type: 'pause' } : status === 'paused' ? { type: 'resume' } : { type: 'start' };
}

function pressPrimary() {
  const { game, dispatch } = usePulseStore.getState();
  dispatch(primaryAction(game.status));
}

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

/** Leaving the app (or the browser tab) pauses a running session instead of letting the clock run. */
function usePauseInBackground() {
  const dispatch = usePulseStore((s) => s.dispatch);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') dispatch({ type: 'pause' });
    });
    return () => sub.remove();
  }, [dispatch]);
}

/**
 * Space catches, P pauses and resumes, Enter runs the primary action when nothing
 * else has focus. Web only; native uses the on-screen controls. Works the same in
 * both interfaces, so the Full Rive button never needs its own keyboard path.
 */
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
      } else if (e.code === 'Enter' && e.target === document.body) {
        pressPrimary();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dispatch]);
}

export function GameScreen() {
  const game = usePulseStore((s) => s.game);
  const dispatch = usePulseStore((s) => s.dispatch);
  const ui = useGameModeStore((s) => s.ui);
  const setUi = useGameModeStore((s) => s.setUi);
  usePulseClock(game.status === 'running');
  useKeyboardControls();
  usePauseInBackground();

  const seconds = Math.ceil(remainingMs(game) / 1000);
  const primary = PRIMARY_LABEL[game.status];
  const scoreLine = `${game.score} caught, ${game.misses} missed, ${seconds} seconds left`;

  return (
    <ScreenFrame title="Game Workspace" purpose="Catch the ring while it crosses the blue band. Thirty seconds, one catch per pulse.">
      <View className="gap-4 lg:flex-row lg:items-start">
        <Panel label="Controls" className="lg:w-64">
          <SegmentedControl tone="royal" aria-label="Interface" options={INTERFACES} value={ui} onChange={setUi} />
          {ui === 'mixed' ? (
            <ActionButton tone={game.status === 'running' ? 'quiet' : 'solid'} label={primary} onPress={pressPrimary} />
          ) : (
            // The artwork is the pointer target: its press trigger reaches pressPrimary. Screen readers
            // get the same action through the activate accessibility action, keyboards through Enter and P.
            <View
              accessible
              role="button"
              aria-label={primary}
              accessibilityActions={[{ name: 'activate' }]}
              onAccessibilityAction={(e) => e.nativeEvent.actionName === 'activate' && pressPrimary()}
            >
              <RivePanel
                source={riveFiles.gameControls}
                contract={riveContract.gameControls}
                values={{ status: game.status }}
                triggers={{ press: pressPrimary }}
                label={primary}
                aspectRatio={240 / 64}
              />
            </View>
          )}
          <Text className="text-sm leading-6 text-silver-400">Tap the stage or press Space to catch. P pauses, Enter starts.</Text>
        </Panel>

        <Pressable
          role="button"
          aria-label="Catch the pulse"
          disabled={game.status !== 'running'}
          onPress={() => dispatch({ type: 'catch' })}
          className="flex-1 items-center justify-center rounded-2xl border border-ink-800 bg-ink-900 p-4"
        >
          <View className="w-full max-w-[400px]">
            <RivePanel
              source={riveFiles.pulseCatch}
              contract={riveContract.pulseCatch}
              values={{
                phase: game.status === 'ready' ? 0 : pulsePhase(game.elapsedMs),
                bandFrom: BAND.from,
                bandTo: BAND.to,
                status: game.status,
                score: game.score,
              }}
              label={game.status === 'over' ? `${game.score} caught` : STAGE_LABEL[game.status]}
              aspectRatio={1}
            />
          </View>
        </Pressable>

        <Panel label="Score" className="lg:w-56">
          {ui === 'mixed' ? (
            <View className="flex-row justify-between lg:flex-col">
              <Text aria-live="polite" className="font-display text-4xl text-silver-50">{game.score}</Text>
              <Text className="text-base text-silver-300">{game.misses} missed</Text>
              <Text className="text-base text-silver-300">{seconds}s left</Text>
            </View>
          ) : (
            <RivePanel
              source={riveFiles.gameHud}
              contract={riveContract.gameHud}
              values={{ score: game.score, misses: game.misses, secondsLeft: seconds }}
              label={scoreLine}
              aspectRatio={240 / 200}
            />
          )}
        </Panel>
      </View>
    </ScreenFrame>
  );
}
