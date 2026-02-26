-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Policies table (created first since inventory_items references it)
CREATE TABLE policies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type            TEXT UNIQUE NOT NULL CHECK (type IN ('warranty', 'returns')),
  title           TEXT NOT NULL,
  content         TEXT NOT NULL,
  effective_date  DATE NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_by      UUID REFERENCES auth.users(id)
);

-- Staff profiles
CREATE TABLE staff_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('staff', 'admin')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory items
CREATE TABLE inventory_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku             TEXT UNIQUE NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  category        TEXT NOT NULL,
  brand           TEXT,
  model           TEXT,
  serial_tag      TEXT,
  specs           JSONB NOT NULL DEFAULT '{}',
  cosmetic_grade        TEXT CHECK (cosmetic_grade IN ('A', 'B', 'C')),
  functional_grade      TEXT CHECK (functional_grade IN ('A', 'B', 'C')),
  battery_condition     TEXT CHECK (battery_condition IN ('Excellent', 'Good', 'Fair', 'Poor', 'N/A')),
  public_price    NUMERIC(10,2) NOT NULL,
  internal_cost   NUMERIC(10,2),
  public_description    TEXT,
  internal_notes        TEXT,
  status          TEXT NOT NULL DEFAULT 'AVAILABLE'
                  CHECK (status IN ('AVAILABLE', 'ON_HOLD', 'SOLD', 'RETURNED')),
  hold_expires_at TIMESTAMPTZ,
  status_changed_at     TIMESTAMPTZ DEFAULT NOW(),
  status_changed_by     UUID REFERENCES auth.users(id),
  warranty_policy_id    UUID REFERENCES policies(id),
  returns_policy_id     UUID REFERENCES policies(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  created_by      UUID REFERENCES auth.users(id)
);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Item photos
CREATE TABLE item_photos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id         UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  cloudinary_id   TEXT NOT NULL,
  cloudinary_url  TEXT NOT NULL,
  alt_text        TEXT,
  position        INTEGER NOT NULL DEFAULT 0,
  uploaded_at     TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by     UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_item_photos_item_id ON item_photos(item_id);
CREATE INDEX idx_item_photos_position ON item_photos(item_id, position);

-- Sales
CREATE TABLE sales (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number  TEXT UNIQUE NOT NULL,
  item_id         UUID NOT NULL REFERENCES inventory_items(id),
  buyer_name      TEXT,
  buyer_phone     TEXT,
  sale_price      NUMERIC(10,2) NOT NULL,
  payment_method  TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'mobile_money', 'other')),
  fulfillment_type TEXT CHECK (fulfillment_type IN ('pickup', 'delivery')),
  delivery_notes  TEXT,
  warranty_snapshot     TEXT,
  returns_snapshot      TEXT,
  receipt_pdf_url TEXT,
  sold_at         TIMESTAMPTZ DEFAULT NOW(),
  recorded_by     UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sales_item_id ON sales(item_id);
CREATE INDEX idx_sales_sold_at ON sales(sold_at DESC);

-- Page views
CREATE TABLE page_views (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id         UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  session_id      TEXT NOT NULL,
  viewed_at       TIMESTAMPTZ DEFAULT NOW(),
  referrer        TEXT,
  user_agent      TEXT
);

CREATE INDEX idx_page_views_item_id ON page_views(item_id);
CREATE INDEX idx_page_views_viewed_at ON page_views(viewed_at DESC);
CREATE INDEX idx_page_views_session ON page_views(session_id, item_id);

-- Inquiries
CREATE TABLE inquiries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id         UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  session_id      TEXT NOT NULL,
  source          TEXT NOT NULL DEFAULT 'whatsapp' CHECK (source IN ('whatsapp', 'form')),
  message         TEXT,
  referrer        TEXT,
  utm_source      TEXT,
  utm_medium      TEXT,
  utm_campaign    TEXT,
  inquired_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inquiries_item_id ON inquiries(item_id);
CREATE INDEX idx_inquiries_inquired_at ON inquiries(inquired_at DESC);

-- Receipt number sequence
CREATE SEQUENCE receipt_seq START 1;

CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'RCP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('receipt_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Item analytics view
CREATE VIEW item_analytics AS
SELECT
  i.id,
  i.title,
  i.sku,
  i.status,
  COUNT(DISTINCT pv.id) FILTER (WHERE pv.viewed_at > NOW() - INTERVAL '7 days')  AS views_7d,
  COUNT(DISTINCT pv.id) FILTER (WHERE pv.viewed_at > NOW() - INTERVAL '30 days') AS views_30d,
  COUNT(DISTINCT inq.id) FILTER (WHERE inq.inquired_at > NOW() - INTERVAL '7 days')  AS inquiries_7d,
  COUNT(DISTINCT inq.id) FILTER (WHERE inq.inquired_at > NOW() - INTERVAL '30 days') AS inquiries_30d,
  ROUND(
    NULLIF(COUNT(DISTINCT inq.id)::NUMERIC, 0) /
    NULLIF(COUNT(DISTINCT pv.id)::NUMERIC, 0) * 100, 1
  ) AS conversion_pct_30d
FROM inventory_items i
LEFT JOIN page_views pv ON pv.item_id = i.id
LEFT JOIN inquiries inq ON inq.item_id = i.id
GROUP BY i.id, i.title, i.sku, i.status;

-- RLS helper functions
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM staff_profiles
    WHERE id = auth.uid() AND role IN ('staff', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM staff_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "public read items" ON inventory_items FOR SELECT USING (true);
CREATE POLICY "staff insert items" ON inventory_items FOR INSERT WITH CHECK (is_staff());
CREATE POLICY "staff update items" ON inventory_items FOR UPDATE USING (is_staff());
CREATE POLICY "admin delete items" ON inventory_items FOR DELETE USING (is_admin());

CREATE POLICY "public read photos" ON item_photos FOR SELECT USING (true);
CREATE POLICY "staff insert photos" ON item_photos FOR INSERT WITH CHECK (is_staff());
CREATE POLICY "staff update photos" ON item_photos FOR UPDATE USING (is_staff());
CREATE POLICY "staff delete photos" ON item_photos FOR DELETE USING (is_staff());

CREATE POLICY "staff read sales" ON sales FOR SELECT USING (is_staff());
CREATE POLICY "staff insert sales" ON sales FOR INSERT WITH CHECK (is_staff());

CREATE POLICY "service insert views" ON page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "staff read views" ON page_views FOR SELECT USING (is_staff());

CREATE POLICY "service insert inquiries" ON inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "staff read inquiries" ON inquiries FOR SELECT USING (is_staff());

CREATE POLICY "public read policies" ON policies FOR SELECT USING (true);
CREATE POLICY "admin update policies" ON policies FOR UPDATE USING (is_admin());

CREATE POLICY "staff read profiles" ON staff_profiles FOR SELECT USING (is_staff());

-- Seed initial policies
INSERT INTO policies (type, title, content, effective_date)
VALUES
  ('warranty', 'Warranty Policy', '<p>All items come with a 30-day warranty covering functional defects. Cosmetic issues are not covered. Contact us via WhatsApp to initiate a warranty claim.</p>', CURRENT_DATE),
  ('returns',  'Returns Policy',  '<p>Returns are accepted within 7 days of purchase for items in original condition. A restocking fee of 10% may apply. Contact us via WhatsApp to initiate a return.</p>', CURRENT_DATE);
