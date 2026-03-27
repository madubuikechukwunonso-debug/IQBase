// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import Credentials from "next-auth/providers/credentials"
import bcryptjs from "bcryptjs"
import type { JWT } from "next-auth/jwt"

const prisma = new PrismaClient()

const authOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user || !user.hashedPassword) return null

        const isValid = await bcryptjs.compare(
          credentials.password as string,
          user.hashedPassword
        )

        if (!isValid) return null

        return user
      }
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) token.role = user.role
      return token
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (session.user) (session.user as any).role = token.role
      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
