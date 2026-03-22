export const dynamic = 'force-dynamic'
"use client"

import { useState, useEffect, useCallback } from "react"
import { Brain, Timer, Trophy, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { questions as allQuestions } from "@/data/questions"
import { calculateScore } from "@/lib/scoring"
import { Answer, Question, TestResult } from "@/types"
import { shuffleArray } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

const QUESTION_COUNT = 20

export default function TestPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [testState, setTestState] = useState<'intro' | 'testing' | 'completed'>('intro')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)

  // Auto-redirect after completion
  useEffect(() => {
    if (testState !== 'completed' || !result) return
    if (status === "loading") return

    if (status === "authenticated" && session?.user) {
      const resultString = encodeURIComponent(JSON.stringify(result))
      router.push(`/pricing?result=${resultString}`)
    } else {
      router.push("/register?callbackUrl=/test")
    }
  }, [testState, result, status, session, router])

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

  // Timer
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

  const handleAnswerSelect = (index: number) => {
    if (showFeedback) return
    setSelectedAnswer(index)
    handleAnswerSubmit(index)
  }

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
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Brain className="w-16 h-16 mx-auto mb-6 text-primary" />
            <CardTitle className="text-3xl">IQBase Cognitive Assessment</CardTitle>
            <p className="text-muted-foreground mt-2">20 questions • ~15 minutes</p>
          </CardHeader>
          <CardContent>
            <Button onClick={startTest} size="lg" className="w-full text-lg">
              Start the Test
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ==================== COMPLETED ====================
  if (testState === 'completed' && result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-500" />
            <CardTitle className="text-3xl">Test Complete!</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => {
                const resultString = encodeURIComponent(JSON.stringify(result))
                router.push(`/pricing?result=${resultString}`)
              }}
              size="lg"
              className="w-full"
            >
              Unlock Full Results →
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ==================== ACTIVE TEST ====================
  const currentQuestion = questions[currentIndex]
  if (!currentQuestion) return null

  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="max-w-3xl mx-auto p-6 pt-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div className="text-lg font-medium">
          Question {currentIndex + 1} of {questions.length}
        </div>
        <div className="flex items-center gap-2 font-mono text-xl font-semibold">
          <Timer className="w-5 h-5" /> {timeLeft}s
        </div>
      </div>

      <Progress value={progress} className="mb-10 h-2" />

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl leading-relaxed text-center">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index
            const isCorrect = index === currentQuestion.correctAnswer
            const isWrongSelected = showFeedback && isSelected && !isCorrect

            let buttonClass = "w-full text-left p-6 rounded-3xl border-2 text-lg font-medium transition-all duration-200"

            if (showFeedback) {
              if (isCorrect) {
                buttonClass += " bg-green-100 dark:bg-green-900 border-green-500 text-green-700 dark:text-green-300"
              } else if (isWrongSelected) {
                buttonClass += " bg-red-100 dark:bg-red-900 border-red-500 text-red-700 dark:text-red-300"
              } else {
                buttonClass += " border-gray-200 dark:border-gray-700 opacity-60"
              }
            } else if (isSelected) {
              buttonClass += " bg-indigo-100 dark:bg-indigo-900 border-indigo-600 text-indigo-700 dark:text-indigo-300 scale-[1.02]"
            } else {
              buttonClass += " border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-800"
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
                    <div>
                      {isCorrect && <CheckCircle className="w-6 h-6 text-green-600" />}
                      {isWrongSelected && <XCircle className="w-6 h-6 text-red-600" />}
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </CardContent>
      </Card>

      {showFeedback && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Next question loading in 1.6 seconds...
        </div>
      )}
    </div>
  )
}
