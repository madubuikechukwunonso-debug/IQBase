import { Answer, Question, CategoryScores, TestResult } from '@/types';
import { calculatePercentile, getScoreCategory, getTimeBonus } from './utils';

interface ScoringConfig {
  baseScore: number;
  difficultyWeight: number;
  speedWeight: number;
  minScore: number;
  maxScore: number;
  targetMean: number;
  targetStdDev: number;
}

const DEFAULT_CONFIG: ScoringConfig = {
  baseScore: 85,
  difficultyWeight: 8,
  speedWeight: 0.3,
  minScore: 70,
  maxScore: 145,
  targetMean: 100,
  targetStdDev: 15,
};

export function calculateScore(
  answers: Answer[],
  questions: Question[],
  config: ScoringConfig = DEFAULT_CONFIG,
): TestResult {
  // Calculate raw score with difficulty and speed bonuses
  let rawScore = 0;
  let maxPossibleScore = 0;

  const categoryStats: Record<
    string,
    { correct: number; total: number; timeBonus: number }
  > = {
    logical: { correct: 0, total: 0, timeBonus: 0 },
    pattern: { correct: 0, total: 0, timeBonus: 0 },
    numerical: { correct: 0, total: 0, timeBonus: 0 },
    speed: { correct: 0, total: 0, timeBonus: 0 },
  };

  answers.forEach((answer) => {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) return;

    const category = question.type;

    // Only count categories we actually track
    if (category in categoryStats) {
      categoryStats[category].total++;
    }

    maxPossibleScore += config.difficultyWeight * question.difficulty;

    if (answer.isCorrect) {
      // Base points for correct answer
      const basePoints = config.difficultyWeight * question.difficulty;
      // Time bonus for quick answers
      const timeBonus =
        getTimeBonus(answer.timeSpent, question.timeLimit * 1000) * basePoints;

      rawScore += basePoints + timeBonus;

      if (category in categoryStats) {
        categoryStats[category].correct++;
        categoryStats[category].timeBonus += timeBonus;
      }
    }
  });

  // Calculate accuracy percentage
  const accuracy = maxPossibleScore > 0 ? rawScore / maxPossibleScore : 0;

  // Convert to IQ-like scale (mean 100, std dev 15)
  const normalizedScore =
    config.baseScore + accuracy * (config.maxScore - config.baseScore);

  // Apply small randomization to simulate real test variance (±5 points)
  const variance = (Math.random() - 0.5) * 10;

  // Final score within bounds
  const finalScore = Math.round(
    Math.max(config.minScore, Math.min(config.maxScore, normalizedScore + variance)),
  );

  // Calculate percentile
  const percentile = calculatePercentile(finalScore);

  // Calculate category scores (0-100 scale)
  const categoryScores: CategoryScores = {
    logical: Math.round(
      (categoryStats.logical.correct / Math.max(1, categoryStats.logical.total)) * 100,
    ),
    pattern: Math.round(
      (categoryStats.pattern.correct / Math.max(1, categoryStats.pattern.total)) * 100,
    ),
    numerical: Math.round(
      (categoryStats.numerical.correct / Math.max(1, categoryStats.numerical.total)) * 100,
    ),
    speed: calculateSpeedScore(answers, questions),
  };

  // Get category info
  const categoryInfo = getScoreCategory(finalScore);

  // Generate strengths and weaknesses
  const { strengths, weaknesses } = analyzePerformance(categoryScores, categoryStats);

  // Generate recommendations
  const recommendations = generateRecommendations(categoryScores, strengths, weaknesses);

  return {
    score: finalScore,
    percentile,
    category: categoryInfo.label,
    categoryDescription: categoryInfo.description,
    categoryColor: categoryInfo.color,
    categoryScores,
    strengths,
    weaknesses,
    recommendations,
  };
}

function calculateSpeedScore(answers: Answer[], questions: Question[]): number {
  if (answers.length === 0) return 0;

  const speedScores = answers.map((answer) => {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) return 0;

    const timeLimit = question.timeLimit * 1000;
    const timeRatio = Math.min(1, answer.timeSpent / timeLimit);

    // Faster answers get higher scores
    return Math.round((1 - timeRatio) * 100);
  });

  return Math.round(
    speedScores.reduce((a, b) => a + b, 0) / speedScores.length,
  );
}

