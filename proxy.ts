// proxy.ts — Next.js 16 (đổi tên từ middleware.ts, xem docs/upgrading/version-16)
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
    const role = req.nextauth.token?.role;

    if (isAdminRoute && role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/checkout/:path*", "/orders/:path*"],
};
