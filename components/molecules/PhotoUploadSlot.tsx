'use client';

import { useRef, useState } from 'react';
import { Spinner } from '@/components/atoms/Spinner';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type PhotoUploadSlotProps = {
  imageUrl?: string;
  onUpload: (file: File) => Promise<void>;
  onDelete?: () => void;
  isUploading?: boolean;
  className?: string;
};

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function PhotoUploadSlot({ imageUrl, onUpload, onDelete, isUploading, className }: PhotoUploadSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Only JPEG, PNG, or WebP images allowed');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('File must be under 10MB');
      return;
    }
    await onUpload(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={cn('relative', className)}>
      {imageUrl ? (
        <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
          <Image src={imageUrl} alt="Item photo" fill className="object-cover" sizes="200px" />
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Spinner size="md" className="text-white" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex aspect-square w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-brand-400 hover:bg-brand-50 transition-colors"
        >
          {isUploading ? (
            <Spinner size="md" />
          ) : (
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="hidden"
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
