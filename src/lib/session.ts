import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { User } from "next-auth";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user ?? null;
}
