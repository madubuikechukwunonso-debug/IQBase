import { getUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Trophy, TrendingUp, Brain, Target, Play, Settings, LogOut } from "lucide-react";
import ScoreTrendChart from "./ScoreTrendChart";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const tests = await prisma.test.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const totalTests = tests.length;
  const avgScore = totalTests > 0
    ? Math.round(tests.reduce((sum, t) => sum + (t.score || 0), 0) / totalTests)
    : 0;
  const highestPercentile = totalTests > 0
    ? Math.max(...tests.map(t => t.percentile || 0))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Modern Header */}
      <header className="border-b bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">IQBase</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Welcome Back (mobile-friendly truncation) */}
            <div className="hidden sm:flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-2 shadow-sm max-w-[240px]">
              <span className="text-muted-foreground text-sm whitespace-nowrap">Welcome back,</span>
              <span className="font-semibold text-base truncate">
                {user.name || user.email?.split("@")[0]}
              </span>
            </div>

            {/* Start New Test */}
            <Button asChild size="lg" className="gap-2 text-base font-semibold">
              <Link href="/test">
                <Play className="w-5 h-5" />
                Start New Test
              </Link>
            </Button>

            {/* Admin Dashboard Button – only for admins */}
            {user.role === "ADMIN" && (
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link href="/admin">
                  <Settings className="w-5 h-5" />
                  Admin Dashboard
                </Link>
              </Button>
            )}

            {/* Logout Button */}
            <Button asChild variant="ghost" size="lg" className="gap-2">
              <Link href="/api/auth/signout">
                <LogOut className="w-5 h-5" />
                Logout
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Mobile Welcome Back */}
        <div className="sm:hidden mb-8">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl px-6 py-5 shadow-sm">
            <span className="text-muted-foreground text-sm">Welcome back,</span>
            <h1 className="text-3xl font-bold tracking-tight truncate mt-1">
              {user.name || user.email?.split("@")[0]}
            </h1>
          </div>
        </div>

        {/* Desktop Welcome */}
        <div className="hidden sm:flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome back, {user.name || user.email?.split("@")[0]}
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Track your IQ progress • Improve every test
            </p>
          </div>
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
                      <Link href={`/results?testId=${test.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
