import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState } from './EmptyState';
import { Button } from './Button';
import { View } from './tw';
import { Calendar, Users } from './icons';
import { DISTRICTS, DISTRICT_NAME } from './district';

const meta = {
  title: 'UI/EmptyState',
  component: EmptyState,
  args: {
    icon: <Calendar size={30} className="text-text-muted" />,
    title: 'Nothing here yet',
  },
} satisfies Meta<typeof EmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  argTypes: {
    district: { control: 'inline-radio', options: DISTRICTS },
    tone: { control: 'select', options: [undefined, 'orange', 'royal', 'carolina', 'leaf', 'apple', 'brick'] },
  },
};
export const WithAction: Story = {
  args: {
    description: 'Content appears here once it has been added.',
    action: <Button title="Refresh" variant="outline" size="sm" onPress={() => {}} />,
  },
};

/** One per district, with the copy the schedule and staff panes use. */
export const Districts: Story = {
  render: () => (
    <View className="gap-2 md:flex-row md:flex-wrap">
      {DISTRICTS.map((d) => (
        <EmptyState
          key={d}
          district={d}
          icon={<Users size={30} className="text-text-muted" />}
          title={`${DISTRICT_NAME[d]}: no staff yet`}
          description="Add someone to the studio to see them here."
        />
      ))}
    </View>
  ),
};

/**
 * `illustration` replaces the icon tile and skyline. The caller owns the
 * art's accessible name: here a drawn ring and dot labelled as an image.
 */
export const WithIllustration: Story = {
  args: {
    icon: undefined,
    illustration: (
      <View role="img" aria-label="An empty orbit" className="size-40 items-center justify-center rounded-full border-8 border-royal-500">
        <View className="size-8 rounded-full bg-white" />
      </View>
    ),
    title: 'No one here yet',
    description: 'Invite a friend to start one.',
  },
};

/**
 * No icon and no art (the art is still to come): the slot renders nothing
 * and the state starts at its title, with no gap above it.
 */
export const WithoutIllustration: Story = {
  args: {
    icon: undefined,
    title: 'This request has expired',
    description: 'Ask again and we will send a new link.',
    action: <Button title="Ask again" size="md" onPress={() => {}} />,
  },
};
