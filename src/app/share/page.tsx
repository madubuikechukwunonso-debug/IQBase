"use client"

import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  Brain,
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Link as LinkIcon,
  CheckCircle,
  Trophy,
  Target,
  TrendingUp,
  Zap,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useState } from "react"
import { Suspense } from "react"

function ShareContent() {
  const searchParams = useSearchParams()
  const [copied, setCopied] = useState(false)
  const score = parseInt(searchParams.get("score") || "100")
  const percentile = parseInt(searchParams.get("percentile") || "50")
  const category = searchParams.get("category") || "Average"

  const getScoreMessage = () => {
    if (score >= 130) return "I just scored in the top 2% on my cognitive assessment!"
    if (score >= 120) return "Just completed my cognitive assessment with impressive results!"
    if (score >= 110) return "Happy with my cognitive assessment results!"
    return "Just took a cognitive assessment - interesting insights!"
  }

  const shareText = encodeURIComponent(
    `${getScoreMessage()}\n\nScore: ${score} (${category})\nPercentile: ${percentile}%\n\nTest your cognitive abilities at`
  )
  const shareUrl = encodeURIComponent("https://iqbase.com")

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getScoreColor = (score: number) => {
    if (score >= 130) return "text-purple-500"
    if (score >= 120) return "text-blue-500"
    if (score >= 110) return "text-green-500"
    if (score >= 90) return "text-yellow-500"
    return "text-orange-500"
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
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-0 shadow-xl overflow-hidden">
            {/* Result Card */}
            <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 p-8">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mx-auto mb-4"
                >
                  <Trophy className="w-10 h-10 text-white" />
                </motion.div>

                <p className="text-sm text-muted-foreground mb-2">Cognitive Score</p>
                <h1 className={`text-6xl font-bold ${getScoreColor(score)} mb-2`}>
                  {score}
                </h1>
                <Badge className="text-lg px-4 py-1 mb-4">
                  {category}
                </Badge>

                <div className="flex justify-center gap-8 mt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{percentile}%</p>
                    <p className="text-sm text-muted-foreground">Percentile</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">Top {100 - percentile}%</p>
                    <p className="text-sm text-muted-foreground">Global Rank</p>
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-center mb-6">
                Share Your Results
              </h2>

              {/* Social Share Buttons */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <a
                  href={shareLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 transition-colors"
                >
                  <Twitter className="w-8 h-8 text-sky-500" />
                  <span className="text-sm font-medium">Twitter</span>
                </a>
                <a
                  href={shareLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 transition-colors"
                >
                  <Facebook className="w-8 h-8 text-blue-600" />
                  <span className="text-sm font-medium">Facebook</span>
                </a>
                <a
                  href={shareLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-blue-700/10 hover:bg-blue-700/20 transition-colors"
                >
                  <Linkedin className="w-8 h-8 text-blue-700" />
                  <span className="text-sm font-medium">LinkedIn</span>
                </a>
              </div>

              {/* Copy Link */}
              <div className="flex gap-2 mb-8">
                <div className="flex-1 p-3 rounded-lg bg-muted flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground truncate">
                    {typeof window !== 'undefined' ? window.location.href : ''}
                  </span>
                </div>
                <Button
                  variant={copied ? "default" : "outline"}
                  onClick={copyToClipboard}
                  className="min-w-[100px]"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              {/* CTA */}
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Challenge your friends to beat your score!
                </p>
                <Link href="/test">
                  <Button size="lg" variant="gradient" className="btn-shine">
                    <Target className="mr-2 w-5 h-5" />
                    Take Test Again
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Stats Preview */}
          <Card className="border-0 shadow-xl mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Your Cognitive Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Logical</p>
                    <p className="font-semibold">Strong</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pattern</p>
                    <p className="font-semibold">Excellent</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Numerical</p>
                    <p className="font-semibold">Good</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Speed</p>
                    <p className="font-semibold">Fast</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

export default function SharePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }
    >
      <ShareContent />
    </Suspense>
  )
}
