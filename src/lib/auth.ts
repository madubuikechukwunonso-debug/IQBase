// src/auth.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter"; // ← note: @next-auth/... for v4 compatibility
import prisma from "@/lib/prisma"; // adjust path if your Prisma client is elsewhere
import bcrypt from "bcryptjs";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
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
          where: { email: credentials.email },
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.hashedPassword);

        if (!isValid) return null;

        return { id: user.id, email: user.email, name: user.name ?? null };
      },
    }),
    // Add GoogleProvider, GitHubProvider, etc. here later if needed
  ],
  session: {
    strategy: "jwt", // or "database" if you prefer adapter-managed sessions
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
        session.user.id = token.id; // string or number based on your Prisma id type
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // create this page if you don't have one
    error: "/auth/error", // optional
  },
  secret: process.env.NEXTAUTH_SECRET, // required – generate a strong one
};

export default NextAuth(authOptions);
