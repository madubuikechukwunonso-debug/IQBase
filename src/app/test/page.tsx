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

export const dynamic = "force-dynamic"

const QUESTION_COUNT = 20
const WARNING_TIME = 10 // seconds

export default function TestPage() {
  const sessionData = useSession()
  const session = sessionData?.data ?? null
  const status = sessionData?.status ?? "loading"   // ← safe
  const router = useRouter()

  const [testState, setTestState] = useState<'intro' | 'testing' | 'completed'>('intro')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)

  // SAFE REDIRECT — waits for session to load (fixes the bug)
  useEffect(() => {
    if (testState !== 'completed' || !result) return
    if (status === "loading") return

    if (status === "authenticated") {
      const resultString = encodeURIComponent(JSON.stringify(result))
      router.push(`/pricing?result=${resultString}`)
    } else {
      router.push(`/register?callbackUrl=/test`)
    }
  }, [testState, result, status, router])

  // Loading screen while NextAuth checks login
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Preparing your IQ test...</p>
        </div>
      </div>
    )
  }

  // Initialize test
  const startTest = useCallback(() => {
    const shuffled = shuffleArray(allQuestions).slice(0, QUESTION_COUNT)
    setQuestions(shuffled)
    setCurrentIndex(0)
    setAnswers([])
    setTestState('testing')
    setTimeLeft(shuffled[0].timeLimit)
    setSelectedAnswer(null)
    setShowFeedback(false)
  }, [])

  // Timer effect
  useEffect(() => {
    if (testState !== 'testing' || showFeedback) return
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
  }, [testState, currentIndex, showFeedback])

  // Handle answer selection
  const handleAnswerSelect = (index: number) => {
    if (showFeedback) return
    setSelectedAnswer(index)
    handleAnswerSubmit(index)
  }

  // Handle answer submission
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
        setCurrentIndex((prev) => prev + 1)
        setTimeLeft(questions[currentIndex + 1].timeLimit)
        setSelectedAnswer(null)
        setShowFeedback(false)
      } else {
        const testResult = calculateScore(updatedAnswers, questions)
        setResult(testResult)
        setTestState('completed')
      }
    }, 1600)
  }

  // ==================== INTRO ====================
  if (testState === 'intro') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card>
          <CardHeader className="text-center">
            <Brain className="w-10 h-10 mx-auto mb-4" />
            <CardTitle>Cognitive Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={startTest} className="w-full">
              Start Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ==================== COMPLETED ====================
  if (testState === 'completed' && result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="text-center">
          <CardHeader>
            <Trophy className="w-10 h-10 mx-auto mb-4" />
            <CardTitle>Assessment Complete</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                const resultString = encodeURIComponent(JSON.stringify(result))
                router.push(`/pricing?result=${resultString}`)
              }}
            >
              Unlock Results
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ==================== ACTIVE TEST WITH HIGHLIGHTING ====================
  const currentQuestion = questions[currentIndex]
  if (!currentQuestion) return null
  const progress = (currentIndex / questions.length) * 100
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="mb-4 flex justify-between">
        <span>Question {currentIndex + 1}</span>
        <span>{timeLeft}s</span>
      </div>
      <Progress value={progress} />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index
            const isCorrect = index === currentQuestion.correctAnswer
            const isWrongSelected = showFeedback && isSelected && !isCorrect
            let buttonClass = "block w-full p-5 border-2 rounded-xl text-left text-lg font-medium transition-all duration-200"
            if (showFeedback) {
              if (isCorrect) {
                buttonClass += " bg-green-100 dark:bg-green-900 border-green-600 text-green-800 dark:text-green-200"
              } else if (isWrongSelected) {
                buttonClass += " bg-red-100 dark:bg-red-900 border-red-600 text-red-800 dark:text-red-200"
              } else {
                buttonClass += " border-gray-300 dark:border-gray-700 opacity-70"
              }
            } else if (isSelected) {
              buttonClass += " bg-indigo-100 dark:bg-indigo-900 border-indigo-600 text-indigo-700 dark:text-indigo-300 scale-[1.02]"
            } else {
              buttonClass += " border-gray-300 dark:border-gray-700 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            }
            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showFeedback}
                className={buttonClass}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showFeedback && (
                    <>
                      {isCorrect && <CheckCircle className="w-6 h-6 text-green-600" />}
                      {isWrongSelected && <XCircle className="w-6 h-6 text-red-600" />}
                    </>
                  )}
                </div>
              </button>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
