// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import Credentials from "next-auth/providers/credentials"
import EmailProvider from "next-auth/providers/email"
import nodemailer from "nodemailer"
import bcryptjs from "bcryptjs"

const prisma = new PrismaClient()

// ← authOptions is now internal (not exported) → fixes the type error
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
        if (!user || !user.password || !user.emailVerified) return null
        const isValid = await bcryptjs.compare(credentials.password as string, user.password)
        return isValid ? user : null
      }
    }),

    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        const transport = nodemailer.createTransport({
          host: process.env.EMAIL_SERVER_HOST,
          port: Number(process.env.EMAIL_SERVER_PORT),
          auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
          },
        })

        const { host } = new URL(url)
        await transport.sendMail({
          to: email,
          from: process.env.EMAIL_FROM,
          subject: `Your magic link for IQBase`,
          html: `
            <div style="font-family: system-ui; max-width: 600px; margin: 40px auto; padding: 40px; background: #0a0a0a; color: white; border-radius: 16px;">
              <h1 style="font-size: 28px; margin-bottom: 8px;">Welcome to IQBase 👋</h1>
              <p style="font-size: 18px; color: #a3a3a3;">Click the button below to ${url.includes("verify") ? "verify your email and create your account" : "reset your password"}:</p>
              <a href="${url}" style="display: inline-block; margin: 24px 0; padding: 16px 32px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 9999px; font-weight: 600; font-size: 18px;">
                ${url.includes("verify") ? "Create my account" : "Reset password"}
              </a>
              <p style="color: #666; font-size: 14px;">Link expires in 15 minutes.</p>
              <p style="color: #666; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
            </div>
          `,
        })
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role
      return token
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = token.role
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
