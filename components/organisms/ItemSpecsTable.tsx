import { SpecRow } from '@/components/molecules/SpecRow';
import type { Category } from '@/types/inventory';

type ItemSpecsTableProps = {
  category: Category;
  specs: Record<string, unknown>;
};

const SPEC_LABELS: Record<string, Record<string, string>> = {
  laptop: {
    cpu: 'Processor', ram_gb: 'RAM (GB)', storage_gb: 'Storage (GB)', storage_type: 'Storage Type',
    gpu: 'Graphics', screen_size: 'Screen Size', os: 'Operating System', battery_cycles: 'Battery Cycles',
  },
  desktop: {
    cpu: 'Processor', ram_gb: 'RAM (GB)', storage_gb: 'Storage (GB)', storage_type: 'Storage Type',
    gpu: 'Graphics', screen_size: 'Screen Size', os: 'Operating System',
  },
  tablet: {
    cpu: 'Processor', ram_gb: 'RAM (GB)', storage_gb: 'Storage (GB)',
    screen_size: 'Screen Size', os: 'Operating System', battery_health: 'Battery Health',
  },
  phone: {
    cpu: 'Processor', ram_gb: 'RAM (GB)', storage_gb: 'Storage (GB)',
    screen_size: 'Screen Size', os: 'Operating System', battery_health: 'Battery Health',
  },
  accessory: { type: 'Type', compatibility: 'Compatibility', color: 'Color' },
  other: {},
};

export function ItemSpecsTable({ category, specs }: ItemSpecsTableProps) {
  const labels = SPEC_LABELS[category] || {};
  const entries = Object.entries(labels);

  if (entries.length === 0) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">Specifications</h3>
      <div className="divide-y divide-gray-100">
        {entries.map(([key, label]) => (
          <SpecRow key={key} label={label} value={specs[key] as string | number | null} />
        ))}
      </div>
    </div>
  );
}
