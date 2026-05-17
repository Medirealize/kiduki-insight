import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "admin_token";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /admin/login はそのまま通す
  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  // /admin/* はすべて認証チェック
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || token !== adminPassword) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
