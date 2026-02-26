'use client';

import { SearchBar } from '@/components/molecules/SearchBar';
import { FilterChip } from '@/components/molecules/FilterChip';
import { useInventoryFilters } from '@/hooks/useInventoryFilters';
import { Button } from '@/components/atoms/Button';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'laptop', label: 'Laptops' },
  { value: 'desktop', label: 'Desktops' },
  { value: 'tablet', label: 'Tablets' },
  { value: 'phone', label: 'Phones' },
  { value: 'accessory', label: 'Accessories' },
];

const STATUSES = [
  { value: '', label: 'All' },
  { value: 'available', label: 'Available' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'sold', label: 'Sold' },
];

export function InventoryFilters() {
  const { filters, setFilter, clearFilters } = useInventoryFilters();
  const hasActiveFilters = filters.category || filters.status || filters.q || filters.min_price || filters.max_price;

  return (
    <div className="space-y-4">
      <SearchBar
        value={filters.q}
        onChange={(val) => setFilter('q', val)}
        placeholder="Search by title, brand, model, or SKU..."
      />
      <div className="space-y-3">
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</span>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {CATEGORIES.map((cat) => (
              <FilterChip
                key={cat.value}
                label={cat.label}
                isActive={filters.category === cat.value}
                onClick={() => setFilter('category', cat.value)}
              />
            ))}
          </div>
        </div>
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</span>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {STATUSES.map((s) => (
              <FilterChip
                key={s.value}
                label={s.label}
                isActive={filters.status === s.value}
                onClick={() => setFilter('status', s.value)}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-500">Min Price</label>
            <input
              type="number"
              value={filters.min_price}
              onChange={(e) => setFilter('min_price', e.target.value)}
              placeholder="0"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm min-h-[44px]"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-500">Max Price</label>
            <input
              type="number"
              value={filters.max_price}
              onChange={(e) => setFilter('max_price', e.target.value)}
              placeholder="Any"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm min-h-[44px]"
            />
          </div>
        </div>
      </div>
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear all filters
        </Button>
      )}
    </div>
  );
}
