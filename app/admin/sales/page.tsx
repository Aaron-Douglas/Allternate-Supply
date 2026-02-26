import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AdminPageTemplate } from '@/components/templates/AdminPageTemplate';
import { Badge } from '@/components/atoms/Badge';
import { PriceTag } from '@/components/atoms/PriceTag';
import { Button } from '@/components/atoms/Button';
import Link from 'next/link';

export default async function SalesPage() {
  const supabase = await createServerSupabaseClient();

  const { data: sales } = await supabase
    .from('sales')
    .select(`
      *,
      inventory_items ( sku, title )
    `)
    .order('sold_at', { ascending: false });

  return (
    <AdminPageTemplate title="Sales History" description="All recorded sales">
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt #</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {(sales || []).map((sale) => {
              const item = sale.inventory_items as { sku: string; title: string } | null;
              return (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">{sale.receipt_number}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium text-gray-900">{item?.title || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{item?.sku}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{sale.buyer_name || '—'}</td>
                  <td className="px-4 py-3"><PriceTag amount={sale.sale_price} size="sm" /></td>
                  <td className="px-4 py-3">
                    <Badge label={(sale.payment_method || 'N/A').replace('_', ' ')} variant="available" />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(sale.sold_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/api/receipts/${sale.id}`} target="_blank">
                      <Button variant="outline" size="sm">PDF</Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(!sales || sales.length === 0) && (
          <div className="p-8 text-center text-gray-500">No sales recorded yet.</div>
        )}
      </div>
    </AdminPageTemplate>
  );
}
