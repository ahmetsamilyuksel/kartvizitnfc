# NFC Card Studio

Premium NFC business card ordering platform. Users design their card, place an order, and get a digital profile accessible via NFC tap.

## Tech Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** (dark theme, premium design)
- **Prisma** + SQLite
- **iron-session** (admin auth)
- **Zod** validation
- **qrcode** package

## Setup

```bash
npm install
cp .env.example .env
npx prisma migrate dev
node prisma/seed.js
npm run dev
```

## Admin Access

Navigate to `http://localhost:3000/admin/login` and use credentials from `.env`:

- Email: `admin@example.com`
- Password: `SuperSecure123!`

## Project Structure

```
src/
├── app/
│   ├── [lang]/          # Public pages (landing, create, checkout, success, digital card)
│   ├── admin/           # Admin pages (login, dashboard, orders, settings)
│   └── api/             # API routes (public + admin)
├── components/          # Reusable UI components
├── lib/                 # Core utilities (db, auth, vcard, validation, i18n)
├── messages/            # i18n translations (ru, tr, en)
└── middleware.ts        # Route middleware
prisma/
├── schema.prisma        # Database schema
└── seed.js              # Seed data
```

## User Flow

1. Landing page → Create card (design + form) → Checkout → Order success
2. NFC tap → Digital card page (`/{lang}/a/{cardId}`) → Download vCard

## Admin Flow

1. Login → Dashboard (metrics) → Orders list → Order detail (update status)
2. Settings → Pricing + Payment methods CRUD
