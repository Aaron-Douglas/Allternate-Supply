import { ItemStatus } from '@/types/inventory';

const STATUS_CONFIG: Record<ItemStatus, { label: string; color: string; bgColor: string }> = {
  AVAILABLE: { label: 'Available', color: 'text-green-700', bgColor: 'bg-green-100' },
  ON_HOLD: { label: 'On Hold', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  SOLD: { label: 'Sold', color: 'text-red-700', bgColor: 'bg-red-100' },
  RETURNED: { label: 'Returned', color: 'text-gray-700', bgColor: 'bg-gray-100' },
};

export function useItemStatus(status: ItemStatus) {
  return STATUS_CONFIG[status];
}

export function getStatusConfig(status: ItemStatus) {
  return STATUS_CONFIG[status];
}
