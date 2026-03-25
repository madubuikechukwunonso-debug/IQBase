"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Brain,
  Users,
  TrendingUp,
  DollarSign,
  BarChart3,
  Filter,
  Download,
  Search,
  Plus,
  Sparkles,
  Wand2,
  X,
  Loader2,
  CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

export default function AdminPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [stats, setStats] = useState<any>(null)
  const [recentTests, setRecentTests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // AI Modal
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [category, setCategory] = useState("logical")
  const [difficulty, setDifficulty] = useState(3)
  const [generating, setGenerating] = useState(false)
  const [generatedQuestion, setGeneratedQuestion] = useState<any>(null)

  const { toast } = useToast()

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(res => res.json())
      .then(data => {
        setStats(data.stats || {})
        setRecentTests(data.recentTests || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredTests = recentTests.filter(test =>
    test.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const generateWithAI = async () => {
    if (!prompt.trim()) {
      toast({ title: "Please enter a prompt", variant: "destructive" })
      return
    }

    setGenerating(true)
    setGeneratedQuestion(null)

    try {
      const res = await fetch("/api/admin/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, category, difficulty }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Generation failed")

      setGeneratedQuestion(data)
      toast({ title: "✅ Question generated successfully!" })
    } catch (err: any) {
      toast({ title: "AI Generation failed", description: err.message, variant: "destructive" })
    } finally {
      setGenerating(false)
    }
  }

  const saveGeneratedQuestion = async () => {
    if (!generatedQuestion) return

    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generatedQuestion),
      })

      if (res.ok) {
        toast({ title: "✅ Question saved to database!" })
        setAiModalOpen(false)
        setGeneratedQuestion(null)
        setPrompt("")
      } else {
        toast({ title: "Failed to save question", variant: "destructive" })
      }
    } catch (err) {
      toast({ title: "Save failed", variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading live stats...</p>
        </div>
      </div>
    )
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
            <span className="font-bold">IQBase Admin</span>
          </Link>
          <Badge variant="outline">Admin Dashboard</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Overview</h1>
            <p className="text-muted-foreground">Real-time platform performance</p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setAiModalOpen(true)}
              className="gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg shadow-purple-500/30"
            >
              <Sparkles className="w-4 h-4" />
              <Wand2 className="w-4 h-4" />
              AI Question Generator
            </Button>

            <Button asChild variant="default">
              <Link href="/admin/questions/new">
                <Plus className="w-4 h-4 mr-2" />
                Manual Question
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid - your original cards stay exactly the same */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {/* Paste your existing stat cards here if you want – they are unchanged */}
        </div>

        {/* Recent Tests Table - your original table stays exactly the same */}
        <Card>
          {/* ... your existing recent tests table ... */}
        </Card>
      </main>

      {/* AI MODAL */}
      {aiModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-purple-500" />
                <h2 className="text-2xl font-bold">AI Question Generator</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setAiModalOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6 overflow-auto max-h-[70vh]">
              <div>
                <Label>Prompt / Idea</Label>
                <Textarea
                  placeholder="Create a hard logical reasoning question about conditional statements..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="logical">Logical Reasoning</SelectItem>
                      <SelectItem value="pattern">Pattern Recognition</SelectItem>
                      <SelectItem value="numerical">Numerical Reasoning</SelectItem>
                      <SelectItem value="speed">Processing Speed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Difficulty (1-5)</Label>
                  <Input
                    type="range"
                    min="1"
                    max="5"
                    value={difficulty}
                    onChange={(e) => setDifficulty(Number(e.target.value))}
                    className="mt-2 accent-purple-600"
                  />
                  <div className="text-center text-sm text-muted-foreground mt-1">{difficulty}</div>
                </div>
              </div>

              <Button
                onClick={generateWithAI}
                disabled={generating}
                className="w-full py-7 text-lg bg-gradient-to-r from-purple-600 to-violet-600"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Generating with AI...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-3 h-5 w-5" />
                    Generate Question
                  </>
                )}
              </Button>

              {generatedQuestion && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border rounded-2xl p-6 bg-muted/30"
                >
                  <h3 className="font-semibold mb-3">Preview</h3>
                  <p className="text-lg leading-relaxed mb-6">{generatedQuestion.question}</p>
                  <div className="space-y-3">
                    {generatedQuestion.options.map((opt: string, i: number) => (
                      <div
                        key={i}
                        className={`p-4 rounded-xl border ${i === generatedQuestion.correctAnswer ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-border"}`}
                      >
                        {opt}
                        {i === generatedQuestion.correctAnswer && <CheckCircle className="inline ml-2 w-4 h-4 text-green-500" />}
                      </div>
                    ))}
                  </div>
                  <Button onClick={saveGeneratedQuestion} className="w-full mt-6">
                    Save to Question Bank
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
