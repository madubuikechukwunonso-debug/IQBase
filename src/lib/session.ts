import { cookies } from "next/headers";
import { cache } from "react";
import { auth } from "./auth";

export const getSession = cache(async () => {
  const sessionId = cookies().get(auth.sessionCookieName)?.value ?? null;
  if (!sessionId) return null;
  const { session, user } = await auth.validateSession(sessionId);
  return { session, user };
});

export const getUser = cache(async () => {
  const sessionData = await getSession();
  return sessionData?.user ?? null;
});
