'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FormPageTemplate } from '@/components/templates/FormPageTemplate';
import { ItemForm, ItemFormData } from '@/components/organisms/ItemForm';
import { ItemPhotoManager } from '@/components/organisms/ItemPhotoManager';
import { updateItem } from '@/actions/inventory';
import { createClient } from '@/lib/supabase/client';
import { Spinner } from '@/components/atoms/Spinner';
import type { InventoryItemWithPhotos } from '@/types/inventory';

function formatAuditDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return '—';
  }
}

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const [item, setItem] = useState<InventoryItemWithPhotos | null>(null);
  const [staffNames, setStaffNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('inventory_items')
        .select('*, item_photos(*)')
        .eq('id', params.id as string)
        .single();

      if (data) {
        const itemPhotos = (data.item_photos || []).sort(
          (a: { position: number }, b: { position: number }) => a.position - b.position
        );
        setItem({ ...data, item_photos: itemPhotos } as InventoryItemWithPhotos);

        const ids = [data.created_by, data.updated_by].filter(Boolean);
        if (ids.length > 0) {
          const { data: profiles } = await supabase
            .from('staff_profiles')
            .select('id, full_name')
            .in('id', ids);
          const map: Record<string, string> = {};
          profiles?.forEach((p: { id: string; full_name: string }) => {
            map[p.id] = p.full_name;
          });
          setStaffNames(map);
        }
      } else {
        setItem(null);
      }
      setIsFetching(false);
    };
    fetchItem();
  }, [params.id]);

  const handlePhotosUpdated = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('inventory_items')
      .select('*, item_photos(*)')
      .eq('id', params.id as string)
      .single();

    if (data) {
      const itemPhotos = (data.item_photos || []).sort(
        (a: { position: number }, b: { position: number }) => a.position - b.position
      );
      setItem({ ...data, item_photos: itemPhotos } as InventoryItemWithPhotos);
    }
  }, [params.id]);

  const handleSubmit = async (data: ItemFormData) => {
    setIsLoading(true);
    try {
      await updateItem(params.id as string, data);
      router.push('/admin/inventory');
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update item');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!item) {
    return (
      <FormPageTemplate title="Item Not Found">
        <p className="text-gray-500">The requested item was not found.</p>
      </FormPageTemplate>
    );
  }

  return (
    <FormPageTemplate title={`Edit: ${item.title}`} description={`SKU: ${item.sku}`}>
      <ItemPhotoManager
        itemId={item.id}
        photos={item.item_photos ?? []}
        onPhotosUpdated={handlePhotosUpdated}
      />
      <ItemForm item={item} onSubmit={handleSubmit} isLoading={isLoading} />
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Audit</h3>
        <dl className="text-sm text-gray-600 space-y-1">
          <div>
            <span className="text-gray-500">Created by </span>
            <span className="font-medium text-gray-900">
              {item.created_by ? staffNames[item.created_by] ?? 'Unknown' : '—'}
            </span>
            <span className="text-gray-500"> on {formatAuditDate(item.created_at)}</span>
          </div>
          <div>
            <span className="text-gray-500">Last updated by </span>
            <span className="font-medium text-gray-900">
              {item.updated_by ? (staffNames[item.updated_by] ?? 'Unknown') : '—'}
            </span>
            <span className="text-gray-500">
              {item.updated_at ? ` on ${formatAuditDate(item.updated_at)}` : ''}
            </span>
          </div>
        </dl>
      </div>
    </FormPageTemplate>
  );
}
