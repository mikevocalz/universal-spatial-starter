import type { Meta, StoryObj } from '@storybook/react-vite';
import { NotificationPreview } from './NotificationPreview';
import { View } from './tw';

const meta = {
  title: 'UI/NotificationPreview',
  component: NotificationPreview,
  args: {
    appName: 'Starter',
    title: 'Your export is ready',
    body: "Open the app whenever you're ready.",
    time: 'now',
    accessibilityLabel: 'Example notification from Starter: Your export is ready.',
  },
} satisfies Meta<typeof NotificationPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** A typical OS notification banner preview. */
export const Default: Story = {
  render: (args) => (
    <View className="p-4">
      <NotificationPreview {...args} />
    </View>
  ),
};

/** The body clamps to two lines to preserve the banner shape. */
export const LongBody: Story = {
  args: {
    body:
      "Open the app whenever you're ready. Your export stays available until you get there — no hurry, it waits for you either way.",
  },
  render: (args) => (
    <View className="p-4">
      <NotificationPreview {...args} />
    </View>
  ),
};

/** The white banner stays legible against a dark surface. */
export const Dark: Story = {
  render: (args) => (
    <View className="bg-ink-950 p-4">
      <NotificationPreview {...args} />
    </View>
  ),
};
