"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const sessionId = searchParams.get("session_id")

  useEffect(() => {
    if (status === "loading") return

    // Force refresh session after Stripe redirect
    if (sessionId && status === "authenticated") {
      update()
      // Give NextAuth a moment to set the cookie
      setTimeout(() => {
        router.push(`/results?session_id=${sessionId}`)
      }, 800)
      return
    }

    // If session not ready yet, wait and retry
    const timer = setTimeout(() => {
      router.push(`/results?session_id=${sessionId}`)
    }, 1200)

    return () => clearTimeout(timer)
  }, [sessionId, status, router, update])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-6 text-primary" />
        <h1 className="text-2xl font-semibold mb-2">Payment Successful</h1>
        <p className="text-muted-foreground">Redirecting to your results...</p>
      </div>
    </div>
  )
}
