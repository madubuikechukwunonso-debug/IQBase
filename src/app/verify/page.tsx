"use client"
// src/app/verify/page.tsx
import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Brain, CheckCircle, Loader2 } from "lucide-react"

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const email = searchParams.get("email")

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying")
  const [message, setMessage] = useState("Verifying your account...")

  useEffect(() => {
    if (!token || !email) {
      setStatus("error")
      setMessage("Invalid or missing verification link")
      setTimeout(() => router.push("/login"), 2000)
      return
    }

    const verifyAccount = async () => {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "GET", // ← Changed to GET to match your verify/route.ts
        })

        if (res.ok) {
          setStatus("success")
          setMessage("Account created successfully! Redirecting...")
          setTimeout(() => router.push("/dashboard"), 1500)
        } else {
          setStatus("error")
          setMessage("Invalid or expired link")
          setTimeout(() => router.push("/login"), 2000)
        }
      } catch (error) {
        console.error(error)
        setStatus("error")
        setMessage("Verification failed. Please try again.")
        setTimeout(() => router.push("/login"), 2000)
      }
    }

    verifyAccount()
  }, [token, email, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl">
            <Brain className="w-9 h-9 text-white" />
          </div>
        </div>

        {status === "verifying" && (
          <>
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-violet-500" />
            <h1 className="text-2xl font-bold mt-8 text-gray-900 dark:text-white">
              Verifying your account...
            </h1>
            <p className="text-gray-500 mt-3">Please wait a moment</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
            <h1 className="text-2xl font-bold mt-8 text-gray-900 dark:text-white">
              Account Created!
            </h1>
            <p className="text-green-600 dark:text-green-400 mt-3 font-medium">{message}</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <span className="text-4xl">✕</span>
            </div>
            <h1 className="text-2xl font-bold mt-8 text-gray-900 dark:text-white">
              Verification Failed
            </h1>
            <p className="text-red-600 dark:text-red-400 mt-3">{message}</p>
          </>
        )}
      </div>
    </div>
  )
}

// Server wrapper with Suspense boundary
export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted">
          <div className="text-center">
            <Brain className="w-12 h-12 mx-auto animate-pulse text-violet-500" />
          </div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  )
}
