import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const COOKIE_NAME = "admin_token";
const ADMIN_EMAIL = "nomshin1983jp@gmail.com";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  if (pathname.startsWith("/admin")) {
    const res = NextResponse.next();

    // ① Supabase セッションのメールアドレスで管理者チェック
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll: () => req.cookies.getAll(),
            setAll: (list) =>
              list.forEach(({ name, value, options }) =>
                res.cookies.set(name, value, options)
              ),
          },
        }
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email === ADMIN_EMAIL) return res;
    } catch { /* ignore — fall through to password check */ }

    // ② 旧来のパスワードクッキー（後方互換）
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminPassword && token === adminPassword) return NextResponse.next();

    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
