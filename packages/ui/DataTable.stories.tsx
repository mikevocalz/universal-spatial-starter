import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { DataTable, type ColumnDef, type SortState } from './DataTable';
import { Badge } from './Badge';
import { Text, View } from './tw';
import { DISTRICTS, DISTRICT_NAME } from './district';

type Row = { name: string; role: string; status: 'Active' | 'Invited'; logins: number };

const ROWS: Row[] = [
  { name: 'Maya Rodriguez', role: 'Owner', status: 'Active', logins: 128 },
  { name: 'Daniel Okafor', role: 'Admin', status: 'Active', logins: 94 },
  { name: 'Priya Raman', role: 'Editor', status: 'Invited', logins: 12 },
  { name: 'Marcus Bell', role: 'Editor', status: 'Active', logins: 57 },
  { name: 'Elena Fischer', role: 'Viewer', status: 'Invited', logins: 3 },
];

const COLUMNS: ColumnDef<Row, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'role', header: 'Role' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => (
      <Badge label={String(getValue())} tone={getValue() === 'Active' ? 'success' : 'neutral'} />
    ),
  },
  { accessorKey: 'logins', header: 'Logins' },
];

const meta: Meta = { title: 'UI/DataTable' };
export default meta;
type Story = StoryObj;

/** No props beyond data and columns. */
export const Sortable: Story = {
  render: () => (
    <View className="max-w-content-detail p-4">
      <DataTable data={ROWS} columns={COLUMNS} />
    </View>
  ),
};

type Project = { project: string; region: string; type: string; visits: number; priority: number };

const PROJECTS: Project[] = [
  { project: 'Orbit Lab', region: 'North', type: 'Web', visits: 1240, priority: 2 },
  { project: 'Atlas', region: 'East', type: 'Native', visits: 860, priority: 3 },
  { project: 'Beacon', region: 'West', type: 'Hybrid', visits: 512, priority: 3 },
  { project: 'Comet', region: 'East', type: 'Web', visits: 431, priority: 4 },
  { project: 'Drift', region: 'South', type: 'Spatial', visits: 98, priority: 5 },
  { project: 'Ember', region: 'North', type: 'Game', visits: 2210, priority: 1 },
  { project: 'Fjord', region: 'West', type: 'Web', visits: 1730, priority: 1 },
  { project: 'Gale', region: 'East', type: 'Hybrid', visits: 204, priority: 4 },
];

const PROJECT_COLUMNS: ColumnDef<Project, unknown>[] = [
  { accessorKey: 'project', header: 'Project' },
  { accessorKey: 'region', header: 'Region' },
  { accessorKey: 'type', header: 'Type' },
  { accessorKey: 'visits', header: 'Visits' },
  { accessorKey: 'priority', header: 'Priority', cell: ({ getValue }) => '★'.repeat(Number(getValue())) },
];

/** Every option, plus a district showcase. Hover a row; sort a column; page through. */
export const Neon: StoryObj<typeof DataTable<Project>> = {
  args: {
    title: 'Projects board',
    district: 'midtown',
    striped: true,
    compact: false,
    corners: true,
    rowHover: true,
    pageSize: 5,
    loading: false,
  },
  argTypes: {
    district: { control: 'inline-radio', options: DISTRICTS },
    color: { control: 'inline-radio', options: ['orange', 'royal', 'carolina', 'leaf', 'apple'] },
  },
  render: (args) => (
    <View className="min-h-screen gap-8 bg-ink-950 p-4 md:p-8">
      <View className="max-w-content-detail">
        <DataTable {...args} data={PROJECTS} columns={PROJECT_COLUMNS} />
      </View>
      <View className="max-w-content-detail gap-6 md:flex-row">
        <DataTable color="royal" title="Loading" data={PROJECTS} columns={PROJECT_COLUMNS.slice(0, 3)} loading loadingRows={3} className="md:flex-1" />
        <DataTable color="apple" title="Archived projects" data={[]} columns={PROJECT_COLUMNS.slice(0, 3)} emptyText="No archived projects yet" className="md:flex-1" />
      </View>
      <View className="max-w-content-detail gap-6 md:flex-row md:flex-wrap">
        {DISTRICTS.map((d) => (
          <View key={d} className="md:w-[calc(50%-12px)]">
            <DataTable district={d} title={DISTRICT_NAME[d]} data={PROJECTS.slice(0, 3)} columns={PROJECT_COLUMNS.slice(0, 2)} compact />
          </View>
        ))}
      </View>
    </View>
  ),
};

// ---- G1/G2: page surface, server mode, layouts, links, selection -----------

type Member = { memberId: string; email: string; consent: string; joined: string; items: number };

const MEMBERS: Member[] = [
  { memberId: 'usr_01JX4K2', email: 'd•••@g•••.com', consent: 'Pending', joined: '12 Mar 2026', items: 3 },
  { memberId: 'usr_01JX9Q7', email: 'm•••@o•••.net', consent: 'Approved', joined: '28 Feb 2026', items: 1 },
  { memberId: 'usr_01JY2B4', email: 'p•••@m•••.org', consent: 'Not required', joined: '02 Feb 2026', items: 5 },
];

