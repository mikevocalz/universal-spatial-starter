import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CardSliderImageAspect, CardSliderImageFrame, CardSliderImageItemData } from './cards/card-slider.types';
import { CardSlider, type CardSliderProps } from './cards/CardSlider';
import { CardSliderImageItem } from './cards/slider-items';
import { DISTRICTS, type District } from './district';
import { Heading } from './html';
import { Text } from './Text';
import { View } from './tw';

// Drawn sample art, so the kit ships no photos: a ring and a dot on a flat
// field, 1200x800 like a bundled photo crop.
const art = (bg: string, ring: string, dot: string, cx: number) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="${bg}"/><circle cx="${cx}" cy="400" r="260" fill="none" stroke="${ring}" stroke-width="48"/><circle cx="${cx + 184}" cy="216" r="44" fill="${dot}"/></svg>`,
  )}`;

// One slide per sample, in NeonBlade's demo shape (a title, a line, a number).
const SAMPLES: readonly { title: string; subtitle: string; meta: string; colors: [string, string, string] }[] = [
  { title: 'Orbit', subtitle: 'Sample one', meta: 'Views 4', colors: ['#14120f', '#0047ff', '#f4f1ea'] },
  { title: 'Ring', subtitle: 'Sample two', meta: 'Saved', colors: ['#1b1712', '#2f6bff', '#f4f1ea'] },
  { title: 'Halo', subtitle: 'Sample three', meta: 'Views 38', colors: ['#100e0c', '#5a8cff', '#ffd9a8'] },
  { title: 'Arc', subtitle: 'Sample four', meta: 'Busy', colors: ['#16130f', '#0033b8', '#f4f1ea'] },
  { title: 'Loop', subtitle: 'Sample five', meta: 'Views 51', colors: ['#0f0d0b', '#7aa2ff', '#ffb27a'] },
  { title: 'Path', subtitle: 'Sample six', meta: 'Streak 6 days', colors: ['#1a1611', '#0047ff', '#ffe7c2'] },
  { title: 'Drift', subtitle: 'Sample seven', meta: 'Claimed', colors: ['#12100d', '#3d74ff', '#f4f1ea'] },
  { title: 'Spin', subtitle: 'Sample eight', meta: 'Wait 3 min', colors: ['#181410', '#1f5cff', '#ffcf99'] },
];
const ITEMS: CardSliderImageItemData[] = SAMPLES.map(({ title, subtitle, meta, colors: [bg, ring, dot] }, i) => ({
  id: `sample-${i + 1}`,
  image: { source: art(bg, ring, dot, 420 + (i % 3) * 120), alt: `${title}: a ring and a dot on a dark field` },
  title,
  subtitle,
  meta,
  district: DISTRICTS[i % DISTRICTS.length]!,
}));

/** Every sample, the given district's first, so each demo opens on its own tone. */
const from = (d: District) => [...ITEMS.filter((it) => it.district === d), ...ITEMS.filter((it) => it.district !== d)];

/**
 * One image slide per sample. The first `eager` slides load at once (they are
 * on screen at first paint); the rest load lazily as they near the viewport.
 */
const slides = (frame: CardSliderImageFrame, aspect: CardSliderImageAspect = 'classic', eager = 1, items = ITEMS) =>
  items.map((it, i) => (
    <CardSliderImageItem key={it.id} {...it} frame={frame} aspect={aspect} priority={i < eager} />
  ));

const meta = {
  title: 'Cards/Card slider',
  component: CardSlider,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'CardSlider, the port of NeonBlade card-slider (Card Slider). Slides here are CardSliderImageItem: drawn sample art in a notch, corner-cut or beam frame with a solid title band in the district tone. CardSlider itself takes any children.' } },
  },
  args: {
    label: 'Samples',
    visibleCount: { sm: 1, md: 2, xl: 3 },
    gap: 16,
    showButtons: true,
    buttonPosition: 'sides',
    buttonVisibility: 'always',
    showProgress: true,
    progressStyle: 'bar',
    progressPosition: 'inset',
    loop: false,
    autoPlay: false,
    autoPlayInterval: 3000,
    enableSwipe: true,
    swipeThreshold: 50,
    showEdgeFades: false,
    showCornerAccents: false,
    cornerAccentStyle: 'frame',
    scanLines: false,
    district: 'midtown',
    children: null,
  },
  argTypes: {
    district: { control: 'inline-radio', options: DISTRICTS },
    tone: { control: 'select', options: [undefined, 'orange', 'royal', 'carolina', 'leaf', 'apple', 'brick'] },
    progressStyle: { control: 'inline-radio', options: ['bar', 'dots', 'counter'] },
    progressPosition: { control: 'inline-radio', options: ['inset', 'below-content'] },
    buttonPosition: { control: 'inline-radio', options: ['sides', 'bottom'] },
    buttonVisibility: { control: 'inline-radio', options: ['always', 'hover'] },
    cornerAccentStyle: { control: 'inline-radio', options: ['frame', 'plus'] },
    prevButtonCorner: { control: 'inline-radio', options: ['top-left', 'top-right', 'bottom-left', 'bottom-right'] },
    nextButtonCorner: { control: 'inline-radio', options: ['top-left', 'top-right', 'bottom-left', 'bottom-right'] },
    gap: { control: { type: 'range', min: 0, max: 48, step: 4 } },
    autoPlayInterval: { control: { type: 'range', min: 1000, max: 8000, step: 500 } },
    edgeFadeColor: { control: 'color' },
    children: { control: false },
  },
} satisfies Meta<typeof CardSlider>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop as a control. One card on phones, two from md, three from xl. */
export const Playground: Story = {
  name: 'Card Slider (NeonBlade: Card Slider)',
  render: (args: CardSliderProps) => (
    <View className="min-h-screen bg-ink-950 px-4 py-8 md:px-10">
      <CardSlider {...args}>{slides('notch', 'classic', 3)}</CardSlider>
    </View>
  ),
};

