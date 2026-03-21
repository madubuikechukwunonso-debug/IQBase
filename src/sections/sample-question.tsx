"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Lightbulb, CheckCircle, XCircle, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const sampleQuestion = {
  question: "Complete the sequence: 2, 6, 12, 20, 30, ___",
  options: ["36", "40", "42", "48"],
  correctAnswer: 2, // Index of correct answer (42)
  explanation: "The pattern is n×(n+1): 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30, so 6×7=42.",
}

export function SampleQuestion() {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  const handleSelect = (index: number) => {
    if (showResult) return
    setSelectedAnswer(index)
    setShowResult(true)
  }

  const isCorrect = selectedAnswer === sampleQuestion.correctAnswer

  return (
    <section id="sample" className="py-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4">
            <Lightbulb className="w-4 h-4 mr-1" />
            Try It Now
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Sample <span className="gradient-text">Question</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Get a taste of what to expect in the full assessment
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-2 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">Pattern Recognition</Badge>
                <span className="text-sm text-muted-foreground">Difficulty: Medium</span>
              </div>
              <CardTitle className="text-xl md:text-2xl">
                {sampleQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {sampleQuestion.options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleSelect(index)}
                    disabled={showResult}
                    whileHover={!showResult ? { scale: 1.02 } : {}}
                    whileTap={!showResult ? { scale: 0.98 } : {}}
                    className={`
                      p-4 rounded-lg border-2 text-lg font-medium transition-all
                      ${showResult && index === sampleQuestion.correctAnswer
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : showResult && index === selectedAnswer && index !== sampleQuestion.correctAnswer
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : selectedAnswer === index
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted'
                      }
                      ${showResult ? 'cursor-default' : 'cursor-pointer'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {showResult && index === sampleQuestion.correctAnswer && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {showResult && index === selectedAnswer && index !== sampleQuestion.correctAnswer && (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              <AnimatePresence>
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={`p-4 rounded-lg mt-4 ${isCorrect ? 'bg-green-50 dark:bg-green-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-6 h-6 text-orange-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <p className={`font-semibold ${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'}`}>
                            {isCorrect ? 'Correct!' : 'Not quite right'}
                          </p>
                          <p className="text-muted-foreground mt-1">
                            {sampleQuestion.explanation}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 text-center">
                      <p className="text-muted-foreground mb-4">
                        Ready to test your full cognitive potential?
                      </p>
                      <a href="/test">
                        <Button size="lg" variant="gradient">
                          Start Full Assessment
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