const MEMBER_COLUMNS: ColumnDef<Member, unknown>[] = [
  { accessorKey: 'memberId', header: 'Member', meta: { priority: 1 } },
  { accessorKey: 'email', header: 'Email', meta: { priority: 1 } },
  { accessorKey: 'consent', header: 'Consent', meta: { priority: 2 } },
  { accessorKey: 'joined', header: 'Joined', meta: { priority: 3 } },
  { accessorKey: 'items', header: 'Items', meta: { priority: 4, align: 'end' } },
];

/** The daylit console face: raised surface, themed type, royal accents. */
export const PageSurface: Story = {
  render: () => (
    <View className="max-w-3xl p-4">
      <DataTable
        surface="page"
        caption="Members"
        data={MEMBERS}
        columns={MEMBER_COLUMNS}
        getRowId={(r) => r.memberId}
      />
    </View>
  ),
};

/** Page surface under the night scheme. */
export const PageSurfaceNight: Story = {
  render: () => (
    <View className="scheme-dark max-w-3xl bg-ink-950 p-4">
      <DataTable
        surface="page"
        caption="Members"
        data={MEMBERS}
        columns={MEMBER_COLUMNS}
        getRowId={(r) => r.memberId}
      />
    </View>
  ),
};

const ServerSortDemo = () => {
  const [sort, setSort] = React.useState<SortState>({ columnId: 'joined', direction: 'desc' });
  const rows = [...MEMBERS].sort((a, b) => {
    if (!sort) return 0;
    const k = sort.columnId as keyof Member;
    return (sort.direction === 'asc' ? 1 : -1) * String(a[k]).localeCompare(String(b[k]));
  });
  return (
    <View className="max-w-3xl p-4">
      <DataTable
        surface="page"
        caption="Members"
        columns={MEMBER_COLUMNS}
        getRowId={(r) => r.memberId}
        mode={{ kind: 'server', sort, onSortChange: setSort, rows }}
      />
    </View>
  );
};

/** Server mode: rows and sort come from the screen; the header asks for the next sort. */
export const ServerSort: Story = {
  render: () => <ServerSortDemo />,
};

/** A resizable pane: record rows below 600 px, priority columns above. */
export const PriorityColumns: Story = {
  render: () => (
    <View className="w-[420px] resize-x overflow-hidden border border-border p-4 md:w-[900px]">
      <DataTable
        surface="page"
        layout="columns"
        caption="Members"
        data={MEMBERS}
        columns={MEMBER_COLUMNS}
        getRowId={(r) => r.memberId}
      />
    </View>
  ),
};

/** layout="records": every row a label/value card, header row visually hidden. */
export const RecordRows: Story = {
  render: () => (
    <View className="max-w-md p-4">
      <DataTable
        surface="page"
        layout="records"
        caption="Members"
        data={MEMBERS}
        columns={MEMBER_COLUMNS}
        getRowId={(r) => r.memberId}
      />
    </View>
  ),
};

/** Whole row is one link; the open record carries aria-current and the selection bar. */
export const RowLinks: Story = {
  render: () => (
    <View className="max-w-3xl p-4">
      <DataTable
        surface="page"
        caption="Members"
        data={MEMBERS}
        columns={MEMBER_COLUMNS}
        getRowId={(r) => r.memberId}
        getRowHref={(r) => `/admin/members/${r.memberId}`}
        selectedRowId="usr_01JX9Q7"
      />
    </View>
  ),
};

const SelectionDemo = () => {
  const [ids, setIds] = React.useState<string[]>(['usr_01JX4K2']);
  return (
    <View className="max-w-3xl p-4">
      <DataTable
        surface="page"
        caption="Members"
        data={MEMBERS}
        columns={MEMBER_COLUMNS}
        getRowId={(r) => r.memberId}
        selection={{ selectedIds: ids, onSelectedIdsChange: setIds }}
      />
    </View>
  );
};

/** A selection column for a bulk action. */
export const Selection: Story = {
  render: () => <SelectionDemo />,
};

/** emptyState and errorState replace the body. */
export const EmptyAndError: Story = {
  render: () => (
    <View className="max-w-3xl gap-6 p-4">
      <DataTable
        surface="page"
        caption="Members"
        data={[]}
        columns={MEMBER_COLUMNS}
        getRowId={(r) => r.memberId}
        emptyState={<Text className="p-4 text-text-muted">No Member matches that search.</Text>}
      />
      <DataTable
        surface="page"
        caption="Members"
        data={[]}
        columns={MEMBER_COLUMNS}
        getRowId={(r) => r.memberId}
        errorState={<Text className="p-4 text-danger">Couldn&rsquo;t load members. Try again.</Text>}
      />
    </View>
  ),
};

/** Skeleton rows with aria-busy. */
export const Loading: Story = {
  render: () => (
    <View className="max-w-3xl p-4">
      <DataTable surface="page" caption="Members" columns={MEMBER_COLUMNS} loading loadingRows={4} />
    </View>
  ),
};
