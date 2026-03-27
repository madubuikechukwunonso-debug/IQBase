"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Brain,
  Users,
  TrendingUp,
  DollarSign,
  BarChart3,
  Search,
  Sparkles,
  Wand2,
  X,
  Loader2,
  CheckCircle,
  ShieldX,
  Trash2,
  Terminal,
  Image as ImageIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// === DEBUG CONSOLE COMPONENT ===
const DebugConsole = ({ isOpen, logs, onClose }: {
  isOpen: boolean
  logs: { id: number; text: string; type: "info" | "error" | "success" }[]
  onClose: () => void
}) => {
  if (!isOpen) return null
  return (
    <div className="fixed bottom-6 right-6 w-96 h-96 bg-zinc-950 border border-zinc-700 rounded-2xl shadow-2xl flex flex-col z-[99999] overflow-hidden">
      <div className="bg-zinc-900 px-4 py-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-2 text-emerald-400">
          <Terminal className="w-5 h-5" />
          <span className="font-mono text-sm font-bold">AI LIVE CONSOLE</span>
        </div>
        <button onClick={onClose} className="text-zinc-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="flex-1 p-4 font-mono text-xs overflow-auto bg-black text-zinc-100 space-y-1">
        {logs.length === 0 ? (
          <div className="text-zinc-500 italic">Waiting for AI response...</div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`flex gap-2 ${
                log.type === "error"
                  ? "text-red-400"
                  : log.type === "success"
                  ? "text-emerald-400"
                  : "text-sky-300"
              }`}
            >
              <span className="text-zinc-500">[AI]</span>
              <span className="whitespace-pre-wrap">{log.text}</span>
            </div>
          ))
        )}
      </div>
      <div className="p-3 text-[10px] text-zinc-500 border-t bg-zinc-900 text-center font-mono">
        LIVE AI STREAM
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [tests, setTests] = useState<any[]>([])
  const [questions, setQuestions] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  // AI Modal
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generatedQuestion, setGeneratedQuestion] = useState<any>(null)
  const [lastType, setLastType] = useState<"text" | "visual" | null>(null)

  // Hardcoded prompts
  const hardcodedPrompts = [
    "Create a challenging logical reasoning question about conditional statements and syllogisms.",
    "Create a pattern recognition question with numbers or shapes that requires deep observation.",
    "Create a numerical reasoning question involving percentages, ratios or sequences.",
    "Create a processing speed question that tests quick decision making.",
    "Create a logical puzzle question with multiple steps and clear options.",
    "Create a numerical word problem that requires careful calculation.",
    "Create a logical analogy or relationship question.",
  ]

  const visualPrompts = [
    "Create a visual pattern or matrix IQ question that requires observing shapes, colors or symbols.",
    "Create a spatial reasoning question with rotating figures or 3D cubes.",
    "Create a mirror-image or symmetry IQ question.",
    "Create a visual analogy or figure completion question.",
  ]

  // Debug console
  const [debugOpen, setDebugOpen] = useState(false)
  const [debugLogs, setDebugLogs] = useState<{ id: number; text: string; type: "info" | "error" | "success" }[]>([])

  const addLog = (text: string, type: "info" | "error" | "success" = "info") => {
    setDebugLogs((prev) => [...prev, { id: Date.now(), text, type }])
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [statsRes, usersRes, testsRes, questionsRes] = await Promise.all([
      fetch("/api/admin/stats"),
      fetch("/api/admin/users"),
      fetch("/api/admin/tests"),
      fetch("/api/admin/questions")
    ])
    const statsData = await statsRes.json()
    const usersData = await usersRes.json()
    const testsData = await testsRes.json()
    const questionsData = await questionsRes.json()

    setStats(statsData.stats || {})
    setUsers(usersData.users || [])
    setTests(testsData.tests || [])
    setQuestions(questionsData.questions || [])
    setLoading(false)
  }

  const blockUser = async (userId: string, blocked: boolean) => {
    await fetch(`/api/admin/users/${userId}/block`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocked })
    })
    fetchData()
  }

  const deleteTest = async (testId: string) => {
    if (!confirm("Delete this test permanently?")) return
    await fetch(`/api/admin/tests/${testId}`, { method: "DELETE" })
    fetchData()
  }

  const deleteQuestion = async (questionId: string) => {
    if (!confirm("Delete this question permanently?")) return
    await fetch(`/api/admin/questions/${questionId}`, { method: "DELETE" })
    fetchData()
  }

  // === GROQ - Text / Normal Questions ===
  const generateRandomQuestion = async () => {
    setGenerating(true)
    setGeneratedQuestion(null)
    setDebugOpen(true)
    setDebugLogs([])
    const randomPrompt = hardcodedPrompts[Math.floor(Math.random() * hardcodedPrompts.length)]
    addLog("🚀 Starting GROQ (text) generation...", "info")
    addLog(`Prompt: ${randomPrompt}`, "info")
    try {
      const res = await fetch("/api/admin/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: randomPrompt }),
      })
      if (!res.ok) throw new Error("Generation failed")
      const reader = res.body?.getReader()
      if (!reader) throw new Error("No stream reader")
      const decoder = new TextDecoder()
      let buffer = ""
      let cleanJsonText = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk
        addLog(chunk, "info")
        const lines = chunk.split("\n")
        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const content = JSON.parse(line.slice(2))
              cleanJsonText += content
            } catch {
              cleanJsonText += line.slice(2)
            }
          }
        }
      }
      const jsonMatch = cleanJsonText.match(/\{[\s\S]*?\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        setGeneratedQuestion(parsed)
        setLastType("text")
        addLog("✅ Groq text question parsed!", "success")
      } else {
        throw new Error("Could not find valid JSON")
      }
    } catch (err: any) {
      addLog(`❌ ${err.message}`, "error")
    } finally {
      setGenerating(false)
    }
  }

  // === GEMINI - Visual / Image Questions (text-based with ASCII) ===
  const generateVisualQuestion = async () => {
    setGenerating(true)
    setGeneratedQuestion(null)
    setDebugOpen(true)
    setDebugLogs([])
    const randomVisualPrompt = visualPrompts[Math.floor(Math.random() * visualPrompts.length)]
    addLog("🚀 Starting GEMINI (visual) generation...", "info")
    addLog(`Prompt: ${randomVisualPrompt}`, "info")
    try {
      const res = await fetch("/api/admin/generate-visual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: randomVisualPrompt }),
      })
      if (!res.ok) throw new Error("Generation failed")
      const reader = res.body?.getReader()
      if (!reader) throw new Error("No stream reader")
      const decoder = new TextDecoder()
      let buffer = ""
      let cleanJsonText = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk
        addLog(chunk, "info")
        const lines = chunk.split("\n")
        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const content = JSON.parse(line.slice(2))
              cleanJsonText += content
            } catch {
              cleanJsonText += line.slice(2)
            }
          }
        }
      }
      const jsonMatch = cleanJsonText.match(/\{[\s\S]*?\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        setGeneratedQuestion(parsed)
        setLastType("visual")
        addLog("✅ Gemini visual question parsed!", "success")
      } else {
        throw new Error("Could not find valid JSON")
      }
    } catch (err: any) {
      addLog(`❌ ${err.message}`, "error")
    } finally {
      setGenerating(false)
    }
  }

  const handleCancel = () => {
    setAiModalOpen(false)
    setGeneratedQuestion(null)
    setDebugOpen(false)
    if (lastType === "text") generateRandomQuestion()
    else if (lastType === "visual") generateVisualQuestion()
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
        alert("✅ Question saved to database!")
        setAiModalOpen(false)
        setGeneratedQuestion(null)
        setDebugOpen(false)
        fetchData()
      } else {
        alert("Failed to save question")
      }
    } catch (err) {
      alert("Save failed")
    }
  }

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredTests = tests.filter(t =>
    t.user?.email.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredQuestions = questions.filter(q =>
    q.question.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
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
        {/* Tabs (unchanged) */}
        <div className="flex border-b mb-6">
          <button onClick={() => setActiveTab("overview")} className={`px-6 py-3 font-medium ${activeTab === "overview" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>Overview</button>
          <button onClick={() => setActiveTab("users")} className={`px-6 py-3 font-medium ${activeTab === "users" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>Users</button>
          <button onClick={() => setActiveTab("tests")} className={`px-6 py-3 font-medium ${activeTab === "tests" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>Tests</button>
          <button onClick={() => setActiveTab("questions")} className={`px-6 py-3 font-medium ${activeTab === "questions" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>Questions</button>
        </div>

        {/* All your existing tabs (overview, users, tests, questions) remain exactly the same */}

        {/* ... (overview, users, tests, questions tabs unchanged - omitted for brevity) ... */}

      </main>

      {/* Floating AI Button */}
      <button
        onClick={() => setAiModalOpen(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-600 to-violet-600 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 hover:scale-105 transition-transform"
      >
        <Sparkles className="w-5 h-5" />
        <Wand2 className="w-5 h-5" />
        <span className="font-medium">Generate Random Question</span>
      </button>

      {/* AI Modal */}
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
              <button onClick={() => { setAiModalOpen(false); setDebugOpen(false) }} className="text-2xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={generateRandomQuestion}
                  disabled={generating}
                  className="py-7 text-lg bg-gradient-to-r from-purple-600 to-violet-600 flex items-center gap-2"
                >
                  {generating ? <Loader2 className="animate-spin" /> : <Wand2 />}
                  Groq – Text Question
                </Button>
                <Button
                  onClick={generateVisualQuestion}
                  disabled={generating}
                  className="py-7 text-lg bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center gap-2"
                >
                  {generating ? <Loader2 className="animate-spin" /> : <ImageIcon />}
                  Gemini – Visual Question
                </Button>
              </div>

              {/* UPDATED PREVIEW LOGIC – shows real ASCII art nicely */}
              {generatedQuestion && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border rounded-2xl p-6 bg-muted/30">
                  <h3 className="font-semibold mb-3">Generated Question</h3>

                  {/* ASCII Art / Grid Preview for Visual Questions */}
                  {generatedQuestion.type === "visual" && generatedQuestion.question && (
                    <div className="mb-6 bg-white dark:bg-zinc-900 p-6 rounded-xl border font-mono text-sm whitespace-pre leading-relaxed overflow-auto">
                      {generatedQuestion.question}
                    </div>
                  )}

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

                  <div className="flex gap-3 mt-6">
                    <Button onClick={saveGeneratedQuestion} className="flex-1">Save to Question Bank</Button>
                    <Button onClick={handleCancel} variant="outline" className="flex-1">Cancel & Generate New</Button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* LIVE DEBUG CONSOLE */}
      <DebugConsole
        isOpen={debugOpen}
        logs={debugLogs}
        onClose={() => setDebugOpen(false)}
      />
    </div>
  )
}
