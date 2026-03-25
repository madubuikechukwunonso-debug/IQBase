import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    console.log('⚠️  ADMIN_EMAIL or ADMIN_PASSWORD not set in environment variables.')
    return
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'ADMIN',
      hashedPassword,
    },
    create: {
      email,
      name: 'Admin',
      role: 'ADMIN',
      hashedPassword,
    },
  })

  console.log(`✅ Admin user ready: ${admin.email} (role: ADMIN)`)
}

createAdmin()
  .catch((e) => console.error('❌ Failed to create admin:', e))
  .finally(() => prisma.$disconnect())
