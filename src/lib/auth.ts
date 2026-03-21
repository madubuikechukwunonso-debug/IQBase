import { Lucia } from "lucia";                          // ← Capital L, and it's the class
import { PrismaAdapter } from "@lucia-auth/adapter-prisma"; // ← Use the class constructor
import { nextjs_future } from "lucia";                 // ← Direct from "lucia"
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

const adapter = new PrismaAdapter(client.session, client.user); // ← Required: pass session & user models

export const lucia = new Lucia(adapter, {
  env: process.env.NODE_ENV === "development" ? "DEV" : "PROD",
  middleware: nextjs_future(),
  sessionCookie: {
    expires: false, // Recommended for Next.js (no expiry on cookie)
  },
  getUserAttributes: (data) => {
    return {
      email: data.email,
      name: data.name,
    };
  },
});

// Type augmentation (required for getUser / session typing)
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
  }
}
