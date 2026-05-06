import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Foxy Refresh bug → browser treats malformed URL as a path on THIS host:
  // `/https:/www.example.com/checkout/…` or `/https://example.com/…`
  if (
    path.startsWith("/https:/") ||
    path.startsWith("/http:/") ||
    path.startsWith("/https://") ||
    path.startsWith("/http://")
  ) {
    let candidate = path.slice(1);
    candidate = candidate
      .replace(/^https:\/(?!\/)/i, "https://")
      .replace(/^http:\/(?!\/)/i, "http://");
    try {
      const dest = new URL(candidate);
      request.nextUrl.searchParams.forEach((v, k) => dest.searchParams.set(k, v));
      return NextResponse.redirect(dest.toString(), 308);
    } catch {
      // continue
    }
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const needsAuth =
    path.startsWith("/account") ||
    path === "/cart/redirect" ||
    path === "/cart/checkout";

  if (needsAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set(
      "returnTo",
      `${path}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on all app paths except static assets (refresh session + gate protected routes).
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
