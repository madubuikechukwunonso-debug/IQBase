"use client"

import { Suspense, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  Trophy,
  Download,
  ArrowLeft,
  Brain,
  CheckCircle,
  Loader2,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

function ResultsContent() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "loading") return
    if (!session?.user?.id) {
      window.location.href = "/login"
      return
    }

    const verifyAndLoadResults = async () => {
      try {
        const res = await fetch(`/api/results/verify?session_id=${sessionId}`)
        const data = await res.json()

        if (!res.ok) throw new Error(data.error || "Failed to load results")

        setTestResult(data.test)
      } catch (err: any) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (sessionId) {
      verifyAndLoadResults()
    } else {
      setLoading(false)
    }
  }, [session, status, sessionId])

  const handleDownloadPDF = () => {
    if (!testResult?.pdfReport) return

    const blob = new Blob([testResult.pdfReport], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `IQBase-Premium-Report-${testResult.score || "Unknown"}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !testResult) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center bg-gradient-to-br from-background to-muted">
        <div>
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">{error || "No results found"}</p>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-6 py-3 rounded-full mb-6">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Payment Successful • Thank you!</span>
          </div>
          <Trophy className="w-20 h-20 mx-auto text-amber-500 mb-6" />
          <h1 className="text-5xl font-bold mb-2">Your Results Are Ready</h1>
          <p className="text-muted-foreground text-lg">You now have full access to your cognitive profile</p>
        </motion.div>

        {/* Score card */}
        <Card className="mb-8 border-0 shadow-2xl">
          <CardHeader className="text-center pt-8">
            <CardTitle className="text-8xl font-bold text-primary">
              {testResult.score}
            </CardTitle>
            <p className="text-sm uppercase tracking-widest text-muted-foreground">IQ Score</p>
            <Badge className="mt-4 text-lg px-6 py-2" variant="secondary">
              {testResult.category || "General"}
            </Badge>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Logical</p>
                <p className="text-3xl font-bold">{testResult.logicalScore ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pattern</p>
                <p className="text-3xl font-bold">{testResult.patternScore ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Numerical</p>
                <p className="text-3xl font-bold">{testResult.numericalScore ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Speed</p>
                <p className="text-3xl font-bold">{testResult.speedScore ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Premium actions */}
        {testResult.pdfReport && (
          <Button
            onClick={handleDownloadPDF}
            size="lg"
            className="w-full mb-6 text-lg py-7"
          >
            <FileText className="mr-3 w-6 h-6" />
            Download Full Premium PDF Report
          </Button>
        )}

        <div className="flex gap-4">
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full py-6">
              <ArrowLeft className="mr-2 w-5 h-5" />
              Back to Home
            </Button>
          </Link>
          <Link href="/dashboard" className="flex-1">
            <Button className="w-full py-6">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin" />
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  )
}

export const dynamic = "force-dynamic"
