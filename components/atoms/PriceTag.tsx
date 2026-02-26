import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { CURRENCY } from '@/lib/currency';

type PriceTagProps = {
  amount: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeStyles = {
  sm: 'text-sm font-semibold',
  md: 'text-lg font-bold',
  lg: 'text-2xl font-bold',
};

export function PriceTag({ amount, currency = CURRENCY, size = 'md', className }: PriceTagProps) {
  return (
    <span className={cn(sizeStyles[size], 'text-gray-900', className)}>
      {formatPrice(amount, currency)}
    </span>
  );
}
