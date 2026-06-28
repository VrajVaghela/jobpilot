import { NextResponse, type NextRequest } from "next/server";
import { createAuthActions } from "@insforge/sdk/ssr";

const OAUTH_VERIFIER_COOKIE = "insforge_oauth_verifier";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const code = url.searchParams.get("insforge_code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=oauth", url.origin));
  }

  const codeVerifier = request.cookies.get(OAUTH_VERIFIER_COOKIE)?.value;

  const response = NextResponse.redirect(new URL("/dashboard", url.origin));

  const auth = createAuthActions({
    requestCookies: request.cookies,
    responseCookies: response.cookies,
  });

  const { error } = await auth.exchangeOAuthCode(code, codeVerifier);

  response.cookies.delete(OAUTH_VERIFIER_COOKIE);

  if (error) {
    console.error("[auth/callback]", error);
    return NextResponse.redirect(new URL("/login?error=oauth", url.origin));
  }

  return response;
}
