import { createServerSupabaseClient } from '@/lib/supabase/server';
import { RecentlySoldReel } from '@/components/organisms/RecentlySoldReel';
import type { InventoryItem, ItemPhoto } from '@/types/inventory';

export const revalidate = 120;

export const metadata = {
  title: `Recently Sold | ${process.env.NEXT_PUBLIC_SHOP_NAME || 'Electronics Catalog'}`,
};

export default async function SoldPage() {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('inventory_items')
    .select('*, item_photos(*)')
    .eq('status', 'SOLD')
    .order('status_changed_at', { ascending: false })
    .limit(30);

  const items = (data || []) as (InventoryItem & { item_photos: ItemPhoto[] })[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Recently Sold</h1>
        <p className="mt-1 text-gray-500">Check out what our customers have been buying</p>
      </div>
      <RecentlySoldReel items={items} />
    </div>
  );
}
