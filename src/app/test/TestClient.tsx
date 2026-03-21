"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Brain,
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Trophy,
  Timer,
  Lock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { questions as allQuestions } from "@/data/questions"
import { calculateScore } from "@/lib/scoring"
import { Answer, Question, TestResult } from "@/types"
import { shuffleArray } from "@/lib/utils"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

const QUESTION_COUNT = 20
const WARNING_TIME = 10

export default function TestClient() {
  const { data: session } = useSession()
  const router = useRouter()

  const [testState, setTestState] = useState<'intro' | 'testing' | 'completed'>('intro')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)

  // ✅ START TEST (SAFE)
  const startTest = useCallback(() => {
    const shuffled = shuffleArray(allQuestions).slice(0, QUESTION_COUNT)

    if (!shuffled.length) {
      console.error("No questions found")
      return
    }

    setQuestions(shuffled)
    setCurrentIndex(0)
    setAnswers([])
    setSelectedAnswer(null)
    setShowFeedback(false)
    setTestState('testing')
    setTimeLeft(shuffled[0]?.timeLimit ?? 0)
  }, [])

  // ✅ TIMER (SAFE)
  useEffect(() => {
    if (testState !== 'testing' || showFeedback || !questions[currentIndex]) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAnswerSubmit(-1)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [testState, currentIndex, showFeedback, questions])

  // ✅ SELECT ANSWER
  const handleAnswerSelect = (index: number) => {
    if (showFeedback) return
    setSelectedAnswer(index)
    handleAnswerSubmit(index)
  }

  // ✅ SUBMIT ANSWER (SAFE)
  const handleAnswerSubmit = (answerIndex: number) => {
    const currentQuestion = questions[currentIndex]
    if (!currentQuestion) return

    const timeSpent = (currentQuestion.timeLimit - timeLeft) * 1000

    const answer: Answer = {
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
      timeSpent,
      isCorrect: answerIndex === currentQuestion.correctAnswer,
    }

    const updatedAnswers = [...answers, answer]
    setAnswers(updatedAnswers)
    setShowFeedback(true)

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        const nextIndex = currentIndex + 1

        setCurrentIndex(nextIndex)
        setTimeLeft(questions[nextIndex]?.timeLimit ?? 0)
        setSelectedAnswer(null)
        setShowFeedback(false)
      } else {
        // ✅ TEST COMPLETE
        const testResult = calculateScore(updatedAnswers, questions)
        setResult(testResult)
        setTestState('completed')

        // PAYMENT FLOW
        if (!session?.user) {
          router.push(`/register?callbackUrl=/test`)
        } else {
          const resultString = encodeURIComponent(JSON.stringify(testResult))
          router.push(`/pricing?result=${resultString}`)
        }
      }
    }, 1500)
  }

  // ✅ SAFE RENDER GUARD (CRITICAL)
  if (testState === 'testing' && (!questions.length || !questions[currentIndex])) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading questions...</p>
      </div>
    )
  }

  // ==================== INTRO ====================
  if (testState === 'intro') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Button onClick={startTest}>Start Assessment</Button>
      </div>
    )
  }

  // ==================== COMPLETED ====================
  if (testState === 'completed' && result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Test completed. Redirecting...</p>
      </div>
    )
  }

  // ==================== TESTING ====================
  const currentQuestion = questions[currentIndex]
  const progress = (currentIndex / questions.length) * 100

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">

        <div className="flex justify-between mb-4">
          <span>Question {currentIndex + 1}</span>
          <span>{timeLeft}s</span>
        </div>

        <Progress value={progress} />

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent>
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showFeedback}
                className="block w-full border p-3 mb-2 rounded"
              >
                {option}
              </button>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
