"use client"
export const dynamic = 'force-dynamic'

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Hero } from "@/sections/hero"
import { Features } from "@/sections/features"
import { SampleQuestion } from "@/sections/sample-question"
import { Testimonials } from "@/sections/testimonials"
import { CTA } from "@/sections/cta"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <section id="features">
        <Features />
      </section>
      <SampleQuestion />
      <section id="testimonials">
        <Testimonials />
      </section>
      <CTA />
      <Footer />
    </main>
  )
}
