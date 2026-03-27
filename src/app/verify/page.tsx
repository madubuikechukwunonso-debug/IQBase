// src/app/verify/page.tsx
import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { Brain } from "lucide-react"

// Client component (contains the hooks)
function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const token = searchParams.get("token")
  const email = searchParams.get("email")

  useEffect(() => {
    if (!token || !email) {
      router.push("/login")
      return
    }

    const verifyAccount = async () => {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, email }),
        })

        if (res.ok) {
          router.push("/dashboard")
        } else {
          alert("Invalid or expired link")
          router.push("/login")
        }
      } catch (error) {
        console.error(error)
        alert("Verification failed")
        router.push("/login")
      }
    }

    verifyAccount()
  }, [token, email, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Brain className="w-16 h-16 text-violet-500 animate-pulse" />
      <h1 className="text-2xl font-bold mt-6 text-gray-900 dark:text-white">
        Verifying your account...
      </h1>
      <p className="text-gray-500 mt-2">Please wait a moment</p>
    </div>
  )
}

// Server component with Suspense boundary
export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Brain className="w-16 h-16 text-violet-500 animate-pulse" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}
