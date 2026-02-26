import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { uploadItemPhoto } from '@/lib/cloudinary/upload';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const itemId = formData.get('itemId') as string;

    if (!file || !itemId) {
      return NextResponse.json({ error: 'File and itemId are required' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, or WebP allowed.' }, { status: 400 });
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum 10MB.' }, { status: 400 });
    }

    // Check photo count
    const { count } = await supabase
      .from('item_photos')
      .select('*', { count: 'exact', head: true })
      .eq('item_id', itemId);

    if ((count || 0) >= 5) {
      return NextResponse.json({ error: 'Maximum 5 photos per item.' }, { status: 400 });
    }

    const position = count || 0;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { publicId, secureUrl } = await uploadItemPhoto(buffer, itemId, position);

    const { data, error } = await supabase
      .from('item_photos')
      .insert({
        item_id: itemId,
        cloudinary_id: publicId,
        cloudinary_url: secureUrl,
        position,
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
