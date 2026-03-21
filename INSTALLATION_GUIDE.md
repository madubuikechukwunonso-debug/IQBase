# IQBase Complete Installation Guide

This guide walks you through installing and setting up IQBase from scratch, including all dependencies, database, and third-party integrations.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step 1: Extract and Setup](#step-1-extract-and-setup)
3. [Step 2: Install Dependencies](#step-2-install-dependencies)
4. [Step 3: Database Setup](#step-3-database-setup)
5. [Step 4: Environment Variables](#step-4-environment-variables)
6. [Step 5: Stripe Configuration](#step-5-stripe-configuration)
7. [Step 6: Database Migration](#step-6-database-migration)
8. [Step 7: Run Development Server](#step-7-run-development-server)
9. [Step 8: Production Deployment](#step-8-production-deployment)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- A **PostgreSQL database** (local or cloud)
- A **Stripe account** (free to create)

Verify installations:
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
git --version     # Should show 2.x.x or higher
```

---

## Step 1: Extract and Setup

### 1.1 Extract the ZIP file

```bash
# On macOS/Linux
unzip iqbase.zip -d iqbase

# On Windows (PowerShell)
Expand-Archive -Path iqbase.zip -DestinationPath iqbase

# Or use your system's file explorer
```

### 1.2 Navigate to the project folder

```bash
cd iqbase
```

### 1.3 Verify project structure

Your folder should look like this:
```
iqbase/
├── src/
│   ├── app/                 # Next.js pages
│   ├── components/          # UI components
│   ├── sections/            # Homepage sections
│   ├── lib/                 # Utility functions
│   ├── data/                # Questions dataset
│   └── types/               # TypeScript types
├── prisma/
│   └── schema.prisma        # Database schema
├── public/                  # Static assets
├── .env.example            # Environment template
├── package.json            # Dependencies
├── next.config.js          # Next.js config
├── tailwind.config.js      # Tailwind config
├── tsconfig.json           # TypeScript config
└── README.md               # Project documentation
```

---

## Step 2: Install Dependencies

### 2.1 Install Node.js packages

```bash
npm install
```

This will install all required packages including:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Stripe SDK
- Prisma ORM
- PDF generation libraries
- UI components (Radix UI)

### 2.2 Verify installation

```bash
npm list next react react-dom
```

You should see the packages listed without errors.

---

## Step 3: Database Setup

You need a PostgreSQL database. Choose one option:

### Option A: Local PostgreSQL (Development)

#### macOS (using Homebrew)
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database
createdb iqbase

# Create user (optional)
createuser -P iqbase_user
```

#### Windows
1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run installer with default settings
3. Remember the password you set for postgres user
4. Open pgAdmin or psql
5. Create database: `CREATE DATABASE iqbase;`

#### Linux (Ubuntu/Debian)
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql

# Create database
sudo -u postgres createdb iqbase

# Create user (optional)
sudo -u postgres createuser -P iqbase_user
```

### Option B: Cloud PostgreSQL (Recommended for Production)

#### Vercel Postgres (Easiest)
1. Go to [vercel.com](https://vercel.com)
2. Create an account
3. Go to "Storage" tab
4. Click "Create Database" → "Postgres"
5. Choose region closest to you
6. Copy the connection string

#### Supabase (Free Tier Available)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy connection string under "Connection String" → "URI"

#### Railway (Free Tier Available)
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL plugin
4. Copy connection string from Variables tab

---

## Step 4: Environment Variables

### 4.1 Create environment file

```bash
# Copy the example file
cp .env.example .env.local
```

### 4.2 Edit .env.local

Open `.env.local` in your text editor and fill in the values:

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
# 
# Examples:
# Local: postgresql://postgres:password@localhost:5432/iqbase
# Vercel: postgresql://user:pass@host.vercel-storage.com:5432/iqbase
# Supabase: postgresql://postgres:pass@db.project.supabase.co:5432/postgres

DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@YOUR_HOST:5432/iqbase"

# ============================================
# STRIPE CONFIGURATION
# ============================================
# Get these from https://dashboard.stripe.com/apikeys
# Use test keys for development, live keys for production

STRIPE_SECRET_KEY="sk_test_..."           # Secret key (starts with sk_test_ or sk_live_)
STRIPE_PUBLISHABLE_KEY="pk_test_..."      # Publishable key (starts with pk_test_ or pk_live_)
STRIPE_WEBHOOK_SECRET="whsec_..."         # Webhook secret (we'll get this in Step 5)

# ============================================
# STRIPE PRICE IDs
# ============================================
# Create products in Stripe Dashboard, then copy price IDs
# These look like: price_1ABC123...

STRIPE_PRICE_BASIC="price_..."            # $1 basic access price ID
STRIPE_PRICE_PREMIUM="price_..."          # $5 premium report price ID

# ============================================
# APPLICATION CONFIGURATION
# ============================================
# Your app's URL - change for production

NEXT_PUBLIC_APP_URL="http://localhost:3000"   # Development
# NEXT_PUBLIC_APP_URL="https://yourdomain.com"  # Production

# ============================================
# OPTIONAL: ANALYTICS
# ============================================
# NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"          # Google Analytics (optional)
```

### 4.3 Save the file

Make sure to save `.env.local` before proceeding.

---

## Step 5: Stripe Configuration

### 5.1 Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Sign up for free account
3. Complete email verification

### 5.2 Get API Keys

1. In Stripe Dashboard, go to "Developers" → "API keys"
2. Copy "Publishable key" (starts with `pk_test_`)
3. Click "Reveal test key" and copy "Secret key" (starts with `sk_test_`)
4. Paste these into your `.env.local` file

### 5.3 Create Products

#### Create Basic Access Product ($1)
1. Go to "Products" in Stripe Dashboard
2. Click "Add product"
3. Name: "Basic Access"
4. Description: "Unlock full results on the web"
5. Price: $1.00
6. Pricing model: "Standard pricing"
7. Click "Save product"
8. Copy the Price ID (starts with `price_`)
9. Paste into `.env.local` as `STRIPE_PRICE_BASIC`

#### Create Premium Report Product ($5)
1. Click "Add product"
2. Name: "Premium Report"
3. Description: "Downloadable PDF cognitive assessment report"
4. Price: $5.00
5. Pricing model: "Standard pricing"
6. Click "Save product"
7. Copy the Price ID (starts with `price_`)
8. Paste into `.env.local` as `STRIPE_PRICE_PREMIUM`

### 5.4 Set Up Webhook (for local development)

#### Install Stripe CLI

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows:**
Download from [Stripe CLI releases](https://github.com/stripe/stripe-cli/releases)

**Linux:**
```bash
# Download latest release
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.2/stripe_1.19.2_linux_amd64.tar.gz

# Extract
tar -xvf stripe_1.19.2_linux_amd64.tar.gz

# Move to PATH
sudo mv stripe /usr/local/bin/
```

#### Login to Stripe CLI
```bash
stripe login
```
This will open a browser to authorize the CLI.

#### Start Webhook Forwarding
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

You'll see output like:
```
> Ready! You are using Stripe API version [2024-06-20].
> Your webhook signing secret is whsec_xxxxxxxxxxxxxxxx (^C to quit)
```

Copy the webhook signing secret (`whsec_...`) and paste it into `.env.local` as `STRIPE_WEBHOOK_SECRET`.

**Keep this terminal window open** while developing - it forwards Stripe webhooks to your local server.

---

## Step 6: Database Migration

### 6.1 Generate Prisma Client

```bash
npx prisma generate
```

This generates the TypeScript types based on your schema.

### 6.2 Push Schema to Database

```bash
npx prisma db push
```

This creates all tables in your database according to the schema.

### 6.3 Verify Database Setup (Optional)

```bash
npx prisma studio
```

This opens Prisma Studio in your browser where you can view and edit database records.

---

## Step 7: Run Development Server

### 7.1 Start the Next.js development server

```bash
npm run dev
```

### 7.2 Open in browser

Navigate to: [http://localhost:3000](http://localhost:3000)

You should see the IQBase homepage!

### 7.3 Test the application

1. Click "Test Your Intelligence Now"
2. Complete the sample test
3. Enter email on results page
4. Try the Stripe checkout (use test card below)

### Test Card Numbers

Use these for testing payments:

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 9995` | Insufficient funds |

Use any future date for expiry and any 3 digits for CVC.

---

## Step 8: Production Deployment

### 8.1 Prepare for Production

#### Update environment variables for production:

```env
# Change to production URL
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Use live Stripe keys (when ready)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
```

#### Build the application locally to test:

```bash
npm run build
```

If there are no errors, you're ready to deploy!

### 8.2 Deploy to Vercel (Recommended)

#### Option A: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

#### Option B: GitHub + Vercel Dashboard

1. Create a GitHub repository
2. Push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/iqbase.git
git push -u origin main
```

3. Go to [vercel.com](https://vercel.com)
4. Click "Add New Project"
5. Import your GitHub repository
6. Configure:
   - Framework Preset: Next.js
   - Build Command: `next build`
   - Output Directory: `.next`

7. Add Environment Variables in Vercel Dashboard:
   - Copy all variables from `.env.local`
   - Paste into Vercel's Environment Variables section

8. Click "Deploy"

### 8.3 Configure Production Webhook

After deployment:

1. Get your production URL (e.g., `https://iqbase.vercel.app`)
2. Go to Stripe Dashboard → Developers → Webhooks
3. Click "Add endpoint"
4. Endpoint URL: `https://yourdomain.com/api/stripe/webhook`
5. Select events:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
6. Click "Add endpoint"
7. Copy the "Signing secret"
8. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`
9. Redeploy: `vercel --prod`

### 8.4 Verify Production Deployment

1. Visit your production URL
2. Test the complete flow:
   - Take test
   - Enter email
   - Make payment (use real card for live mode)
   - Download PDF report

---

## Troubleshooting

### Issue: "Cannot find module"

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Prisma Client not found"

**Solution:**
```bash
npx prisma generate
```

### Issue: "Database connection failed"

**Solutions:**
1. Check `DATABASE_URL` in `.env.local`
2. Verify database is running
3. Check firewall settings
4. For cloud databases, ensure IP whitelist includes your server

### Issue: "Stripe checkout not working"

**Solutions:**
1. Verify `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY`
2. Check that price IDs are correct
3. Ensure webhook is configured (for local dev, stripe CLI must be running)
4. Check browser console for errors

### Issue: "Build fails on Vercel"

**Solutions:**
1. Check build logs in Vercel Dashboard
2. Ensure all environment variables are set
3. Verify `next.config.js` is correct
4. Try building locally first: `npm run build`

### Issue: "PDF generation fails"

**Solution:**
```bash
# Ensure pdf-lib is installed
npm list pdf-lib

# If not installed:
npm install pdf-lib
```

### Issue: "Dark mode not working"

**Solution:**
1. Check that `next-themes` is installed
2. Verify `ThemeProvider` is in `layout.tsx`
3. Clear browser cache and cookies

---

## Next Steps

After successful installation:

1. **Customize the questions** in `src/data/questions.ts`
2. **Update branding** - change colors in `tailwind.config.js`
3. **Add analytics** - Google Analytics, Mixpanel, etc.
4. **Set up email** - SendGrid, Resend for transactional emails
5. **Configure monitoring** - Sentry for error tracking
6. **Add more features** - badges, leaderboards, etc.

---

## Directory Reference

| Path | Description |
|------|-------------|
| `src/app/` | Next.js pages and API routes |
| `src/components/ui/` | Reusable UI components |
| `src/sections/` | Homepage section components |
| `src/lib/` | Utility functions and helpers |
| `src/data/questions.ts` | Question dataset |
| `prisma/schema.prisma` | Database schema definition |
| `.env.local` | Environment variables (not in git) |
| `public/` | Static assets (images, fonts) |

---

## Support

If you encounter issues:

1. Check the [README.md](README.md)
2. Review [DEPLOYMENT.md](DEPLOYMENT.md)
3. Search [Next.js docs](https://nextjs.org/docs)
4. Search [Prisma docs](https://prisma.io/docs)
5. Search [Stripe docs](https://stripe.com/docs)

---

**Congratulations!** You now have IQBase running locally and ready for production! 🎉
