import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const COOKIE_NAME = "admin_token";
const ADMIN_EMAIL = "nomshin1983jp@gmail.com";

const intlMiddleware = createIntlMiddleware(routing);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /ja/admin/* など locale 付き admin URL → /admin/* へ
  const localeAdmin = pathname.match(/^\/(ja|en)(\/admin(?:\/.*)?)$/);
  if (localeAdmin) {
    return NextResponse.redirect(new URL(localeAdmin[2], req.url));
  }

  // 管理者ルート: next-intl を通さず独自認証チェック
  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  // Supabase OAuth / マジックリンクのコールバック（locale プレフィックス不要）
  if (pathname.startsWith("/auth")) return NextResponse.next();

  if (pathname.startsWith("/admin")) {
    const res = NextResponse.next();
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

    const token = req.cookies.get(COOKIE_NAME)?.value;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminPassword && token === adminPassword) return NextResponse.next();

    return NextResponse.redirect(new URL("/", req.url));
  }

  // API ルート・静的ファイルは next-intl をスキップ
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(ico|png|svg|jpg|jpeg|webp|css|js|woff2?)$/)
  ) {
    return NextResponse.next();
  }

  // それ以外のページは next-intl のロケールルーティングを適用
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
  ],
};
