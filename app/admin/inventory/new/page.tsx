'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormPageTemplate } from '@/components/templates/FormPageTemplate';
import { ItemForm, ItemFormData } from '@/components/organisms/ItemForm';
import { createItem } from '@/actions/inventory';

export default function NewItemPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: ItemFormData) => {
    setIsLoading(true);
    try {
      const result = await createItem(data);
      router.push(`/admin/inventory/${result.id}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create item');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormPageTemplate title="New Item" description="Add a new item to your inventory">
      <ItemForm onSubmit={handleSubmit} isLoading={isLoading} />
    </FormPageTemplate>
  );
}
