import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth/auth.config";

// Optimistic route protection only. Every protected page / handler must
// still verify the session itself (defence in depth).
const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const { nextUrl } = req;
  const user = req.auth?.user;
  const path = nextUrl.pathname;

  const isAdminArea = path === "/admin" || path.startsWith("/admin/");
  const isAdminApi = path.startsWith("/api/admin");
  const needsLogin = path === "/profile" || path === "/history" || path.startsWith("/history/");

  if (isAdminApi) {
    // APIs answer with status codes, not redirects.
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    return;
  }

  if ((needsLogin || isAdminArea) && !user) {
    const url = new URL("/login", nextUrl.origin);
    url.searchParams.set("callbackUrl", path + nextUrl.search);
    return NextResponse.redirect(url);
  }

  if (isAdminArea && user?.role !== "admin") {
    return NextResponse.redirect(new URL("/", nextUrl.origin));
  }
});

export const config = {
  matcher: ["/profile", "/history/:path*", "/admin/:path*", "/api/admin/:path*"],
};
