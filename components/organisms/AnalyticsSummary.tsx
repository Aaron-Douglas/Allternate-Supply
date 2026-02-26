import type { ItemAnalytics } from '@/types/analytics';

type AnalyticsSummaryProps = {
  data: ItemAnalytics[];
};

export function AnalyticsSummary({ data }: AnalyticsSummaryProps) {
  if (data.length === 0) {
    return <p className="text-gray-500 text-center py-8">No analytics data available yet.</p>;
  }

  const sorted = [...data].sort((a, b) => b.views_7d - a.views_7d);

  return (
    <div className="space-y-6">
      {/* Top 10 bar chart */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Top 10 Items by Views (7 days)</h3>
        <div className="space-y-2">
          {sorted.slice(0, 10).map((item) => {
            const maxViews = sorted[0]?.views_7d || 1;
            const pct = (item.views_7d / maxViews) * 100;
            return (
              <div key={item.id} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-32 truncate">{item.sku}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                  <div className="bg-brand-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-medium text-gray-700 w-10 text-right">{item.views_7d}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Views 7d</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Views 30d</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Inquiries 7d</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Inquiries 30d</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Conversion %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {sorted.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">{item.title}</div>
                  <div className="text-xs text-gray-500">{item.sku}</div>
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-700">{item.views_7d}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-700">{item.views_30d}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-700">{item.inquiries_7d}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-700">{item.inquiries_30d}</td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                  {item.conversion_pct_30d != null ? `${item.conversion_pct_30d}%` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
