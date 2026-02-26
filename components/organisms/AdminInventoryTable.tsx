'use client';

import Link from 'next/link';
import { Badge } from '@/components/atoms/Badge';
import { PriceTag } from '@/components/atoms/PriceTag';
import { Button } from '@/components/atoms/Button';
import type { InventoryItem } from '@/types/inventory';

type AdminInventoryTableProps = {
  items: InventoryItem[];
};

const statusVariant: Record<string, 'available' | 'hold' | 'sold' | 'returned'> = {
  AVAILABLE: 'available',
  ON_HOLD: 'hold',
  SOLD: 'sold',
  RETURNED: 'returned',
};

export function AdminInventoryTable({ items }: AdminInventoryTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-mono text-gray-600">{item.sku}</td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-[200px] truncate">{item.title}</td>
              <td className="px-4 py-3 text-sm text-gray-600 capitalize">{item.category}</td>
              <td className="px-4 py-3">
                <Badge label={item.status.replace('_', ' ')} variant={statusVariant[item.status] || 'available'} />
              </td>
              <td className="px-4 py-3"><PriceTag amount={item.public_price} size="sm" /></td>
              <td className="px-4 py-3 text-right space-x-2">
                <Link href={`/admin/inventory/${item.id}`}>
                  <Button variant="outline" size="sm">Edit</Button>
                </Link>
                {(item.status === 'AVAILABLE' || item.status === 'ON_HOLD') && (
                  <Link href={`/admin/inventory/${item.id}/sale`}>
                    <Button variant="primary" size="sm">Sell</Button>
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && (
        <div className="p-8 text-center text-gray-500">No items found.</div>
      )}
    </div>
  );
}
