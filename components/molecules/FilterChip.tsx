'use client';

import { cn } from '@/lib/utils';

type FilterChipProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
};

export function FilterChip({ label, isActive, onClick, className }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors min-h-[36px]',
        isActive
          ? 'bg-brand-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        className
      )}
    >
      {label}
    </button>
  );
}
