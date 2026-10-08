import type { Meta, StoryObj } from '@storybook/react-vite';
import { Timeline, type TimelineItemData } from './elements/Timeline';
import { colorControl, DistrictGrid, districtControl } from './progress/story-kit';
import { View } from './tw';

const LINE: TimelineItemData[] = [
  { date: 'Mon 9:00', title: 'Kickoff', description: 'Team formed.' },
  { date: 'Mon 12:30', title: 'First draft', description: 'First milestone reached.', badge: 'New' },
  { date: 'Tue 18:00', title: 'Review', description: 'Three items in review.', active: true },
  { date: 'Thu', title: 'Beta', description: 'Opens after the next milestone.' },
  { title: 'Launch', description: 'The last stop. Nobody has made it yet.', badge: 'Soon' },
];

const meta = {
  title: 'Elements/Timeline',
  component: Timeline,
  args: {
    items: LINE, district: 'midtown', variant: 'default', lineStyle: 'solid', dotStyle: 'square', dotAnim: 'ping',
    align: 'left', animate: true, accessibilityLabel: 'Route progress',
  },
  argTypes: {
    district: districtControl,
    color: colorControl,
    variant: { control: 'inline-radio', options: ['default', 'glow', 'minimal', 'stepped'] },
    lineStyle: { control: 'inline-radio', options: ['solid', 'dashed', 'glow', 'none'] },
    dotStyle: { control: 'inline-radio', options: ['circle', 'square', 'diamond'] },
    dotAnim: { control: 'inline-radio', options: ['none', 'pulse', 'ping'] },
    align: { control: 'inline-radio', options: ['left', 'right', 'alternate'] },
  },
  render: (args) => (
    <View className="mx-auto w-full max-w-3xl p-4">
      <Timeline {...args} />
    </View>
  ),
} satisfies Meta<typeof Timeline>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Alternates on wide screens, stacks left on phones. */
export const Alternate: Story = { args: { align: 'alternate', variant: 'stepped' } };

export const Districts: Story = {
  render: () => (
    <DistrictGrid>
      {(district) => (
        <Timeline
          district={district}
          items={LINE.slice(0, 4)}
          variant={district === 'downtown' ? 'minimal' : district === 'harlem' ? 'stepped' : district === 'megacity' ? 'glow' : 'default'}
          lineStyle={district === 'megacity' ? 'dashed' : 'solid'}
          dotStyle={district === 'harlem' ? 'diamond' : 'square'}
          dotAnim="pulse"
        />
      )}
    </DistrictGrid>
  ),
};
