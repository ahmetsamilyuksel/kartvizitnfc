# NFC Card Studio - Development Guide

## Project Overview

NFC Card Studio is a premium NFC business card ordering platform built with Next.js 14 App Router. Users design a card, place an order, and receive a digital profile page accessible via NFC tap.

## Tech Stack

- **Framework**: Next.js 14 App Router + TypeScript (strict mode)
- **Styling**: Tailwind CSS (dark theme throughout)
- **Database**: Prisma ORM + SQLite (`prisma/dev.db`)
- **Auth**: iron-session (cookie-based, admin-only)
- **Validation**: Zod schemas on all API endpoints
- **QR**: qrcode package for vCard QR generation

## Key Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npx prisma migrate dev   # Run migrations
npx prisma studio    # Database GUI
node prisma/seed.js  # Seed initial data
```

## Architecture

### File Structure
```
src/app/[lang]/*     → Public pages with i18n (ru/tr/en)
src/app/admin/*      → Admin panel (server + client components)
src/app/api/*        → REST API endpoints
src/components/*     → Reusable client components
src/lib/*            → Core utilities
src/messages/*.json  → Translation files
src/middleware.ts    → Route-level middleware
```

### Database Models
- **AdminSetting**: Singleton (id=1) for currency + base price
- **PaymentMethod**: Payment options (manual/bank/card/crypto)
- **Card**: NFC card designs (model/color/contact info/photo)
- **Order**: Links Card + PaymentMethod with customer/shipping data

### Route Patterns
- Public: `/{lang}`, `/{lang}/create`, `/{lang}/checkout`, `/{lang}/order/success`, `/{lang}/a/{cardId}`
- Admin: `/admin`, `/admin/login`, `/admin/orders`, `/admin/orders/{id}`, `/admin/settings`
- API: `/api/public/*`, `/api/orders`, `/api/vcard/{cardId}`, `/api/admin/*`

## Conventions

1. **All API routes** must use Zod validation
2. **Admin API routes** must check `getSession().isLoggedIn` first
3. **Pages under `[lang]`** receive locale via `params.lang` and use `getMessages(lang)` for translations
4. **Route params** in Next.js 15 style: `params` is `Promise<{...}>`, must be `await`ed
5. **Client components** use `"use client"` directive at top
6. **Dark theme** everywhere - use `bg-gray-950`, `bg-white/[0.03]`, `border-white/[0.06]` patterns
7. **Card colors**: turquoise (#14b8a6), navy (#1e40af), graphite (#374151)
8. **Card models**: minimal, wave, premium
9. **Order statuses**: NEW → PAID → IN_PRODUCTION → SHIPPED → COMPLETED | CANCELED

## Environment Variables

Required in `.env`:
- `DATABASE_URL` - Prisma connection string
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` - Admin login credentials
- `SESSION_SECRET` - 32-char secret for iron-session
- `NEXT_PUBLIC_APP_URL` - Base URL for digital card links
