// src/types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;           // ← Add this (or number if your Prisma id is number)
    } & DefaultSession["user"];
  }

  // Optional: if you want to type the user object returned by authorize()
  interface User {
    id: string;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id: string;
  }
}
