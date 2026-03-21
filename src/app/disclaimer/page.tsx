"use client"

import { motion } from "framer-motion"
import { AlertTriangle, Brain, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DisclaimerPage() {
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
              <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <CardTitle className="text-3xl font-bold">Important Disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  Not Clinically Validated
                </p>
                <p className="text-yellow-700 dark:text-yellow-300">
                  This is <strong>not a clinically validated IQ test</strong> but inspired by standard 
                  psychometric principles found in the public domain. Results are for entertainment 
                  and self-reflection purposes only.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">What This Means</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold">&times;</span>
                    <span>Results <strong>cannot</strong> be used in any court or for legal purposes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold">&times;</span>
                    <span>Not suitable for educational placement or job screening</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold">&times;</span>
                    <span>Does not diagnose any cognitive conditions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-500 font-bold">&times;</span>
                    <span>Not a substitute for professional psychological assessment</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">For Professional Assessment</h3>
                <p className="text-muted-foreground">
                  If you require a clinically validated cognitive assessment for educational, 
                  occupational, or legal purposes, please consult:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 font-bold">&check;</span>
                    <span>A licensed psychologist or neuropsychologist</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 font-bold">&check;</span>
                    <span>An accredited psychological testing center</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 font-bold">&check;</span>
                    <span>Your healthcare provider for referrals</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">About Our Test</h3>
                <p className="text-muted-foreground">
                  IQBase is designed as an engaging, educational tool to help you explore different 
                  aspects of cognitive ability including:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>&bull; Logical reasoning and problem-solving</li>
                  <li>&bull; Pattern recognition abilities</li>
                  <li>&bull; Numerical reasoning skills</li>
                  <li>&bull; Processing speed under time pressure</li>
                </ul>
                <p className="text-muted-foreground">
                  While inspired by established psychometric principles, this assessment has not 
                  undergone the rigorous standardization and validation processes required for 
                  clinical use.
                </p>
              </div>

              <div className="pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground text-center">
                  By using IQBase, you acknowledge that you understand and accept these limitations. 
                  If you have any concerns about your cognitive health, please consult a qualified 
                  healthcare professional.
                </p>
              </div>

              <div className="flex justify-center">
                <Link href="/test">
                  <Button size="lg" variant="gradient">
                    I Understand - Start Test
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
