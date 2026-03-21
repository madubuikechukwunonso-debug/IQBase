# IQBase - Cognitive Assessment Platform

A high-conversion, visually stunning cognitive assessment platform inspired by standard psychometric principles. Built with Next.js, TypeScript, Tailwind CSS, and Stripe.

![IQBase Screenshot](https://via.placeholder.com/800x400?text=IQBase+Screenshot)

## Features

### Core Functionality
- **25-Question Assessment** - Timed questions across logical reasoning, pattern recognition, and numerical ability
- **Weighted Scoring Algorithm** - Difficulty-based scoring with speed bonuses
- **Email Capture Flow** - Blurred results preview with email unlock
- **Stripe Payment Integration** - $1 basic access, $5 premium PDF report
- **PDF Report Generation** - Professional certificate-style reports
- **Dark/Light Mode** - Full theme support with next-themes

### UI/UX Features
- Animated gradients and smooth transitions (Framer Motion)
- Mobile-first responsive design
- Sample question preview on homepage
- Social proof with testimonials
- High-conversion CTA sections
- Glass morphism effects

### Legal & Ethical
- Clear disclaimer about non-clinical nature
- Privacy Policy and Terms of Service pages
- GDPR-compliant data handling

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom + Radix UI primitives
- **Animation**: Framer Motion
- **Payment**: Stripe
- **PDF**: pdf-lib
- **Database**: PostgreSQL (Prisma ORM)
- **Deployment**: Vercel

## Project Structure

```
iqbase/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   └── stripe/        # Stripe checkout & webhook
│   │   ├── test/              # Test page
│   │   ├── results/           # Results page with email capture
│   │   ├── pricing/           # Pricing page
│   │   ├── disclaimer/        # Disclaimer page
│   │   ├── privacy/           # Privacy policy
│   │   ├── terms/             # Terms of service
│   │   ├── page.tsx           # Homepage
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ui/                # UI components (Button, Card, etc.)
│   │   ├── navigation.tsx     # Site navigation
│   │   ├── footer.tsx         # Site footer
│   │   ├── theme-provider.tsx # Theme context
│   │   └── mode-toggle.tsx    # Dark/light toggle
│   ├── sections/              # Homepage sections
│   │   ├── hero.tsx
│   │   ├── features.tsx
│   │   ├── sample-question.tsx
│   │   ├── testimonials.tsx
│   │   └── cta.tsx
│   ├── lib/
│   │   ├── utils.ts           # Utility functions
│   │   ├── scoring.ts         # Scoring algorithm
│   │   ├── stripe.ts          # Stripe client
│   │   └── pdf-generator.ts   # PDF generation
│   ├── data/
│   │   └── questions.ts       # Question dataset (25 questions)
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   └── hooks/                 # Custom React hooks
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                    # Static assets
├── .env.example              # Environment variables template
├── next.config.js            # Next.js config
├── tailwind.config.js        # Tailwind config
├── tsconfig.json             # TypeScript config
└── package.json              # Dependencies
```

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd iqbase
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/iqbase"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio
npx prisma studio
```

### 4. Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Dashboard
3. Create two products in Stripe:
   - Basic Access ($1)
   - Premium Report ($5)
4. Copy the price IDs to your environment variables

#### Stripe Webhook Setup (Local Development)

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the webhook signing secret to your .env.local
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

```bash
# Using Vercel CLI
npm i -g vercel
vercel
```

### Environment Variables for Production

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_live_...) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (pk_live_...) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `NEXT_PUBLIC_APP_URL` | Your production URL |

### Stripe Webhook (Production)

1. In Stripe Dashboard, go to Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `payment_intent.payment_failed`
4. Copy the signing secret to your environment variables

## Scoring Algorithm

The scoring system uses a weighted approach:

1. **Base Points**: Each correct answer earns `difficulty × 8` points
2. **Speed Bonus**: Up to 30% bonus for quick answers
3. **Normalization**: Raw score converted to IQ-like scale (70-145)
4. **Percentile**: Calculated using standard normal distribution

```typescript
// Formula
finalScore = baseScore + (accuracy × (maxScore - baseScore)) ± variance
percentile = 50 × (1 + erf((score - 100) / (15 × √2)))
```

## Customization

### Adding Questions

Edit `src/data/questions.ts`:

```typescript
{
  id: 'unique-id',
  type: 'logical', // logical | pattern | numerical | verbal
  difficulty: 3,   // 1-5
  question: 'Your question?',
  options: ['A', 'B', 'C', 'D'],
  correctAnswer: 0, // Index of correct option
  explanation: 'Why this is correct',
  timeLimit: 45     // Seconds
}
```

### Modifying Pricing

Edit `src/app/pricing/page.tsx`:

```typescript
const pricingTiers = [
  {
    id: "basic",
    name: "Basic Access",
    price: 1,  // Change this
    // ...
  },
  // ...
]
```

Update Stripe price IDs in environment variables.

## UI Improvements for Higher Conversion

1. **Urgency Elements**
   - Add countdown timer for limited-time offers
   - Show "X people taking test now" counter
   - Progress indicator during test

2. **Social Proof**
   - Real-time notification popups
   - "Join 1M+ users" counter
   - Recent activity feed

3. **Gamification**
   - Achievement badges
   - Streak counter for returning users
   - Leaderboard (optional)

4. **Viral Features**
   - Share results on social media
   - Referral program
   - Challenge friends

## API Routes

### POST /api/stripe/checkout
Creates a Stripe checkout session.

**Body:**
```json
{
  "priceId": "price_...",
  "email": "user@example.com",
  "testId": "optional-test-id"
}
```

**Response:**
```json
{
  "sessionId": "cs_...",
  "url": "https://checkout.stripe.com/..."
}
```

### POST /api/stripe/webhook
Handles Stripe webhook events for payment confirmation.

## Database Schema

### User
- id, email, name, createdAt, updatedAt

### Test
- id, userId, score, percentile, category
- logicalScore, patternScore, numericalScore, speedScore
- status, startedAt, completedAt

### Answer
- id, testId, questionId, questionType, difficulty
- selectedAnswer, isCorrect, timeSpent

### Payment
- id, userId, testId, stripePaymentId
- amount, currency, tier, status

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - See LICENSE file for details

## Disclaimer

This is not a clinically validated IQ test. Results are for entertainment and self-reflection purposes only. For professional cognitive assessment, consult a licensed psychologist.

## Support

For questions or support:
- Email: support@iqbase.com
- GitHub Issues: [repository-url]/issues

---

Built with ❤️ by the IQBase Team
