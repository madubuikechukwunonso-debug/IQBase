"use client"
import { useState } from "react"
import { Brain, ArrowLeft, Plus, Trash2, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NewQuestionPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    type: "logical",
    difficulty: 3,
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
    timeLimit: 30,
    imageUrl: "",
    isActive: true,
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...form.options]
    newOptions[index] = value
    setForm({ ...form, options: newOptions })
  }

  const addOption = () => {
    if (form.options.length < 6) {
      setForm({ ...form, options: [...form.options, ""] })
    }
  }

  const removeOption = (index: number) => {
    if (form.options.length > 2) {
      const newOptions = form.options.filter((_, i) => i !== index)
      setForm({ 
        ...form, 
        options: newOptions,
        correctAnswer: Math.min(form.correctAnswer, newOptions.length - 1)
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!form.question.trim()) {
      setError("Question text is required")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          difficulty: Number(form.difficulty),
          question: form.question.trim(),
          options: form.options.map(opt => opt.trim()),
          correctAnswer: Number(form.correctAnswer),
          explanation: form.explanation.trim(),
          timeLimit: Number(form.timeLimit),
          imageUrl: form.type === "graphical" && form.imageUrl ? form.imageUrl.trim() : null,
          isActive: form.isActive,
        }),
      })

      if (!res.ok) throw new Error("Failed to create question")

      setSuccess(true)
      setTimeout(() => router.push("/admin"), 1500)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted pb-12">
      <header className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 hover:opacity-80 transition">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            <span className="font-bold">Add New Question</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl">Create New Question</CardTitle>
            <p className="text-muted-foreground">Add to database — supports graphical questions</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Type & Difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium block mb-1">Question Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border border-input bg-background px-3 py-2 rounded-md"
                  >
                    <option value="logical">Logical</option>
                    <option value="pattern">Pattern</option>
                    <option value="numerical">Numerical</option>
                    <option value="verbal">Verbal</option>
                    <option value="graphical">Graphical (with image)</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">Difficulty (1-5)</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: Number(e.target.value) })}
                    className="w-full border border-input bg-background px-3 py-2 rounded-md"
                  >
                    {[1,2,3,4,5].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="text-sm font-medium block mb-1">Question Text</label>
                <textarea
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  placeholder="What comes next in the sequence?"
                  className="w-full min-h-[100px] border border-input bg-background px-3 py-2 rounded-md"
                  required
                />
              </div>

              {/* Options */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium">Answer Options</label>
                  <Button type="button" variant="outline" size="sm" onClick={addOption}>
                    <Plus className="w-4 h-4 mr-1" /> Add Option
                  </Button>
                </div>
                <div className="space-y-3">
                  {form.options.map((opt, index) => (
                    <div key={index} className="flex gap-3">
                      <Input
                        value={opt}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        required
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeOption(index)}
                        disabled={form.options.length <= 2}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Correct Answer Index */}
              <div>
                <label className="text-sm font-medium block mb-1">Correct Answer (index starting from 0)</label>
                <Input
                  type="number"
                  value={form.correctAnswer}
                  onChange={(e) => setForm({ ...form, correctAnswer: Number(e.target.value) })}
                  min={0}
                  max={form.options.length - 1}
                />
              </div>

              {/* Explanation & Time Limit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium block mb-1">Explanation</label>
                  <textarea
                    value={form.explanation}
                    onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                    placeholder="Why is this the correct answer?"
                    className="w-full min-h-[80px] border border-input bg-background px-3 py-2 rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Time Limit (seconds)</label>
                  <Input
                    type="number"
                    value={form.timeLimit}
                    onChange={(e) => setForm({ ...form, timeLimit: Number(e.target.value) })}
                    min={10}
                    max={120}
                  />
                </div>
              </div>

              {/* Graphical Image URL */}
              {form.type === "graphical" && (
                <div>
                  <label className="text-sm font-medium block mb-1">Image URL (for graphical question)</label>
                  <Input
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.png"
                  />
                  {form.imageUrl && (
                    <div className="mt-4 border rounded-xl overflow-hidden bg-muted p-4">
                      <img src={form.imageUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                    </div>
                  )}
                </div>
              )}

              {error && <p className="text-red-500 text-center">{error}</p>}
              {success && <p className="text-green-600 text-center font-medium">✅ Question saved successfully!</p>}

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Saving to Database..." : "Create Question"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
