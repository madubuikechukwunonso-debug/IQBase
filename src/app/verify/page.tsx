"use client"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Brain } from "lucide-react"

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const email = searchParams.get("email")

  useEffect(() => {
    if (!token || !email) return

    fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email }),
    }).then(async (res) => {
      if (res.ok) {
        router.push("/dashboard")
      } else {
        alert("Invalid or expired link")
      }
    })
  }, [token, email, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Brain className="w-16 h-16 text-violet-500 animate-pulse" />
      <h1 className="text-2xl font-bold mt-6">Creating your account...</h1>
    </div>
  )
}
