'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { slugify, generateSKU } from '@/lib/utils';

export type ItemFormData = {
  title: string;
  category: string;
  sku?: string;
  brand?: string;
  model?: string;
  serial_tag?: string;
  public_price: number;
  internal_cost?: number;
  cosmetic_grade?: string;
  functional_grade?: string;
  battery_condition?: string;
  public_description?: string;
  internal_notes?: string;
  status: string;
  hold_expires_at?: string;
  specs?: Record<string, unknown>;
};

export async function createItem(formData: ItemFormData): Promise<{ id: string; slug: string }> {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Generate SKU if not provided
  let sku = formData.sku;
  if (!sku) {
    const { count } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true })
      .eq('category', formData.category);
    sku = generateSKU(formData.category, (count || 0) + 1);
  }

  const slug = `${slugify(formData.title)}-${sku.toLowerCase()}`;

  const { data, error } = await supabase
    .from('inventory_items')
    .insert({
      sku,
      slug,
      title: formData.title,
      category: formData.category,
      brand: formData.brand || null,
      model: formData.model || null,
      serial_tag: formData.serial_tag || null,
      specs: formData.specs || {},
      cosmetic_grade: formData.cosmetic_grade || null,
      functional_grade: formData.functional_grade || null,
      battery_condition: formData.battery_condition || null,
      public_price: formData.public_price,
      internal_cost: formData.internal_cost || null,
      public_description: formData.public_description || null,
      internal_notes: formData.internal_notes || null,
      status: formData.status || 'AVAILABLE',
      hold_expires_at: formData.hold_expires_at || null,
      created_by: user.id,
    })
    .select('id, slug')
    .single();

  if (error) throw new Error(error.message);

  const serviceRole = await createServiceRoleClient();
  await serviceRole.from('audit_events').insert({
    actor_id: user.id,
    action: 'item.created',
    entity_type: 'inventory_item',
    entity_id: data.id,
    details: { slug: data.slug, title: formData.title },
  });

  revalidatePath('/');
  return { id: data.id, slug: data.slug };
}

export async function updateItem(id: string, formData: Partial<ItemFormData>): Promise<void> {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Build update object
  const updateData: Record<string, unknown> = {};
  if (formData.title !== undefined) updateData.title = formData.title;
  if (formData.category !== undefined) updateData.category = formData.category;
  if (formData.brand !== undefined) updateData.brand = formData.brand || null;
  if (formData.model !== undefined) updateData.model = formData.model || null;
  if (formData.serial_tag !== undefined) updateData.serial_tag = formData.serial_tag || null;
  if (formData.specs !== undefined) updateData.specs = formData.specs;
  if (formData.cosmetic_grade !== undefined) updateData.cosmetic_grade = formData.cosmetic_grade || null;
  if (formData.functional_grade !== undefined) updateData.functional_grade = formData.functional_grade || null;
  if (formData.battery_condition !== undefined) updateData.battery_condition = formData.battery_condition || null;
  if (formData.public_price !== undefined) updateData.public_price = formData.public_price;
  if (formData.internal_cost !== undefined) updateData.internal_cost = formData.internal_cost || null;
  if (formData.public_description !== undefined) updateData.public_description = formData.public_description || null;
  if (formData.internal_notes !== undefined) updateData.internal_notes = formData.internal_notes || null;
  if (formData.hold_expires_at !== undefined) updateData.hold_expires_at = formData.hold_expires_at || null;

  if (formData.status !== undefined) {
    updateData.status = formData.status;
    updateData.status_changed_at = new Date().toISOString();
    updateData.status_changed_by = user.id;
  }

  updateData.updated_by = user.id;

  const { error } = await supabase
    .from('inventory_items')
    .update(updateData)
    .eq('id', id);

  if (error) throw new Error(error.message);

  // Get slug for revalidation
  const { data: item } = await supabase
    .from('inventory_items')
    .select('slug')
    .eq('id', id)
    .single();

  revalidatePath('/');
  if (item?.slug) {
    revalidatePath(`/items/${item.slug}`);
  }
  revalidatePath('/sold');

  const serviceRole = await createServiceRoleClient();
  await serviceRole.from('audit_events').insert({
    actor_id: user.id,
    action: 'item.updated',
    entity_type: 'inventory_item',
    entity_id: id,
    details: item?.slug ? { slug: item.slug } : undefined,
  });
}

export async function deleteItem(id: string): Promise<void> {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: item } = await supabase
    .from('inventory_items')
    .select('slug')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);

  const serviceRole = await createServiceRoleClient();
  await serviceRole.from('audit_events').insert({
    actor_id: user.id,
    action: 'item.deleted',
    entity_type: 'inventory_item',
    entity_id: id,
    details: item?.slug ? { slug: item.slug } : undefined,
  });

  revalidatePath('/');
  revalidatePath('/sold');
}
