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
  Timer
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

const QUESTION_COUNT = 20
const WARNING_TIME = 10 // seconds

export default function TestPage() {
  const [testState, setTestState] = useState<'intro' | 'testing' | 'completed'>('intro')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
  const [startTime, setStartTime] = useState<number>(0)

  // Initialize test
  const startTest = useCallback(() => {
    const shuffled = shuffleArray(allQuestions).slice(0, QUESTION_COUNT)
    setQuestions(shuffled)
    setCurrentIndex(0)
    setAnswers([])
    setTestState('testing')
    setStartTime(Date.now())
    setTimeLeft(shuffled[0].timeLimit)
  }, [])

  // Timer effect
  useEffect(() => {
    if (testState !== 'testing' || showFeedback) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - auto-submit
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
    const timeSpent = (currentQuestion.timeLimit - timeLeft) * 1000

    const answer: Answer = {
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
      timeSpent,
      isCorrect: answerIndex === currentQuestion.correctAnswer,
    }

    setAnswers((prev) => [...prev, answer])
    setShowFeedback(true)

    // Move to next question after delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1)
        setTimeLeft(questions[currentIndex + 1].timeLimit)
        setSelectedAnswer(null)
        setShowFeedback(false)
      } else {
        // Test completed
        const testResult = calculateScore([...answers, answer], questions)
        setResult(testResult)
        setTestState('completed')
      }
    }, 1500)
  }

  // Get difficulty color
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'bg-green-500'
    if (difficulty <= 3) return 'bg-yellow-500'
    if (difficulty <= 4) return 'bg-orange-500'
    return 'bg-red-500'
  }

  // Get difficulty label
  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 2) return 'Easy'
    if (difficulty <= 3) return 'Medium'
    if (difficulty <= 4) return 'Hard'
    return 'Expert'
  }

  // Intro screen
  if (testState === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full"
        >
          <Card className="border-0 shadow-2xl">
            <CardHeader className="text-center pb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mx-auto mb-6">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl md:text-4xl font-bold">
                Cognitive Assessment
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Discover your cognitive strengths in just 15-20 minutes
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted">
                  <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="font-semibold">{QUESTION_COUNT} Questions</p>
                  <p className="text-sm text-muted-foreground">Carefully crafted</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="font-semibold">Timed</p>
                  <p className="text-sm text-muted-foreground">Test your speed</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <Timer className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="font-semibold">15-20 Minutes</p>
                  <p className="text-sm text-muted-foreground">Average completion</p>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">
                      Before You Start
                    </p>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                      <li>• Find a quiet place free from distractions</li>
                      <li>• Each question has a time limit</li>
                      <li>• You cannot pause the test once started</li>
                      <li>• Answer to the best of your ability</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button 
                size="xl" 
                variant="gradient" 
                className="w-full btn-shine"
                onClick={startTest}
              >
                Start Assessment
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By starting, you agree to our{" "}
                <Link href="/terms" className="underline hover:text-foreground">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:text-foreground">
                  Privacy Policy
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Test completed screen
  if (testState === 'completed' && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg w-full"
        >
          <Card className="border-0 shadow-2xl text-center">
            <CardHeader className="pb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mx-auto mb-6"
              >
                <Trophy className="w-12 h-12 text-white" />
              </motion.div>
              <CardTitle className="text-2xl md:text-3xl font-bold">
                Assessment Complete!
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Great job! You&apos;ve completed all {QUESTION_COUNT} questions.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10">
                <p className="text-sm text-muted-foreground mb-2">Your Cognitive Score</p>
                <p className="text-6xl font-bold gradient-text">{result.score}</p>
                <p className="text-lg text-muted-foreground mt-2">
                  {result.category}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Percentile</p>
                  <p className="text-2xl font-bold">{result.percentile}%</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Correct</p>
                  <p className="text-2xl font-bold">
                    {answers.filter(a => a.isCorrect).length}/{QUESTION_COUNT}
                  </p>
                </div>
              </div>

              <Link href={`/results?score=${result.score}&percentile=${result.percentile}&category=${encodeURIComponent(result.category)}`}>
                <Button size="xl" variant="gradient" className="w-full btn-shine">
                  View Full Results
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Testing screen
  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex) / questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="max-w-3xl mx-auto pt-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm">
                Question {currentIndex + 1} of {questions.length}
              </Badge>
              <Badge 
                variant="secondary" 
                className={`text-sm ${getDifficultyColor(currentQuestion.difficulty)} text-white`}
              >
                {getDifficultyLabel(currentQuestion.difficulty)}
              </Badge>
            </div>
            <div className={`flex items-center gap-2 text-lg font-mono font-bold ${
              timeLeft <= WARNING_TIME ? 'timer-urgent' : ''
            }`}>
              <Clock className="w-5 h-5" />
              {timeLeft}s
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="capitalize">
                    {currentQuestion.type} Reasoning
                  </Badge>
                </div>
                <CardTitle className="text-xl md:text-2xl leading-relaxed">
                  {currentQuestion.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {currentQuestion.options.map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showFeedback}
                      whileHover={!showFeedback ? { scale: 1.01 } : {}}
                      whileTap={!showFeedback ? { scale: 0.99 } : {}}
                      className={`
                        p-4 rounded-lg border-2 text-left text-lg transition-all
                        ${showFeedback && index === currentQuestion.correctAnswer
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : showFeedback && index === selectedAnswer && index !== currentQuestion.correctAnswer
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-border hover:border-primary/50 hover:bg-muted'
                        }
                        ${showFeedback ? 'cursor-default' : 'cursor-pointer'}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {showFeedback && index === currentQuestion.correctAnswer && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        {showFeedback && index === selectedAnswer && index !== currentQuestion.correctAnswer && (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Feedback */}
                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 p-4 rounded-lg bg-muted"
                  >
                    <p className="text-muted-foreground">
                      <strong>Explanation:</strong> {currentQuestion.explanation}
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
