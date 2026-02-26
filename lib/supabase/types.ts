// Auto-generated types placeholder
// Run: supabase gen types typescript --project-id <ref> > lib/supabase/types.ts
// to generate actual types from your database schema

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      inventory_items: {
        Row: {
          id: string;
          sku: string;
          slug: string;
          title: string;
          category: string;
          brand: string | null;
          model: string | null;
          serial_tag: string | null;
          specs: Json;
          cosmetic_grade: string | null;
          functional_grade: string | null;
          battery_condition: string | null;
          public_price: number;
          internal_cost: number | null;
          public_description: string | null;
          internal_notes: string | null;
          status: string;
          hold_expires_at: string | null;
          status_changed_at: string;
          status_changed_by: string | null;
          warranty_policy_id: string | null;
          returns_policy_id: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          sku: string;
          slug: string;
          title: string;
          category: string;
          brand?: string | null;
          model?: string | null;
          serial_tag?: string | null;
          specs?: Json;
          cosmetic_grade?: string | null;
          functional_grade?: string | null;
          battery_condition?: string | null;
          public_price: number;
          internal_cost?: number | null;
          public_description?: string | null;
          internal_notes?: string | null;
          status?: string;
          hold_expires_at?: string | null;
          warranty_policy_id?: string | null;
          returns_policy_id?: string | null;
          created_by?: string | null;
        };
        Update: Partial<{
          sku: string;
          slug: string;
          title: string;
          category: string;
          brand: string | null;
          model: string | null;
          serial_tag: string | null;
          specs: Json;
          cosmetic_grade: string | null;
          functional_grade: string | null;
          battery_condition: string | null;
          public_price: number;
          internal_cost: number | null;
          public_description: string | null;
          internal_notes: string | null;
          status: string;
          hold_expires_at: string | null;
          status_changed_at: string;
          status_changed_by: string | null;
          warranty_policy_id: string | null;
          returns_policy_id: string | null;
          updated_by: string | null;
        }>;
      };
      item_photos: {
        Row: {
          id: string;
          item_id: string;
          cloudinary_id: string;
          cloudinary_url: string;
          alt_text: string | null;
          position: number;
          uploaded_at: string;
          uploaded_by: string | null;
        };
        Insert: {
          id?: string;
          item_id: string;
          cloudinary_id: string;
          cloudinary_url: string;
          alt_text?: string | null;
          position?: number;
          uploaded_by?: string | null;
        };
        Update: Partial<{
          alt_text: string | null;
          position: number;
        }>;
      };
      sales: {
        Row: {
          id: string;
          receipt_number: string;
          item_id: string;
          buyer_name: string | null;
          buyer_phone: string | null;
          sale_price: number;
          payment_method: string | null;
          fulfillment_type: string | null;
          delivery_notes: string | null;
          warranty_snapshot: string | null;
          returns_snapshot: string | null;
          receipt_pdf_url: string | null;
          sold_at: string;
          recorded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          receipt_number: string;
          item_id: string;
          buyer_name?: string | null;
          buyer_phone?: string | null;
          sale_price: number;
          payment_method?: string | null;
          fulfillment_type?: string | null;
          delivery_notes?: string | null;
          warranty_snapshot?: string | null;
          returns_snapshot?: string | null;
          receipt_pdf_url?: string | null;
          sold_at?: string;
          recorded_by?: string | null;
        };
        Update: Partial<{
          receipt_pdf_url: string | null;
        }>;
      };
      page_views: {
        Row: {
          id: string;
          item_id: string;
          session_id: string;
          viewed_at: string;
          referrer: string | null;
          user_agent: string | null;
        };
        Insert: {
          id?: string;
          item_id: string;
          session_id: string;
          referrer?: string | null;
          user_agent?: string | null;
        };
        Update: never;
      };
      inquiries: {
        Row: {
          id: string;
          item_id: string;
          session_id: string;
          source: string;
          message: string | null;
          referrer: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          inquired_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          session_id: string;
          source?: string;
          message?: string | null;
          referrer?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
        };
        Update: never;
      };
      policies: {
        Row: {
          id: string;
          type: string;
          title: string;
          content: string;
          effective_date: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          type: string;
          title: string;
          content: string;
          effective_date: string;
          updated_by?: string | null;
        };
        Update: Partial<{
          title: string;
          content: string;
          effective_date: string;
          updated_by: string | null;
        }>;
      };
      staff_profiles: {
        Row: {
          id: string;
          full_name: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role?: string;
        };
        Update: Partial<{
          full_name: string;
          role: string;
        }>;
      };
      audit_events: {
        Row: {
          id: string;
          actor_id: string;
          action: string;
          entity_type: string;
          entity_id: string | null;
          details: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id: string;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          details?: Json | null;
        };
        Update: never;
      };
    };
    Views: {
      item_analytics: {
        Row: {
          id: string;
          title: string;
          sku: string;
          status: string;
          views_7d: number;
          views_30d: number;
          inquiries_7d: number;
          inquiries_30d: number;
          conversion_pct_30d: number | null;
        };
      };
    };
    Functions: {
      is_staff: { Returns: boolean };
      is_admin: { Returns: boolean };
      generate_receipt_number: { Returns: string };
    };
  };
}
