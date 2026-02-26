export type ItemStatus = 'AVAILABLE' | 'ON_HOLD' | 'SOLD' | 'RETURNED';
export type CosmeticGrade = 'A' | 'B' | 'C';
export type FunctionalGrade = 'A' | 'B' | 'C';
export type BatteryCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'N/A';
export type Category = 'laptop' | 'desktop' | 'tablet' | 'phone' | 'accessory' | 'other';

export interface InventoryItem {
  id: string;
  sku: string;
  slug: string;
  title: string;
  category: Category;
  brand: string | null;
  model: string | null;
  serial_tag: string | null;
  specs: Record<string, unknown>;
  cosmetic_grade: CosmeticGrade | null;
  functional_grade: FunctionalGrade | null;
  battery_condition: BatteryCondition | null;
  public_price: number;
  internal_cost: number | null;
  public_description: string | null;
  internal_notes: string | null;
  status: ItemStatus;
  hold_expires_at: string | null;
  status_changed_at: string;
  status_changed_by: string | null;
  warranty_policy_id: string | null;
  returns_policy_id: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface ItemPhoto {
  id: string;
  item_id: string;
  cloudinary_id: string;
  cloudinary_url: string;
  alt_text: string | null;
  position: number;
  uploaded_at: string;
  uploaded_by: string | null;
}

export interface InventoryItemWithPhotos extends InventoryItem {
  item_photos: ItemPhoto[];
}
