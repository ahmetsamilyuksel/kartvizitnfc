# NFC Card Studio - Development Guide

## Project Overview

NFC Card Studio is a premium NFC business card ordering platform built with Next.js 14 App Router. Users design a physical NFC card (choosing model, color, contact info), place an order with shipping details, and receive a digital profile page accessible via NFC tap. The app supports three languages (Russian, Turkish, English) and includes an admin panel for order management.

## Tech Stack

- **Framework**: Next.js 14.2.35 App Router + TypeScript (strict mode)
- **React**: v18
- **Styling**: Tailwind CSS 3.4 (dark theme throughout)
- **Database**: Prisma ORM 5.x + SQLite (`prisma/dev.db`)
- **Auth**: iron-session 8.x (cookie-based, admin-only)
- **Validation**: Zod 4.x schemas on all API endpoints
- **QR**: qrcode package for vCard QR generation

## Key Commands

```bash
npm run dev              # Start development server
npm run build            # prisma generate && next build
npm run start            # Start production server
npm run lint             # Run ESLint (next/core-web-vitals + next/typescript)
npx prisma migrate dev   # Run database migrations
npx prisma studio        # Database GUI at localhost:5555
node prisma/seed.js      # Seed AdminSetting + 2 default payment methods
```

Note: `npm run build` runs `prisma generate` before `next build`. There is also a `postinstall` script that runs `prisma generate`.

## Architecture

### File Structure

```
kartvizitnfc/
├── src/
│   ├── app/
│   │   ├── layout.tsx                          # Root layout (dark theme, Geist font)
│   │   ├── page.tsx                            # Redirects / → /ru
│   │   ├── globals.css                         # Tailwind directives + dark base
│   │   ├── [lang]/                             # Localized public routes
│   │   │   ├── layout.tsx                      # Validates locale param
│   │   │   ├── page.tsx                        # Landing page (server)
│   │   │   ├── create/page.tsx                 # Card designer (client)
│   │   │   ├── checkout/page.tsx               # Checkout form (client)
│   │   │   ├── order/success/page.tsx          # Order confirmation (client)
│   │   │   └── a/[cardId]/
│   │   │       ├── page.tsx                    # Digital card (server)
│   │   │       └── DigitalCardClient.tsx       # Digital card UI (client)
│   │   ├── admin/                              # Admin panel
│   │   │   ├── login/page.tsx                  # Login form (client)
│   │   │   ├── page.tsx                        # Dashboard with metrics (server)
│   │   │   ├── orders/page.tsx                 # Orders list with filters (client)
│   │   │   ├── orders/[id]/page.tsx            # Order detail + status update (client)
│   │   │   └── settings/page.tsx               # Pricing + payment methods (client)
│   │   └── api/
│   │       ├── orders/route.ts                 # POST: create order + card
│   │       ├── public/checkout-data/route.ts   # GET: pricing & payment methods
│   │       ├── vcard/[cardId]/route.ts         # GET: vCard file download
│   │       └── admin/
│   │           ├── login/route.ts              # POST: admin authentication
│   │           ├── orders/route.ts             # GET: list orders (filterable)
│   │           ├── orders/[id]/route.ts        # GET/PATCH: order detail/status
│   │           ├── settings/route.ts           # GET/PUT: admin settings
│   │           ├── payment-methods/route.ts    # GET/POST: payment methods
│   │           └── payment-methods/[id]/route.ts # PATCH/DELETE: single method
│   ├── components/
│   │   ├── CardPreview.tsx                     # Business card visual mockup
│   │   ├── ColorSelector.tsx                   # Color picker (3 options)
│   │   ├── ModelSelector.tsx                   # Model picker (3 options)
│   │   ├── PhotoUpload.tsx                     # Image upload + compression
│   │   └── LanguageSwitcher.tsx                # RU/TR/EN dropdown
│   ├── lib/
│   │   ├── db.ts                               # Prisma singleton (prevents HMR leaks)
│   │   ├── auth.ts                             # iron-session config + validateAdmin()
│   │   ├── i18n.ts                             # Locale helpers + getMessages()
│   │   ├── vcard.ts                            # vCard v3.0 string generator
│   │   └── validation.ts                       # All Zod schemas
│   ├── messages/
│   │   ├── en.json                             # English translations
│   │   ├── ru.json                             # Russian translations
│   │   └── tr.json                             # Turkish translations
│   └── middleware.ts                           # Redirect / → /ru, admin auth guard
├── prisma/
│   ├── schema.prisma                           # 4 models (see below)
│   ├── seed.js                                 # Seeds AdminSetting + PaymentMethods
│   ├── dev.db                                  # SQLite database file
│   └── migrations/                             # Migration history
├── package.json
├── tsconfig.json                               # Strict mode, @/* → ./src/*
├── tailwind.config.ts
├── next.config.mjs                             # Default config
├── .eslintrc.json                              # next/core-web-vitals + next/typescript
└── .env.example                                # Environment template
```

