'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { uploadItemPhoto, deleteCloudinaryAsset } from '@/lib/cloudinary/upload';

export async function uploadPhoto(
  itemId: string,
  formData: FormData
): Promise<{ id: string; cloudinary_url: string }> {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const file = formData.get('file') as File;
  if (!file) throw new Error('No file provided');

  // Check photo count
  const { count } = await supabase
    .from('item_photos')
    .select('*', { count: 'exact', head: true })
    .eq('item_id', itemId);

  if ((count || 0) >= 5) throw new Error('Maximum 5 photos per item');

  const position = count || 0;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { publicId, secureUrl } = await uploadItemPhoto(buffer, itemId, position);

  const { data, error } = await supabase
    .from('item_photos')
    .insert({
      item_id: itemId,
      cloudinary_id: publicId,
      cloudinary_url: secureUrl,
      position,
      uploaded_by: user.id,
    })
    .select('id, cloudinary_url')
    .single();

  if (error) throw new Error(error.message);

  // Get item slug for revalidation
  const { data: item } = await supabase
    .from('inventory_items')
    .select('slug')
    .eq('id', itemId)
    .single();

  revalidatePath('/');
  if (item?.slug) revalidatePath(`/items/${item.slug}`);

  return { id: data.id, cloudinary_url: data.cloudinary_url };
}

export async function reorderPhotos(itemId: string, orderedIds: string[]): Promise<void> {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Validate all IDs belong to this item
  const { data: photos } = await supabase
    .from('item_photos')
    .select('id')
    .eq('item_id', itemId);

  const photoIds = new Set(photos?.map(p => p.id) || []);
  for (const id of orderedIds) {
    if (!photoIds.has(id)) throw new Error('Invalid photo ID');
  }

  // Update positions
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase
      .from('item_photos')
      .update({ position: i })
      .eq('id', orderedIds[i]);
  }
}

export async function deletePhoto(photoId: string): Promise<void> {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Fetch photo to get cloudinary ID and item_id
  const { data: photo, error } = await supabase
    .from('item_photos')
    .select('cloudinary_id, item_id')
    .eq('id', photoId)
    .single();

  if (error || !photo) throw new Error('Photo not found');

  // Delete from Cloudinary
  await deleteCloudinaryAsset(photo.cloudinary_id);

  // Delete from DB
  await supabase
    .from('item_photos')
    .delete()
    .eq('id', photoId);

  // Re-number remaining photos
  const { data: remaining } = await supabase
    .from('item_photos')
    .select('id')
    .eq('item_id', photo.item_id)
    .order('position');

  if (remaining) {
    for (let i = 0; i < remaining.length; i++) {
      await supabase
        .from('item_photos')
        .update({ position: i })
        .eq('id', remaining[i].id);
    }
  }

  // Revalidate
  const { data: item } = await supabase
    .from('inventory_items')
    .select('slug')
    .eq('id', photo.item_id)
    .single();

  revalidatePath('/');
  if (item?.slug) revalidatePath(`/items/${item.slug}`);
}
