import { lucia } from "lucia";
import { nextjs } from "lucia/middleware";
import { prisma } from "@lucia-auth/adapter-prisma";
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

export const auth = lucia({
  adapter: prisma(client),
  env: process.env.NODE_ENV === "development" ? "DEV" : "PROD",
  middleware: nextjs(),
  getUserAttributes: (data) => {
    return {
      email: data.email,
      name: data.name,
    };
  },
});

export type Auth = typeof auth;
