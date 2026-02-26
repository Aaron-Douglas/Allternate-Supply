import { ItemCard } from '@/components/molecules/ItemCard';
import type { InventoryItem, ItemPhoto } from '@/types/inventory';

type RecentlySoldReelProps = {
  items: (InventoryItem & { item_photos: ItemPhoto[] })[];
};

export function RecentlySoldReel({ items }: RecentlySoldReelProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No recently sold items to display.</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: horizontal scroll */}
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory lg:hidden">
        {items.map((item) => {
          const primaryPhoto = item.item_photos?.find((p) => p.position === 0) || item.item_photos?.[0];
          return (
            <div key={item.id} className="min-w-[280px] snap-start">
              <ItemCard
                slug={item.slug}
                title={item.title}
                category={item.category}
                status={item.status}
                publicPrice={item.public_price}
                cosmeticGrade={item.cosmetic_grade}
                primaryPhotoId={primaryPhoto?.cloudinary_id || null}
              />
            </div>
          );
        })}
      </div>
      {/* Desktop: grid */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6">
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
    </>
  );
}
