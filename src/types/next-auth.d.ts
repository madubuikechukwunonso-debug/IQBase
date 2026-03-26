import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";           // required for admin checks
      subscriptionTier?: "FREE" | "PREMIUM";
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: "USER" | "ADMIN";             // required for admin checks
    subscriptionTier?: "FREE" | "PREMIUM";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "USER" | "ADMIN";             // required for admin checks
    subscriptionTier?: "FREE" | "PREMIUM";
  }
}
