'use client';

import { useState } from 'react';
import { PhotoUploadSlot } from '@/components/molecules/PhotoUploadSlot';
import { uploadPhoto, deletePhoto } from '@/actions/photos';
import { cloudinaryUrl } from '@/lib/cloudinary/transforms';
import type { ItemPhoto } from '@/types/inventory';

type ItemPhotoManagerProps = {
  itemId: string;
  photos: ItemPhoto[];
  onPhotosUpdated: () => Promise<void>;
};

export function ItemPhotoManager({ itemId, photos, onPhotosUpdated }: ItemPhotoManagerProps) {
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

  const handleUpload = async (file: File, slotIndex: number) => {
    setUploadingSlot(slotIndex);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await uploadPhoto(itemId, formData);
      await onPhotosUpdated();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleReplace = async (photo: ItemPhoto, file: File) => {
    const slotIndex = photo.position;
    setUploadingSlot(slotIndex);
    try {
      await deletePhoto(photo.id);
      const formData = new FormData();
      formData.append('file', file);
      await uploadPhoto(itemId, formData);
      await onPhotosUpdated();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Replace failed');
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleDelete = async (photo: ItemPhoto) => {
    try {
      await deletePhoto(photo.id);
      await onPhotosUpdated();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Delete failed');
    }
  };

  const slots: Array<{ type: 'filled'; photo: ItemPhoto } | { type: 'empty' }> = [];
  for (let i = 0; i < photos.length; i++) {
    slots.push({ type: 'filled', photo: photos[i]! });
  }
  if (photos.length < 5) {
    slots.push({ type: 'empty' });
  }

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Photos</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {slots.map((slot, index) =>
          slot.type === 'filled' ? (
            <PhotoUploadSlot
              key={slot.photo.id}
              imageUrl={cloudinaryUrl(slot.photo.cloudinary_id, 'thumb')}
              onUpload={(file) => handleReplace(slot.photo, file)}
              onDelete={() => handleDelete(slot.photo)}
              isUploading={uploadingSlot === index}
            />
          ) : (
            <PhotoUploadSlot
              key="empty"
              onUpload={(file) => handleUpload(file, index)}
              isUploading={uploadingSlot === index}
            />
          )
        )}
      </div>
    </section>
  );
}
