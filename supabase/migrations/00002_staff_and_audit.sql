-- Staff management and audit: updated_by, staff_profiles RLS, audit_events

-- 1. inventory_items: add updated_by
ALTER TABLE inventory_items
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- 2. staff_profiles: allow admins to insert and update
CREATE POLICY "admin insert staff_profiles" ON staff_profiles
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "admin update staff_profiles" ON staff_profiles
  FOR UPDATE USING (is_admin());

-- 3. audit_events table
CREATE TABLE audit_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID NOT NULL REFERENCES auth.users(id),
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   TEXT,
  details     JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_events_created_at ON audit_events(created_at DESC);
CREATE INDEX idx_audit_events_entity ON audit_events(entity_type, entity_id);

ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff read audit_events" ON audit_events
  FOR SELECT USING (is_staff());

-- No INSERT policy: only server-side with service role can insert.
