import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
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

// Đọc claim `exp` (giây, Unix time) từ payload JWT của backend mà không cần verify chữ ký —
// chỉ dùng để biết khi nào accessToken hết hạn, không dùng để xác thực.
function decodeAccessTokenExpiry(accessToken: string): number | undefined {
  try {
    const payload = accessToken.split(".")[1];
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: number };
    return exp ? exp * 1000 : undefined;
  } catch {
    return undefined;
  }
}

// Gọi lại backend bằng refresh_token đã relay (xem relayRefreshCookie) để lấy accessToken mới —
// dùng trong callback `jwt` để các Server Component (getServerSession) không bao giờ cầm accessToken
// đã hết hạn, khác với useAuthFetch (chỉ refresh khi gặp 401 ở phía client).
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const cookieStore = await cookies();
    const relayedToken = cookieStore.get(RELAYED_REFRESH_COOKIE)?.value;
    if (!relayedToken) throw new Error("Không có refresh token để làm mới");

    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { Cookie: `refresh_token=${relayedToken}` },
    });
    if (!res.ok) throw new Error("Làm mới accessToken thất bại");

    await relayRefreshCookie(res.headers.get("set-cookie"));
    const data = (await res.json()) as AuthResponse;

    return {
      ...token,
      accessToken: data.accessToken,
      accessTokenExpires: decodeAccessTokenExpiry(data.accessToken),
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
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
        token.accessTokenExpires = user.accessToken
          ? decodeAccessTokenExpiry(user.accessToken)
          : undefined;
        return token;
      }
      // Cho phép client cập nhật accessToken mới sau khi gọi /api/auth/refresh-token thành công:
      // useSession().update({ accessToken: "..." })
      if (trigger === "update" && session?.accessToken) {
        token.accessToken = session.accessToken;
        token.accessTokenExpires = decodeAccessTokenExpiry(session.accessToken);
        token.error = undefined;
        return token;
      }
      // Còn hạn (trừ hao 30s) — dùng lại luôn, không refresh mỗi request.
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires - 30_000) {
        return token;
      }
      // Hết hạn (hoặc không rõ hạn) và không phải lần đăng nhập/cập nhật vừa rồi — refresh trước khi
      // trả về, để getServerSession() ở Server Component luôn có accessToken còn dùng được.
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.accessToken = token.accessToken;
      }
      session.error = token.error;
      return session;
    },
  },
};