### Database Models (Prisma)

**AdminSetting** — Singleton row (id=1) for global configuration:
- `currency: String` (default: "RUB")
- `basePriceRub: Int` (default: 1490)

**PaymentMethod** — Available payment options:
- `name: String` — Display name
- `type: String` — One of: `manual`, `bank`, `card`, `crypto`
- `active: Boolean` — Whether shown to customers
- `instructions: String?` — Optional payment instructions text
- `sortOrder: Int` — Display ordering

**Card** — NFC card designs (created at order time):
- `fullName`, `company?`, `title?`, `phone?`, `email?`, `website?`, `whatsapp?`, `telegram?`
- `model: String` — One of: `minimal`, `wave`, `premium`
- `color: String` — One of: `turquoise`, `navy`, `graphite`
- `photoDataUrl: String?` — Base64-encoded JPEG (compressed to <500KB)

**Order** — Links Card + PaymentMethod with customer/shipping:
- `status: String` — One of: `NEW`, `PAID`, `IN_PRODUCTION`, `SHIPPED`, `COMPLETED`, `CANCELED`
- `totalAmountRub: Int`
- Customer fields: `customerFullName`, `customerPhone`, `customerEmail?`
- Shipping fields: `shippingCountry`, `shippingCity`, `shippingAddress1`, `shippingAddress2?`, `shippingPostalCode?`
- `notes: String?`

All non-singleton models use CUID for primary keys.

### API Endpoints Reference

**Public:**
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/orders` | Create card + order. Returns `{ orderId, cardId }` |
| GET | `/api/public/checkout-data` | Returns `{ basePriceRub, currency, paymentMethods[] }` |
| GET | `/api/vcard/[cardId]` | Downloads vCard file for a card |

**Admin (all require active session):**
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/admin/login` | Authenticate with email/password |
| GET | `/api/admin/orders` | List orders. Query: `?status=X&search=Y` |
| GET | `/api/admin/orders/[id]` | Single order with card + payment details |
| PATCH | `/api/admin/orders/[id]` | Update order status |
| GET | `/api/admin/settings` | Get AdminSetting |
| PUT | `/api/admin/settings` | Upsert AdminSetting |
| GET | `/api/admin/payment-methods` | List all payment methods |
| POST | `/api/admin/payment-methods` | Create payment method |
| PATCH | `/api/admin/payment-methods/[id]` | Update payment method |
| DELETE | `/api/admin/payment-methods/[id]` | Delete (fails if orders reference it) |

### Route Patterns

- **Public**: `/{lang}`, `/{lang}/create`, `/{lang}/checkout`, `/{lang}/order/success`, `/{lang}/a/{cardId}`
- **Admin**: `/admin`, `/admin/login`, `/admin/orders`, `/admin/orders/{id}`, `/admin/settings`
- **API**: `/api/orders`, `/api/public/*`, `/api/vcard/{cardId}`, `/api/admin/*`

### User Flow

1. Landing page (`/{lang}`) → CTA to create card
2. Card designer (`/{lang}/create`) → Choose model/color, upload photo, fill contact info → saves to sessionStorage
3. Checkout (`/{lang}/checkout`) → Customer & shipping info, select payment → POST `/api/orders`
4. Success page (`/{lang}/order/success`) → Shows order number + digital card link
5. Digital card (`/{lang}/a/{cardId}`) → Contact info, action buttons, QR code for vCard download

## Conventions

### General

1. **All API routes** must validate input with Zod schemas from `src/lib/validation.ts`
2. **Admin API routes** must check `getSession().isLoggedIn` first and return 401 if not authenticated
3. **Route params** follow Next.js 15 async style: `params` is `Promise<{...}>` and must be `await`ed
4. **Client components** use `"use client"` directive at top of file
5. **Server components** are the default — no directive needed

