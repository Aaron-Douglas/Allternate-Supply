'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FormPageTemplate } from '@/components/templates/FormPageTemplate';
import { SaleForm, SaleFormData } from '@/components/organisms/SaleForm';
import { createSale } from '@/actions/sales';
import { createClient } from '@/lib/supabase/client';
import { Spinner } from '@/components/atoms/Spinner';
import type { InventoryItem } from '@/types/inventory';

export default function RecordSalePage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : null;
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!id) {
      setIsFetching(false);
      return;
    }
    const fetchItem = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', id)
        .single();

      setItem(data as InventoryItem | null);
      setIsFetching(false);
    };
    fetchItem();
  }, [id]);

  const handleSubmit = async (data: SaleFormData) => {
    if (!id) return;
    setIsLoading(true);
    try {
      const result = await createSale({
        itemId: id,
        ...data,
      });
      alert(`Sale recorded! Receipt: ${result.receiptNumber}`);
      router.push('/admin/sales');
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to record sale');
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

  if (item.status === 'SOLD') {
    return (
      <FormPageTemplate title="Item Already Sold">
        <p className="text-gray-500">This item has already been sold.</p>
      </FormPageTemplate>
    );
  }

  return (
    <FormPageTemplate title="Record Sale" description={`Selling: ${item.title}`}>
      <SaleForm
        defaultPrice={item.public_price}
        itemTitle={item.title}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </FormPageTemplate>
  );
}
