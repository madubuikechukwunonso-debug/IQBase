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
  CheckCircle,
  ShieldX,
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [tests, setTests] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  // AI Modal
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [category, setCategory] = useState("logical")
  const [difficulty, setDifficulty] = useState(3)
  const [generating, setGenerating] = useState(false)
  const [generatedQuestion, setGeneratedQuestion] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [statsRes, usersRes, testsRes] = await Promise.all([
      fetch("/api/admin/stats"),
      fetch("/api/admin/users"),
      fetch("/api/admin/tests")
    ])

    const statsData = await statsRes.json()
    const usersData = await usersRes.json()
    const testsData = await testsRes.json()

    setStats(statsData.stats || {})
    setUsers(usersData.users || [])
    setTests(testsData.tests || [])
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

  const generateWithAI = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt")
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
    } catch (err: any) {
      alert("AI Generation failed: " + err.message)
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
        alert("✅ Question saved to database!")
        setAiModalOpen(false)
        setGeneratedQuestion(null)
        setPrompt("")
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
        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 font-medium ${activeTab === "overview" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 font-medium ${activeTab === "users" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("tests")}
            className={`px-6 py-3 font-medium ${activeTab === "tests" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
          >
            Tests
          </button>
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
            {/* Add more stats as needed */}
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
                  <Input
                    placeholder="Search email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
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
                      <td className="py-3 px-4">
                        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        {user.blocked ? <Badge variant="destructive">Blocked</Badge> : <Badge variant="outline">Active</Badge>}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          variant={user.blocked ? "default" : "destructive"}
                          onClick={() => blockUser(user.id, !user.blocked)}
                        >
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
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteTest(test.id)}
                        >
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

        {/* AI Button floating in corner */}
        <button
          onClick={() => setAiModalOpen(true)}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-600 to-violet-600 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 hover:scale-105 transition-transform"
        >
          <Sparkles className="w-5 h-5" />
          <Wand2 className="w-5 h-5" />
          <span className="font-medium">Generate Question with AI</span>
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
                <button onClick={() => setAiModalOpen(false)} className="text-2xl leading-none">×</button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Prompt</label>
                  <textarea
                    placeholder="Create a hard logical reasoning question about conditional statements..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="w-full border border-border rounded-2xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full border border-border rounded-2xl p-3"
                    >
                      <option value="logical">Logical Reasoning</option>
                      <option value="pattern">Pattern Recognition</option>
                      <option value="numerical">Numerical Reasoning</option>
                      <option value="speed">Processing Speed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Difficulty (1-5)</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={difficulty}
                      onChange={(e) => setDifficulty(Number(e.target.value))}
                      className="w-full accent-purple-600"
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
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-3 h-5 w-5" />
                      Generate Question
                    </>
                  )}
                </Button>

                {generatedQuestion && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border rounded-2xl p-6 bg-muted/30">
                    <h3 className="font-semibold mb-3">Preview</h3>
                    <p className="text-lg leading-relaxed mb-6">{generatedQuestion.question}</p>
                    <div className="space-y-3">
                      {generatedQuestion.options.map((opt: string, i: number) => (
                        <div
                          key={i}
                          className={`p-4 rounded-xl border ${i === generatedQuestion.correctAnswer ? "border-green-500 bg-green-50" : "border-border"}`}
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
      </main>
    </div>
  )
}
