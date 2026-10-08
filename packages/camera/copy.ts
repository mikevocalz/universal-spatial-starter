import type { LabState } from './lab-machine';

/** What the status panel offers the user for a state, if anything. */
export type StatusAction = 'retry' | 'open-settings';

export interface StatusCopy {
  title: string;
  body: string;
  action?: { kind: StatusAction; label: string };
}

/** Where the copy is shown; only the permission-denied guidance differs. */
export type CopySurface = 'native' | 'web';

/**
 * User-facing text for every Camera Lab state. Sentence case, plain
 * statements of what is happening and what the user can do next.
 */
export function describeLabState(state: LabState, surface: CopySurface): StatusCopy | undefined {
  switch (state.status) {
    case 'closed':
      return undefined;
    case 'sensing-unavailable':
      if (state.host === 'visionos') {
        return {
          title: 'Keyboard scanning is not set up for Vision Pro',
          body: 'Vision Pro tracks a specific keyboard through a trained reference object. This build does not include one, so Camera Lab has no sensing source here.',
        };
      }
      return {
        title: 'Camera sensing is unavailable on this headset',
        body:
          state.host === 'pico'
            ? 'PICO does not give this app camera frames for detection, so Camera Lab cannot scan here.'
            : 'Meta Horizon OS does not give this app camera frames for detection, so Camera Lab cannot scan here.',
      };
    case 'requesting-permission':
      return {
        title: 'Allow camera access',
        body: 'Camera Lab looks for a keyboard in the live camera view. Frames are analyzed on this device and never saved.',
      };
    case 'permission-denied':
      if (surface === 'web') {
        return {
          title: 'Camera access is blocked',
          body: "Allow camera access for this site in your browser's settings, then try again.",
          action: { kind: 'retry', label: 'Try again' },
        };
      }
      return state.canAskAgain
        ? {
            title: 'Camera access is off',
            body: 'Camera Lab needs the camera to look for a keyboard.',
            action: { kind: 'retry', label: 'Allow camera access' },
          }
        : {
            title: 'Camera access is off',
            body: 'Turn on camera access for this app in Settings, then come back to scan.',
            action: { kind: 'open-settings', label: 'Open settings' },
          };
    case 'camera-unavailable': {
      const body = {
        'no-camera': 'This device has no camera Camera Lab can use.',
        'in-use': 'Another app is using the camera. Close it, then try again.',
        'insecure-context': 'The browser only allows camera access on a secure (https) connection.',
        'unsupported-browser': 'This browser does not support camera access.',
        error: 'The camera could not start.',
      }[state.reason];
      return {
        title: 'No camera available',
        body: state.detail ? `${body} (${state.detail})` : body,
        action: state.reason === 'no-camera' || state.reason === 'unsupported-browser' ? undefined : { kind: 'retry', label: 'Try again' },
      };
    }
    case 'model-loading':
      return { title: 'Loading the detector', body: 'Preparing the on-device keyboard detector.' };
    case 'model-failed':
      return {
        title: 'The detector did not load',
        body: state.detail,
        action: { kind: 'retry', label: 'Try again' },
      };
    case 'scanning':
      return { title: 'Scanning for a keyboard', body: 'Point the camera at a keyboard.' };
    case 'keyboard-found':
      return { title: 'Keyboard found', body: `${formatConfidence(state.detection.confidence)} confidence` };
  }
}

/** Formats a 0..1 score as a whole percentage, e.g. 0.874 -> "87%". */
export function formatConfidence(score: number): string {
  return `${Math.round(Math.min(1, Math.max(0, score)) * 100)}%`;
}
