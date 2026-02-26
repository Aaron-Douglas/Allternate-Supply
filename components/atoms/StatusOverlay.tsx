import { cn } from '@/lib/utils';

type StatusOverlayProps = {
  status: 'SOLD' | 'ON_HOLD' | 'RETURNED';
  size?: 'sm' | 'lg';
};

const statusStyles = {
  SOLD: 'bg-red-600/90 text-white font-black rotate-[-12deg]',
  ON_HOLD: 'bg-amber-500/90 text-white font-bold',
  RETURNED: 'bg-gray-500/80 text-white font-semibold',
};

const statusLabels = {
  SOLD: 'SOLD',
  ON_HOLD: 'ON HOLD',
  RETURNED: 'RETURNED',
};

const sizeStyles = {
  sm: 'text-xs px-2 py-1',
  lg: 'text-lg px-4 py-2',
};

export function StatusOverlay({ status, size = 'sm' }: StatusOverlayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
      <span
        className={cn(
          'uppercase rounded',
          statusStyles[status],
          sizeStyles[size]
        )}
      >
        {statusLabels[status]}
      </span>
    </div>
  );
}
