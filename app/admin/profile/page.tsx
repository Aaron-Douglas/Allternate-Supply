import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AdminPageTemplate } from '@/components/templates/AdminPageTemplate';

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const { data: profile } = await supabase
    .from('staff_profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  return (
    <AdminPageTemplate title="Profile" description="Your account details">
      <div className="rounded-xl border border-gray-200 bg-white p-6 max-w-lg space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Email</p>
          <p className="mt-1 text-gray-900">{user.email}</p>
        </div>
        {profile ? (
          <>
            <div>
              <p className="text-sm font-medium text-gray-500">Full name</p>
              <p className="mt-1 text-gray-900">{profile.full_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Role</p>
              <p className="mt-1 text-gray-900 capitalize">{profile.role}</p>
            </div>
          </>
        ) : (
          <p className="text-sm text-amber-600">No staff profile found.</p>
        )}
        {user.created_at && (
          <div>
            <p className="text-sm font-medium text-gray-500">Member since</p>
            <p className="mt-1 text-gray-900">
              {new Date(user.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        )}
      </div>
    </AdminPageTemplate>
  );
}
