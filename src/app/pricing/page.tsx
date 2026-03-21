"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Check, 
  X, 
  Sparkles, 
  Download, 
  FileText, 
  Mail,
  Brain,
  ArrowRight,
  Lock,
  Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"

const pricingTiers = [
  {
    id: "basic",
    name: "Basic Access",
    price: 1,
    description: "Unlock your results on the web",
    features: [
      { text: "View full results online", included: true },
      { text: "Detailed category breakdown", included: true },
      { text: "Personalized recommendations", included: true },
      { text: "Shareable result card", included: true },
      { text: "PDF report", included: false },
      { text: "Email delivery", included: false },
      { text: "Lifetime access", included: false },
    ],
    cta: "Unlock for $1",
    icon: Lock,
    popular: false,
  },
  {
    id: "premium",
    name: "Premium Report",
    price: 5,
    description: "Complete cognitive profile package",
    features: [
      { text: "Everything in Basic", included: true },
      { text: "Beautiful PDF report", included: true },
      { text: "Delivered to your email", included: true },
      { text: "Lifetime access", included: true },
      { text: "Detailed analysis", included: true },
      { text: "Progress tracking", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Get Premium for $5",
    icon: Star,
    popular: true,
  },
]

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [hoveredTier, setHoveredTier] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">IQBase</span>
          </Link>
          <Badge variant="outline">Pricing</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-4 h-4 mr-1" />
            Simple Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Unlock Your <span className="gradient-text">Full Potential</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that works best for you. Both options give you instant access to your results.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
        >
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              onMouseEnter={() => setHoveredTier(tier.id)}
              onMouseLeave={() => setHoveredTier(null)}
            >
              <Card 
                className={`h-full relative overflow-hidden transition-all duration-300 ${
                  tier.popular 
                    ? 'border-2 border-primary shadow-xl scale-105' 
                    : 'border shadow-lg'
                } ${hoveredTier === tier.id ? 'shadow-2xl' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
                    MOST POPULAR
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-xl ${
                    tier.popular 
                      ? 'bg-gradient-to-br from-primary to-purple-600' 
                      : 'bg-muted'
                  } flex items-center justify-center mb-4`}>
                    <tier.icon className={`w-6 h-6 ${tier.popular ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <p className="text-muted-foreground">{tier.description}</p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold">${tier.price}</span>
                    <span className="text-muted-foreground">one-time</span>
                  </div>

                  <ul className="space-y-3">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        {feature.included ? (
                          <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                            <X className="w-3 h-3 text-muted-foreground" />
                          </div>
                        )}
                        <span className={feature.included ? '' : 'text-muted-foreground'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    size="lg" 
                    variant={tier.popular ? 'gradient' : 'outline'}
                    className={`w-full ${tier.popular ? 'btn-shine' : ''}`}
                  >
                    {tier.cta}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Features Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-center mb-8">What&apos;s Included</h2>
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-semibold">Feature</th>
                    <th className="text-center p-4 font-semibold">Basic ($1)</th>
                    <th className="text-center p-4 font-semibold text-primary">Premium ($5)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Full online results", basic: true, premium: true },
                    { feature: "Category breakdown", basic: true, premium: true },
                    { feature: "Personalized recommendations", basic: true, premium: true },
                    { feature: "Shareable result card", basic: true, premium: true },
                    { feature: "Beautiful PDF report", basic: false, premium: true },
                    { feature: "Email delivery", basic: false, premium: true },
                    { feature: "Lifetime access", basic: false, premium: true },
                    { feature: "Detailed analysis", basic: false, premium: true },
                    { feature: "Progress tracking", basic: false, premium: true },
                    { feature: "Priority support", basic: false, premium: true },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="p-4">{row.feature}</td>
                      <td className="text-center p-4">
                        {row.basic ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground mx-auto" />
                        )}
                      </td>
                      <td className="text-center p-4">
                        {row.premium ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards (Visa, Mastercard, American Express) and PayPal. All payments are processed securely through Stripe.",
              },
              {
                q: "How soon will I receive my premium report?",
                a: "Your premium PDF report will be delivered to your email within minutes of payment confirmation.",
              },
              {
                q: "Can I retake the test?",
                a: "Yes! With the Premium plan, you get lifetime access including the ability to retake the test and track your progress over time.",
              },
              {
                q: "Is my payment information secure?",
                a: "Absolutely. We use Stripe, a PCI-compliant payment processor. Your card details never touch our servers.",
              },
            ].map((faq, i) => (
              <Card key={i} className="border-0 shadow">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-muted-foreground mb-4">Trusted by over 1 million users worldwide</p>
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-50">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              <span className="text-sm">SSL Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span className="text-sm">PCI Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm">Stripe Verified</span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
