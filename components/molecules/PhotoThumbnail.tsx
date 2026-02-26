import Image from 'next/image';
import { cn } from '@/lib/utils';
import { cloudinaryUrl } from '@/lib/cloudinary/transforms';

type PhotoThumbnailProps = {
  cloudinaryId: string;
  alt: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
};

export function PhotoThumbnail({ cloudinaryId, alt, isActive, onClick, className }: PhotoThumbnailProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative aspect-square overflow-hidden rounded-lg border-2 transition-colors',
        isActive ? 'border-brand-500' : 'border-transparent hover:border-gray-300',
        className
      )}
    >
      <Image
        src={cloudinaryUrl(cloudinaryId, 'thumb')}
        alt={alt}
        fill
        className="object-cover"
        sizes="120px"
      />
    </button>
  );
}
