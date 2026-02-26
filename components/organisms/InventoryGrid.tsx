import { ItemCard } from '@/components/molecules/ItemCard';
import type { InventoryItem, ItemPhoto } from '@/types/inventory';

type InventoryGridProps = {
  items: (InventoryItem & { item_photos: ItemPhoto[] })[];
};

export function InventoryGrid({ items }: InventoryGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-600">No items found</h3>
        <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or check back later.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {items.map((item) => {
        const primaryPhoto = item.item_photos?.find((p) => p.position === 0) || item.item_photos?.[0];
        return (
          <ItemCard
            key={item.id}
            slug={item.slug}
            title={item.title}
            category={item.category}
            status={item.status}
            publicPrice={item.public_price}
            cosmeticGrade={item.cosmetic_grade}
            primaryPhotoId={primaryPhoto?.cloudinary_id || null}
          />
        );
      })}
    </div>
  );
}
