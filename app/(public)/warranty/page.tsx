import { createServerSupabaseClient } from '@/lib/supabase/server';

export const revalidate = 3600;

export const metadata = {
  title: `Warranty Policy | ${process.env.NEXT_PUBLIC_SHOP_NAME || 'Electronics Catalog'}`,
};

export default async function WarrantyPage() {
  const supabase = await createServerSupabaseClient();

  const { data: policy } = await supabase
    .from('policies')
    .select('*')
    .eq('type', 'warranty')
    .single();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl mb-2">
        {policy?.title || 'Warranty Policy'}
      </h1>
      {policy?.effective_date && (
        <p className="text-sm text-gray-500 mb-6">
          Effective: {new Date(policy.effective_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      )}
      {policy?.content ? (
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: policy.content }}
        />
      ) : (
        <p className="text-gray-500">No warranty policy has been published yet.</p>
      )}
    </div>
  );
}
