import Link from 'next/link';
import Image from 'next/image';
import { StatusOverlay } from '@/components/atoms/StatusOverlay';
import { Badge } from '@/components/atoms/Badge';
import { PriceTag } from '@/components/atoms/PriceTag';
import { ConditionDot } from '@/components/atoms/ConditionDot';
import type { ItemStatus, CosmeticGrade } from '@/types/inventory';
import { cloudinaryUrl } from '@/lib/cloudinary/transforms';

type ItemCardProps = {
  slug: string;
  title: string;
  category: string;
  status: ItemStatus;
  publicPrice: number;
  cosmeticGrade: CosmeticGrade | null;
  primaryPhotoId: string | null;
};

const categoryVariant: Record<string, 'available' | 'new'> = {
  laptop: 'new',
  desktop: 'new',
  tablet: 'new',
  phone: 'new',
  accessory: 'available',
  other: 'available',
};

export function ItemCard({
  slug,
  title,
  category,
  status,
  publicPrice,
  cosmeticGrade,
  primaryPhotoId,
}: ItemCardProps) {
  const imageUrl = primaryPhotoId
    ? cloudinaryUrl(primaryPhotoId, 'card')
    : '/placeholder-item.svg';

  return (
    <Link href={`/items/${slug}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
        <div className="relative aspect-[4/3]">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {status !== 'AVAILABLE' && <StatusOverlay status={status} size="sm" />}
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{title}</h3>
          <div className="flex items-center gap-2">
            <Badge label={category} variant={categoryVariant[category] || 'available'} />
            {cosmeticGrade && <ConditionDot grade={cosmeticGrade} />}
          </div>
          <PriceTag amount={publicPrice} size="sm" />
        </div>
      </div>
    </Link>
  );
}
