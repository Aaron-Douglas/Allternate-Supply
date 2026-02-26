import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AdminPageTemplate } from '@/components/templates/AdminPageTemplate';
import { AdminInventoryTable } from '@/components/organisms/AdminInventoryTable';
import { Button } from '@/components/atoms/Button';
import type { InventoryItem } from '@/types/inventory';

export default async function AdminInventoryPage() {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('inventory_items')
    .select('*')
    .order('created_at', { ascending: false });

  const items = (data || []) as InventoryItem[];

  return (
    <AdminPageTemplate
      title="Inventory"
      description={`${items.length} items in catalog`}
      actions={
        <Link href="/admin/inventory/new">
          <Button>+ New Item</Button>
        </Link>
      }
    >
      <AdminInventoryTable items={items} />
    </AdminPageTemplate>
  );
}