### i18n

- Supported locales: `ru` (default), `tr`, `en`
- Pages under `[lang]` receive locale via `params.lang` and call `getMessages(lang)` for translations
- Translation files live in `src/messages/{locale}.json`
- The `LanguageSwitcher` component swaps the first path segment to change locale
- Default redirect: `/` → `/ru`

### Styling (Dark Theme)

- **Backgrounds**: `bg-gray-950` (page), `bg-white/[0.03]` (cards/panels), `bg-white/[0.05]` (hover)
- **Borders**: `border-white/[0.06]` (subtle), `border-white/10` (medium)
- **Text**: `text-white` (primary), `text-white/60` (secondary), `text-white/30` (muted)
- **Gradients**: Teal-to-blue for CTA buttons (`from-teal-500 to-blue-600`)
- **Shadows**: Teal glow on card previews (`shadow-teal-500/20`)
- **Corners**: `rounded-xl` to `rounded-3xl` on interactive elements
- **Card colors**: turquoise (`#14b8a6`), navy (`#1e40af`), graphite (`#374151`)
- **Status badges**: green (completed), yellow (paid), blue (in production/shipped), red (canceled), gray (new)

### Card Design

- **Models**: `minimal` (clean, no decoration), `wave` (SVG wave at bottom), `premium` (radial gradient circles)
- **Colors**: `turquoise`, `navy`, `graphite` — each with matching gradient backgrounds
- **Card aspect ratio**: 1.6:1 (standard business card)
- **Photo processing**: Cropped to 800x800, JPEG compressed with decreasing quality until <500KB

### Data Flow Between Pages

- Card design data → `sessionStorage` key (from create to checkout)
- Order result (orderId, cardId) → `sessionStorage` (from checkout to success)
- No global state management library — React hooks + sessionStorage only

### Database

- **Prisma singleton** in `src/lib/db.ts` prevents connection leaks during HMR
- **CUID** for all primary keys except AdminSetting (integer, always id=1)
- **Order status flow**: `NEW` → `PAID` → `IN_PRODUCTION` → `SHIPPED` → `COMPLETED` (or `CANCELED` from any state)
- **Cascading**: Orders reference Card and PaymentMethod; PaymentMethod cannot be deleted if orders exist

### Authentication

- **Admin only** — no user accounts
- iron-session with cookie `nfc-admin-session`, 24h TTL
- Credentials validated against `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars
- Middleware redirects unauthenticated `/admin/*` requests to `/admin/login`

## Environment Variables

Required in `.env` (see `.env.example`):

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Prisma SQLite connection | `file:./dev.db` |
| `ADMIN_EMAIL` | Admin login email | `admin@example.com` |
| `ADMIN_PASSWORD` | Admin login password | `SuperSecure123!` |
| `SESSION_SECRET` | 32-char iron-session secret | `your-32-char-secret-here-change-me` |
| `NEXT_PUBLIC_APP_URL` | Base URL for digital card links | `http://localhost:3000` |

## Validation Schemas

All schemas are defined in `src/lib/validation.ts`:

- **cardSchema**: fullName (min 2), phone (min 5), email (valid or null), website (URL or empty), model (enum), color (enum), plus optional fields
- **orderSchema**: Extends card schema with customer info + shipping fields
- **adminSettingsSchema**: basePriceRub (positive int), currency (string)
- **paymentMethodSchema**: name, type (enum: manual/bank/card/crypto), active, instructions, sortOrder
- **loginSchema**: email (valid), password (required)
- **orderStatusSchema**: status (enum of 6 valid statuses)

## Components

| Component | Type | Purpose |
|-----------|------|---------|
| `CardPreview` | Client | Visual business card mockup with model-specific decorations and color themes |
| `ColorSelector` | Client | Three color buttons (turquoise/navy/graphite) with selection ring |
| `ModelSelector` | Client | Three model buttons (minimal/wave/premium) with SVG icons |
| `PhotoUpload` | Client | Hidden file input + canvas-based image crop/compress to <500KB JPEG |
| `LanguageSwitcher` | Client | Dropdown for RU/TR/EN locale switching, preserves current route |

All components accept i18n `labels` props for translated text.

## Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env
# Edit .env with your values

# 3. Run database migrations
npx prisma migrate dev

# 4. Seed initial data
node prisma/seed.js

# 5. Start dev server
npm run dev
```
