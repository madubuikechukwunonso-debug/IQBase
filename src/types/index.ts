export interface Question {
  id: string
  type: 'logical' | 'pattern' | 'numerical' | 'verbal'
  difficulty: 1 | 2 | 3 | 4 | 5
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  timeLimit: number // in seconds
  imageUrl?: string
}

export interface Answer {
  questionId: string
  selectedAnswer: number
  timeSpent: number // in milliseconds
  isCorrect: boolean
}

export interface TestSession {
  id: string
  email?: string
  answers: Answer[]
  currentQuestionIndex: number
  startTime: number
  endTime?: number
  score?: number
  percentile?: number
  categoryScores?: CategoryScores
  isCompleted: boolean
  hasPaid: boolean
  paymentTier?: 'basic' | 'premium'
}

export interface CategoryScores {
  logical: number
  pattern: number
  numerical: number
  speed: number
}

export interface TestResult {
  score: number
  percentile: number
  category: string
  categoryDescription: string
  categoryColor: string
  categoryScores: CategoryScores
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}

export interface User {
  id: string
  email: string
  name?: string
  createdAt: Date
  tests: TestSession[]
}

export interface PricingTier {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  isPopular?: boolean
}

export interface Testimonial {
  id: string
  name: string
  role: string
  avatar?: string
  content: string
  rating: number
}

export interface Feature {
  id: string
  title: string
  description: string
  icon: string
}
