export type PaymentMethod = 'cash' | 'bank_transfer' | 'mobile_money' | 'other';
export type FulfillmentType = 'pickup' | 'delivery';

export interface Sale {
  id: string;
  receipt_number: string;
  item_id: string;
  buyer_name: string | null;
  buyer_phone: string | null;
  sale_price: number;
  payment_method: PaymentMethod | null;
  fulfillment_type: FulfillmentType | null;
  delivery_notes: string | null;
  warranty_snapshot: string | null;
  returns_snapshot: string | null;
  receipt_pdf_url: string | null;
  sold_at: string;
  recorded_by: string | null;
  created_at: string;
}

export interface SaleWithItem extends Sale {
  inventory_items: {
    id: string;
    sku: string;
    title: string;
    category: string;
    brand: string | null;
    model: string | null;
    specs: Record<string, unknown>;
    cosmetic_grade: string | null;
    functional_grade: string | null;
    public_price: number;
  };
}
