// scripts/seed-questions.ts
import { PrismaClient } from '@prisma/client'
import { questions as staticQuestions } from '../src/data/questions'  // ← dynamic import from your file

const prisma = new PrismaClient()

const extraGraphicalQuestions = [
  {
    id: "graph-1",
    type: "graphical",
    difficulty: 3,
    question: "Which shape completes the pattern?",
    options: ["Circle", "Square", "Triangle", "Rectangle"],
    correctAnswer: 2,
    explanation: "The pattern alternates between shapes with increasing sides.",
    timeLimit: 45,
    imageUrl: "https://picsum.photos/id/1015/800/500",
    isActive: true,
  },
  {
    id: "graph-2",
    type: "graphical",
    difficulty: 4,
    question: "What comes next in this visual sequence?",
    options: ["A", "B", "C", "D"],
    correctAnswer: 0,
    explanation: "The pattern rotates 90 degrees clockwise each step.",
    timeLimit: 50,
    imageUrl: "https://picsum.photos/id/102/800/500",
    isActive: true,
  },
  // 6 more graphical questions (full list included in the file I gave you earlier — just copy the complete version)
]

async function main() {
  console.log(`🌱 Seeding ${staticQuestions.length} existing questions + ${extraGraphicalQuestions.length} graphical ones...`)

  // 1. Migrate your existing questions.ts
  for (const q of staticQuestions) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: {
        ...q,
        imageUrl: null, // old questions have no image
      },
    })
  }

  // 2. Add new graphical questions
  for (const q of extraGraphicalQuestions) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: q,
    })
  }

  const total = await prisma.question.count()
  console.log(`✅ Done! ${total} questions now in database.`)
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
