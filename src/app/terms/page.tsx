"use client"

import { motion } from "framer-motion"
import { Brain, FileText, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function TermsPage() {
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
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 prose dark:prose-invert max-w-none">
              <p className="text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <section>
                <h3 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h3>
                <p className="text-muted-foreground">
                  By accessing or using IQBase, you agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">2. Description of Service</h3>
                <p className="text-muted-foreground">
                  IQBase provides online cognitive assessment tools inspired by psychometric principles. 
                  Our services include:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>Online cognitive ability tests</li>
                  <li>Personalized result reports</li>
                  <li>Premium PDF report generation</li>
                  <li>Progress tracking features</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">3. Not a Clinical Tool</h3>
                <p className="text-muted-foreground">
                  <strong>Important:</strong> IQBase is not a clinically validated assessment tool. 
                  Results are for entertainment and self-reflection purposes only. They cannot be used:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>For legal or court proceedings</li>
                  <li>For educational placement decisions</li>
                  <li>For employment screening</li>
                  <li>As a substitute for professional psychological evaluation</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">4. User Accounts</h3>
                <p className="text-muted-foreground">
                  You may use our services without creating an account. If you provide an email address:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>You must provide a valid email address</li>
                  <li>You are responsible for maintaining confidentiality</li>
                  <li>You agree to receive service-related communications</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">5. Payments and Refunds</h3>
                <p className="text-muted-foreground">
                  For premium services:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>All payments are processed securely through Stripe</li>
                  <li>Prices are in USD unless otherwise stated</li>
                  <li>Digital products are generally non-refundable once delivered</li>
                  <li>Contact us for refund requests within 7 days</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">6. Intellectual Property</h3>
                <p className="text-muted-foreground">
                  All content, including questions, reports, and designs, is the property of IQBase 
                  and protected by copyright laws. You may not reproduce, distribute, or create 
                  derivative works without our permission.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">7. Limitation of Liability</h3>
                <p className="text-muted-foreground">
                  IQBase and its affiliates shall not be liable for any indirect, incidental, 
                  special, consequential, or punitive damages arising from your use of our services.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">8. Changes to Terms</h3>
                <p className="text-muted-foreground">
                  We reserve the right to modify these terms at any time. Continued use of our 
                  services after changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">9. Contact Information</h3>
                <p className="text-muted-foreground">
                  For questions about these Terms, please contact us at{" "}
                  <a href="mailto:legal@iqbase.com" className="text-primary hover:underline">
                    legal@iqbase.com
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
