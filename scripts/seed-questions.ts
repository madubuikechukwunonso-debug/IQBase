// scripts/seed-questions.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding questions...')

  // Your existing questions will be inserted here automatically in the next step
  const questions = [
    // ... your current 25 questions will be added here by me in the next message
    // + 8 new graphical questions
  ]

  for (const q of questions) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: q,
    })
  }

  console.log('✅ Seeded', questions.length, 'questions!')
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