function analyzePerformance(
  categoryScores: CategoryScores,
  categoryStats: Record<string, { correct: number; total: number; timeBonus: number }>,
): { strengths: string[]; weaknesses: string[] } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // Analyze each category
  if (categoryScores.logical >= 70) {
    strengths.push('Logical Reasoning');
  } else if (categoryScores.logical < 50) {
    weaknesses.push('Logical Reasoning');
  }

  if (categoryScores.pattern >= 70) {
    strengths.push('Pattern Recognition');
  } else if (categoryScores.pattern < 50) {
    weaknesses.push('Pattern Recognition');
  }

  if (categoryScores.numerical >= 70) {
    strengths.push('Numerical Reasoning');
  } else if (categoryScores.numerical < 50) {
    weaknesses.push('Numerical Reasoning');
  }

  if (categoryScores.speed >= 70) {
    strengths.push('Processing Speed');
  } else if (categoryScores.speed < 50) {
    weaknesses.push('Processing Speed');
  }

  return { strengths, weaknesses };
}

function generateRecommendations(
  categoryScores: CategoryScores,
  strengths: string[],
  weaknesses: string[],
): string[] {
  const recommendations: string[] = [];

  // Add recommendations based on weaknesses
  if (weaknesses.includes('Logical Reasoning')) {
    recommendations.push(
      'Practice syllogisms and logical deduction puzzles to strengthen your reasoning skills.',
    );
  }
  if (weaknesses.includes('Pattern Recognition')) {
    recommendations.push(
      'Engage in activities like Sudoku, chess, or sequence puzzles to improve pattern detection.',
    );
  }
  if (weaknesses.includes('Numerical Reasoning')) {
    recommendations.push(
      'Work on mental math exercises and percentage calculations to boost numerical fluency.',
    );
  }
  if (weaknesses.includes('Processing Speed')) {
    recommendations.push(
      'Try timed quizzes and quick-response games to increase your cognitive processing speed.',
    );
  }

  // Add general recommendations
  if (recommendations.length === 0) {
    recommendations.push(
      'Excellent performance! Challenge yourself with more complex problems to continue growing.',
    );
  }

  recommendations.push(
    'Regular cognitive exercise, adequate sleep, and a healthy diet support optimal brain function.',
  );
  recommendations.push(
    'Consider exploring new learning domains to diversify your cognitive abilities.',
  );

  return recommendations.slice(0, 4);
}

export function getQuickFeedback(score: number): string {
  if (score >= 130) return 'Exceptional cognitive performance!';
  if (score >= 120) return 'Superior problem-solving abilities!';
  if (score >= 110) return 'Strong cognitive skills demonstrated!';
  if (score >= 90) return 'Solid cognitive performance!';
  if (score >= 80) return 'Good effort with room for growth!';
  return 'Keep practicing to improve your skills!';
}

export function getDetailedBreakdown(
  answers: Answer[],
  questions: Question[],
): {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
  fastestCategory: string;
  slowestCategory: string;
} {
  const totalQuestions = answers.length;
  const correctAnswers = answers.filter((a) => a.isCorrect).length;
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  const averageTime =
    totalQuestions > 0
      ? answers.reduce((sum, a) => sum + a.timeSpent, 0) / totalQuestions
      : 0;

  // Calculate average time per category
  const categoryTimes: Record<string, number[]> = {
    logical: [],
    pattern: [],
    numerical: [],
    speed: [],
  };

  answers.forEach((answer) => {
    const question = questions.find((q) => q.id === answer.questionId);
    if (question && question.type in categoryTimes) {
      categoryTimes[question.type].push(answer.timeSpent);
    }
  });

  const categoryAverages = Object.entries(categoryTimes)
    .map(([type, times]) => ({
      type,
      average: times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0,
    }))
    .filter((cat) => cat.average > 0); // only show categories that had questions

  categoryAverages.sort((a, b) => a.average - b.average);

  return {
    totalQuestions,
    correctAnswers,
    accuracy: Math.round(accuracy),
    averageTime: Math.round(averageTime / 1000), // in seconds
    fastestCategory: categoryAverages[0]?.type || 'N/A',
    slowestCategory:
      categoryAverages[categoryAverages.length - 1]?.type || 'N/A',
  };
}
