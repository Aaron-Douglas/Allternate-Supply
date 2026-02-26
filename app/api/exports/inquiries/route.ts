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
      .from('inquiries')
      .select(`
        source, inquired_at, utm_source, utm_medium, utm_campaign,
        inventory_items ( sku, title )
      `)
      .order('inquired_at', { ascending: false });

    if (from) query = query.gte('inquired_at', `${from}T00:00:00`);
    if (to) query = query.lte('inquired_at', `${to}T23:59:59`);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (data || []).map((row: Record<string, unknown>) => {
      const item = row.inventory_items as Record<string, unknown> | null;
      return {
        item_sku: item?.sku || '',
        item_title: item?.title || '',
        source: row.source,
        inquired_at: row.inquired_at,
        utm_source: row.utm_source,
        utm_medium: row.utm_medium,
        utm_campaign: row.utm_campaign,
      };
    });

    const columns = ['item_sku', 'item_title', 'source', 'inquired_at', 'utm_source', 'utm_medium', 'utm_campaign'];
    const csv = toCSV(rows, columns);
    const date = new Date().toISOString().split('T')[0];

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="inquiries-${date}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
