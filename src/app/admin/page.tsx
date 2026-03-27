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

  const [selectedDifficulty, setSelectedDifficulty] = useState(3)

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
    "Create a visual analogy or figure completion question using cultural or historical symbols.",
    "Create a spatial reasoning question with famous architecture or historical landmarks.",
    "Create a mirror-image or symmetry IQ question using real-world objects or religious icons.",
    "Create a visual pattern question based on nature, art, or ancient symbols.",
    "Create a question that involves comparing figures or scenes from different civilizations.",
    "Create a figure completion question using mythological or scientific imagery.",
    "Create a visual analogy using famous religious leaders or spiritual figures.",
    "Create a spatial reasoning question featuring ancient temples or palaces.",
    "Create a mirror-image question using traditional clothing or ceremonial attire.",
    "Create a visual puzzle based on famous historical events or battles.",
    "Create a figure completion question using elements from world mythology.",
    "Create a visual analogy using sacred objects from different faiths.",
    "Create a reasoning question with famous explorers and their ships.",
    "Create a visual puzzle using royal crowns, thrones, or regalia.",
    "Create a figure completion question inspired by ancient Egyptian or Greek art.",
    "Create a visual analogy using traditional festival masks or costumes.",
    "Create a spatial reasoning question featuring famous bridges or monuments.",
    "Create a mirror-image question using natural landscapes or famous gardens.",
    "Create a visual puzzle based on famous literary or theatrical scenes.",
    "Create a figure completion question using medieval knights or samurai armor.",
  ]

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

  // === GROQ - Text Only (no image) ===
  const generateRandomQuestion = async () => {
    setGenerating(true)
    setGeneratedQuestion(null)
    setDebugOpen(true)
    setDebugLogs([])

    const randomPrompt = hardcodedPrompts[Math.floor(Math.random() * hardcodedPrompts.length)]
    addLog("🚀 Starting GROQ generation (text only)...", "info")
    addLog(`Prompt: ${randomPrompt} | Difficulty: ${selectedDifficulty}`, "info")

    try {
      const res = await fetch("/api/admin/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: randomPrompt,
          difficulty: selectedDifficulty
        }),
      })

      if (!res.ok) throw new Error("Generation failed")

      const parsed = await res.json()
      setGeneratedQuestion(parsed)
      setLastType("text")
      addLog("✅ Groq text question ready!", "success")
    } catch (err: any) {
      addLog(`❌ ${err.message}`, "error")
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  // === REPLICATE - Visual Question (Groq first → then image using better description) ===
  const generateVisualQuestion = async () => {
    setGenerating(true)
    setGeneratedQuestion(null)
    setDebugOpen(true)
    setDebugLogs([])

    const randomVisualPrompt = visualPrompts[Math.floor(Math.random() * visualPrompts.length)]
    addLog("🚀 Starting GROQ generation (question + visual description)...", "info")
    addLog(`Prompt: ${randomVisualPrompt}`, "info")

    try {
      const res = await fetch("/api/admin/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: randomVisualPrompt,
          difficulty: selectedDifficulty
        }),
      })

      if (!res.ok) throw new Error("Question generation failed")

      const parsed = await res.json()

      // Use Groq's visualDescription for image generation
      const imageRes = await fetch("/api/admin/generate-visual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: parsed.visualDescription || parsed.question }),
      })

      const imageData = await imageRes.json()
      if (!imageRes.ok || !imageData.success) {
        throw new Error(imageData.error || "Image generation failed")
      }

      const fullQuestion = { ...parsed, imageUrl: imageData.image }
      setGeneratedQuestion(fullQuestion)
      setLastType("visual")
      addLog("✅ Groq question + relevant image ready!", "success")
    } catch (err: any) {
      addLog(`❌ ${err.message}`, "error")
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  const handleCancel = () => {
    setGeneratedQuestion(null)
    if (lastType === "text") {
      generateRandomQuestion()
    } else if (lastType === "visual") {
      generateVisualQuestion()
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
        <div className="flex border-b mb-6">
          <button onClick={() => setActiveTab("overview")} className={`px-6 py-3 font-medium ${activeTab === "overview" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>Overview</button>
          <button onClick={() => setActiveTab("users")} className={`px-6 py-3 font-medium ${activeTab === "users" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>Users</button>
          <button onClick={() => setActiveTab("tests")} className={`px-6 py-3 font-medium ${activeTab === "tests" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>Tests</button>
          <button onClick={() => setActiveTab("questions")} className={`px-6 py-3 font-medium ${activeTab === "questions" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>Questions</button>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-3xl font-bold">{stats.totalUsers || 0}</p>
                  </div>
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Tests</p>
                    <p className="text-3xl font-bold">{stats.totalTests || 0}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Premium Users</p>
                    <p className="text-3xl font-bold">{stats.premiumUsers || 0}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Basic Users</p>
                    <p className="text-3xl font-bold">{stats.basicUsers || 0}</p>
                  </div>
                  <Users className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>Users ({filteredUsers.length})</CardTitle>
                <div className="relative w-72">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4"><Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge></td>
                      <td className="py-3 px-4">{user.blocked ? <Badge variant="destructive">Blocked</Badge> : <Badge variant="outline">Active</Badge>}</td>
                      <td className="py-3 px-4">
                        <Button size="sm" variant={user.blocked ? "default" : "destructive"} onClick={() => blockUser(user.id, !user.blocked)}>
                          <ShieldX className="w-3 h-3 mr-1" />
                          {user.blocked ? "Unblock" : "Block"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* TESTS TAB */}
        {activeTab === "tests" && (
          <Card>
            <CardHeader>
              <CardTitle>Tests ({filteredTests.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Score</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTests.map((test) => (
                    <tr key={test.id} className="border-b last:border-0">
                      <td className="py-3 px-4">{test.user?.email}</td>
                      <td className="py-3 px-4 font-semibold">{test.score}</td>
                      <td className="py-3 px-4 text-muted-foreground">{new Date(test.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <Button size="sm" variant="destructive" onClick={() => deleteTest(test.id)}>
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* QUESTIONS TAB */}
        {activeTab === "questions" && (
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>Questions ({filteredQuestions.length})</CardTitle>
                <div className="relative w-72">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search question..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Question</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Difficulty</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuestions.map((q) => (
                    <tr key={q.id} className="border-b last:border-0">
                      <td className="py-3 px-4 text-sm">{q.question.substring(0, 80)}...</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">{q.type}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={q.difficulty >= 4 ? "destructive" : "outline"}>{q.difficulty}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button size="sm" variant="destructive" onClick={() => deleteQuestion(q.id)}>
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
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
            className="bg-background rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-purple-500" />
                <h2 className="text-2xl font-bold">AI Question Generator</h2>
              </div>
              <button onClick={() => { setAiModalOpen(false); setDebugOpen(false) }} className="text-2xl leading-none">×</button>
            </div>

            <div className="flex-1 overflow-auto p-6 space-y-6">
              <div className="flex items-center gap-3">
                <span className="font-medium text-sm">Difficulty (Groq only):</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setSelectedDifficulty(level)}
                      className={`w-8 h-8 rounded-lg font-bold text-sm flex items-center justify-center transition-all ${
                        selectedDifficulty === level ? "bg-purple-600 text-white shadow-md" : "bg-muted hover:bg-muted-foreground/20"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

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
                  Replicate – Visual Question
                </Button>
              </div>

              {/* Preview */}
              {generatedQuestion && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border rounded-2xl p-6 bg-muted/30">
                  <h3 className="font-semibold mb-3">Generated Question</h3>
                  {generatedQuestion.imageUrl && (
                    <div className="mb-6 border rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
                      <img
                        src={generatedQuestion.imageUrl}
                        alt="Generated Visual IQ Question"
                        className="w-full h-auto max-h-96 object-contain mx-auto"
                      />
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
                </motion.div>
              )}
            </div>

            <div className="p-6 border-t flex gap-3 bg-background">
              <Button onClick={saveGeneratedQuestion} className="flex-1" disabled={!generatedQuestion}>
                Save to Question Bank
              </Button>
              <Button onClick={handleCancel} variant="outline" className="flex-1">
                Cancel & Generate New
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <DebugConsole isOpen={debugOpen} logs={debugLogs} onClose={() => setDebugOpen(false)} />
    </div>
  )
}
