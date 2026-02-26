'use client';

import { Badge } from '@/components/atoms/Badge';
import type { ItemStatus } from '@/types/inventory';

type StatusSelectorProps = {
  value: ItemStatus;
  onChange: (status: ItemStatus) => void;
};

const statuses: { value: ItemStatus; variant: 'available' | 'hold' | 'sold' | 'returned' }[] = [
  { value: 'AVAILABLE', variant: 'available' },
  { value: 'ON_HOLD', variant: 'hold' },
  { value: 'SOLD', variant: 'sold' },
  { value: 'RETURNED', variant: 'returned' },
];

export function StatusSelector({ value, onChange }: StatusSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((s) => (
        <label key={s.value} className="cursor-pointer">
          <input
            type="radio"
            name="status"
            value={s.value}
            checked={value === s.value}
            onChange={() => onChange(s.value)}
            className="sr-only"
          />
          <Badge
            label={s.value.replace('_', ' ')}
            variant={s.variant}
            className={value === s.value ? 'ring-2 ring-brand-500 ring-offset-1' : 'opacity-60'}
          />
        </label>
      ))}
    </div>
  );
}
