import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AdminPageTemplate } from '@/components/templates/AdminPageTemplate';

export default async function InquiriesPage() {
  const supabase = await createServerSupabaseClient();

  const { data: inquiries } = await supabase
    .from('inquiries')
    .select(`
      *,
      inventory_items ( sku, title )
    `)
    .order('inquired_at', { ascending: false })
    .limit(100);

  return (
    <AdminPageTemplate title="Inquiries" description="WhatsApp inquiry log">
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">UTM Source</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">UTM Medium</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {(inquiries || []).map((inq) => {
              const item = inq.inventory_items as { sku: string; title: string } | null;
              return (
                <tr key={inq.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium text-gray-900">{item?.title || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{item?.sku}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{inq.source}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-400 truncate max-w-[120px]">{inq.session_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(inq.inquired_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{inq.utm_source || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{inq.utm_medium || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(!inquiries || inquiries.length === 0) && (
          <div className="p-8 text-center text-gray-500">No inquiries recorded yet.</div>
        )}
      </div>
    </AdminPageTemplate>
  );
}
