"use client"

import { motion } from "framer-motion"
import { Brain, Shield, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PrivacyPage() {
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
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Home
            </Button>
          </Link>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 prose dark:prose-invert max-w-none">
              <p className="text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <section>
                <h3 className="text-xl font-semibold mb-3">1. Information We Collect</h3>
                <p className="text-muted-foreground">
                  We collect minimal information to provide our services:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>Email address (optional, for result delivery)</li>
                  <li>Test responses and scores</li>
                  <li>Anonymous usage analytics</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">2. How We Use Your Information</h3>
                <p className="text-muted-foreground">
                  Your information is used solely for:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>Delivering your test results</li>
                  <li>Generating personalized reports</li>
                  <li>Improving our assessment accuracy</li>
                  <li>Processing payments (if applicable)</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">3. Data Security</h3>
                <p className="text-muted-foreground">
                  We implement industry-standard security measures including:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>SSL/TLS encryption for all data transmission</li>
                  <li>Secure database storage with access controls</li>
                  <li>Regular security audits and updates</li>
                  <li>PCI-compliant payment processing via Stripe</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">4. Data Sharing</h3>
                <p className="text-muted-foreground">
                  We do not sell, trade, or rent your personal information to third parties. 
                  We only share data with:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>Payment processors (Stripe) for transaction processing</li>
                  <li>Analytics providers (anonymous data only)</li>
                  <li>Legal authorities when required by law</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">5. Your Rights</h3>
                <p className="text-muted-foreground">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>Access your personal data</li>
                  <li>Request data deletion</li>
                  <li>Opt-out of communications</li>
                  <li>Export your data</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">6. Cookies</h3>
                <p className="text-muted-foreground">
                  We use essential cookies to maintain your session and preferences. 
                  We do not use tracking cookies for advertising purposes.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">7. Contact Us</h3>
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy, please contact us at{" "}
                  <a href="mailto:privacy@iqbase.com" className="text-primary hover:underline">
                    privacy@iqbase.com
                  </a>
                </p>
              </section>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
