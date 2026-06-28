import { NextResponse, type NextRequest } from "next/server";
import { updateSession, type CookieStore } from "@insforge/sdk/ssr/middleware";

const PROTECTED_PREFIXES = ["/dashboard", "/profile", "/find-jobs"];

const ACCESS_TOKEN_COOKIE = "insforge_access_token";

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.next({ request });

  // Next's cookie stores match the SDK's documented updateSession usage; the
  // type mismatch is only an unused set() overload, so we cast to CookieStore.
  await updateSession({
    requestCookies: request.cookies as unknown as CookieStore,
    responseCookies: response.cookies as unknown as CookieStore,
  });

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected) {
    const hasSession =
      response.cookies.get(ACCESS_TOKEN_COOKIE)?.value ??
      request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

    if (!hasSession) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
