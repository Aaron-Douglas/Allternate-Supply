'use client';

import { useState } from 'react';
import { AdminPageTemplate } from '@/components/templates/AdminPageTemplate';
import { Button } from '@/components/atoms/Button';
import { Label } from '@/components/atoms/Label';

export default function ExportsPage() {
  const [salesFrom, setSalesFrom] = useState('');
  const [salesTo, setSalesTo] = useState('');
  const [inquiriesFrom, setInquiriesFrom] = useState('');
  const [inquiriesTo, setInquiriesTo] = useState('');

  const downloadCSV = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <AdminPageTemplate title="CSV Exports" description="Download data as CSV files">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Export */}
        <div className="rounded-xl bg-white border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Inventory</h3>
          <p className="text-sm text-gray-500">Export all inventory items with their details.</p>
          <Button onClick={() => downloadCSV('/api/exports/inventory')} className="w-full">
            Export Full Inventory
          </Button>
        </div>

        {/* Sales Export */}
        <div className="rounded-xl bg-white border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Sales</h3>
          <p className="text-sm text-gray-500">Export sales within a date range.</p>
          <div className="space-y-2">
            <div>
              <Label>From</Label>
              <input type="date" value={salesFrom} onChange={e => setSalesFrom(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm min-h-[44px]" />
            </div>
            <div>
              <Label>To</Label>
              <input type="date" value={salesTo} onChange={e => setSalesTo(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm min-h-[44px]" />
            </div>
          </div>
          <Button
            onClick={() => {
              const params = new URLSearchParams();
              if (salesFrom) params.set('from', salesFrom);
              if (salesTo) params.set('to', salesTo);
              downloadCSV(`/api/exports/sales?${params.toString()}`);
            }}
            className="w-full"
          >
            Export Sales
          </Button>
        </div>

        {/* Inquiries Export */}
        <div className="rounded-xl bg-white border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Inquiries</h3>
          <p className="text-sm text-gray-500">Export inquiries within a date range.</p>
          <div className="space-y-2">
            <div>
              <Label>From</Label>
              <input type="date" value={inquiriesFrom} onChange={e => setInquiriesFrom(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm min-h-[44px]" />
            </div>
            <div>
              <Label>To</Label>
              <input type="date" value={inquiriesTo} onChange={e => setInquiriesTo(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm min-h-[44px]" />
            </div>
          </div>
          <Button
            onClick={() => {
              const params = new URLSearchParams();
              if (inquiriesFrom) params.set('from', inquiriesFrom);
              if (inquiriesTo) params.set('to', inquiriesTo);
              downloadCSV(`/api/exports/inquiries?${params.toString()}`);
            }}
            className="w-full"
          >
            Export Inquiries
          </Button>
        </div>
      </div>
    </AdminPageTemplate>
  );
}
