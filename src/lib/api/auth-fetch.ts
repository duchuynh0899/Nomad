"use client";

// lib/api/auth-fetch.ts — hook bọc quanh các API cần Bearer token.
// Access token của backend hết hạn sau 15 phút (JWT_ACCESS_EXPIRES_IN). Khi gặp 401,
// tự gọi /api/auth/refresh-token (dùng refresh_token đã relay, xem lib/auth.ts) để lấy
// accessToken mới, cập nhật session NextAuth rồi thử lại request 1 lần. Nếu refresh cũng
// thất bại thì đăng xuất và điều hướng về /login.
import { useCallback } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ApiError } from "./http";

export function useAuthFetch() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const authFetch = useCallback(
    async <T,>(fn: (token: string) => Promise<T>): Promise<T> => {
      const token = session?.accessToken as string | undefined;
      if (!token) {
        throw new ApiError(401, "Bạn cần đăng nhập để thực hiện thao tác này");
      }

      try {
        return await fn(token);
      } catch (err) {
        if (!(err instanceof ApiError) || err.statusCode !== 401) throw err;

        const refreshRes = await fetch("/api/auth/refresh-token", { method: "POST" });
        if (!refreshRes.ok) {
          await signOut({ redirect: false });
          router.push("/login?expired=1");
          throw err;
        }

        const { accessToken } = (await refreshRes.json()) as { accessToken: string };
        await update({ accessToken });
        return fn(accessToken);
      }
    },
    [session, update, router]
  );

  return { authFetch, accessToken: session?.accessToken as string | undefined };
}
