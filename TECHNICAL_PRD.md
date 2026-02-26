# Technical PRD: Inventory-First Electronics Catalog
### Stack: Next.js 14 · Tailwind CSS · Supabase · Cloudinary
### Version: 1.0 | Audience: AI Agent / Engineering Team

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Tooling](#2-tech-stack--tooling)
3. [Repository & Project Structure](#3-repository--project-structure)
4. [Atomic Design System](#4-atomic-design-system)
5. [Database Schema (Supabase / PostgreSQL)](#5-database-schema-supabase--postgresql)
6. [Supabase Auth & Row Level Security](#6-supabase-auth--row-level-security)
7. [Cloudinary Media Pipeline](#7-cloudinary-media-pipeline)
8. [Public-Facing Pages & Routes](#8-public-facing-pages--routes)
9. [Admin / Staff Pages & Routes](#9-admin--staff-pages--routes)
10. [API Route Handlers](#10-api-route-handlers)
11. [Server Actions](#11-server-actions)
12. [State Management](#12-state-management)
13. [WhatsApp Integration](#13-whatsapp-integration)
14. [Analytics: Views & Inquiries](#14-analytics-views--inquiries)
15. [Sales & Receipt Generation](#15-sales--receipt-generation)
16. [CSV Export](#16-csv-export)
17. [Policy Pages (CMS)](#17-policy-pages-cms)
18. [Mobile-First Design Specifications](#18-mobile-first-design-specifications)
19. [Performance Requirements](#19-performance-requirements)
20. [Testing Strategy (Jest)](#20-testing-strategy-jest)
21. [Environment Variables](#21-environment-variables)
22. [Deployment](#22-deployment)
23. [Feature Flags & Phased Delivery](#23-feature-flags--phased-delivery)
24. [Acceptance Criteria Matrix](#24-acceptance-criteria-matrix)

---

## 1. Project Overview

A mobile-first inventory catalog for a retail electronics shop. Customers browse current stock, view item details, and initiate purchases via WhatsApp. All payment and fulfillment happens offline. Staff manage inventory, photos, statuses, and sales through a custom admin UI built into the same Next.js app.

### Core Constraints

- No online checkout, cart, or payment processing.
- Items are unique units (one SKU = one physical device).
- Item status drives all UI behavior: `AVAILABLE | ON_HOLD | SOLD | RETURNED`.
- WhatsApp is the primary buyer-to-seller channel.
- The public site must load fast on mobile 4G with no authentication required.

---

## 2. Tech Stack & Tooling

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Framework | Next.js | 14.x (App Router) | SSR + ISR for public pages |
| Language | TypeScript | 5.x | Strict mode enabled |
| Styling | Tailwind CSS | 3.x | Mobile-first utility classes |
| UI Components | shadcn/ui | latest | Headless + accessible primitives |
| Database | Supabase (PostgreSQL) | latest | Managed Postgres, RLS enforced |
| Auth | Supabase Auth | latest | Email/password for staff; no buyer accounts |
| Storage | Cloudinary | latest | All media; transformation via URL params |
| PDF Generation | @react-pdf/renderer | 3.x | Receipt PDFs server-side |
| Testing | Jest + Testing Library | 29.x / 14.x | Unit + integration + component tests |
| Linting | ESLint + Prettier | latest | Enforced pre-commit via Husky |
| Type Checking | tsc --noEmit | — | Run in CI |
| Package Manager | pnpm | 8.x | Workspace support |

### Dev Dependencies

```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.x",
    "@testing-library/react": "^14.x",
    "@testing-library/user-event": "^14.x",
    "jest": "^29.x",
    "jest-environment-jsdom": "^29.x",
    "ts-jest": "^29.x",
    "husky": "^8.x",
    "lint-staged": "^14.x",
    "@types/jest": "^29.x"
  }
}
```

---

## 3. Repository & Project Structure

```
/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public route group (no auth)
│   │   ├── layout.tsx            # Public shell: nav, footer
│   │   ├── page.tsx              # Homepage = inventory listing
│   │   ├── items/
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # Item detail page
│   │   ├── sold/
│   │   │   └── page.tsx          # Recently sold gallery
│   │   ├── warranty/
│   │   │   └── page.tsx          # Warranty policy page
│   │   └── returns/
│   │       └── page.tsx          # Returns policy page
│   ├── (admin)/                  # Admin route group (auth required)
│   │   ├── layout.tsx            # Admin shell: sidebar, top nav
│   │   ├── login/
│   │   │   └── page.tsx          # Staff login page
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Overview metrics
│   │   ├── inventory/
│   │   │   ├── page.tsx          # Inventory list + filters
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # Create item form
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Edit item form
│   │   │       └── sale/
│   │   │           └── page.tsx  # Record sale form
│   │   ├── sales/
│   │   │   └── page.tsx          # Sales history + receipts
│   │   ├── inquiries/
│   │   │   └── page.tsx          # Inquiry log
│   │   ├── analytics/
│   │   │   └── page.tsx          # Views + inquiries metrics
│   │   ├── policies/
│   │   │   └── page.tsx          # Edit warranty/returns content
│   │   └── exports/
│   │       └── page.tsx          # CSV export triggers
│   └── api/
│       ├── log-view/
│       │   └── route.ts          # POST: record item page view
│       ├── log-inquiry/
│       │   └── route.ts          # POST: record WhatsApp click
│       ├── receipts/
│       │   └── [saleId]/
│       │       └── route.ts      # GET: stream receipt PDF
│       └── exports/
│           ├── inventory/
│           │   └── route.ts      # GET: inventory CSV
│           ├── sales/
│           │   └── route.ts      # GET: sales CSV
│           └── inquiries/
│               └── route.ts      # GET: inquiries CSV
├── components/                   # Atomic design component library
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   ├── templates/
│   └── ui/                       # shadcn/ui auto-generated
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server Supabase client (cookies)
│   │   └── types.ts              # Generated DB types (supabase gen types)
│   ├── cloudinary/
│   │   ├── upload.ts             # Upload helpers
│   │   └── transforms.ts         # URL transformation builders
│   ├── pdf/
│   │   └── receipt.tsx           # Receipt PDF component (@react-pdf/renderer)
│   ├── whatsapp.ts               # WhatsApp link builder
│   ├── analytics.ts              # View/inquiry logging helpers
│   ├── csv.ts                    # CSV serialization helpers
│   └── utils.ts                  # Shared utilities (cn, slugify, formatPrice)
├── hooks/
│   ├── useInventoryFilters.ts    # Filter state for listing page
│   ├── useItemStatus.ts          # Status display helpers
│   └── useSession.ts             # Session ID for analytics
├── types/
│   ├── inventory.ts              # InventoryItem, ItemStatus, ItemPhoto, etc.
│   ├── sales.ts                  # Sale, Receipt
│   ├── analytics.ts              # PageView, Inquiry
│   └── policy.ts                 # Policy
├── actions/
│   ├── inventory.ts              # Server actions: createItem, updateItem, etc.
│   ├── sales.ts                  # Server actions: createSale
│   ├── policies.ts               # Server actions: updatePolicy
│   └── photos.ts                 # Server actions: uploadPhoto, reorderPhotos
├── middleware.ts                 # Auth guard for (admin) routes
├── jest.config.ts
├── jest.setup.ts
├── tailwind.config.ts
├── tsconfig.json
└── .env.local
```

---

## 4. Atomic Design System

All UI is built using atomic design principles. Every component lives in one of five levels. **Never build a complex component without composing it from smaller atoms and molecules.**

### 4.1 Atoms

Smallest, stateless, no business logic. Styled with Tailwind only.

| Component | File | Props | Notes |
|---|---|---|---|
| `Badge` | `atoms/Badge.tsx` | `label`, `variant: 'sold'\|'hold'\|'available'\|'returned'\|'new'` | Status badge used everywhere |
| `Button` | `atoms/Button.tsx` | `variant`, `size`, `isLoading`, `disabled` | Wraps shadcn Button |
| `StatusOverlay` | `atoms/StatusOverlay.tsx` | `status: ItemStatus`, `size: 'sm'\|'lg'` | Absolute-positioned overlay for images |
| `PriceTag` | `atoms/PriceTag.tsx` | `amount: number`, `currency: string` | Formats price |
| `ConditionDot` | `atoms/ConditionDot.tsx` | `grade: 'A'\|'B'\|'C'` | Color dot for cosmetic grade |
| `Spinner` | `atoms/Spinner.tsx` | `size` | Loading indicator |
| `Avatar` | `atoms/Avatar.tsx` | `initials`, `src` | Staff avatar |
| `Divider` | `atoms/Divider.tsx` | — | Horizontal rule |
| `ErrorMessage` | `atoms/ErrorMessage.tsx` | `message` | Inline field error |
| `Label` | `atoms/Label.tsx` | `htmlFor`, `required` | Form label |

#### StatusOverlay Specification

```tsx
// components/atoms/StatusOverlay.tsx
// Renders as an absolute overlay on top of an image container
// Parent must have position: relative

type StatusOverlayProps = {
  status: 'SOLD' | 'ON_HOLD' | 'RETURNED';
  size?: 'sm' | 'lg';
};

// Visual spec:
// SOLD: bg-red-600/90, text-white, font-black, uppercase, rotate-[-12deg]
// ON_HOLD: bg-amber-500/90, text-white, font-bold, uppercase
// RETURNED: bg-gray-500/80, text-white, font-semibold
// AVAILABLE: no overlay rendered
// sm: text-xs px-2 py-1
// lg: text-lg px-4 py-2
```

### 4.2 Molecules

Composed of atoms. May have local state (hover, open/close). No async data fetching.

| Component | File | Composed Of | Notes |
|---|---|---|---|
| `ItemCard` | `molecules/ItemCard.tsx` | `StatusOverlay`, `Badge`, `PriceTag`, `ConditionDot` | Listing grid card |
| `PhotoThumbnail` | `molecules/PhotoThumbnail.tsx` | Cloudinary `<img>`, `StatusOverlay` | Single image with overlay |
| `SpecRow` | `molecules/SpecRow.tsx` | `Label`, text | One spec key/value row |
| `FilterChip` | `molecules/FilterChip.tsx` | `Button`, `Badge` | Active filter indicator |
| `SearchBar` | `molecules/SearchBar.tsx` | Input atom | Search input with clear |
| `WhatsAppButton` | `molecules/WhatsAppButton.tsx` | `Button`, WhatsApp icon | CTA button, handles status logic |
| `StatusSelector` | `molecules/StatusSelector.tsx` | `Badge`, radio buttons | Admin status changer |
| `PhotoUploadSlot` | `molecules/PhotoUploadSlot.tsx` | Input, `Spinner` | Single photo upload cell |
| `SaleStatusBanner` | `molecules/SaleStatusBanner.tsx` | `Badge`, text | "This item has been sold" notice |
| `ReceiptRow` | `molecules/ReceiptRow.tsx` | text | One line on receipt PDF |

### 4.3 Organisms

Full sections with fetched or passed-down data. May own async state.

| Component | File | Notes |
|---|---|---|
| `InventoryGrid` | `organisms/InventoryGrid.tsx` | Responsive grid of `ItemCard`s |
| `InventoryFilters` | `organisms/InventoryFilters.tsx` | Category, status, price range, search |
| `ItemDetailGallery` | `organisms/ItemDetailGallery.tsx` | Main image + thumbnails strip, lightbox |
| `ItemSpecsTable` | `organisms/ItemSpecsTable.tsx` | Full specs by category |
| `RecentlySoldReel` | `organisms/RecentlySoldReel.tsx` | Horizontal scroll of sold items |
| `AdminInventoryTable` | `organisms/AdminInventoryTable.tsx` | Sortable, filterable admin table |
| `ItemForm` | `organisms/ItemForm.tsx` | Full create/edit form with photo upload |
| `SaleForm` | `organisms/SaleForm.tsx` | Record sale: buyer, price, payment method |
| `AnalyticsSummary` | `organisms/AnalyticsSummary.tsx` | Views/inquiries chart per item |
| `PolicyEditor` | `organisms/PolicyEditor.tsx` | Rich text editor for policies |
| `PhotoReorderGrid` | `organisms/PhotoReorderGrid.tsx` | Drag-and-drop photo ordering |
| `AdminSidebar` | `organisms/AdminSidebar.tsx` | Staff navigation sidebar |

### 4.4 Templates

Page-level layouts. Receive organisms as children or slots. No business logic.

| Component | File | Notes |
|---|---|---|
| `PublicPageTemplate` | `templates/PublicPageTemplate.tsx` | Header + content + footer |
| `AdminPageTemplate` | `templates/AdminPageTemplate.tsx` | Sidebar + topbar + content area |
| `ItemDetailTemplate` | `templates/ItemDetailTemplate.tsx` | Gallery left, info right (desktop) |
| `FormPageTemplate` | `templates/FormPageTemplate.tsx` | Centered single-column form |

### 4.5 Component Testing Rule

**Every atom and molecule must have a corresponding `.test.tsx` file.** Organisms require at minimum a render smoke test and one behavior test. Templates are snapshot-tested.

---

## 5. Database Schema (Supabase / PostgreSQL)

Run all migrations via Supabase CLI (`supabase migration new <name>`). Never alter the DB manually in production.

### 5.1 Tables

#### `inventory_items`
```sql
CREATE TABLE inventory_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku             TEXT UNIQUE NOT NULL,             -- e.g. "LAP-2024-001"
  slug            TEXT UNIQUE NOT NULL,             -- URL-safe, auto-generated from title+sku
  title           TEXT NOT NULL,
  category        TEXT NOT NULL,                    -- 'laptop' | 'desktop' | 'tablet' | 'phone' | 'accessory' | 'other'
  brand           TEXT,
  model           TEXT,
  serial_tag      TEXT,                             -- serial or service tag (optional)

  -- Specs (stored as JSONB for flexibility per category)
  specs           JSONB NOT NULL DEFAULT '{}',
  -- Expected spec keys by category:
  -- laptop/desktop: cpu, ram_gb, storage_gb, storage_type, gpu, screen_size, os, battery_cycles
  -- tablet/phone:   cpu, ram_gb, storage_gb, screen_size, os, battery_health
  -- accessory:      type, compatibility, color

  -- Condition
  cosmetic_grade        TEXT CHECK (cosmetic_grade IN ('A', 'B', 'C')),
  functional_grade      TEXT CHECK (functional_grade IN ('A', 'B', 'C')),
  battery_condition     TEXT CHECK (battery_condition IN ('Excellent', 'Good', 'Fair', 'Poor', 'N/A')),

  -- Pricing
  public_price    NUMERIC(10,2) NOT NULL,
  internal_cost   NUMERIC(10,2),                    -- staff/admin only

  -- Content
  public_description    TEXT,
  internal_notes        TEXT,                       -- staff/admin only

  -- Status
  status          TEXT NOT NULL DEFAULT 'AVAILABLE'
                  CHECK (status IN ('AVAILABLE', 'ON_HOLD', 'SOLD', 'RETURNED')),
  hold_expires_at TIMESTAMPTZ,                      -- optional hold expiry
  status_changed_at     TIMESTAMPTZ DEFAULT NOW(),
  status_changed_by     UUID REFERENCES auth.users(id),

  -- Policies (nullable = use global policy)
  warranty_policy_id    UUID REFERENCES policies(id),
  returns_policy_id     UUID REFERENCES policies(id),

  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  created_by      UUID REFERENCES auth.users(id)
);

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

#### `item_photos`
```sql
CREATE TABLE item_photos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id         UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  cloudinary_id   TEXT NOT NULL,                    -- Cloudinary public_id
  cloudinary_url  TEXT NOT NULL,                    -- Base URL (no transformation)
  alt_text        TEXT,
  position        INTEGER NOT NULL DEFAULT 0,       -- 0 = primary/featured photo
  uploaded_at     TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by     UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_item_photos_item_id ON item_photos(item_id);
CREATE INDEX idx_item_photos_position ON item_photos(item_id, position);
```

#### `sales`
```sql
CREATE TABLE sales (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number  TEXT UNIQUE NOT NULL,             -- e.g. "RCP-2024-00142"
  item_id         UUID NOT NULL REFERENCES inventory_items(id),

  -- Buyer info (optional but encouraged)
  buyer_name      TEXT,
  buyer_phone     TEXT,

  -- Sale details
  sale_price      NUMERIC(10,2) NOT NULL,
  payment_method  TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'mobile_money', 'other')),
  fulfillment_type TEXT CHECK (fulfillment_type IN ('pickup', 'delivery')),
  delivery_notes  TEXT,

  -- Policy snapshots (store text at time of sale for immutable receipts)
  warranty_snapshot     TEXT,
  returns_snapshot      TEXT,

  -- Receipt storage
  receipt_pdf_url TEXT,                             -- Cloudinary URL of generated PDF

  -- Timestamps
  sold_at         TIMESTAMPTZ DEFAULT NOW(),
  recorded_by     UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sales_item_id ON sales(item_id);
CREATE INDEX idx_sales_sold_at ON sales(sold_at DESC);
```

#### `page_views`
```sql
CREATE TABLE page_views (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id         UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  session_id      TEXT NOT NULL,                    -- anonymous session UUID stored in cookie
  viewed_at       TIMESTAMPTZ DEFAULT NOW(),
  referrer        TEXT,
  user_agent      TEXT
);

-- Deduplication: max 1 view per session per item per 30 minutes (enforced in API)
CREATE INDEX idx_page_views_item_id ON page_views(item_id);
CREATE INDEX idx_page_views_viewed_at ON page_views(viewed_at DESC);
CREATE INDEX idx_page_views_session ON page_views(session_id, item_id);
```

#### `inquiries`
```sql
CREATE TABLE inquiries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id         UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  session_id      TEXT NOT NULL,
  source          TEXT NOT NULL DEFAULT 'whatsapp' CHECK (source IN ('whatsapp', 'form')),
  message         TEXT,                             -- for form-based inquiries
  referrer        TEXT,
  utm_source      TEXT,
  utm_medium      TEXT,
  utm_campaign    TEXT,
  inquired_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inquiries_item_id ON inquiries(item_id);
CREATE INDEX idx_inquiries_inquired_at ON inquiries(inquired_at DESC);
```

#### `policies`
```sql
CREATE TABLE policies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type            TEXT UNIQUE NOT NULL CHECK (type IN ('warranty', 'returns')),
  title           TEXT NOT NULL,
  content         TEXT NOT NULL,                    -- rich text (HTML string)
  effective_date  DATE NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_by      UUID REFERENCES auth.users(id)
);

-- Seed with initial policies on migration
INSERT INTO policies (type, title, content, effective_date)
VALUES
  ('warranty', 'Warranty Policy', '<p>Default warranty policy content.</p>', CURRENT_DATE),
  ('returns',  'Returns Policy',  '<p>Default returns policy content.</p>',  CURRENT_DATE);
```

#### `staff_profiles` (extends auth.users)
```sql
CREATE TABLE staff_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('staff', 'admin')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.2 Receipt Number Generation

```sql
CREATE SEQUENCE receipt_seq START 1;

CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'RCP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('receipt_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;
```

### 5.3 Key Database Views

```sql
-- Item analytics summary (used in admin dashboard)
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
```

---

## 6. Supabase Auth & Row Level Security

### 6.1 Roles

Two roles exist: `staff` and `admin`. Both are stored in `staff_profiles.role`. Admin is a superset of staff permissions.

| Action | Public | Staff | Admin |
|---|---|---|---|
| Read published items (all statuses) | ✅ | ✅ | ✅ |
| Read internal_cost, internal_notes | ❌ | ✅ | ✅ |
| Create / update items | ❌ | ✅ | ✅ |
| Delete items | ❌ | ❌ | ✅ |
| Upload photos | ❌ | ✅ | ✅ |
| Create sales | ❌ | ✅ | ✅ |
| View all sales | ❌ | ✅ | ✅ |
| Export CSV | ❌ | ✅ | ✅ |
| Edit policies | ❌ | ❌ | ✅ |
| Manage staff accounts | ❌ | ❌ | ✅ |

### 6.2 RLS Policies

```sql
-- Enable RLS on all tables
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;

-- Helper function: check staff role
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

-- inventory_items: public can read; staff can write
CREATE POLICY "public read items" ON inventory_items FOR SELECT USING (true);
CREATE POLICY "staff insert items" ON inventory_items FOR INSERT WITH CHECK (is_staff());
CREATE POLICY "staff update items" ON inventory_items FOR UPDATE USING (is_staff());
CREATE POLICY "admin delete items" ON inventory_items FOR DELETE USING (is_admin());

-- item_photos: public read; staff write
CREATE POLICY "public read photos" ON item_photos FOR SELECT USING (true);
CREATE POLICY "staff manage photos" ON item_photos FOR ALL USING (is_staff());

-- sales: staff read/write only
CREATE POLICY "staff read sales" ON sales FOR SELECT USING (is_staff());
CREATE POLICY "staff insert sales" ON sales FOR INSERT WITH CHECK (is_staff());

-- page_views / inquiries: API route handler inserts (service role); staff reads
CREATE POLICY "staff read views" ON page_views FOR SELECT USING (is_staff());
CREATE POLICY "staff read inquiries" ON inquiries FOR SELECT USING (is_staff());

-- policies: public read; admin write
CREATE POLICY "public read policies" ON policies FOR SELECT USING (true);
CREATE POLICY "admin update policies" ON policies FOR UPDATE USING (is_admin());
```

### 6.3 Auth Flow

- Staff log in at `/admin/login` using Supabase Auth email/password.
- On successful login, session is stored in cookies via `@supabase/ssr`.
- `middleware.ts` checks the session on every `/(admin)` route. If no session, redirect to `/admin/login`.
- Role is loaded from `staff_profiles` and stored in server context for permission checks.

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/admin') || pathname === '/admin/login') {
    return NextResponse.next();
  }
  // Check session; redirect to /admin/login if missing
}

export const config = { matcher: ['/admin/:path*'] };
```

---

## 7. Cloudinary Media Pipeline

### 7.1 Upload Flow

1. Staff selects image file(s) in `PhotoUploadSlot` component.
2. File is sent to `/api/photos/upload` route (multipart/form-data).
3. Route handler uploads to Cloudinary under folder `inventory/{item_id}/`.
4. Cloudinary returns `public_id` and `secure_url`.
5. Route handler inserts a row into `item_photos` with `cloudinary_id` and `cloudinary_url`.
6. Response returns the new photo record to the client.

### 7.2 Cloudinary Folder Structure

```
inventory/
  {item_id}/
    photo_0    ← primary / featured
    photo_1
    photo_2
    photo_3
    photo_4
receipts/
  {receipt_number}.pdf
```

### 7.3 Image Transformation URL Builder

```typescript
// lib/cloudinary/transforms.ts

const BASE = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

export type ImageSize = 'thumb' | 'card' | 'detail' | 'zoom';

const TRANSFORMS: Record<ImageSize, string> = {
  thumb:  'w_120,h_90,c_fill,f_auto,q_auto',
  card:   'w_480,h_360,c_fill,f_auto,q_auto',
  detail: 'w_800,h_600,c_limit,f_auto,q_auto',
  zoom:   'w_1600,h_1200,c_limit,f_auto,q_90',
};

export function cloudinaryUrl(publicId: string, size: ImageSize): string {
  return `${BASE}/${TRANSFORMS[size]}/${publicId}`;
}
```

### 7.4 Upload Configuration

```typescript
// lib/cloudinary/upload.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
  api_key:     process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET,
});

export async function uploadItemPhoto(
  file: Buffer,
  itemId: string,
  position: number
): Promise<{ publicId: string; secureUrl: string }> {
  const result = await cloudinary.uploader.upload(
    `data:image/jpeg;base64,${file.toString('base64')}`,
    {
      folder: `inventory/${itemId}`,
      public_id: `photo_${position}`,
      overwrite: true,
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    }
  );
  return { publicId: result.public_id, secureUrl: result.secure_url };
}
```

### 7.5 Photo Constraints

- Maximum 5 photos per item.
- Accepted MIME types: `image/jpeg`, `image/png`, `image/webp`.
- Maximum upload size: 10 MB per file (enforced client-side and server-side).
- Photos must be reorderable (drag-and-drop in `PhotoReorderGrid`); reorder updates `position` in `item_photos`.
- Deleting a photo removes it from Cloudinary and from `item_photos`.

---

## 8. Public-Facing Pages & Routes

### 8.1 Homepage — Inventory Listing (`/`)

**Rendering:** ISR with `revalidate = 60` seconds.

**Data fetched (server):**
- All `inventory_items` where `status != 'RETURNED'` (configurable), ordered by `created_at DESC`.
- Primary photo per item (position = 0) from `item_photos`.

**UI Layout (mobile-first):**
- Single-column card grid on mobile (`grid-cols-1`).
- Two-column on `sm` breakpoint (`sm:grid-cols-2`).
- Three-column on `lg` breakpoint (`lg:grid-cols-3`).

**`ItemCard` display spec:**
```
[Primary photo with StatusOverlay if not AVAILABLE]
[Title]
[Badge: category]  [ConditionDot: cosmetic_grade]
[PriceTag]
[WhatsAppButton or SoldIndicator]
```

**Filters (client-side, URL params):**
- `?category=laptop|desktop|tablet|...`
- `?status=available|on_hold|sold`
- `?q=search+term` (searches title, brand, model, SKU)
- `?min_price=X&max_price=Y`

Filters update URL params without page reload using `useRouter().push`. Filter state is read from `useSearchParams()`.

**Acceptance Criteria:**
- [ ] All items with status ≠ RETURNED render as cards.
- [ ] SOLD and ON_HOLD items show correct `StatusOverlay`.
- [ ] Filtering by category returns only matching items.
- [ ] Text search matches title, brand, model, SKU (case-insensitive).
- [ ] Page loads in < 2 seconds on simulated 4G (Chrome DevTools).
- [ ] Grid is responsive across 320px, 768px, 1280px viewports.

### 8.2 Item Detail Page (`/items/[slug]`)

**Rendering:** ISR with `revalidate = 60` seconds.

**Data fetched (server):**
- Full `inventory_items` row by slug.
- All `item_photos` for the item ordered by position.
- Active warranty and returns policies.

**On page load (client):** Fire `POST /api/log-view` with `itemId` and session ID.

**UI Layout:**

*Mobile:* Stacked vertically — gallery full width, then info block.  
*Desktop (lg+):* Two columns — gallery left (60%), info right (40%), sticky.

**Info block spec:**
```
[StatusOverlay if not AVAILABLE — shown as banner on mobile]
[Title]
[PriceTag large]
[ConditionDot + cosmetic_grade label]
[SpecsTable by category]
[WhatsAppButton (primary CTA)]
[Warranty + Returns policy summary links]
```

**`ItemDetailGallery` spec:**
- Main image with `detail` transform.
- Horizontal thumbnail strip below (mobile) or vertical strip left (desktop).
- Tap/click thumbnail → swap main image.
- Tap main image → open lightbox with `zoom` transform.
- StatusOverlay rendered over main image if status ≠ AVAILABLE.

**WhatsApp CTA behavior by status:**

| Status | Button label | Action |
|---|---|---|
| AVAILABLE | "Buy on WhatsApp" | Open WhatsApp link, log inquiry |
| ON_HOLD | "Ask about this item" | Open WhatsApp link, log inquiry |
| SOLD | "Sold" | Button disabled, gray |
| RETURNED | "Ask about this item" | Open WhatsApp link, log inquiry |

**Acceptance Criteria:**
- [ ] `generateStaticParams` exports all item slugs for static generation.
- [ ] `notFound()` is returned if slug doesn't exist.
- [ ] Gallery shows all photos; primary photo is displayed first.
- [ ] WhatsApp button fires log-inquiry before opening WhatsApp.
- [ ] SOLD items show disabled CTA.
- [ ] Structured data (`application/ld+json`) is included for SEO.

### 8.3 Recently Sold (`/sold`)

**Rendering:** ISR `revalidate = 120`.

**Data:** Last 30 sold items (status = SOLD, ordered by `status_changed_at DESC`), with primary photo.

**UI:** Horizontal scroll reel on mobile; 3-column grid on desktop. Each card shows the `StatusOverlay` SOLD badge prominently.

### 8.4 Warranty & Returns Policy Pages (`/warranty`, `/returns`)

**Rendering:** ISR `revalidate = 3600`.

**Data:** Latest policy row matching `type = 'warranty'` or `type = 'returns'`.

**UI:** Simple single-column content page. Renders `content` as HTML (`dangerouslySetInnerHTML` — content is admin-only authored, not user-generated). Shows `effective_date`.

---

## 9. Admin / Staff Pages & Routes

All admin routes under `/admin/*` are protected by `middleware.ts`. They use the `AdminPageTemplate` with `AdminSidebar`.

### 9.1 Login (`/admin/login`)

- Email + password form.
- Calls `supabase.auth.signInWithPassword()`.
- On success: redirect to `/admin/dashboard`.
- On error: show inline error message.
- No "remember me" — session lifetime controlled by Supabase (default 1 week).

### 9.2 Dashboard (`/admin/dashboard`)

Metrics cards:
- Total items by status (AVAILABLE / ON_HOLD / SOLD / RETURNED)
- Sales this month (count + total revenue)
- Inquiries this week
- Most-viewed item (last 7 days)

### 9.3 Inventory List (`/admin/inventory`)

- Server-rendered table of all items.
- Columns: SKU, Title, Category, Status, Price, Photos count, Views (7d), Actions.
- Filters: status, category, search.
- Actions per row: Edit, View public page, Record Sale (if AVAILABLE/ON_HOLD), Delete (admin only).
- Bulk action: Export selected as CSV.

### 9.4 Create / Edit Item (`/admin/inventory/new`, `/admin/inventory/[id]`)

**Form fields (grouped):**

*Identification:*
- SKU (auto-generated suggestion, editable)
- Title (required)
- Category (required, select)
- Brand, Model, Serial/Service Tag

*Specs (shown/hidden based on category):*
- Laptop/Desktop: CPU, RAM (GB), Storage (GB), Storage Type, GPU, Screen Size (inches), OS, Battery Cycles
- Tablet/Phone: CPU, RAM, Storage, Screen Size, OS, Battery Health
- Accessory: Type, Compatibility, Color

*Condition:*
- Cosmetic Grade (A/B/C with visual examples)
- Functional Grade (A/B/C)
- Battery Condition (Excellent/Good/Fair/Poor/N/A)

*Pricing:*
- Public Price (required)
- Internal Cost (visible to staff/admin only — rendered but hidden from public)

*Content:*
- Public Description (textarea, markdown or plain text)
- Internal Notes (textarea, staff-only)

*Status:*
- Status selector (AVAILABLE / ON_HOLD / SOLD / RETURNED)
- Hold Expires At (datetime, shown only when ON_HOLD)

*Photos:*
- `PhotoReorderGrid`: 5 upload slots, drag to reorder, delete individual photos.

*Policies:*
- Checkbox: "Use global warranty policy" (default true) or select custom policy.
- Checkbox: "Use global returns policy" (default true) or select custom policy.

**On submit:** Call `createItem` or `updateItem` server action. Redirect to `/admin/inventory/[id]` on success.

### 9.5 Record Sale (`/admin/inventory/[id]/sale`)

Only accessible if item status is AVAILABLE or ON_HOLD.

**Form fields:**
- Buyer Name (text)
- Buyer Phone (text)
- Sale Price (number, pre-filled with public_price)
- Payment Method (select: Cash / Bank Transfer / Mobile Money / Other)
- Fulfillment Type (select: Pickup / Delivery)
- Delivery Notes (textarea, shown when Delivery selected)
- Sold At (datetime, defaults to now)

**On submit:**
1. Call `createSale` server action.
2. Server action: creates `sales` row, updates `inventory_items.status = 'SOLD'`, generates receipt PDF, uploads PDF to Cloudinary, stores URL in `sales.receipt_pdf_url`.
3. Redirect to `/admin/sales?highlight={saleId}` with success toast.

### 9.6 Sales History (`/admin/sales`)

- Table: Receipt #, Item, Buyer Name, Sale Price, Payment Method, Date, Receipt PDF link.
- Filters: date range, payment method.
- Download receipt button per row.

### 9.7 Inquiries (`/admin/inquiries`)

- Table: Item, Source, Session, Date, UTM params.
- Filter: item, date range, source.

### 9.8 Analytics (`/admin/analytics`)

- Per-item summary table using `item_analytics` view.
- Sortable by views_7d, inquiries_7d, conversion_pct_30d.
- Simple bar charts for top 10 items by views.

### 9.9 Policy Editor (`/admin/policies`)

- Two tabs: Warranty and Returns.
- Rich text editor (TipTap or similar) for `content`.
- Effective date picker.
- Save button calls `updatePolicy` server action.
- Preview renders the HTML output.

### 9.10 CSV Exports (`/admin/exports`)

Buttons:
- Export Full Inventory → `GET /api/exports/inventory`
- Export Sales (date range picker) → `GET /api/exports/sales?from=X&to=Y`
- Export Inquiries (date range picker) → `GET /api/exports/inquiries?from=X&to=Y`

---

## 10. API Route Handlers

All route handlers in `app/api/` are Edge-compatible unless noted. Authentication via Supabase session cookie.

### `POST /api/log-view`

**Auth:** None (public). Uses service role for DB insert.

**Body:**
```json
{ "itemId": "uuid", "sessionId": "uuid" }
```

**Logic:**
1. Check `page_views` for a row with matching `item_id` and `session_id` in last 30 minutes.
2. If found: return `{ recorded: false }` (deduplication).
3. If not: insert new row. Return `{ recorded: true }`.

**Rate limit:** 1 insert per `(sessionId, itemId)` per 30 minutes (enforced by DB query before insert).

### `POST /api/log-inquiry`

**Auth:** None (public). Uses service role.

**Body:**
```json
{
  "itemId": "uuid",
  "sessionId": "uuid",
  "source": "whatsapp",
  "referrer": "string",
  "utmSource": "string",
  "utmMedium": "string",
  "utmCampaign": "string"
}
```

**Logic:** Insert row into `inquiries`. Always inserts (no dedup for inquiries — each click is intentional).

### `GET /api/receipts/[saleId]`

**Auth:** Staff session required.

**Logic:**
1. Fetch `sales` row by `saleId` + related `inventory_items` row.
2. If `receipt_pdf_url` exists: redirect to Cloudinary URL.
3. Else: regenerate PDF, upload to Cloudinary, update `sales.receipt_pdf_url`, return PDF stream.

**Response:** `Content-Type: application/pdf`, inline or attachment.

### `GET /api/exports/inventory`

**Auth:** Staff session required.

**Query params:** None required. Optional `?status=AVAILABLE`.

**Response:** `Content-Type: text/csv`, `Content-Disposition: attachment; filename="inventory-{date}.csv"`.

**Columns:** `sku, title, category, brand, model, status, public_price, cosmetic_grade, functional_grade, created_at`.

### `GET /api/exports/sales`

**Auth:** Staff session required.

**Query params:** `?from=YYYY-MM-DD&to=YYYY-MM-DD`.

**Columns:** `receipt_number, sku, title, buyer_name, buyer_phone, sale_price, payment_method, fulfillment_type, sold_at`.

### `GET /api/exports/inquiries`

**Auth:** Staff session required.

**Query params:** `?from=YYYY-MM-DD&to=YYYY-MM-DD`.

**Columns:** `item_sku, item_title, source, inquired_at, utm_source, utm_medium, utm_campaign`.

---

## 11. Server Actions

Server actions live in `actions/`. All mutating operations use server actions (not client-side API calls).

### `createItem(formData: ItemFormData): Promise<{ id: string; slug: string }>`

1. Validate all required fields (Zod schema).
2. Auto-generate `sku` if not provided: `{CATEGORY_PREFIX}-{YEAR}-{padded_sequence}`.
3. Auto-generate `slug` from title + sku: `slugify(title)-{sku.toLowerCase()}`.
4. Insert into `inventory_items`.
5. Return `{ id, slug }`.

### `updateItem(id: string, formData: Partial<ItemFormData>): Promise<void>`

1. Validate.
2. If `status` changed: update `status_changed_at = NOW()` and `status_changed_by = auth.uid()`.
3. Update row.
4. Revalidate `/items/[slug]` and `/` ISR paths.

### `createSale(formData: SaleFormData): Promise<{ receiptNumber: string }>`

**This is the most critical action. Run as a DB transaction.**

```typescript
// Pseudocode for the transaction
BEGIN;
  -- 1. Lock the item row
  SELECT * FROM inventory_items WHERE id = formData.itemId FOR UPDATE;
  -- 2. Verify item is AVAILABLE or ON_HOLD (error if SOLD)
  -- 3. Fetch current policy content for snapshot
  -- 4. Generate receipt number
  -- 5. Insert sales row with policy snapshots
  -- 6. Update inventory_items SET status = 'SOLD', status_changed_at = NOW()
COMMIT;
-- 7. Generate PDF receipt (outside transaction)
-- 8. Upload PDF to Cloudinary
-- 9. Update sales.receipt_pdf_url
```

Returns `receiptNumber`. Throws if item is already SOLD.

### `updatePolicy(type: 'warranty' | 'returns', content: string, effectiveDate: string): Promise<void>`

1. Admin-only check.
2. Upsert `policies` row.
3. Revalidate `/warranty` or `/returns` ISR paths.

### `uploadPhoto(itemId: string, file: File, position: number): Promise<ItemPhoto>`

1. Validate file type and size.
2. Upload to Cloudinary via `uploadItemPhoto()`.
3. Insert into `item_photos`.
4. Return new photo record.

### `reorderPhotos(itemId: string, orderedIds: string[]): Promise<void>`

1. Validate all IDs belong to `itemId`.
2. Bulk update `position` for each photo.

### `deletePhoto(photoId: string): Promise<void>`

1. Fetch photo to get `cloudinary_id`.
2. Delete from Cloudinary.
3. Delete from `item_photos`.
4. Re-number remaining photos' positions sequentially.

---

## 12. State Management

**No global state library (no Redux, no Zustand) is required for v1.** Use:

- **Server state:** Fetch in Server Components, pass as props.
- **URL state:** Filters, search, pagination via `useSearchParams` + `useRouter`.
- **Form state:** React Hook Form + Zod validation.
- **UI state:** `useState` / `useReducer` in Client Components.
- **Optimistic updates:** `useOptimistic` for status changes in admin table.

### Session ID for Analytics

```typescript
// hooks/useSession.ts
// Generates and persists a random UUID in a cookie for anonymous session tracking.
// Does NOT track the user's identity.

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function useSession(): string {
  const [sessionId, setSessionId] = useState<string>('');
  useEffect(() => {
    const key = 'inv_session_id';
    let id = document.cookie.match(new RegExp(`${key}=([^;]+)`))?.[1];
    if (!id) {
      id = uuidv4();
      // Session cookie: expires when browser closes
      document.cookie = `${key}=${id}; path=/; SameSite=Lax`;
    }
    setSessionId(id);
  }, []);
  return sessionId;
}
```

---

## 13. WhatsApp Integration

### 13.1 Link Builder

```typescript
// lib/whatsapp.ts

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER; // e.g. "254712345678" (no +)

type WhatsAppLinkParams = {
  itemId: string;
  title: string;
  price: number;
  currency?: string;
};

export function buildWhatsAppLink({ itemId, title, price, currency = 'KES' }: WhatsAppLinkParams): string {
  const message = encodeURIComponent(
    `Hi! I'm interested in this item from your catalog:\n\n` +
    `📱 *${title}*\n` +
    `🏷️ Item ID: ${itemId}\n` +
    `💰 Price: ${currency} ${price.toLocaleString()}\n\n` +
    `Is this still available?`
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}
```

### 13.2 WhatsApp Button Component

```tsx
// components/molecules/WhatsAppButton.tsx
// Must be a Client Component ('use client')
// On click: 1) fire log-inquiry  2) open WhatsApp link in new tab

'use client';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { useSession } from '@/hooks/useSession';
import { ItemStatus } from '@/types/inventory';

type Props = {
  itemId: string;
  title: string;
  price: number;
  status: ItemStatus;
};

const LABELS: Record<ItemStatus, string> = {
  AVAILABLE: 'Buy on WhatsApp',
  ON_HOLD:   'Ask about this item',
  RETURNED:  'Ask about this item',
  SOLD:      'Sold',
};
```

### 13.3 Inquiry Logging

The `POST /api/log-inquiry` call must be **non-blocking** — the WhatsApp tab should open immediately regardless of whether the log request completes. Use `fetch` with no `await` from the client.

```typescript
// Fire and forget — do NOT await
fetch('/api/log-inquiry', {
  method: 'POST',
  body: JSON.stringify({ itemId, sessionId, source: 'whatsapp', referrer: document.referrer }),
  headers: { 'Content-Type': 'application/json' },
});
window.open(whatsappLink, '_blank');
```

---

## 14. Analytics: Views & Inquiries

### 14.1 View Logging

`POST /api/log-view` is called from the Item Detail page on mount (client-side only — do not call during SSR/ISR render as it would log a view on every cache miss).

```typescript
// In ItemDetailPage client component or via useEffect
useEffect(() => {
  if (sessionId && itemId) {
    fetch('/api/log-view', {
      method: 'POST',
      body: JSON.stringify({ itemId, sessionId }),
      headers: { 'Content-Type': 'application/json' },
    });
  }
}, [sessionId, itemId]);
```

### 14.2 Analytics Admin View

The `AnalyticsSummary` organism queries the `item_analytics` view via a server component. Displayed columns:

| Column | Description |
|---|---|
| Item | SKU + title |
| Views 7d | Page views in last 7 days |
| Views 30d | Page views in last 30 days |
| Inquiries 7d | WhatsApp clicks in last 7 days |
| Inquiries 30d | WhatsApp clicks in last 30 days |
| Conversion % | `inquiries_30d / views_30d * 100` |

---

## 15. Sales & Receipt Generation

### 15.1 Receipt PDF Spec

Generated using `@react-pdf/renderer`. The PDF is a single-page A4 document.

**Header:**
- Shop name (from env `NEXT_PUBLIC_SHOP_NAME`)
- Shop address and phone (from env)
- Shop logo (Cloudinary URL from env `NEXT_PUBLIC_SHOP_LOGO_URL`)

**Body:**
```
RECEIPT
Receipt #: RCP-2024-00142
Date: January 15, 2024
------------------------------
ITEM DETAILS
SKU:         LAP-2024-001
Title:       Dell XPS 15 9520
Category:    Laptop
CPU:         Intel Core i7-12700H
RAM:         16 GB
Storage:     512 GB SSD
Condition:   Grade A (Cosmetic) / Grade A (Functional)
------------------------------
SALE DETAILS
Buyer:       John Doe
Phone:       +254 712 345 678
Sale Price:  KES 120,000
Payment:     Bank Transfer
Fulfillment: Pickup
------------------------------
POLICIES
Warranty:    [snapshot of warranty text at time of sale]
Returns:     [snapshot of returns text at time of sale]
------------------------------
Thank you for your purchase!
[Shop contact details]
```

### 15.2 Receipt Number Format

`RCP-{YYYY}-{00001}` — zero-padded 5-digit sequence, reset annually (or use continuous sequence; configurable via env).

### 15.3 PDF Storage

Generated PDF is uploaded to Cloudinary under `receipts/{receipt_number}.pdf`. The `secure_url` is stored in `sales.receipt_pdf_url`. Subsequent requests redirect to the Cloudinary URL; PDF is not regenerated.

---

## 16. CSV Export

```typescript
// lib/csv.ts
export function toCSV(rows: Record<string, unknown>[], columns: string[]): string {
  const header = columns.join(',');
  const body = rows.map(row =>
    columns.map(col => {
      const val = row[col] ?? '';
      const str = String(val).replace(/"/g, '""');
      return str.includes(',') || str.includes('\n') ? `"${str}"` : str;
    }).join(',')
  ).join('\n');
  return `${header}\n${body}`;
}
```

Each export route handler:
1. Verifies staff session.
2. Queries Supabase with optional date filters.
3. Serializes with `toCSV()`.
4. Returns `Response` with headers:
```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="inventory-2024-01-15.csv"
```

---

## 17. Policy Pages (CMS)

Policies are stored as HTML strings in the `policies` table. The `PolicyEditor` component in the admin uses **TipTap** (MIT-licensed rich text editor) to edit content.

```typescript
// Required TipTap extensions:
// - @tiptap/extension-bold
// - @tiptap/extension-italic
// - @tiptap/extension-bullet-list
// - @tiptap/extension-ordered-list
// - @tiptap/extension-heading (H2, H3 only)
// - @tiptap/extension-link
```

Policy content is rendered on public pages with `dangerouslySetInnerHTML`. Because only admin users can author policy content (not buyers), this is acceptable. **Content must be sanitized server-side using `DOMPurify` or `sanitize-html` before saving to DB** to guard against accidental XSS from copy-paste.

---

## 18. Mobile-First Design Specifications

### 18.1 Breakpoints (Tailwind defaults)

| Name | Min Width | Use |
|---|---|---|
| (default) | 0px | Mobile portrait — primary design target |
| `sm` | 640px | Mobile landscape / small tablet |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Wide desktop |

**All components are designed for mobile first, then enhanced for larger screens.** Never design for desktop and shrink down.

### 18.2 Touch Targets

- All interactive elements (buttons, links, form inputs) must have a minimum touch target of **44 × 44px**.
- Enforce with Tailwind: `min-h-[44px] min-w-[44px]`.

### 18.3 Typography Scale

```typescript
// tailwind.config.ts — extend with custom type scale
fontSize: {
  'xs':   ['0.75rem',  { lineHeight: '1rem' }],
  'sm':   ['0.875rem', { lineHeight: '1.25rem' }],
  'base': ['1rem',     { lineHeight: '1.75rem' }],  // body text
  'lg':   ['1.125rem', { lineHeight: '1.75rem' }],
  'xl':   ['1.25rem',  { lineHeight: '1.75rem' }],
  '2xl':  ['1.5rem',   { lineHeight: '2rem' }],
  '3xl':  ['1.875rem', { lineHeight: '2.25rem' }],
}
```

### 18.4 Color Tokens (extend Tailwind)

```typescript
// tailwind.config.ts
colors: {
  brand: {
    50: '#f0f9ff', 100: '#e0f2fe', 500: '#0ea5e9', 600: '#0284c7',
    700: '#0369a1', 900: '#0c4a6e',
  },
  status: {
    available: '#16a34a',   // green-600
    hold:      '#d97706',   // amber-600
    sold:      '#dc2626',   // red-600
    returned:  '#6b7280',   // gray-500
  },
  whatsapp: '#25D366',
}
```

### 18.5 Spacing System

Follow Tailwind's default spacing scale. Minimum padding on cards: `p-4` (16px). Section gaps: `gap-4` mobile, `gap-6` desktop.

### 18.6 Image Aspect Ratios

- Listing card images: `aspect-[4/3]` (480×360).
- Detail main image: `aspect-[4/3]` (800×600).
- Thumbnails: `aspect-square` (120×120).

Use `object-cover` on all images to prevent layout shifts.

### 18.7 Navigation

- Mobile: bottom sticky tab bar with icons for: Home, Sold, WhatsApp (direct CTA), [Admin if logged in].
- Desktop: top horizontal nav.

### 18.8 Admin UI Mobile

Admin is primarily desktop-oriented but must be usable on tablet (768px+). Sidebar collapses to a hamburger menu on `md` and below.

---

## 19. Performance Requirements

| Metric | Target | How |
|---|---|---|
| LCP (mobile, 4G) | < 2.5s | ISR, Cloudinary CDN, next/image |
| FID / INP | < 100ms | Minimal client JS, no heavy libs on public pages |
| CLS | < 0.1 | Reserve image dimensions, aspect-ratio classes |
| TTFB | < 500ms | ISR cache hit, Vercel edge |
| Image weight (card) | < 50 KB | Cloudinary `q_auto,f_auto` |
| JS bundle (public) | < 200 KB gzipped | No large client-side libs on public routes |

### Image Optimization Rules

- Use `next/image` for all images with `width`, `height`, and `sizes` props.
- Provide Cloudinary-transformed URLs (not original URLs) to `next/image`.
- Use `priority` prop only on the primary hero image on detail pages.
- Use `loading="lazy"` (default) on all other images.

### ISR Revalidation Strategy

| Route | Revalidate | Trigger |
|---|---|---|
| `/` | 60 seconds | `revalidatePath('/')` after item create/update/status change |
| `/items/[slug]` | 60 seconds | `revalidatePath('/items/[slug]')` after item update |
| `/sold` | 120 seconds | After item becomes SOLD |
| `/warranty` `/returns` | 3600 seconds | After policy update |

---

## 20. Testing Strategy (Jest)

### 20.1 Setup

```typescript
// jest.config.ts
import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'actions/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThresholds: {
    global: {
      branches:   70,
      functions:  80,
      lines:      80,
      statements: 80,
    },
  },
};

export default createJestConfig(config);
```

```typescript
// jest.setup.ts
import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  }),
}));
```

### 20.2 Test File Conventions

- Test files co-located with source: `Button.test.tsx` next to `Button.tsx`.
- API route tests: `app/api/log-view/__tests__/route.test.ts`.
- Action tests: `actions/__tests__/sales.test.ts`.
- Lib/utility tests: `lib/__tests__/whatsapp.test.ts`.

### 20.3 Required Tests by Layer

#### Atoms (all required)

```typescript
// Example: components/atoms/StatusOverlay.test.tsx
describe('StatusOverlay', () => {
  it('renders SOLD overlay with correct text and red background', () => { ... });
  it('renders ON_HOLD overlay with amber background', () => { ... });
  it('does not render for AVAILABLE status', () => { ... });
  it('applies sm size classes correctly', () => { ... });
  it('applies lg size classes correctly', () => { ... });
});

// components/atoms/Badge.test.tsx
describe('Badge', () => {
  it.each(['sold', 'hold', 'available', 'returned'])(
    'renders %s variant with correct label',
    (variant) => { ... }
  );
});
```

#### Molecules (all required)

```typescript
// components/molecules/WhatsAppButton.test.tsx
describe('WhatsAppButton', () => {
  it('renders "Buy on WhatsApp" for AVAILABLE items', () => { ... });
  it('renders "Ask about this item" for ON_HOLD items', () => { ... });
  it('renders disabled "Sold" button for SOLD items', () => { ... });
  it('fires log-inquiry fetch on click for AVAILABLE items', async () => { ... });
  it('opens WhatsApp link in new tab on click', async () => { ... });
  it('does NOT fire fetch for SOLD items', async () => { ... });
});

// components/molecules/ItemCard.test.tsx
describe('ItemCard', () => {
  it('renders item title and price', () => { ... });
  it('shows StatusOverlay when status is SOLD', () => { ... });
  it('shows StatusOverlay when status is ON_HOLD', () => { ... });
  it('does not show StatusOverlay when AVAILABLE', () => { ... });
  it('links to correct item detail URL', () => { ... });
});
```

#### Organisms (smoke + behavior)

```typescript
// components/organisms/InventoryGrid.test.tsx
describe('InventoryGrid', () => {
  it('renders correct number of ItemCards', () => { ... });
  it('renders empty state when items array is empty', () => { ... });
  it('applies responsive grid classes', () => { ... });
});
```

#### Server Actions

```typescript
// actions/__tests__/sales.test.ts
describe('createSale', () => {
  it('throws if item status is already SOLD', async () => { ... });
  it('creates a sales row with correct receipt number format', async () => { ... });
  it('updates item status to SOLD after sale creation', async () => { ... });
  it('stores policy snapshots from current policies', async () => { ... });
});
```

#### API Route Handlers

```typescript
// app/api/log-view/__tests__/route.test.ts
describe('POST /api/log-view', () => {
  it('returns 400 if itemId is missing', async () => { ... });
  it('returns recorded: false if view exists within 30 minutes', async () => { ... });
  it('returns recorded: true and inserts view if no recent view exists', async () => { ... });
});
```

#### Utility Libraries

```typescript
// lib/__tests__/whatsapp.test.ts
describe('buildWhatsAppLink', () => {
  it('includes itemId in the message', () => { ... });
  it('includes title in the message', () => { ... });
  it('includes formatted price in the message', () => { ... });
  it('returns a valid wa.me URL', () => { ... });
  it('URL-encodes the message', () => { ... });
});

// lib/__tests__/csv.test.ts
describe('toCSV', () => {
  it('produces correct header row', () => { ... });
  it('escapes commas in values with quotes', () => { ... });
  it('escapes double quotes inside quoted values', () => { ... });
  it('handles null/undefined values as empty string', () => { ... });
});

// lib/__tests__/cloudinary.test.ts
describe('cloudinaryUrl', () => {
  it('returns correct URL for thumb size', () => { ... });
  it('returns correct URL for card size', () => { ... });
  it('returns correct URL for zoom size', () => { ... });
});
```

#### Hooks

```typescript
// hooks/__tests__/useSession.test.ts
describe('useSession', () => {
  it('generates and stores a UUID session ID if none exists', () => { ... });
  it('returns the same session ID on subsequent renders', () => { ... });
  it('reads existing session from cookie', () => { ... });
});
```

### 20.4 CI Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install --frozen-lockfile
      - run: pnpm tsc --noEmit
      - run: pnpm lint
      - run: pnpm test --coverage
      - run: pnpm build
```

### 20.5 Pre-commit Hooks (Husky + lint-staged)

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

---

## 21. Environment Variables

```bash
# .env.local — never commit this file

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # Server-only; used in API routes for analytics inserts

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxx

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER=254712345678  # No + prefix

# Shop Info (used in receipts and WhatsApp messages)
NEXT_PUBLIC_SHOP_NAME=TechShop Nairobi
NEXT_PUBLIC_SHOP_ADDRESS=123 Kenyatta Ave, Nairobi
NEXT_PUBLIC_SHOP_PHONE=+254 712 345 678
NEXT_PUBLIC_SHOP_LOGO_URL=https://res.cloudinary.com/your-cloud-name/image/upload/v1/shop/logo.png

# Feature Flags (see §23)
NEXT_PUBLIC_FEATURE_RETURNED_ITEMS_VISIBLE=false
NEXT_PUBLIC_FEATURE_HOLD_EXPIRY=false
```

---

## 22. Deployment

### 22.1 Hosting

- **Production:** Vercel (always-on; no cold starts on Pro/Team plan).
- **Database:** Supabase hosted PostgreSQL with automated daily backups (minimum).
- **Media:** Cloudinary (CDN, always-on, no additional hosting required).

### 22.2 Vercel Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_role_key",
    "CLOUDINARY_API_SECRET": "@cloudinary_api_secret"
  }
}
```

### 22.3 Domain Configuration

- Public site: `yourdomain.com` (or `www.yourdomain.com`)
- Admin: `yourdomain.com/admin` (no separate subdomain needed; protected by middleware)

### 22.4 Supabase CLI Commands

```bash
# Initialize
supabase init
supabase link --project-ref <ref>

# Generate TypeScript types from DB
supabase gen types typescript --project-id <ref> > lib/supabase/types.ts

# Run migrations
supabase db push

# Seed initial data (policies)
supabase db seed
```

---

## 23. Feature Flags & Phased Delivery

Features are toggled via environment variables. The agent must implement the flag checks but the underlying code should always be complete and correct.

| Flag | Default | Feature |
|---|---|---|
| `NEXT_PUBLIC_FEATURE_RETURNED_ITEMS_VISIBLE` | `false` | Show RETURNED items on public listing |
| `NEXT_PUBLIC_FEATURE_HOLD_EXPIRY` | `false` | Auto-expire ON_HOLD items via cron |
| `NEXT_PUBLIC_FEATURE_HOT_ITEMS` | `false` | "Hot items" section (top by views 7d) |
| `NEXT_PUBLIC_FEATURE_FORM_INQUIRY` | `false` | On-site inquiry form (vs WhatsApp only) |
| `NEXT_PUBLIC_FEATURE_RECENTLY_SOLD` | `true` | Recently Sold page |
| `NEXT_PUBLIC_FEATURE_ANALYTICS_DASHBOARD` | `true` | Admin analytics tab |

### Phase Delivery Plan

**Phase 1 (Core)**
- DB schema + migrations
- Supabase Auth + RLS
- Inventory CRUD (admin)
- Photo upload (Cloudinary)
- Public listing + detail pages
- StatusOverlay component
- WhatsApp CTA (no logging yet)

**Phase 2 (Analytics + Recently Sold)**
- `POST /api/log-view`
- `POST /api/log-inquiry`
- `useSession` hook
- View logging on detail page
- WhatsApp click logging
- `/sold` page
- Admin analytics view

**Phase 3 (Sales + Receipts + Exports)**
- `createSale` server action
- Receipt PDF generation
- Cloudinary PDF upload
- `/api/receipts/[saleId]`
- CSV export routes
- Admin export UI

**Phase 4 (Polish + Optional)**
- Hold expiry cron (Supabase Edge Function)
- Hot items section
- Form-based inquiry option
- Advanced analytics charts
- Pricing rule suggestions

---

## 24. Acceptance Criteria Matrix

| ID | Feature | Criteria | Test Type |
|---|---|---|---|
| AC-01 | Inventory listing | All AVAILABLE items appear on homepage | Integration |
| AC-02 | Status overlay | SOLD items show red SOLD overlay on card image | Component |
| AC-03 | Status overlay | ON_HOLD items show amber ON HOLD overlay | Component |
| AC-04 | WhatsApp CTA | AVAILABLE item opens WhatsApp with itemId in message | Unit |
| AC-05 | WhatsApp CTA | SOLD item shows disabled "Sold" button | Component |
| AC-06 | Inquiry log | WhatsApp click inserts row in `inquiries` table | Integration |
| AC-07 | View log | Detail page visit inserts row in `page_views` (once per session per 30min) | Integration |
| AC-08 | Sale creation | Creating a sale sets item status to SOLD immediately | Integration |
| AC-09 | Sale creation | Throws error if item is already SOLD | Unit |
| AC-10 | Receipt | Receipt PDF contains item SKU, title, price, buyer name | Integration |
| AC-11 | Receipt | Receipt number matches format `RCP-YYYY-NNNNN` | Unit |
| AC-12 | Policy pages | Warranty page renders current policy HTML | Integration |
| AC-13 | Policy pages | Policy update via admin revalidates `/warranty` | Integration |
| AC-14 | CSV export | Inventory CSV contains all columns | Integration |
| AC-15 | Auth | Non-authenticated user is redirected from `/admin/*` to `/admin/login` | Integration |
| AC-16 | RLS | Staff cannot delete items (returns 403) | Integration |
| AC-17 | Images | Uploading a photo creates a row in `item_photos` with Cloudinary URL | Integration |
| AC-18 | Images | Photo reorder updates `position` field correctly | Integration |
| AC-19 | Mobile | Homepage renders as single-column grid at 375px viewport | Component |
| AC-20 | Mobile | All interactive elements meet 44×44px touch target minimum | Visual/Manual |
| AC-21 | Performance | Homepage LCP < 2.5s on throttled 4G | Manual / Lighthouse |
| AC-22 | ISR | Item detail page re-renders within 60s after status change | Manual |
| AC-23 | Filters | Filtering by category on homepage returns only matching items | Integration |
| AC-24 | Filters | Text search matches title, brand, model, SKU (case-insensitive) | Unit |
| AC-25 | Session | Same session ID is returned across multiple hook calls | Unit |
| AC-26 | Coverage | Jest coverage ≥ 80% lines across components, lib, actions | CI |

---

*End of Technical PRD v1.0*  
*Last updated: February 2026*  
*Stack: Next.js 14 · TypeScript · Tailwind CSS · Supabase · Cloudinary*
