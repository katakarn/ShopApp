# ShopApp (Next.js + Prisma + NextAuth)

Portfolio-ready e-commerce app with product catalog, cart, checkout (mock payment), user orders, and admin dashboard.

## Stack

- Next.js 15 (App Router, TypeScript)
- Prisma + PostgreSQL
- NextAuth (Credentials + optional Google OAuth)
- Server Actions

## Features

- Product listing and product detail page
- Session/Account-aware cart (guest cart merges after sign-in)
- Email verification flow for credentials signup
- Checkout flow with stock validation and mock order placement
- User order history
- Admin dashboard with:
  - Product create + product list
  - Order status update (PENDING, PAID, SHIPPED, CANCELLED)
  - Basic metrics (products, orders, paid revenue)

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Create env file

```bash
cp .env.example .env
```

3. Update `.env`

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mini_ecommerce"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-string"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
RESEND_API_KEY=""
EMAIL_FROM="ShopApp <noreply@example.com>"
```

4. Generate Prisma client and run migration

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

5. Seed sample data

```bash
npm run prisma:seed
```

6. Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Database Options

### Option A (recommended): Docker PostgreSQL (local)

This repo includes `docker-compose.yml`.

```bash
npm run db:up
npm run prisma:migrate -- --name init
npm run prisma:seed
```

Useful commands:

```bash
npm run db:logs
npm run db:down
npm run db:reset
```

### Option B: Neon (cloud PostgreSQL)

1. Create a database in Neon
2. Copy connection string to `DATABASE_URL` in `.env`
3. Run:

```bash
npm run prisma:migrate -- --name init
npm run prisma:seed
```

### Option C: Supabase (cloud PostgreSQL)

1. Create project in Supabase
2. Use Transaction Pooler or direct Postgres URL as `DATABASE_URL`
3. Run:

```bash
npm run prisma:migrate -- --name init
npm run prisma:seed
```

## Demo Accounts

- Admin: `admin@example.com` / `admin1234`
- User: create from `/register`

## Optional: Google OAuth

If you want "Continue with Google" on `/login`:

1. Create OAuth credentials in Google Cloud Console
2. Add these authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - your production URL equivalent
3. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`

## Optional: Real Email Delivery (Resend)

If you want real verification emails:

1. Create API key in Resend
2. Set `RESEND_API_KEY` and `EMAIL_FROM` in `.env`

Without those variables, development mode prints and exposes a local verify link on `/verify-email/sent`.

## Test Email Verification

1. Register a new account from `/register`
2. You will be redirected to `/verify-email/sent`
3. In development, click `Verify now` from that page
4. Sign in from `/login`

Expected behavior:
- Sign in fails with unverified credentials account
- After verify, sign in succeeds

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - ESLint check
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run Prisma migration
- `npm run prisma:seed` - Seed database

## Notes

- Checkout is mock payment and creates an order after stock checks.
- Cart is persisted via secure HTTP-only cookie for guests and via user cart after sign-in.
