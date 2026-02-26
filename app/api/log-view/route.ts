import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { itemId, sessionId } = await request.json();

    if (!itemId || !sessionId) {
      return NextResponse.json({ error: 'itemId and sessionId are required' }, { status: 400 });
    }

    const supabase = await createServiceRoleClient();

    // Dedup: check for view within last 30 minutes
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from('page_views')
      .select('id')
      .eq('item_id', itemId)
      .eq('session_id', sessionId)
      .gte('viewed_at', thirtyMinAgo)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ recorded: false });
    }

    // Insert new view
    const { error } = await supabase
      .from('page_views')
      .insert({
        item_id: itemId,
        session_id: sessionId,
        referrer: request.headers.get('referer') || null,
        user_agent: request.headers.get('user-agent') || null,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ recorded: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
