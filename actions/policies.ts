'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import sanitizeHtml from 'sanitize-html';

export async function updatePolicy(
  type: 'warranty' | 'returns',
  content: string,
  effectiveDate: string
): Promise<void> {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Check admin role
  const { data: profile } = await supabase
    .from('staff_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') throw new Error('Admin access required');

  // Sanitize HTML content
  const cleanContent = sanitizeHtml(content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h2', 'h3']),
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
    },
  });

  const { error } = await supabase
    .from('policies')
    .update({
      content: cleanContent,
      effective_date: effectiveDate,
      updated_by: user.id,
    })
    .eq('type', type);

  if (error) throw new Error(error.message);

  const serviceRole = await createServiceRoleClient();
  await serviceRole.from('audit_events').insert({
    actor_id: user.id,
    action: 'policy.updated',
    entity_type: 'policy',
    entity_id: type,
    details: {},
  });

  revalidatePath(`/${type === 'warranty' ? 'warranty' : 'returns'}`);
}
