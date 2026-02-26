'use client';

import { useState } from 'react';
import Image from 'next/image';
import { StatusOverlay } from '@/components/atoms/StatusOverlay';
import { PhotoThumbnail } from '@/components/molecules/PhotoThumbnail';
import { cloudinaryUrl } from '@/lib/cloudinary/transforms';
import type { ItemPhoto, ItemStatus } from '@/types/inventory';

type ItemDetailGalleryProps = {
  photos: ItemPhoto[];
  status: ItemStatus;
  title: string;
};

export function ItemDetailGallery({ photos, status, title }: ItemDetailGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const activePhoto = photos[activeIndex];

  if (photos.length === 0) {
    return (
      <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center">
        <svg className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91M3.75 21h16.5" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer bg-gray-100"
        onClick={() => setLightboxOpen(true)}
      >
        <Image
          src={cloudinaryUrl(activePhoto.cloudinary_id, 'detail')}
          alt={activePhoto.alt_text || title}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
        />
        {status !== 'AVAILABLE' && <StatusOverlay status={status} size="lg" />}
      </div>

      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {photos.map((photo, i) => (
            <PhotoThumbnail
              key={photo.id}
              cloudinaryId={photo.cloudinary_id}
              alt={photo.alt_text || `${title} photo ${i + 1}`}
              isActive={i === activeIndex}
              onClick={() => setActiveIndex(i)}
              className="w-16 h-16 flex-shrink-0"
            />
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            onClick={() => setLightboxOpen(false)}
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={cloudinaryUrl(activePhoto.cloudinary_id, 'zoom')}
              alt={activePhoto.alt_text || title}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </div>
  );
}
