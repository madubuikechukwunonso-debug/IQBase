// src/app/payment-success/page.tsx
import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

// Inner client component (contains the hooks)
function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const sessionId = searchParams.get("session_id")

  useEffect(() => {
    if (status === "loading") return

    if (sessionId && status === "authenticated") {
      // Refresh session to ensure it's loaded after Stripe redirect
      update().then(() => {
        router.push(`/results?session_id=${sessionId}`)
      })
      return
    }

    // Fallback redirect if session is still not ready
    const timer = setTimeout(() => {
      router.push(`/results?session_id=${sessionId}`)
    }, 1500)

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

// Server wrapper with Suspense boundary (required by Next.js)
export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-6 text-primary" />
            <p className="text-muted-foreground">Processing payment...</p>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  )
}

// Force dynamic rendering (important for search params)
export const dynamic = "force-dynamic"
