'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { AdminPageTemplate } from '@/components/templates/AdminPageTemplate';
import { Spinner } from '@/components/atoms/Spinner';
import type { AuditEvent } from '@/types/audit';

const ACTION_LABELS: Record<string, string> = {
  'item.created': 'Item created',
  'item.updated': 'Item updated',
  'item.deleted': 'Item deleted',
  'sale.recorded': 'Sale recorded',
  'policy.updated': 'Policy updated',
  'staff.created': 'Staff created',
  'staff.updated': 'Staff updated',
};

function entityLink(event: AuditEvent): { href: string; label: string } | null {
  switch (event.entity_type) {
    case 'inventory_item':
      return event.entity_id
        ? { href: `/admin/inventory/${event.entity_id}`, label: event.entity_id.slice(0, 8) + '…' }
        : null;
    case 'policy':
      return event.entity_id
        ? { href: '/admin/policies', label: event.entity_id }
        : null;
    case 'sale':
      return event.entity_id
        ? { href: `/admin/inventory/${event.entity_id}`, label: 'Item' }
        : null;
    case 'staff':
      return { href: '/admin/team', label: 'Team' };
    default:
      return event.entity_id ? { href: '#', label: event.entity_id } : null;
  }
}

export default function ActivityPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [actorNames, setActorNames] = useState<Record<string, string>>({});
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: eventsData, error: eventsError } = await supabase
        .from('audit_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (eventsError) {
        setEvents([]);
        setIsFetching(false);
        return;
      }

      setEvents((eventsData || []) as AuditEvent[]);

      const actorIds = Array.from(new Set((eventsData || []).map((e: { actor_id: string }) => e.actor_id)));
      if (actorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('staff_profiles')
          .select('id, full_name')
          .in('id', actorIds);
        const map: Record<string, string> = {};
        profiles?.forEach((p: { id: string; full_name: string }) => {
          map[p.id] = p.full_name;
        });
        setActorNames(map);
      }
      setIsFetching(false);
    };
    fetchData();
  }, []);

  return (
    <AdminPageTemplate title="Activity" description="Recent actions by staff">
      {isFetching ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.map((event) => {
                const link = entityLink(event);
                return (
                  <tr key={event.id} className="bg-white hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(event.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {actorNames[event.actor_id] ?? 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {ACTION_LABELS[event.action] ?? event.action}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {link ? (
                        <Link href={link.href} className="text-brand-600 hover:underline">
                          {link.label}
                        </Link>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {events.length === 0 && (
            <p className="px-4 py-8 text-center text-gray-500">No activity recorded yet.</p>
          )}
        </div>
      )}
    </AdminPageTemplate>
  );
}
