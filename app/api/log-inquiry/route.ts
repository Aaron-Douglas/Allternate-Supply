import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, sessionId, source, referrer, utmSource, utmMedium, utmCampaign, message } = body;

    if (!itemId || !sessionId) {
      return NextResponse.json({ error: 'itemId and sessionId are required' }, { status: 400 });
    }

    const supabase = await createServiceRoleClient();

    const { error } = await supabase
      .from('inquiries')
      .insert({
        item_id: itemId,
        session_id: sessionId,
        source: source || 'whatsapp',
        message: message || null,
        referrer: referrer || null,
        utm_source: utmSource || null,
        utm_medium: utmMedium || null,
        utm_campaign: utmCampaign || null,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ recorded: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
