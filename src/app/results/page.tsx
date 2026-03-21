"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Brain, 
  Mail, 
  Lock, 
  Unlock, 
  Download, 
  Share2,
  TrendingUp,
  Target,
  Zap,
  Clock,
  ChevronRight,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

// Category score component
function CategoryScore({ 
  label, 
  score, 
  icon: Icon, 
  color 
}: { 
  label: string
  score: number
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="p-4 rounded-lg bg-muted">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${color}`} />
          <span className="font-medium">{label}</span>
        </div>
        <span className="font-bold">{score}%</span>
      </div>
      <Progress value={score} className="h-2" variant={score >= 70 ? "success" : score >= 50 ? "warning" : "danger"} />
    </div>
  )
}

// Results content component
function ResultsContent() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const score = parseInt(searchParams.get("score") || "100")
  const percentile = parseInt(searchParams.get("percentile") || "50")
  const category = searchParams.get("category") || "Average"

  // Mock category scores
  const categoryScores = {
    logical: Math.min(100, Math.max(30, score + Math.floor(Math.random() * 20 - 10))),
    pattern: Math.min(100, Math.max(30, score + Math.floor(Math.random() * 20 - 10))),
    numerical: Math.min(100, Math.max(30, score + Math.floor(Math.random() * 20 - 10))),
    speed: Math.min(100, Math.max(30, 60 + Math.floor(Math.random() * 30))),
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    setIsEmailSubmitted(true)
    setIsLoading(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 130) return "text-purple-500"
    if (score >= 120) return "text-blue-500"
    if (score >= 110) return "text-green-500"
    if (score >= 90) return "text-yellow-500"
    if (score >= 80) return "text-orange-500"
    return "text-red-500"
  }

  const getScoreBg = (score: number) => {
    if (score >= 130) return "from-purple-500/20 to-pink-500/20"
    if (score >= 120) return "from-blue-500/20 to-cyan-500/20"
    if (score >= 110) return "from-green-500/20 to-emerald-500/20"
    if (score >= 90) return "from-yellow-500/20 to-orange-500/20"
    if (score >= 80) return "from-orange-500/20 to-red-500/20"
    return "from-red-500/20 to-pink-500/20"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">IQBase</span>
          </Link>
          <Badge variant="outline">Results</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Score Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className={`p-8 bg-gradient-to-br ${getScoreBg(score)}`}>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Your Cognitive Score</p>
                <h1 className={`text-7xl md:text-8xl font-bold ${getScoreColor(score)} mb-2`}>
                  {score}
                </h1>
                <Badge size="lg" className="text-lg px-4 py-1">
                  {category}
                </Badge>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Percentile</p>
                  <p className="text-2xl font-bold">{percentile}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Global Rank</p>
                  <p className="text-2xl font-bold">Top {100 - percentile}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Questions</p>
                  <p className="text-2xl font-bold">20</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="text-2xl font-bold">~15min</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Email Capture or Full Results */}
        {!isEmailSubmitted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-0 shadow-xl mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Unlock Your Full Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Enter your email to access your detailed cognitive breakdown, personalized recommendations, 
                  and share your results with friends.
                </p>

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12"
                        disabled={isLoading}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      size="lg" 
                      variant="gradient"
                      isLoading={isLoading}
                      className="btn-shine"
                    >
                      <Unlock className="mr-2 w-5 h-5" />
                      Unlock Results
                    </Button>
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}
                </form>

                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-4">What you&apos;ll unlock:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      "Detailed category breakdown",
                      "Personalized recommendations",
                      "Shareable result card",
                      "Progress tracking",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Blurred Preview */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <CardHeader>
                <CardTitle>Detailed Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="blur-lock space-y-4">
                    <CategoryScore 
                      label="Logical Reasoning" 
                      score={85} 
                      icon={Target}
                      color="text-blue-500"
                    />
                    <CategoryScore 
                      label="Pattern Recognition" 
                      score={72} 
                      icon={TrendingUp}
                      color="text-purple-500"
                    />
                    <CategoryScore 
                      label="Numerical Ability" 
                      score={68} 
                      icon={Zap}
                      color="text-orange-500"
                    />
                    <CategoryScore 
                      label="Processing Speed" 
                      score={90} 
                      icon={Clock}
                      color="text-green-500"
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                    <div className="text-center">
                      <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Enter email to unlock</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Category Breakdown */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Detailed Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CategoryScore 
                  label="Logical Reasoning" 
                  score={categoryScores.logical} 
                  icon={Target}
                  color="text-blue-500"
                />
                <CategoryScore 
                  label="Pattern Recognition" 
                  score={categoryScores.pattern} 
                  icon={TrendingUp}
                  color="text-purple-500"
                />
                <CategoryScore 
                  label="Numerical Ability" 
                  score={categoryScores.numerical} 
                  icon={Zap}
                  color="text-orange-500"
                />
                <CategoryScore 
                  label="Processing Speed" 
                  score={categoryScores.speed} 
                  icon={Clock}
                  color="text-green-500"
                />
              </CardContent>
            </Card>

            {/* Strengths & Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Your Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "Strong analytical thinking",
                      "Quick pattern recognition",
                      "Efficient problem-solving",
                    ].map((strength, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "Practice mental math daily",
                      "Try logic puzzles regularly",
                      "Read complex materials",
                    ].map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Upgrade CTA */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/10 to-purple-500/10">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-2">Get Your Premium Report</h3>
                <p className="text-muted-foreground mb-6">
                  Unlock your detailed PDF report with in-depth analysis and personalized insights.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/pricing">
                    <Button size="lg" variant="gradient" className="btn-shine">
                      <Download className="mr-2 w-5 h-5" />
                      Get Premium Report
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline">
                    <Share2 className="mr-2 w-5 h-5" />
                    Share Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Disclaimer */}
        <div className="mt-12 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              <strong>Disclaimer:</strong> This is not a clinically validated IQ test but inspired by standard 
              psychometric principles found in the public domain. Results are for entertainment and 
              self-reflection purposes only and cannot be used in any court or for legal purposes.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

// Main page component with Suspense
export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}
