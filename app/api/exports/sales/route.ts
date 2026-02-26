import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { toCSV } from '@/lib/csv';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const from = request.nextUrl.searchParams.get('from');
    const to = request.nextUrl.searchParams.get('to');

    let query = supabase
      .from('sales')
      .select(`
        receipt_number, sale_price, buyer_name, buyer_phone,
        payment_method, fulfillment_type, sold_at,
        inventory_items ( sku, title )
      `)
      .order('sold_at', { ascending: false });

    if (from) query = query.gte('sold_at', `${from}T00:00:00`);
    if (to) query = query.lte('sold_at', `${to}T23:59:59`);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Flatten joined data
    const rows = (data || []).map((row: Record<string, unknown>) => {
      const item = row.inventory_items as Record<string, unknown> | null;
      return {
        receipt_number: row.receipt_number,
        sku: item?.sku || '',
        title: item?.title || '',
        buyer_name: row.buyer_name,
        buyer_phone: row.buyer_phone,
        sale_price: row.sale_price,
        payment_method: row.payment_method,
        fulfillment_type: row.fulfillment_type,
        sold_at: row.sold_at,
      };
    });

    const columns = ['receipt_number', 'sku', 'title', 'buyer_name', 'buyer_phone', 'sale_price', 'payment_method', 'fulfillment_type', 'sold_at'];
    const csv = toCSV(rows, columns);
    const date = new Date().toISOString().split('T')[0];

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="sales-${date}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
