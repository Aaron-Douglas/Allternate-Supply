import { CURRENCY } from '@/lib/currency';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createStaticSupabaseClient } from '@/lib/supabase/server';
import { ItemDetailGallery } from '@/components/organisms/ItemDetailGallery';
import { ItemSpecsTable } from '@/components/organisms/ItemSpecsTable';
import { ItemDetailTemplate } from '@/components/templates/ItemDetailTemplate';
import { WhatsAppButton } from '@/components/molecules/WhatsAppButton';
import { SaleStatusBanner } from '@/components/molecules/SaleStatusBanner';
import { PriceTag } from '@/components/atoms/PriceTag';
import { ConditionDot } from '@/components/atoms/ConditionDot';
import { Badge } from '@/components/atoms/Badge';
import { ViewLogger } from './ViewLogger';
import type { InventoryItem, ItemPhoto, Category, CosmeticGrade, ItemStatus } from '@/types/inventory';
import Link from 'next/link';

export const revalidate = 60;

async function getItem(slug: string) {
  const supabase = createStaticSupabaseClient();

  const { data } = await supabase
    .from('inventory_items')
    .select('*, item_photos(*)')
    .eq('slug', slug)
    .single();

  return data as (InventoryItem & { item_photos: ItemPhoto[] }) | null;
}

async function getPolicies() {
  const supabase = createStaticSupabaseClient();
  const { data } = await supabase.from('policies').select('*');
  return data || [];
}

export async function generateStaticParams() {
  const supabase = createStaticSupabaseClient();
  const { data } = await supabase.from('inventory_items').select('slug');
  return (data || []).map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const item = await getItem(params.slug);
  if (!item) return { title: 'Item Not Found' };
  return {
    title: `${item.title} | ${process.env.NEXT_PUBLIC_SHOP_NAME || 'Electronics Catalog'}`,
    description: item.public_description || `${item.title} - ${item.category} available for purchase`,
  };
}

export default async function ItemDetailPage({ params }: { params: { slug: string } }) {
  const [item, policies] = await Promise.all([getItem(params.slug), getPolicies()]);

  if (!item) notFound();

  const photos = (item.item_photos || []).sort((a, b) => a.position - b.position);
  const warranty = policies.find(p => p.type === 'warranty');
  const returns = policies.find(p => p.type === 'returns');

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.title,
    description: item.public_description,
    sku: item.sku,
    brand: item.brand ? { '@type': 'Brand', name: item.brand } : undefined,
    offers: {
      '@type': 'Offer',
      price: item.public_price,
      priceCurrency: CURRENCY,
      availability: item.status === 'AVAILABLE'
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ViewLogger itemId={item.id} />
      <ItemDetailTemplate
        gallery={
          <ItemDetailGallery
            photos={photos}
            status={item.status as ItemStatus}
            title={item.title}
          />
        }
        info={
          <div className="space-y-4">
            {(item.status === 'SOLD' || item.status === 'ON_HOLD') && (
              <SaleStatusBanner status={item.status as 'SOLD' | 'ON_HOLD'} holdExpiresAt={item.hold_expires_at} />
            )}

            <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
            <PriceTag amount={item.public_price} size="lg" />

            <div className="flex items-center gap-3">
              <Badge label={item.category} variant="new" />
              {item.cosmetic_grade && (
                <ConditionDot grade={item.cosmetic_grade as CosmeticGrade} showLabel />
              )}
            </div>

            {item.public_description && (
              <p className="text-sm text-gray-600">{item.public_description}</p>
            )}

            <ItemSpecsTable
              category={item.category as Category}
              specs={item.specs as Record<string, unknown>}
            />

            <WhatsAppButton
              itemId={item.id}
              title={item.title}
              price={item.public_price}
              status={item.status as ItemStatus}
            />

            <div className="flex gap-4 text-sm">
              {warranty && (
                <Link href="/warranty" className="text-brand-600 hover:underline">Warranty Policy</Link>
              )}
              {returns && (
                <Link href="/returns" className="text-brand-600 hover:underline">Returns Policy</Link>
              )}
            </div>
          </div>
        }
      />
    </>
  );
}
