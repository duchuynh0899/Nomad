// types/next-auth.d.ts — mở rộng type Session/User/JWT để có role + accessToken (JWT của backend)
import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

type Role = "admin" | "customer";

declare module "next-auth" {
  interface Session {
    user: {
      role?: Role;
    } & DefaultSession["user"];
    accessToken?: string;
    error?: string;
  }

  interface User extends DefaultUser {
    role?: Role;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: Role;
    accessToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}
