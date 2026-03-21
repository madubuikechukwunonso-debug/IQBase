import { Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { nextjs_future } from "lucia";
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

// Create the Prisma adapter – pass the session and user models explicitly
const adapter = new PrismaAdapter(client.session, client.user);

export const auth = new Lucia(adapter, {
  env: process.env.NODE_ENV === "development" ? "DEV" : "PROD",
  middleware: nextjs_future(),
  sessionCookie: {
    // Recommended for Next.js: don't set expiry on cookie itself
    expires: false,
    // Optional: secure in production
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (data) => {
    return {
      email: data.email,
      name: data.name,
    };
  },
});

// Required type augmentation for Lucia v3 (fixes typing for session/user)
declare module "lucia" {
  interface Register {
    Lucia: typeof auth;
  }
}