function Demo({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-3">
      <Heading level={2} className="my-0 font-display text-lg text-ink-50">{title}</Heading>
      {children}
    </View>
  );
}

/**
 * NeonBlade's four demos: single card with side buttons;
 * responsive 1 to 3 with dots, bottom buttons and frame corners; two up with
 * the counter, hover buttons and plus corners; autoplay with scan lines.
 */
export const NeonBladeDemos: Story = {
  name: 'NeonBlade demos',
  render: () => (
    <View className="min-h-screen gap-12 bg-ink-950 px-4 py-8 md:px-10">
      <Demo title="One card, bar progress, side buttons">
        <CardSlider label="Samples, royal tone first" district="downtown" visibleCount={1} progressStyle="bar" buttonPosition="sides">
          {slides('cornerCut', 'wide', 1, from('downtown'))}
        </CardSlider>
      </Demo>
      <Demo title="One, two, then three across, dots, bottom buttons, frame corners">
        <CardSlider
          label="Samples, orange tone first"
          district="midtown"
          visibleCount={{ sm: 1, md: 2, lg: 3 }}
          progressStyle="dots"
          buttonPosition="bottom"
          showCornerAccents
          cornerAccentStyle="frame"
        >
          {slides('notch', 'classic', 3, from('midtown'))}
        </CardSlider>
      </Demo>
      <Demo title="Two across (one on phones), counter, buttons on hover, plus corners">
        <CardSlider
          label="Samples, brick tone first"
          district="harlem"
          visibleCount={{ sm: 1, md: 2 }}
          progressStyle="counter"
          buttonVisibility="hover"
          showCornerAccents
          cornerAccentStyle="plus"
          showEdgeFades
          loop
        >
          {slides('notch', 'classic', 2, from('harlem'))}
        </CardSlider>
      </Demo>
      <Demo title="Autoplay with a pause control, scan lines">
        <Text className="text-silver-400">Holds while hovered or focused. Starts paused when reduced motion is on.</Text>
        <CardSlider
          label="Samples, carolina tone first"
          district="megacity"
          visibleCount={{ sm: 1, md: 2 }}
          autoPlay
          autoPlayInterval={2500}
          loop
          scanLines
          showEdgeFades
        >
          {slides('beam', 'classic', 2, from('megacity'))}
        </CardSlider>
      </Demo>
    </View>
  ),
};

/** The three progress styles, one district each. */
export const ProgressStyles: Story = {
  render: () => (
    <View className="min-h-screen gap-12 bg-ink-950 px-4 py-8 md:px-10">
      <CardSlider label="Samples, royal tone first" district="downtown" visibleCount={{ sm: 1, md: 2 }} progressStyle="bar" buttonPosition="bottom">{slides('cornerCut', 'classic', 2, from('downtown'))}</CardSlider>
      <CardSlider label="Samples, brick tone first" district="harlem" visibleCount={{ sm: 1, md: 3 }} progressStyle="dots" buttonPosition="bottom" loop>{slides('notch', 'tall', 3, from('harlem'))}</CardSlider>
      <CardSlider label="Samples, carolina tone first" district="megacity" visibleCount={{ sm: 1, md: 2 }} progressStyle="counter" buttonPosition="bottom">{slides('beam', 'classic', 2, from('megacity'))}</CardSlider>
    </View>
  ),
};

const onboardingPanels = [
  ['Welcome', 'Explore one screen at a time and find what is waiting.'],
  ['Choose your path', 'Each section has its own places, people and stories.'],
  ['Get started', 'You are ready to begin.'],
] as const;

/** Welcome-style panels keep dots and arrows below the slide content. */
export const OnboardingPanels: Story = {
  render: () => (
    <View className="min-h-screen bg-bg px-4 py-8 md:px-10">
      <CardSlider
        label="Welcome panels"
        visibleCount={1}
        progressStyle="dots"
        progressPosition="below-content"
        buttonPosition="bottom"
        tone="royal"
      >
        {onboardingPanels.map(([title, body]) => (
          <View key={title} className="min-h-64 justify-end gap-3 border-2 border-border bg-surface-raised p-6">
            <Heading level={2} className="font-display text-type-title text-text">{title}</Heading>
            <Text className="text-type-body text-text">{body}</Text>
          </View>
        ))}
      </CardSlider>
    </View>
  ),
};
