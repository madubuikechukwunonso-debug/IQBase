// src/app/test/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Timer,
  Trophy,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateScore } from "@/lib/scoring";
import { Answer, Question, TestResult } from "@/types";
import { shuffleArray } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const QUESTION_COUNT = 20;

export default function TestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [testState, setTestState] = useState<'intro' | 'testing' | 'completed'>('intro');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [testId, setTestId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // === AUTH PROTECTION ===
  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push(`/login?callbackUrl=/test`);
      return;
    }

    fetchQuestions();
  }, [session, status, router]);

  // Fetch questions
  const fetchQuestions = useCallback(async () => {
    try {
      const res = await fetch("/api/questions");
      const data = await res.json();
      const dbQuestions: Question[] = data.questions || [];

      if (dbQuestions.length > 0) {
        const shuffled = shuffleArray(dbQuestions).slice(0, QUESTION_COUNT);
        setQuestions(shuffled);
      } else {
        alert("No questions found in database. Please add some in the admin panel first.");
      }
    } catch (err) {
      console.error("Failed to fetch questions", err);
      alert("Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, []);

  const startTest = useCallback(() => {
    if (questions.length === 0) return;
    setCurrentIndex(0);
    setAnswers([]);
    setTestState('testing');
    setTimeLeft(questions[0].timeLimit);
    setSelectedAnswer(null);
    setShowFeedback(false);
  }, [questions]);

  // Timer
  useEffect(() => {
    if (testState !== 'testing' || showFeedback) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAnswerSubmit(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [testState, currentIndex, showFeedback]);

  const handleAnswerSelect = (index: number) => {
    if (showFeedback) return;
    setSelectedAnswer(index);
    handleAnswerSubmit(index);
  };

  const handleAnswerSubmit = (answerIndex: number) => {
    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return;

    const timeSpent = (currentQuestion.timeLimit - timeLeft) * 1000;

    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
      timeSpent,
      isCorrect: answerIndex === currentQuestion.correctAnswer,
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    setShowFeedback(true);

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setTimeLeft(questions[currentIndex + 1].timeLimit);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        const testResult = calculateScore(updatedAnswers, questions);
        setResult(testResult);
        setTestState('completed');
        saveTestToDB(updatedAnswers, testResult);
      }
    }, 1600);
  };

  const saveTestToDB = async (finalAnswers: Answer[], testResult: TestResult) => {
    try {
      const res = await fetch('/api/tests/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers, result: testResult }),
      });
      const data = await res.json();
      if (data.testId) {
        setTestId(data.testId);
      }
    } catch (err) {
      console.error('Failed to save test', err);
    }
  };

  // Redirect to pricing ONLY after we have a valid testId
  useEffect(() => {
    if (testState === 'completed' && result && testId) {
      router.push(`/pricing?testId=${testId}`);
    }
  }, [testState, result, testId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading your IQ test...</p>
        </div>
      </div>
    );
  }

  // INTRO SCREEN
  if (testState === 'intro') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 text-primary" />
            <CardTitle className="text-3xl">Cognitive Assessment</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={startTest} 
              className="w-full text-lg py-6" 
              disabled={questions.length === 0}
            >
              {questions.length === 0 ? "Loading questions..." : `Start ${QUESTION_COUNT}-Question Test`}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // COMPLETED SCREEN
  if (testState === 'completed' && result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="text-center max-w-md w-full">
          <CardHeader>
            <Trophy className="w-12 h-12 mx-auto mb-4 text-amber-500" />
            <CardTitle>Assessment Complete!</CardTitle>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Redirecting to pricing...
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return null;

  // MAIN TEST SCREEN
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="mb-4 flex justify-between text-sm">
        <span>Question {currentIndex + 1} of {questions.length}</span>
        <span className="flex items-center gap-1">
          <Timer className="w-4 h-4" />
          {timeLeft}s
        </span>
      </div>

      <Progress value={(currentIndex / questions.length) * 100} className="mb-6" />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl leading-relaxed">{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentQuestion.imageUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 shadow-inner"
            >
              <img
                src={currentQuestion.imageUrl}
                alt="Visual IQ Question"
                className="w-full h-auto max-h-[460px] object-contain mx-auto"
              />
            </motion.div>
          )}

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showFeedback}
                className={`w-full p-5 text-left border-2 rounded-2xl transition-all ${
                  selectedAnswer === index
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {showFeedback && (
        <p className="text-center text-sm text-muted-foreground mt-6">
          Next question in 1.6 seconds...
        </p>
      )}
    </div>
  );
}
