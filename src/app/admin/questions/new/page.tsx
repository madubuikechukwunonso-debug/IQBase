"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Brain, ArrowLeft, Plus, Trash2, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { useRouter } from "next/navigation"

type QuestionType = "logical" | "pattern" | "numerical" | "verbal" | "graphical"

export default function NewQuestionPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    type: "logical" as QuestionType,
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

    // Basic validation
    if (!form.question.trim()) {
      setError("Question text is required")
      setLoading(false)
      return
    }
    if (form.options.some(opt => !opt.trim())) {
      setError("All options must be filled")
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

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create question")
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/admin")
      }, 1500)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted pb-12">
      {/* Header */}
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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl">Create New Question</CardTitle>
            <p className="text-muted-foreground">Add to the database — supports graphical questions with images</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Type & Difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Question Type</Label>
                  <Select 
                    value={form.type} 
                    onValueChange={(value: QuestionType) => setForm({ ...form, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="logical">Logical</SelectItem>
                      <SelectItem value="pattern">Pattern</SelectItem>
                      <SelectItem value="numerical">Numerical</SelectItem>
                      <SelectItem value="verbal">Verbal</SelectItem>
                      <SelectItem value="graphical">Graphical (with image)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Difficulty (1-5)</Label>
                  <Select 
                    value={String(form.difficulty)} 
                    onValueChange={(v) => setForm({ ...form, difficulty: Number(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5].map(n => (
                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <Label>Question Text</Label>
                <Textarea
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  placeholder="What is the next number in the sequence: 2, 4, 8, 16, ...?"
                  className="min-h-[100px]"
                  required
                />
              </div>

              {/* Options */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label>Answer Options</Label>
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

              {/* Correct Answer */}
              <div>
                <Label>Correct Answer (index)</Label>
                <Select
                  value={String(form.correctAnswer)}
                  onValueChange={(v) => setForm({ ...form, correctAnswer: Number(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {form.options.map((_, i) => (
                      <SelectItem key={i} value={String(i)}>
                        Option {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Explanation */}
              <div>
                <Label>Explanation</Label>
                <Textarea
                  value={form.explanation}
                  onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                  placeholder="Explain why this is the correct answer..."
                  className="min-h-[80px]"
                />
              </div>

              {/* Time Limit & Active */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Time Limit (seconds)</Label>
                  <Input
                    type="number"
                    value={form.timeLimit}
                    onChange={(e) => setForm({ ...form, timeLimit: Number(e.target.value) })}
                    min={10}
                    max={120}
                  />
                </div>
                <div className="flex items-center gap-3 pt-8">
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                  />
                  <Label>Active (visible in tests)</Label>
                </div>
              </div>

              {/* Graphical Image URL */}
              {form.type === "graphical" && (
                <div className="space-y-4">
                  <Label>Image URL (for graphical question)</Label>
                  <Input
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.png"
                  />
                  {form.imageUrl && (
                    <div className="mt-4 border rounded-xl overflow-hidden bg-muted p-4">
                      <p className="text-sm text-muted-foreground mb-2">Image Preview</p>
                      <img
                        src={form.imageUrl}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg shadow-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Invalid+Image+URL"
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {error && <p className="text-red-500 text-center">{error}</p>}
              {success && <p className="text-green-600 text-center font-medium">✅ Question created successfully! Redirecting...</p>}

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Creating Question..." : "Create & Save to Database"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
