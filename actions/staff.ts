'use server';

import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

export type StaffRole = 'staff' | 'admin';

export interface StaffProfile {
  id: string;
  full_name: string;
  role: string;
  created_at: string;
}

async function ensureAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const { data: profile } = await supabase
    .from('staff_profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') throw new Error('Admin access required');
  return { user, supabase };
}

export async function createStaff(
  email: string,
  password: string,
  fullName: string,
  role: StaffRole
): Promise<void> {
  const { user, supabase } = await ensureAdmin();

  const serviceRole = await createServiceRoleClient();
  const { data: created, error: createError } = await serviceRole.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createError) throw new Error(createError.message);

  const userId = created.user.id;

  const { error: insertError } = await supabase.from('staff_profiles').insert({
    id: userId,
    full_name: fullName.trim() || email.split('@')[0],
    role,
  });
  if (insertError) throw new Error(insertError.message);

  await serviceRole.from('audit_events').insert({
    actor_id: user.id,
    action: 'staff.created',
    entity_type: 'staff',
    entity_id: userId,
    details: { email, full_name: fullName, role },
  });
}

export async function updateStaff(
  userId: string,
  updates: { full_name?: string; role?: StaffRole }
): Promise<void> {
  const { user, supabase } = await ensureAdmin();

  const updateData: { full_name?: string; role?: string } = {};
  if (updates.full_name !== undefined) updateData.full_name = updates.full_name.trim();
  if (updates.role !== undefined) updateData.role = updates.role;

  if (Object.keys(updateData).length === 0) return;

  const { error } = await supabase
    .from('staff_profiles')
    .update(updateData)
    .eq('id', userId);
  if (error) throw new Error(error.message);

  const serviceRole = await createServiceRoleClient();
  await serviceRole.from('audit_events').insert({
    actor_id: user.id,
    action: 'staff.updated',
    entity_type: 'staff',
    entity_id: userId,
    details: updateData,
  });
}

/** Returns staff profiles with email for each (uses service role to list auth users). Admin-only. */
export async function listStaffWithEmails(): Promise<
  { id: string; full_name: string; role: string; created_at: string; email: string | null }[]
> {
  await ensureAdmin();

  const supabase = await createServerSupabaseClient();
  const { data: profiles, error: profileError } = await supabase
    .from('staff_profiles')
    .select('id, full_name, role, created_at')
    .order('created_at', { ascending: false });
  if (profileError) throw new Error(profileError.message);
  if (!profiles?.length) return [];

  const serviceRole = await createServiceRoleClient();
  const { data: users } = await serviceRole.auth.admin.listUsers();
  const emailById = new Map<string, string>();
  users?.users?.forEach((u) => {
    if (u.email) emailById.set(u.id, u.email);
  });

  return profiles.map((p) => ({
    ...p,
    email: emailById.get(p.id) ?? null,
  }));
}
