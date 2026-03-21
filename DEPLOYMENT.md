# IQBase Deployment Guide

This guide covers deploying IQBase to Vercel with PostgreSQL database and Stripe payments.

## Prerequisites

- Node.js 18+ installed locally
- GitHub account
- Vercel account
- Stripe account
- PostgreSQL database (Vercel Postgres, Supabase, or Railway)

## Step 1: Database Setup

### Option A: Vercel Postgres (Recommended)

1. In Vercel Dashboard, go to your project
2. Click "Storage" tab
3. Click "Create Database" → "Postgres"
4. Choose region closest to your users
5. Copy the connection string

### Option B: Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy connection string under "URI"

### Option C: Railway

1. Create account at [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL plugin
4. Copy connection string from Variables

## Step 2: Stripe Setup

### Create Products

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to Products → Add Product
3. Create two products:

**Basic Access ($1)**
- Name: "Basic Access"
- Price: $1.00 (One-time)
- Copy the Price ID (starts with `price_`)

**Premium Report ($5)**
- Name: "Premium Report"
- Price: $5.00 (One-time)
- Copy the Price ID (starts with `price_`)

### Get API Keys

1. Go to Developers → API Keys
2. Copy Publishable key (starts with `pk_`)
3. Reveal and copy Secret key (starts with `sk_`)

### Webhook Setup (After Deployment)

1. Deploy your app first (Step 4)
2. Go to Developers → Webhooks
3. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
5. Copy the Signing secret (starts with `whsec_`)
6. Add to Vercel environment variables

## Step 3: Project Setup

### Initialize Git Repository

```bash
cd iqbase
git init
git add .
git commit -m "Initial commit"
```

### Push to GitHub

```bash
# Create new repository on GitHub first
git remote add origin https://github.com/yourusername/iqbase.git
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Vercel

### Option A: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `next build`
   - Output Directory: `.next`

5. Add Environment Variables:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `STRIPE_SECRET_KEY` | `sk_live_...` (or `sk_test_...` for testing) |
| `STRIPE_PUBLISHABLE_KEY` | `pk_live_...` (or `pk_test_...` for testing) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (add after deployment) |
| `NEXT_PUBLIC_APP_URL` | `https://yourdomain.com` |

6. Click "Deploy"

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Link to existing project? No
# - Project name: iqbase
# - Directory: ./
```

## Step 5: Database Migration

After deployment, run migrations:

```bash
# Using Vercel CLI
vercel --version  # Ensure you're logged in

# Run Prisma commands
npx prisma generate
npx prisma db push
```

Or locally with production database:

```bash
# Add production DATABASE_URL to .env.local temporarily
npx prisma db push
```

## Step 6: Post-Deployment Configuration

### Update Stripe Webhook

1. Get your production URL from Vercel
2. Go to Stripe Dashboard → Developers → Webhooks
3. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
4. Copy the signing secret
5. Add to Vercel environment variables
6. Redeploy: `vercel --prod`

### Verify Deployment

1. Visit your deployed URL
2. Test the homepage
3. Take a test assessment
4. Verify email capture works
5. Test Stripe checkout (use test card: `4242 4242 4242 4242`)

## Environment Variables Reference

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@host:5432/db` |
| `STRIPE_SECRET_KEY` | Stripe secret | `sk_live_...` or `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe public key | `pk_live_...` or `pk_test_...` |
| `NEXT_PUBLIC_APP_URL` | Your app URL | `https://iqbase.vercel.app` |

### Optional

| Variable | Description |
|----------|-------------|
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID |

## Testing Payments

Use these test card numbers in development:

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 9995` | Insufficient funds |

Use any future expiry date and any 3-digit CVC.

## Troubleshooting

### Build Failures

```bash
# Check for TypeScript errors
npm run build

# Check for linting errors
npm run lint
```

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check if database allows connections from Vercel IPs
3. Try connecting locally: `psql $DATABASE_URL`

### Stripe Issues

1. Verify API keys are correct (test vs live)
2. Check webhook is configured correctly
3. Review Stripe Dashboard logs

### Common Errors

**"Cannot find module"**
- Run `npm install`
- Check if package is in dependencies (not devDependencies)

**"Prisma Client not found"**
- Run `npx prisma generate`
- Ensure `@prisma/client` is in dependencies

**"Stripe webhook verification failed"**
- Check `STRIPE_WEBHOOK_SECRET` is correct
- Ensure webhook URL matches exactly

## Production Checklist

- [ ] Database connected and migrated
- [ ] Stripe live mode enabled
- [ ] Webhook configured for production URL
- [ ] Environment variables set in Vercel
- [ ] Domain configured (optional)
- [ ] Analytics added (optional)
- [ ] Error monitoring (Sentry, etc.)
- [ ] Privacy policy and terms updated
- [ ] Support email configured

## Custom Domain (Optional)

1. In Vercel Dashboard, go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` environment variable
5. Update Stripe webhook URL
6. Redeploy

## Monitoring

### Vercel Analytics

1. In Vercel Dashboard, go to Analytics tab
2. Enable Web Analytics
3. View performance metrics

### Stripe Dashboard

Monitor:
- Successful payments
- Failed payments
- Refund requests
- Disputes

## Updates and Maintenance

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Deploy updates
vercel --prod
```

### Database Backups

Set up automated backups with your database provider:
- Vercel Postgres: Automatic daily backups
- Supabase: Configure in Dashboard
- Railway: Manual backups or use plugin

## Support

For deployment issues:
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Next.js Docs: [nextjs.org/docs](https://nextjs.org/docs)
- Stripe Docs: [stripe.com/docs](https://stripe.com/docs)
- Prisma Docs: [prisma.io/docs](https://prisma.io/docs)

---

Happy deploying! 🚀
