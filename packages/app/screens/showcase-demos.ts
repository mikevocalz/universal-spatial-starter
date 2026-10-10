/**
 * Showcase gallery data. Serializable and platform-neutral: on web the page
 * hands it to the client screen across the RSC boundary; on native the screen
 * uses it as its default.
 */
export interface ShowcaseDemo {
  readonly href: string;
  readonly title: string;
  readonly layout: string;
  readonly line: string;
}

export const SHOWCASE_DEMOS: readonly ShowcaseDemo[] = [
  { href: '/native', title: 'Native Workspace', layout: 'Standard layout', line: 'Search a list, open a detail, pull out an inspector. All native controls.' },
  { href: '/hybrid', title: 'Hybrid Rive', layout: 'Standard layout', line: 'Native controls drive an authored Rive artboard in the centre pane.' },
  { href: '/game', title: 'Game Workspace', layout: 'Game layout', line: 'A 30-second catch game: controls, a central stage and a live HUD.' },
  { href: '/immersive', title: 'Immersive Workspace', layout: 'Game layout', line: 'One object on an orbit, rendered by Viro on headsets and in the browser.' },
];
