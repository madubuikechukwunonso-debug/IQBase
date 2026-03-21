# IQBase Quick Start Guide

Get IQBase running in 5 minutes with this condensed guide.

## Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (local or cloud)
- Stripe account (free)

## 1. Extract & Install (2 minutes)

```bash
# Extract the ZIP
cd iqbase

# Install dependencies
npm install
```

## 2. Setup Database (1 minute)

**Option A: Local PostgreSQL**
```bash
# macOS with Homebrew
brew install postgresql@15
brew services start postgresql@15
createdb iqbase
```

**Option B: Cloud (Vercel Postgres)**
1. Go to [vercel.com](https://vercel.com) → Storage → Create Database
2. Copy the connection string

## 3. Configure Environment (1 minute)

```bash
# Copy template
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Your database connection
DATABASE_URL="postgresql://user:password@localhost:5432/iqbase"

# From https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Create products in Stripe, copy price IDs
STRIPE_PRICE_BASIC="price_..."
STRIPE_PRICE_PREMIUM="price_..."

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 4. Setup Database Schema (30 seconds)

```bash
npx prisma generate
npx prisma db push
```

## 5. Start Development Server (30 seconds)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Stripe Webhook (for payments to work)

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook secret (`whsec_...`) to your `.env.local` as `STRIPE_WEBHOOK_SECRET`.

---

## Test Card for Payments

Use this test card number:
- **Card:** `4242 4242 4242 4242`
- **Expiry:** Any future date (e.g., 12/25)
- **CVC:** Any 3 digits (e.g., 123)

---

## Deploy to Production

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Add environment variables in Vercel Dashboard → Settings → Environment Variables.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot find module" | `rm -rf node_modules && npm install` |
| "Prisma Client not found" | `npx prisma generate` |
| "Database connection failed" | Check `DATABASE_URL` in `.env.local` |
| "Stripe checkout fails" | Verify API keys and price IDs |

---

## Full Documentation

- **Detailed Setup:** [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md)
- **Deployment:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **Project Info:** [README.md](README.md)

---

**Need help?** Check the full guides above or search the [Next.js](https://nextjs.org/docs), [Prisma](https://prisma.io/docs), and [Stripe](https://stripe.com/docs) documentation.
