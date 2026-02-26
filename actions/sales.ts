'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export type SaleFormData = {
  itemId: string;
  buyer_name?: string;
  buyer_phone?: string;
  sale_price: number;
  payment_method: string;
  fulfillment_type: string;
  delivery_notes?: string;
  sold_at?: string;
};

export async function createSale(formData: SaleFormData): Promise<{ receiptNumber: string }> {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // 1. Verify item exists and is AVAILABLE or ON_HOLD
  const { data: item, error: itemError } = await supabase
    .from('inventory_items')
    .select('id, status, slug')
    .eq('id', formData.itemId)
    .single();

  if (itemError || !item) throw new Error('Item not found');
  if (item.status === 'SOLD') throw new Error('Item is already sold');
  if (item.status === 'RETURNED') throw new Error('Item is returned and cannot be sold');

  // 2. Fetch current policies for snapshot
  const { data: policies } = await supabase
    .from('policies')
    .select('type, content');

  const warrantySnapshot = policies?.find(p => p.type === 'warranty')?.content || null;
  const returnsSnapshot = policies?.find(p => p.type === 'returns')?.content || null;

  // 3. Generate receipt number
  const { data: receiptData, error: receiptError } = await supabase
    .rpc('generate_receipt_number');

  if (receiptError) throw new Error('Failed to generate receipt number');
  const receiptNumber = receiptData as string;

  // 4. Insert sale
  const { error: saleError } = await supabase
    .from('sales')
    .insert({
      receipt_number: receiptNumber,
      item_id: formData.itemId,
      buyer_name: formData.buyer_name || null,
      buyer_phone: formData.buyer_phone || null,
      sale_price: formData.sale_price,
      payment_method: formData.payment_method,
      fulfillment_type: formData.fulfillment_type,
      delivery_notes: formData.delivery_notes || null,
      warranty_snapshot: warrantySnapshot,
      returns_snapshot: returnsSnapshot,
      sold_at: formData.sold_at || new Date().toISOString(),
      recorded_by: user.id,
    });

  if (saleError) throw new Error(saleError.message);

  // 5. Update item status to SOLD
  const { error: updateError } = await supabase
    .from('inventory_items')
    .update({
      status: 'SOLD',
      status_changed_at: new Date().toISOString(),
      status_changed_by: user.id,
    })
    .eq('id', formData.itemId);

  if (updateError) throw new Error(updateError.message);

  const serviceRole = await createServiceRoleClient();
  await serviceRole.from('audit_events').insert({
    actor_id: user.id,
    action: 'sale.recorded',
    entity_type: 'sale',
    entity_id: formData.itemId,
    details: { receipt_number: receiptNumber },
  });

  // 6. Revalidate pages
  revalidatePath('/');
  revalidatePath('/sold');
  if (item.slug) {
    revalidatePath(`/items/${item.slug}`);
  }

  return { receiptNumber };
}
