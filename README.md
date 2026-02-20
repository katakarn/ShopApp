# ShopApp (Next.js + Prisma + NextAuth)

Portfolio-ready e-commerce app with product catalog, cart, checkout (mock payment), user orders, and admin dashboard.

## Stack

- Next.js 15 (App Router, TypeScript)
- Prisma + PostgreSQL
- NextAuth (Credentials)
- Server Actions

## Features

- Product listing and product detail page
- Session/Account-aware cart (guest cart merges after sign-in)
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
