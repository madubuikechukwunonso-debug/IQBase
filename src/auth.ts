// src/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";  // ← adjust path to your Prisma client

// IMPORTANT: Add this to .env.local (generate a strong one!)
//
// AUTH_SECRET=super-long-random-string (at least 32 chars)
// Tip: run `openssl rand -base64 33` in terminal

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        );

        if (!passwordsMatch) return null;

        // Return object that becomes the `token` & `session.user`
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? null,
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",      // your custom login page
    // error: "/auth/error",   // optional
  },

  session: {
    strategy: "jwt",       // simplest & works great on Vercel (no DB sessions needed)
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  secret: process.env.AUTH_SECRET,
});
