import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { saleId: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const saleId = params?.saleId;
    if (!saleId) {
      return NextResponse.json({ error: 'Missing sale ID' }, { status: 400 });
    }

    const { data: sale, error } = await supabase
      .from('sales')
      .select(`
        id, receipt_number, item_id, buyer_name, buyer_phone, sale_price,
        payment_method, fulfillment_type, sold_at, warranty_snapshot, returns_snapshot, receipt_pdf_url,
        inventory_items (
          id, sku, title, category, brand, model, specs,
          cosmetic_grade, functional_grade, public_price
        )
      `)
      .eq('id', saleId)
      .single();

    if (error || !sale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    if (sale.receipt_pdf_url) {
      return NextResponse.redirect(sale.receipt_pdf_url);
    }

    return NextResponse.json(sale);
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
