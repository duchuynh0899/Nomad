import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";
import { API_BASE_URL } from "@/lib/api/http";
import type { AuthResponse } from "@/types/api";

// Tên cookie FE tự đặt để "relay" refresh_token của backend (httpOnly trên domain backend,
// path=/auth) sang domain FE, dùng cho route /api/auth/refresh-token.
export const RELAYED_REFRESH_COOKIE = "nomad_rt";

async function relayRefreshCookie(setCookieHeader: string | null) {
  if (!setCookieHeader) return;
  const match = setCookieHeader.match(/refresh_token=([^;]+)/);
  const maxAgeMatch = setCookieHeader.match(/Max-Age=(\d+)/i);
  if (!match) return;

  try {
    const cookieStore = await cookies();
    cookieStore.set(RELAYED_REFRESH_COOKIE, match[1], {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
      maxAge: maxAgeMatch ? Number(maxAgeMatch[1]) : 60 * 60 * 24 * 30,
    });
  } catch {
    // cookies() chỉ ghi được trong request scope của route handler — bỏ qua nếu gọi ngoài scope đó
  }
}

// Gọi 1 trong các endpoint /auth/login | /auth/google | /auth/facebook — cả 3 trả về cùng
// shape AuthResponse (xem API_REFERENCE.md mục 2), nên dùng chung logic gọi + relay cookie + map user.
async function authenticateWithBackend(path: string, body: Record<string, string>) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const message = Array.isArray(errorBody?.message)
      ? errorBody.message.join(", ")
      : (errorBody?.message ?? "Đăng nhập thất bại");
    throw new Error(message);
  }

  await relayRefreshCookie(res.headers.get("set-cookie"));

  const data = (await res.json()) as AuthResponse;
  return {
    id: data.user.id,
    name: data.user.name,
    email: data.user.email,
    role: data.user.role,
    accessToken: data.accessToken,
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        return authenticateWithBackend("/auth/login", {
          email: credentials.email,
          password: credentials.password,
        });
      },
    }),
    // Google Identity Services trả về "credential" (idToken) ở client — xem SocialButtons.tsx.
    // Backend tự verify idToken với Google (audience = GOOGLE_CLIENT_ID), không cần redirect URI.
    CredentialsProvider({
      id: "google-idtoken",
      name: "Google",
      credentials: { idToken: { label: "idToken", type: "text" } },
      async authorize(credentials) {
        if (!credentials?.idToken) return null;
        return authenticateWithBackend("/auth/google", { idToken: credentials.idToken });
      },
    }),
    // Facebook Login JS SDK trả về "accessToken" ở client — xem SocialButtons.tsx.
    // Backend tự verify accessToken qua Graph API debug_token (audience = FACEBOOK_APP_ID).
    CredentialsProvider({
      id: "facebook-accesstoken",
      name: "Facebook",
      credentials: { accessToken: { label: "accessToken", type: "text" } },
      async authorize(credentials) {
        if (!credentials?.accessToken) return null;
        return authenticateWithBackend("/auth/facebook", { accessToken: credentials.accessToken });
      },
    }),
  ],
  pages: { signIn: "/login", newUser: "/register" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      // Cho phép client cập nhật accessToken mới sau khi gọi /api/auth/refresh-token thành công:
      // useSession().update({ accessToken: "..." })
      if (trigger === "update" && session?.accessToken) {
        token.accessToken = session.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
};
