// src/lib/auth.ts
import { Lucia, TimeSpan } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { cache } from "react";

const client = new PrismaClient();

// Create the Prisma adapter
const adapter = new PrismaAdapter(client.session, client.user);

// Create Lucia instance
export const lucia = new Lucia(adapter, {
  sessionCookie: {
    // Lucia v3: Use attributes directly
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  // Session expires in 30 days
  sessionExpiresIn: new TimeSpan(30, "d"),
  getUserAttributes: (attributes) => {
    return {
      email: attributes.email,
      name: attributes.name,
    };
  },
});

// Export auth helper for API routes
export const auth = {
  lucia,
  
  // Helper to create session
  async createSession(userId: string) {
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    return { session, sessionCookie };
  },

  // Helper to invalidate session
  async invalidateSession(sessionId: string) {
    await lucia.invalidateSession(sessionId);
    const blankCookie = lucia.createBlankSessionCookie();
    return { blankCookie };
  },

  // Validate session (for API routes)
  async validateSession(sessionId: string) {
    return await lucia.validateSession(sessionId);
  },
};

// Server-side auth validation (for Server Components)
export const validateRequest = cache(async () => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;
  
  if (!sessionId) {
    return { user: null, session: null };
  }

  const result = await lucia.validateSession(sessionId);
  
  // Refresh session if it's fresh
  try {
    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);
      cookieStore.set(
        sessionCookie.name, 
        sessionCookie.value, 
        sessionCookie.attributes
      );
    }
    if (!result.session) {
      const blankCookie = lucia.createBlankSessionCookie();
      cookieStore.set(
        blankCookie.name, 
        blankCookie.value, 
        blankCookie.attributes
      );
    }
  } catch {
    // Next.js throws error when setting cookies in Server Component
    // This is expected behavior
  }

  return result;
});

// Type augmentation for Lucia v3
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      email: string;
      name: string | null;
    };
  }
}
