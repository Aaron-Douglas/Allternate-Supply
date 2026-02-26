import { cn } from '@/lib/utils';

type BadgeVariant = 'sold' | 'hold' | 'available' | 'returned' | 'new';

const variantStyles: Record<BadgeVariant, string> = {
  available: 'bg-green-100 text-green-700 border-green-200',
  hold: 'bg-amber-100 text-amber-700 border-amber-200',
  sold: 'bg-red-100 text-red-700 border-red-200',
  returned: 'bg-gray-100 text-gray-700 border-gray-200',
  new: 'bg-blue-100 text-blue-700 border-blue-200',
};

type BadgeProps = {
  label: string;
  variant: BadgeVariant;
  className?: string;
};

export function Badge({ label, variant, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        variantStyles[variant],
        className
      )}
    >
      {label}
    </span>
  );
}
