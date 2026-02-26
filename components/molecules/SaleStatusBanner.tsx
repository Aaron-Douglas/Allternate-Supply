import { Badge } from '@/components/atoms/Badge';

type SaleStatusBannerProps = {
  status: 'SOLD' | 'ON_HOLD';
  holdExpiresAt?: string | null;
};

export function SaleStatusBanner({ status, holdExpiresAt }: SaleStatusBannerProps) {
  if (status === 'SOLD') {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-center gap-3">
        <Badge label="Sold" variant="sold" />
        <span className="text-sm text-red-700">This item has been sold and is no longer available.</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 flex items-center gap-3">
      <Badge label="On Hold" variant="hold" />
      <span className="text-sm text-amber-700">
        This item is currently on hold.
        {holdExpiresAt && ` Hold expires ${new Date(holdExpiresAt).toLocaleDateString()}.`}
      </span>
    </div>
  );
}
