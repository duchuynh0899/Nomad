// app/api/auth/refresh-token/route.ts
// Route literal (không phải catch-all) — Next.js ưu tiên route cụ thể hơn [...nextauth].
// Đọc refresh_token đã "relay" từ lib/auth.ts (xem RELAYED_REFRESH_COOKIE), gọi
// POST /auth/refresh ở backend kèm cookie đó, rồi relay lại Set-Cookie mới.
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { RELAYED_REFRESH_COOKIE } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/api/http";
import type { AuthResponse } from "@/types/api";

export async function POST() {
  const cookieStore = await cookies();
  const relayedToken = cookieStore.get(RELAYED_REFRESH_COOKIE)?.value;

  if (!relayedToken) {
    return NextResponse.json({ message: "Không có phiên đăng nhập để làm mới" }, { status: 401 });
  }

  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { Cookie: `refresh_token=${relayedToken}` },
  });

  if (!res.ok) {
    cookieStore.delete(RELAYED_REFRESH_COOKIE);
    return NextResponse.json({ message: "Phiên đăng nhập đã hết hạn" }, { status: 401 });
  }

  const setCookie = res.headers.get("set-cookie");
  const match = setCookie?.match(/refresh_token=([^;]+)/);
  if (match) {
    const maxAgeMatch = setCookie?.match(/Max-Age=(\d+)/i);
    cookieStore.set(RELAYED_REFRESH_COOKIE, match[1], {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
      maxAge: maxAgeMatch ? Number(maxAgeMatch[1]) : 60 * 60 * 24 * 30,
    });
  }

  const data = (await res.json()) as AuthResponse;
  return NextResponse.json({ accessToken: data.accessToken, user: data.user });
}
