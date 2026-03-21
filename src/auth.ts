// src/auth.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma"; // assumes you have this exported
import bcrypt from "bcryptjs";

import type { Adapter } from "next-auth/adapters";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
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

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? null,
        };
      },
    }),
    // Optional: add Google, GitHub, etc. later
    // GoogleProvider({ clientId: ..., clientSecret: ... }),
  ],
  session: {
    strategy: "jwt", // works well with adapter too
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // create this page if needed
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET, // must be set in .env
});
