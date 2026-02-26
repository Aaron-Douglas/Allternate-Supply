import { Suspense } from 'react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { InventoryGrid } from '@/components/organisms/InventoryGrid';
import { InventoryFilters } from '@/components/organisms/InventoryFilters';
import { Spinner } from '@/components/atoms/Spinner';
import type { InventoryItem, ItemPhoto } from '@/types/inventory';

export const revalidate = 60;

type SearchParams = {
  category?: string;
  status?: string;
  q?: string;
  min_price?: string;
  max_price?: string;
};

async function getItems(searchParams: SearchParams) {
  const supabase = await createServerSupabaseClient();

  const showReturned = process.env.NEXT_PUBLIC_FEATURE_RETURNED_ITEMS_VISIBLE === 'true';

  let query = supabase
    .from('inventory_items')
    .select('*, item_photos(*)')
    .order('created_at', { ascending: false });

  if (!showReturned) {
    query = query.neq('status', 'RETURNED');
  }

  if (searchParams.category) {
    query = query.eq('category', searchParams.category);
  }

  if (searchParams.status) {
    query = query.eq('status', searchParams.status.toUpperCase());
  }

  if (searchParams.q) {
    const search = searchParams.q;
    query = query.or(`title.ilike.%${search}%,brand.ilike.%${search}%,model.ilike.%${search}%,sku.ilike.%${search}%`);
  }

  if (searchParams.min_price) {
    query = query.gte('public_price', parseFloat(searchParams.min_price));
  }

  if (searchParams.max_price) {
    query = query.lte('public_price', parseFloat(searchParams.max_price));
  }

  const { data } = await query;
  return (data || []) as (InventoryItem & { item_photos: ItemPhoto[] })[];
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const items = await getItems(searchParams);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Browse Our Inventory</h1>
        <p className="mt-1 text-gray-500">Quality pre-owned electronics, ready for purchase</p>
      </div>

      <div className="lg:grid lg:grid-cols-4 lg:gap-8">
        <aside className="lg:col-span-1 mb-6 lg:mb-0">
          <Suspense fallback={<Spinner />}>
            <InventoryFilters />
          </Suspense>
        </aside>
        <div className="lg:col-span-3">
          <InventoryGrid items={items} />
        </div>
      </div>
    </div>
  );
}
