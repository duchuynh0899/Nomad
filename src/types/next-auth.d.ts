// types/next-auth.d.ts — mở rộng type Session để có role
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role?: "admin" | "customer";
    } & DefaultSession["user"];
  }
}