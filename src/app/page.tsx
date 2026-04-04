"use client"
export const dynamic = 'force-dynamic'

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Hero } from "@/sections/hero"
import { Features } from "@/sections/features"
import { SampleQuestion } from "@/sections/sample-question"
import { Testimonials } from "@/sections/testimonials"
import { CTA } from "@/sections/cta"
import { useState, useEffect, Suspense } from "react"
import { Brain, Loader2 } from "lucide-react"

// Simple Error Boundary Component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center text-center px-6">
      <div className="text-red-500 mb-4">
        <Brain className="w-12 h-12 mx-auto" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-6 max-w-md">{error.message || "Failed to load this section"}</p>
      <button
        onClick={resetErrorBoundary}
        className="px-6 py-3 bg-primary text-white rounded-2xl hover:bg-primary/90 transition"
      >
        Try Again
      </button>
    </div>
  )
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate a small initial load (you can remove this if you want instant render)
    const timer = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading IQBase...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero - no boundary needed as it's usually light */}
      <Hero />

      {/* Features with error boundary */}
      <section id="features">
        <Suspense fallback={<div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
          <Features />
        </Suspense>
      </section>

      {/* Sample Question */}
      <SampleQuestion />

      {/* Testimonials with error boundary */}
      <section id="testimonials">
        <Suspense fallback={<div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
          <Testimonials />
        </Suspense>
      </section>

      {/* CTA */}
      <CTA />

      <Footer />
    </main>
  )
}
