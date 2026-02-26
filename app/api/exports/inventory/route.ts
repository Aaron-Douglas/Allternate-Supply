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

    const statusFilter = request.nextUrl.searchParams.get('status');

    let query = supabase
      .from('inventory_items')
      .select('sku, title, category, brand, model, status, public_price, cosmetic_grade, functional_grade, created_at')
      .order('created_at', { ascending: false });

    if (statusFilter) {
      query = query.eq('status', statusFilter.toUpperCase());
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const columns = ['sku', 'title', 'category', 'brand', 'model', 'status', 'public_price', 'cosmetic_grade', 'functional_grade', 'created_at'];
    const csv = toCSV(data || [], columns);
    const date = new Date().toISOString().split('T')[0];

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="inventory-${date}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
