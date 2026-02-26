# Electronics Catalog

A mobile-first inventory catalog for a retail electronics shop. Customers browse current stock, view item details, and initiate purchases via WhatsApp. All payment and fulfillment happen offline. Staff manage inventory, photos, statuses, and sales through a custom admin UI.

**Stack:** Next.js 14 · TypeScript · Tailwind CSS · Supabase · Cloudinary

## Features

- **Public catalog** — Browse available items by category, status, and search; no auth required.
- **Item status** — `AVAILABLE` | `ON_HOLD` | `SOLD` | `RETURNED` drives UI (overlays, filters, CTAs).
- **WhatsApp** — Primary buyer channel; “Contact via WhatsApp” opens pre-filled message.
- **Admin** — Inventory CRUD, photo upload (Cloudinary), sales recording, receipt PDFs, analytics, CSV export, policy pages.
- **No online checkout** — Items are unique units; payment/fulfillment handled offline.

## Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- [Supabase](https://supabase.com) project
- [Cloudinary](https://cloudinary.com) account

## Getting Started

```bash
# Clone and install
git clone <repo-url>
cd electronics-catalog
pnpm install   # or npm install

# Copy env and fill in values (see Environment Variables below)
cp .env.example .env.local

# Run migrations (Supabase CLI)
supabase link --project-ref <your-project-ref>
supabase db push

# Generate DB types (optional but recommended)
supabase gen types typescript --project-id <ref> > lib/supabase/types.ts

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) for the public catalog; [http://localhost:3000/admin](http://localhost:3000/admin) for the admin dashboard.

### First-time admin user

Create a staff account (email/password) via Supabase Auth, then promote to admin:

```bash
pnpm run create-admin <email> <password> 
# Follow prompts to set a user as admin (by email)
```

Or create the user in Supabase Dashboard → Authentication → Users, then run the script to assign the admin role.

## Scripts

| Command | Description |
|--------|-------------|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Production build |
| `pnpm start` | Run production server |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run Jest tests |
| `pnpm test:coverage` | Jest with coverage |
| `pnpm run create-admin` | Promote a user to admin role |

## Environment Variables

Create `.env.local` (never commit). Required:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only; API routes (e.g. analytics) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp number (e.g. `254712345678`, no `+`) |

Optional (shop info for receipts and WhatsApp):

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SHOP_NAME` | Shop name |
| `NEXT_PUBLIC_SHOP_ADDRESS` | Address |
| `NEXT_PUBLIC_SHOP_PHONE` | Display phone |
| `NEXT_PUBLIC_SHOP_LOGO_URL` | Logo URL (e.g. Cloudinary) |

Feature flags (see [TECHNICAL_PRD.md](./TECHNICAL_PRD.md) §23):

- `NEXT_PUBLIC_FEATURE_RETURNED_ITEMS_VISIBLE`
- `NEXT_PUBLIC_FEATURE_HOLD_EXPIRY`
- `NEXT_PUBLIC_FEATURE_RECENTLY_SOLD`
- `NEXT_PUBLIC_FEATURE_ANALYTICS_DASHBOARD`
- etc.

## Project Structure

```
app/
  (public)/          # Public routes: home, item detail, sold, warranty, returns
  (admin)/            # Staff routes: login, dashboard, inventory, sales, analytics, etc.
  api/                # log-view, log-inquiry, receipts/[saleId], exports/*
components/           # Atomic design: atoms, molecules, organisms, templates, ui
lib/                  # Supabase clients, Cloudinary, PDF receipt, WhatsApp, analytics, csv
actions/              # Server actions: inventory, sales, policies, photos
hooks/                # useInventoryFilters, useItemStatus, useSession
types/                # inventory, sales, analytics, policy
```

## Deployment

- **App:** [Vercel](https://vercel.com) (Next.js).
- **Database:** Supabase (PostgreSQL + Auth).
- **Media:** Cloudinary (images and receipt PDFs).

Set the same env vars in Vercel; keep `SUPABASE_SERVICE_ROLE_KEY` and `CLOUDINARY_API_SECRET` as secrets. Admin lives at `/admin`; no separate subdomain.

## Documentation

Full technical spec, schema, RLS, API routes, components, and acceptance criteria: **[TECHNICAL_PRD.md](./TECHNICAL_PRD.md)**.
