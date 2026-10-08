import type { Meta, StoryObj } from '@storybook/react-vite';
import { brand } from '@acme/theme';
import { SceneSection } from './backgrounds/SceneSection';
import { Heading, Main, Paragraph, Section } from './html';
import { SolidPanel } from './neon/SolidPanel';
import { HolographicTerrain } from './three/HolographicTerrain';
import { View } from './tw';

const meta = {
  title: 'Backgrounds/SceneSection',
  component: SceneSection,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SceneSection>;

export default meta;
type Story = StoryObj<typeof meta>;

function Plate({ title, line }: { title: string; line: string }) {
  return (
    <View className="mx-auto w-full max-w-3xl flex-1 justify-end px-4 py-10">
      <SolidPanel tone="ink" depth="lg" className="gap-3 px-5 py-6 md:px-8">
        <Heading level={1} className="my-0 font-display text-3xl text-orange-500">{title}</Heading>
        <Paragraph className="my-0 text-ink-50">{line}</Paragraph>
      </SolidPanel>
    </View>
  );
}

/** HolographicTerrain as a page hero; the lead sits on an ink plate. */
export const TerrainHero: Story = {
  args: { scene: () => null, children: null },
  render: () => (
    <SceneSection
      className="min-h-[520px]"
      placeholderColor={brand.night}
      scene={({ paused }) => <HolographicTerrain paused={paused} className="absolute inset-0" />}
    >
      <Plate title="Explore" line="Templates and resources in one place." />
    </SceneSection>
  ),
};

/** `id` lands on the section — anchor targets, aria-labelledby, motion hooks. */
export const Anchored: Story = {
  args: { scene: () => null, children: null },
  render: () => (
    <SceneSection
      id="hero-anchor"
      className="min-h-[520px]"
      placeholderColor={brand.night}
      scene={({ paused }) => <HolographicTerrain paused={paused} className="absolute inset-0" />}
    >
      <Plate title="Explore" line="Templates and resources in one place." />
    </SceneSection>
  ),
};

/** A whole page: one strong background up top, plain sections below. */
export const Page: Story = {
  args: { scene: () => null, children: null },
  render: () => (
    <Main className="bg-surface">
      <SceneSection
        className="min-h-[520px]"
        placeholderColor={brand.night}
        scene={({ paused }) => <HolographicTerrain paused={paused} className="absolute inset-0" />}
      >
        <Plate title="Explore" line="Templates and resources in one place." />
      </SceneSection>
      {['Featured', 'Resources'].map((title) => (
        <View key={title}>
          <Section className="mx-auto w-full max-w-3xl gap-2 px-4 py-16">
            <Heading level={2} className="my-0 font-display text-2xl text-text">{title}</Heading>
            <Paragraph className="my-0 text-text-muted">Section content on the page surface, legible in both themes.</Paragraph>
          </Section>
        </View>
      ))}
    </Main>
  ),
};
