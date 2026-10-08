import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checklist, CheckRow } from './Checklist';
import { View } from './tw';

const meta = { title: 'UI/Checklist' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

/** Every check passing. */
export const AllPassing: Story = {
  render: () => (
    <View className="max-w-xl p-4">
      <Checklist>
        <CheckRow label="Shared item ids" result={{ kind: 'pass', count: 0 }} detail="Every item id is unique." />
        <CheckRow label="Item ⇄ owner match" result={{ kind: 'pass', count: 0 }} />
        <CheckRow label="Orphaned items" result={{ kind: 'pass', count: 0 }} />
      </Checklist>
    </View>
  ),
};

/** One failing check, linked to the records. */
export const OneFailing: Story = {
  render: () => (
    <View className="max-w-xl p-4">
      <Checklist>
        <CheckRow label="Shared item ids" result={{ kind: 'pass', count: 0 }} />
        <CheckRow label="Item ⇄ owner match" result={{ kind: 'fail', count: 3 }} detail="3 items point at missing owners." href="/admin/integrity" />
        <CheckRow label="Stale pending items" result={{ kind: 'info', count: 12 }} />
      </Checklist>
    </View>
  ),
};

/** A check the server could not run, with its reason. */
export const Unavailable: Story = {
  render: () => (
    <View className="max-w-xl p-4">
      <Checklist>
        <CheckRow label="Shared item ids" result={{ kind: 'pending' }} />
        <CheckRow label="Item ⇄ owner match" result={{ kind: 'unavailable', reason: 'integrity run in progress' }} />
      </Checklist>
    </View>
  ),
};
