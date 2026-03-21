import { lucia } from "lucia";
import { prisma } from "@lucia-auth/adapter-prisma";
import { nextjs_future } from "lucia";  // ← Changed: import directly from "lucia" (no /middleware subpath)
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

export const auth = lucia({
  adapter: prisma(client),
  env: process.env.NODE_ENV === "development" ? "DEV" : "PROD",
  middleware: nextjs_future(),  // ← This is now correct
  getUserAttributes: (data) => {
    return {
      email: data.email,
      name: data.name,
    };
  },
});

export type Auth = typeof auth;
