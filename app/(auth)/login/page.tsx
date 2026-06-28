import Image from "next/image";
import Link from "next/link";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import logo from "@/public/logo.png";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
        <Link href="/" className="flex justify-center">
          <Image src={logo} alt="JobPilot" className="h-9 w-auto" priority />
        </Link>

        <div className="mt-6 text-center">
          <h1 className="text-xl font-semibold text-text-primary">
            Welcome to JobPilot
          </h1>
          <p className="mt-1.5 text-sm text-text-secondary">
            Sign in to find your next role
          </p>
        </div>

        {error ? (
          <p className="mt-6 rounded-md border border-error/30 bg-error/5 px-3 py-2 text-center text-sm text-error">
            Something went wrong signing you in. Please try again.
          </p>
        ) : null}

        <div className="mt-6">
          <OAuthButtons />
        </div>

        <p className="mt-6 text-center text-xs text-text-muted">
          By continuing you agree to JobPilot&apos;s Terms and Privacy Policy.
        </p>
      </div>
    </main>
  );
}
