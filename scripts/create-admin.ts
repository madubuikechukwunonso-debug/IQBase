import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    console.error("❌ ADMIN_EMAIL or ADMIN_PASSWORD is missing in environment variables!")
    process.exit(1)
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.upsert({
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

    console.log(`✅ Admin account created/updated successfully!`)
    console.log(`   Email    : ${user.email}`)
    console.log(`   Role     : ${user.role}`)
  } catch (error) {
    console.error("❌ Failed to create admin:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
