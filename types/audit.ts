export type AuditAction =
  | 'item.created'
  | 'item.updated'
  | 'item.deleted'
  | 'sale.recorded'
  | 'policy.updated'
  | 'staff.created'
  | 'staff.updated';

export interface AuditEvent {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}
