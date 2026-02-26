'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/atoms/Button';
import { Label } from '@/components/atoms/Label';
import { ErrorMessage } from '@/components/atoms/ErrorMessage';
import { CURRENCY } from '@/lib/currency';

export type SaleFormData = {
  buyer_name?: string;
  buyer_phone?: string;
  sale_price: number;
  payment_method: 'cash' | 'bank_transfer' | 'mobile_money' | 'other';
  fulfillment_type: 'pickup' | 'delivery';
  delivery_notes?: string;
  sold_at?: string;
};

type SaleFormProps = {
  defaultPrice: number;
  itemTitle: string;
  onSubmit: (data: SaleFormData) => Promise<void>;
  isLoading?: boolean;
};

export function SaleForm({ defaultPrice, itemTitle, onSubmit, isLoading }: SaleFormProps) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SaleFormData>({
    defaultValues: {
      sale_price: defaultPrice,
      payment_method: 'cash',
      fulfillment_type: 'pickup',
      sold_at: new Date().toISOString().slice(0, 16),
    },
  });

  const fulfillment = watch('fulfillment_type');
  const inputCls = 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm min-h-[44px]';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
        <p className="text-sm text-gray-600">Recording sale for:</p>
        <p className="text-lg font-semibold text-gray-900">{itemTitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="buyer_name">Buyer Name</Label>
          <input {...register('buyer_name')} id="buyer_name" className={inputCls} />
        </div>
        <div>
          <Label htmlFor="buyer_phone">Buyer Phone</Label>
          <input {...register('buyer_phone')} id="buyer_phone" className={inputCls} />
        </div>
      </div>

      <div>
        <Label htmlFor="sale_price" required>Sale Price ({CURRENCY})</Label>
        <input type="number" step="0.01" {...register('sale_price')} id="sale_price" className={inputCls} />
        <ErrorMessage message={errors.sale_price?.message} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="payment_method">Payment Method</Label>
          <select {...register('payment_method')} id="payment_method" className={inputCls}>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <Label htmlFor="fulfillment_type">Fulfillment</Label>
          <select {...register('fulfillment_type')} id="fulfillment_type" className={inputCls}>
            <option value="pickup">Pickup</option>
            <option value="delivery">Delivery</option>
          </select>
        </div>
      </div>

      {fulfillment === 'delivery' && (
        <div>
          <Label htmlFor="delivery_notes">Delivery Notes</Label>
          <textarea {...register('delivery_notes')} id="delivery_notes" rows={3} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
      )}

      <div>
        <Label htmlFor="sold_at">Sale Date & Time</Label>
        <input type="datetime-local" {...register('sold_at')} id="sold_at" className={inputCls} />
      </div>

      <Button type="submit" isLoading={isLoading} size="lg" className="w-full">
        Record Sale
      </Button>
    </form>
  );
}
