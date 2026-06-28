"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthActions } from "@insforge/sdk/ssr";

type Provider = "google" | "github";

const OAUTH_VERIFIER_COOKIE = "insforge_oauth_verifier";

// OAuth init and sign-out always redirect, so they do not follow the
// { success, error } return convention used by data-mutation actions.
export async function signInWithProvider(provider: Provider): Promise<void> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const host = headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  const origin = `${protocol}://${host}`;

  const auth = createAuthActions({ cookies: cookieStore });

  const { data, error } = await auth.signInWithOAuth(provider, {
    redirectTo: `${origin}/auth/callback`,
    skipBrowserRedirect: true,
    ...(provider === "google"
      ? { additionalParams: { prompt: "select_account" } }
      : {}),
  });

  if (error || !data.url) {
    console.error("[actions/auth] signInWithOAuth", error);
    redirect("/login?error=oauth_init");
  }

  if (data.codeVerifier) {
    cookieStore.set(OAUTH_VERIFIER_COOKIE, data.codeVerifier, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10,
    });
  }

  redirect(data.url);
}

export async function signOut(): Promise<void> {
  const cookieStore = await cookies();
  const auth = createAuthActions({ cookies: cookieStore });
  await auth.signOut();
  redirect("/login");
}
