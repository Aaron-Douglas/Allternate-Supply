'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/atoms/Button';
import { Label } from '@/components/atoms/Label';
import { ErrorMessage } from '@/components/atoms/ErrorMessage';
import { StatusSelector } from '@/components/molecules/StatusSelector';
import { CURRENCY } from '@/lib/currency';
import type { InventoryItem, ItemStatus } from '@/types/inventory';

export type ItemFormData = {
  title: string;
  category: 'laptop' | 'desktop' | 'tablet' | 'phone' | 'accessory' | 'other';
  sku?: string;
  brand?: string;
  model?: string;
  serial_tag?: string;
  public_price: number;
  internal_cost?: number;
  cosmetic_grade?: 'A' | 'B' | 'C';
  functional_grade?: 'A' | 'B' | 'C';
  battery_condition?: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'N/A';
  public_description?: string;
  internal_notes?: string;
  status: 'AVAILABLE' | 'ON_HOLD' | 'SOLD' | 'RETURNED';
  hold_expires_at?: string;
  specs?: Record<string, unknown>;
};

type ItemFormProps = {
  item?: InventoryItem | null;
  onSubmit: (data: ItemFormData) => Promise<void>;
  isLoading?: boolean;
};

export function ItemForm({ item, onSubmit, isLoading }: ItemFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ItemFormData>({
    defaultValues: {
      title: item?.title || '',
      category: (item?.category as ItemFormData['category']) || 'laptop',
      sku: item?.sku || '',
      brand: item?.brand || '',
      model: item?.model || '',
      serial_tag: item?.serial_tag || '',
      public_price: item?.public_price || 0,
      internal_cost: item?.internal_cost || undefined,
      cosmetic_grade: (item?.cosmetic_grade as ItemFormData['cosmetic_grade']) || undefined,
      functional_grade: (item?.functional_grade as ItemFormData['functional_grade']) || undefined,
      battery_condition: (item?.battery_condition as ItemFormData['battery_condition']) || undefined,
      public_description: item?.public_description || '',
      internal_notes: item?.internal_notes || '',
      status: (item?.status as ItemStatus) || 'AVAILABLE',
      hold_expires_at: item?.hold_expires_at || '',
      specs: (item?.specs as Record<string, unknown>) || {},
    },
  });

  const status = watch('status');
  const category = watch('category');
  const inputCls = 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm min-h-[44px]';

  const updateSpec = (key: string, value: string) => {
    setValue('specs', { ...watch('specs'), [key]: value });
  };
  const specVal = (key: string) => (item?.specs as Record<string, string>)?.[key] || '';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Identification</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title" required>Title</Label>
            <input {...register('title')} id="title" className={inputCls} />
            <ErrorMessage message={errors.title?.message} />
          </div>
          <div>
            <Label htmlFor="category" required>Category</Label>
            <select {...register('category')} id="category" className={inputCls}>
              <option value="laptop">Laptop</option>
              <option value="desktop">Desktop</option>
              <option value="tablet">Tablet</option>
              <option value="phone">Phone</option>
              <option value="accessory">Accessory</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <Label htmlFor="sku">SKU</Label>
            <input {...register('sku')} id="sku" placeholder="Auto-generated if empty" className={inputCls} />
          </div>
          <div>
            <Label htmlFor="brand">Brand</Label>
            <input {...register('brand')} id="brand" className={inputCls} />
          </div>
          <div>
            <Label htmlFor="model">Model</Label>
            <input {...register('model')} id="model" className={inputCls} />
          </div>
          <div>
            <Label htmlFor="serial_tag">Serial / Service Tag</Label>
            <input {...register('serial_tag')} id="serial_tag" className={inputCls} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Specifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(category === 'laptop' || category === 'desktop') && (
            <>
              <div><Label>CPU</Label><input defaultValue={specVal('cpu')} onChange={e => updateSpec('cpu', e.target.value)} className={inputCls} /></div>
              <div><Label>RAM (GB)</Label><input type="number" defaultValue={specVal('ram_gb')} onChange={e => updateSpec('ram_gb', e.target.value)} className={inputCls} /></div>
              <div><Label>Storage (GB)</Label><input type="number" defaultValue={specVal('storage_gb')} onChange={e => updateSpec('storage_gb', e.target.value)} className={inputCls} /></div>
              <div><Label>Storage Type</Label><select defaultValue={specVal('storage_type')} onChange={e => updateSpec('storage_type', e.target.value)} className={inputCls}><option value="">Select</option><option value="SSD">SSD</option><option value="HDD">HDD</option><option value="NVMe">NVMe</option></select></div>
              <div><Label>GPU</Label><input defaultValue={specVal('gpu')} onChange={e => updateSpec('gpu', e.target.value)} className={inputCls} /></div>
              <div><Label>Screen Size</Label><input defaultValue={specVal('screen_size')} onChange={e => updateSpec('screen_size', e.target.value)} className={inputCls} /></div>
              <div><Label>OS</Label><input defaultValue={specVal('os')} onChange={e => updateSpec('os', e.target.value)} className={inputCls} /></div>
            </>
          )}
          {(category === 'tablet' || category === 'phone') && (
            <>
              <div><Label>CPU</Label><input defaultValue={specVal('cpu')} onChange={e => updateSpec('cpu', e.target.value)} className={inputCls} /></div>
              <div><Label>RAM (GB)</Label><input type="number" defaultValue={specVal('ram_gb')} onChange={e => updateSpec('ram_gb', e.target.value)} className={inputCls} /></div>
              <div><Label>Storage (GB)</Label><input type="number" defaultValue={specVal('storage_gb')} onChange={e => updateSpec('storage_gb', e.target.value)} className={inputCls} /></div>
              <div><Label>Screen Size</Label><input defaultValue={specVal('screen_size')} onChange={e => updateSpec('screen_size', e.target.value)} className={inputCls} /></div>
              <div><Label>OS</Label><input defaultValue={specVal('os')} onChange={e => updateSpec('os', e.target.value)} className={inputCls} /></div>
            </>
          )}
          {category === 'accessory' && (
            <>
              <div><Label>Type</Label><input defaultValue={specVal('type')} onChange={e => updateSpec('type', e.target.value)} className={inputCls} /></div>
              <div><Label>Compatibility</Label><input defaultValue={specVal('compatibility')} onChange={e => updateSpec('compatibility', e.target.value)} className={inputCls} /></div>
              <div><Label>Color</Label><input defaultValue={specVal('color')} onChange={e => updateSpec('color', e.target.value)} className={inputCls} /></div>
            </>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Condition</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Cosmetic Grade</Label>
            <select {...register('cosmetic_grade')} className={inputCls}>
              <option value="">Select</option><option value="A">A - Excellent</option><option value="B">B - Good</option><option value="C">C - Fair</option>
            </select>
          </div>
          <div>
            <Label>Functional Grade</Label>
            <select {...register('functional_grade')} className={inputCls}>
              <option value="">Select</option><option value="A">A - Excellent</option><option value="B">B - Good</option><option value="C">C - Fair</option>
            </select>
          </div>
          <div>
            <Label>Battery Condition</Label>
            <select {...register('battery_condition')} className={inputCls}>
              <option value="">Select</option><option value="Excellent">Excellent</option><option value="Good">Good</option><option value="Fair">Fair</option><option value="Poor">Poor</option><option value="N/A">N/A</option>
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="public_price" required>Public Price ({CURRENCY})</Label>
            <input type="number" step="0.01" {...register('public_price')} id="public_price" className={inputCls} />
            <ErrorMessage message={errors.public_price?.message} />
          </div>
          <div>
            <Label htmlFor="internal_cost">Internal Cost ({CURRENCY})</Label>
            <input type="number" step="0.01" {...register('internal_cost')} id="internal_cost" className={inputCls} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Content</h2>
        <div>
          <Label htmlFor="public_description">Public Description</Label>
          <textarea {...register('public_description')} id="public_description" rows={3} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <Label htmlFor="internal_notes">Internal Notes (staff only)</Label>
          <textarea {...register('internal_notes')} id="internal_notes" rows={3} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Status</h2>
        <StatusSelector value={status} onChange={(s) => setValue('status', s)} />
        {status === 'ON_HOLD' && (
          <div>
            <Label htmlFor="hold_expires_at">Hold Expires At</Label>
            <input type="datetime-local" {...register('hold_expires_at')} id="hold_expires_at" className={inputCls} />
          </div>
        )}
      </section>

      <div className="flex gap-3 pt-4 border-t">
        <Button type="submit" isLoading={isLoading} size="lg">
          {item ? 'Update Item' : 'Create Item'}
        </Button>
      </div>
    </form>
  );
}
