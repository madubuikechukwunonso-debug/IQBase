import { Question } from '@/types'

export const questions: Question[] = [
  // Logical Reasoning Questions
  {
    id: 'logic-1',
    type: 'logical',
    difficulty: 2,
    question: 'If all roses are flowers and some flowers fade quickly, then:',
    options: [
      'All roses fade quickly',
      'Some roses fade quickly',
      'No roses fade quickly',
      'Cannot be determined from the information given'
    ],
    correctAnswer: 3,
    explanation: 'We know all roses are flowers, but we don\'t know which flowers fade quickly. The statement only says "some" flowers fade quickly, not necessarily roses.',
    timeLimit: 45
  },
  {
    id: 'logic-2',
    type: 'logical',
    difficulty: 3,
    question: 'Complete the analogy: Book is to Reading as Fork is to ___',
    options: ['Cooking', 'Eating', 'Kitchen', 'Food'],
    correctAnswer: 1,
    explanation: 'A book is used for reading, just as a fork is used for eating.',
    timeLimit: 30
  },
  {
    id: 'logic-3',
    type: 'logical',
    difficulty: 4,
    question: 'If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?',
    options: ['5 minutes', '100 minutes', '20 minutes', '500 minutes'],
    correctAnswer: 0,
    explanation: 'Each machine takes 5 minutes to make one widget. 100 machines working simultaneously would each make one widget in 5 minutes.',
    timeLimit: 60
  },
  {
    id: 'logic-4',
    type: 'logical',
    difficulty: 3,
    question: 'A bat and a ball cost $11 in total. The bat costs $10 more than the ball. How much does the ball cost?',
    options: ['$1', '$0.50', '$1.50', '$0.10'],
    correctAnswer: 1,
    explanation: 'If the ball costs $0.50, then the bat costs $10.50 (which is $10 more). Together: $0.50 + $10.50 = $11.',
    timeLimit: 45
  },
  {
    id: 'logic-5',
    type: 'logical',
    difficulty: 4,
    question: 'In a lake, there is a patch of lily pads. Every day, the patch doubles in size. If it takes 48 days for the patch to cover the entire lake, how long would it take for the patch to cover half of the lake?',
    options: ['24 days', '47 days', '36 days', '46 days'],
    correctAnswer: 1,
    explanation: 'Since the patch doubles every day, it would be half the size one day before covering the entire lake. So 48 - 1 = 47 days.',
    timeLimit: 60
  },
  {
    id: 'logic-6',
    type: 'logical',
    difficulty: 2,
    question: 'Which word does not belong with the others?',
    options: ['Apple', 'Banana', 'Carrot', 'Orange'],
    correctAnswer: 2,
    explanation: 'Carrot is a vegetable, while the others are fruits.',
    timeLimit: 25
  },
  {
    id: 'logic-7',
    type: 'logical',
    difficulty: 3,
    question: 'If no musicians are astronauts and all astronauts are smart, then:',
    options: [
      'No musicians are smart',
      'Some smart people are not musicians',
      'All smart people are astronauts',
      'No astronauts are musicians'
    ],
    correctAnswer: 3,
    explanation: 'Since no musicians are astronauts, it follows that no astronauts are musicians (the relationship is mutual).',
    timeLimit: 50
  },
  {
    id: 'logic-8',
    type: 'logical',
    difficulty: 4,
    question: 'What is the next number in the sequence: 2, 6, 12, 20, 30, ___',
    options: ['40', '42', '44', '46'],
    correctAnswer: 1,
    explanation: 'The pattern is n×(n+1): 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30, so 6×7=42.',
    timeLimit: 45
  },

  // Pattern Recognition Questions
  {
    id: 'pattern-1',
    type: 'pattern',
    difficulty: 2,
    question: 'What comes next in the pattern: ○ △ □ ○ △ ___',
    options: ['○', '△', '□', '◇'],
    correctAnswer: 2,
    explanation: 'The pattern repeats: circle, triangle, square. After triangle comes square.',
    timeLimit: 20
  },
  {
    id: 'pattern-2',
    type: 'pattern',
    difficulty: 3,
    question: 'Complete the sequence: 1, 1, 2, 3, 5, 8, ___',
    options: ['11', '12', '13', '21'],
    correctAnswer: 2,
    explanation: 'This is the Fibonacci sequence. Each number is the sum of the two preceding ones: 5 + 8 = 13.',
    timeLimit: 30
  },
  {
    id: 'pattern-3',
    type: 'pattern',
    difficulty: 4,
    question: 'What is the next number: 2, 6, 18, 54, ___',
    options: ['108', '162', '216', '324'],
    correctAnswer: 1,
    explanation: 'Each number is multiplied by 3: 2×3=6, 6×3=18, 18×3=54, so 54×3=162.',
    timeLimit: 35
  },
  {
    id: 'pattern-4',
    type: 'pattern',
    difficulty: 3,
    question: 'Complete the pattern: A, C, E, G, ___',
    options: ['H', 'I', 'J', 'K'],
    correctAnswer: 1,
    explanation: 'The pattern skips every other letter: A (skip B) C (skip D) E (skip F) G (skip H) I.',
    timeLimit: 25
  },
  {
    id: 'pattern-5',
    type: 'pattern',
    difficulty: 5,
    question: 'What number should replace the question mark? 3, 11, 19, 27, ?',
    options: ['33', '35', '37', '39'],
    correctAnswer: 1,
    explanation: 'Each number increases by 8: 3+8=11, 11+8=19, 19+8=27, so 27+8=35.',
    timeLimit: 40
  },
  {
    id: 'pattern-6',
    type: 'pattern',
    difficulty: 4,
    question: 'Find the missing number: 4, 9, 16, 25, 36, ___',
    options: ['42', '45', '48', '49'],
    correctAnswer: 3,
    explanation: 'These are perfect squares: 2²=4, 3²=9, 4²=16, 5²=25, 6²=36, so 7²=49.',
    timeLimit: 35
  },
  {
    id: 'pattern-7',
    type: 'pattern',
    difficulty: 3,
    question: 'What comes next: Z, X, V, T, ___',
    options: ['R', 'S', 'Q', 'P'],
    correctAnswer: 0,
    explanation: 'Moving backwards through the alphabet, skipping every other letter: Z (skip Y) X (skip W) V (skip U) T (skip S) R.',
    timeLimit: 35
  },
  {
    id: 'pattern-8',
    type: 'pattern',
    difficulty: 4,
    question: 'Complete the sequence: 1, 4, 9, 16, 25, 36, ___',
    options: ['42', '45', '48', '49'],
    correctAnswer: 3,
    explanation: 'These are square numbers: 1², 2², 3², 4², 5², 6², so next is 7² = 49.',
    timeLimit: 30
  },

  // Numerical Reasoning Questions
  {
    id: 'num-1',
    type: 'numerical',
    difficulty: 2,
    question: 'If 3x + 7 = 22, what is the value of x?',
    options: ['3', '4', '5', '6'],
    correctAnswer: 2,
    explanation: '3x + 7 = 22 → 3x = 15 → x = 5',
    timeLimit: 35
  },
  {
    id: 'num-2',
    type: 'numerical',
    difficulty: 3,
    question: 'What is 25% of 80?',
    options: ['15', '18', '20', '22'],
    correctAnswer: 2,
    explanation: '25% = 1/4, so 80 ÷ 4 = 20.',
    timeLimit: 25
  },
  {
    id: 'num-3',
    type: 'numerical',
    difficulty: 4,
    question: 'A car travels 240 miles in 4 hours. What is its average speed?',
    options: ['50 mph', '55 mph', '60 mph', '65 mph'],
    correctAnswer: 2,
    explanation: 'Speed = Distance ÷ Time = 240 ÷ 4 = 60 mph.',
    timeLimit: 30
  },
  {
    id: 'num-4',
    type: 'numerical',
    difficulty: 3,
    question: 'If 8 workers can complete a job in 6 days, how many days would it take 12 workers?',
    options: ['3 days', '4 days', '5 days', '6 days'],
    correctAnswer: 1,
    explanation: 'Total work = 8 workers × 6 days = 48 worker-days. With 12 workers: 48 ÷ 12 = 4 days.',
    timeLimit: 50
  },
  {
    id: 'num-5',
    type: 'numerical',
    difficulty: 4,
    question: 'What is the next prime number after 23?',
    options: ['25', '27', '29', '31'],
    correctAnswer: 2,
    explanation: '29 is the next prime number after 23. 25 = 5×5, 27 = 3×9, and 31 comes after 29.',
    timeLimit: 35
  },
  {
    id: 'num-6',
    type: 'numerical',
    difficulty: 3,
    question: 'If a shirt costs $40 after a 20% discount, what was the original price?',
    options: ['$48', '$50', '$52', '$55'],
    correctAnswer: 1,
    explanation: 'If $40 is 80% of original price, then original = $40 ÷ 0.8 = $50.',
    timeLimit: 45
  },
  {
    id: 'num-7',
    type: 'numerical',
    difficulty: 5,
    question: 'What is the sum of all integers from 1 to 100?',
    options: ['4950', '5000', '5050', '5100'],
    correctAnswer: 2,
    explanation: 'Using the formula n(n+1)/2: 100×101/2 = 5050.',
    timeLimit: 60
  },
  {
    id: 'num-8',
    type: 'numerical',
    difficulty: 4,
    question: 'If 2^x = 32, what is x?',
    options: ['4', '5', '6', '7'],
    correctAnswer: 1,
    explanation: '2^5 = 32 (2×2×2×2×2 = 32).',
    timeLimit: 30
  },
  {
    id: 'num-9',
    type: 'numerical',
    difficulty: 3,
    question: 'What is 15% of 200?',
    options: ['25', '30', '35', '40'],
    correctAnswer: 1,
    explanation: '15% of 200 = 0.15 × 200 = 30.',
    timeLimit: 25
  },

  // Verbal Reasoning Questions
  {
    id: 'verbal-1',
    type: 'verbal',
    difficulty: 3,
    question: 'Choose the word that is most nearly opposite in meaning to "ABUNDANT":',
    options: ['Plentiful', 'Scarce', 'Generous', 'Wealthy'],
    correctAnswer: 1,
    explanation: 'Scarce means insufficient or in short supply, which is the opposite of abundant.',
    timeLimit: 30
  },
  {
    id: 'verbal-2',
    type: 'verbal',
    difficulty: 4,
    question: 'Which word best completes the sentence: "The scientist\'s ___ approach to research yielded groundbreaking results."',
    options: ['Haphazard', 'Methodical', 'Casual', 'Careless'],
    correctAnswer: 1,
    explanation: 'Methodical means systematic and orderly, which would lead to successful research.',
    timeLimit: 35
  },
  {
    id: 'verbal-3',
    type: 'verbal',
    difficulty: 3,
    question: 'Choose the synonym for "EPHEMERAL":',
    options: ['Eternal', 'Temporary', 'Permanent', 'Enduring'],
    correctAnswer: 1,
    explanation: 'Ephemeral means lasting for a very short time, similar to temporary.',
    timeLimit: 30
  }
]

export function getRandomQuestions(count: number = 20): Question[] {
  const shuffled = [...questions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export function getQuestionsByDifficulty(minDifficulty: number, maxDifficulty: number): Question[] {
  return questions.filter(q => q.difficulty >= minDifficulty && q.difficulty <= maxDifficulty)
}
