"use client"
export const dynamic = 'force-dynamic'

import { useSession, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { PrismaClient } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Trophy, TrendingUp, Target, Play, LogOut } from "lucide-react"
import ScoreTrendChart from "./ScoreTrendChart"

const prisma = new PrismaClient()

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [tests, setTests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Redirect if not logged in
  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>
  }
  if (!session?.user) {
    window.location.href = "/login"
    return null
  }

  // Fetch tests client-side (this avoids the prerender error)
  useEffect(() => {
    const fetchTests = async () => {
      const data = await prisma.test.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      })
      setTests(data)
      setLoading(false)
    }
    fetchTests()
  }, [session.user.id])

  const totalTests = tests.length
  const avgScore = totalTests > 0
    ? Math.round(tests.reduce((sum, t) => sum + (t.score || 0), 0) / totalTests)
    : 0
  const highestPercentile = totalTests > 0
    ? Math.max(...tests.map((t) => t.percentile || 0))
    : 0

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Hero */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome back, {session.user.name || session.user.email?.split("@")[0]}
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Track your IQ progress • Improve every test
          </p>
        </div>

        {/* Logout Button */}
        <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>

        <Button asChild size="lg" className="gap-2 text-base font-semibold">
          <Link href="/test">
            <Play className="w-5 h-5" />
            Start New Test
          </Link>
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <Trophy className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalTests}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{avgScore}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Best Percentile</CardTitle>
            <Target className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{highestPercentile}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Score Trend Chart */}
      {totalTests > 1 && (
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Your Score Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreTrendChart tests={tests} />
          </CardContent>
        </Card>
      )}

      {/* Recent Tests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Tests</CardTitle>
          {totalTests > 0 && (
            <Button variant="outline" asChild>
              <Link href="/results">View All Results</Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {tests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">You haven&apos;t taken any tests yet.</p>
              <Button asChild size="lg">
                <Link href="/test">Take Your First Test</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className="flex items-center justify-between p-6 border rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{test.score} points</p>
                      <p className="text-sm text-muted-foreground">
                        {test.category} • {new Date(test.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={`/results?score=${test.score}&percentile=${test.percentile}&category=${test.category}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
