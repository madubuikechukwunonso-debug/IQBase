import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export function calculatePercentile(score: number): number {
  // Approximate percentile based on IQ-like score (mean 100, sd 15)
  const zScore = (score - 100) / 15
  // Standard normal CDF approximation
  const percentile = 50 * (1 + erf(zScore / Math.sqrt(2)))
  return Math.round(Math.max(1, Math.min(99, percentile)))
}

function erf(x: number): number {
  // Error function approximation
  const sign = x >= 0 ? 1 : -1
  x = Math.abs(x)
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911
  const t = 1 / (1 + p * x)
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
  return sign * y
}

export function getScoreCategory(score: number): { label: string; description: string; color: string } {
  if (score >= 130) return {
    label: "Exceptional",
    description: "Your cognitive abilities are in the top 2% of the population.",
    color: "text-purple-500"
  }
  if (score >= 120) return {
    label: "Superior",
    description: "You demonstrate strong analytical and problem-solving abilities.",
    color: "text-blue-500"
  }
  if (score >= 110) return {
    label: "Above Average",
    description: "Your cognitive performance exceeds the general population average.",
    color: "text-green-500"
  }
  if (score >= 90) return {
    label: "Average",
    description: "Your cognitive abilities are within the typical range.",
    color: "text-yellow-500"
  }
  if (score >= 80) return {
    label: "Below Average",
    description: "There's room for improvement in certain cognitive areas.",
    color: "text-orange-500"
  }
  return {
    label: "Development Opportunity",
    description: "Consider practicing cognitive exercises to improve your skills.",
    color: "text-red-500"
  }
}

export function getTimeBonus(timeSpent: number, maxTime: number): number {
  // Calculate time bonus - faster answers get more points
  const timeRatio = 1 - (timeSpent / maxTime)
  return Math.max(0, timeRatio * 0.3) // Up to 30% bonus for speed
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
