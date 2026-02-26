import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AdminPageTemplate } from '@/components/templates/AdminPageTemplate';
import { AnalyticsSummary } from '@/components/organisms/AnalyticsSummary';
import type { ItemAnalytics } from '@/types/analytics';

export default async function AnalyticsPage() {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('item_analytics')
    .select('*');

  const analytics = (data || []) as ItemAnalytics[];

  return (
    <AdminPageTemplate title="Analytics" description="View and inquiry metrics per item">
      <AnalyticsSummary data={analytics} />
    </AdminPageTemplate>
  );
}
