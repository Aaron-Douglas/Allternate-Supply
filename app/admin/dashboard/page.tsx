import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AdminPageTemplate } from '@/components/templates/AdminPageTemplate';
import { Badge } from '@/components/atoms/Badge';
import { formatPrice } from '@/lib/utils';

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  // Item counts by status
  const statuses = ['AVAILABLE', 'ON_HOLD', 'SOLD', 'RETURNED'] as const;
  const counts: Record<string, number> = {};
  for (const status of statuses) {
    const { count } = await supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true })
      .eq('status', status);
    counts[status] = count || 0;
  }

  // Sales this month
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const { data: monthlySales } = await supabase
    .from('sales')
    .select('sale_price')
    .gte('sold_at', monthStart.toISOString());

  const salesCount = monthlySales?.length || 0;
  const salesRevenue = monthlySales?.reduce((sum, s) => sum + Number(s.sale_price), 0) || 0;

  // Inquiries this week
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const { count: inquiriesCount } = await supabase
    .from('inquiries')
    .select('*', { count: 'exact', head: true })
    .gte('inquired_at', weekStart.toISOString());

  // Most viewed item (7 days)
  const { data: analytics } = await supabase
    .from('item_analytics')
    .select('title, sku, views_7d')
    .order('views_7d', { ascending: false })
    .limit(1);

  const topItem = analytics?.[0];

  const cards = [
    { label: 'Available', value: counts.AVAILABLE, variant: 'available' as const, color: 'bg-green-50 border-green-200' },
    { label: 'On Hold', value: counts.ON_HOLD, variant: 'hold' as const, color: 'bg-amber-50 border-amber-200' },
    { label: 'Sold', value: counts.SOLD, variant: 'sold' as const, color: 'bg-red-50 border-red-200' },
    { label: 'Returned', value: counts.RETURNED, variant: 'returned' as const, color: 'bg-gray-50 border-gray-200' },
  ];

  return (
    <AdminPageTemplate title="Dashboard" description="Overview of your inventory and sales">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className={`rounded-xl border p-4 ${card.color}`}>
            <div className="flex items-center justify-between mb-2">
              <Badge label={card.label} variant={card.variant} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-medium text-gray-500">Sales This Month</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{salesCount}</p>
          <p className="text-sm text-gray-600 mt-1">{formatPrice(salesRevenue)} revenue</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-medium text-gray-500">Inquiries This Week</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{inquiriesCount || 0}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-medium text-gray-500">Most Viewed (7d)</h3>
          {topItem ? (
            <>
              <p className="text-lg font-bold text-gray-900 mt-1 truncate">{topItem.title}</p>
              <p className="text-sm text-gray-600">{topItem.views_7d} views</p>
            </>
          ) : (
            <p className="text-sm text-gray-400 mt-1">No data yet</p>
          )}
        </div>
      </div>
    </AdminPageTemplate>
  );
}
