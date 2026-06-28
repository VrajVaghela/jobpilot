import { createInsforgeServer } from "@/lib/insforge-server";
import { signOut } from "@/actions/auth";

export default async function DashboardPage() {
  const insforge = await createInsforgeServer();
  const {
    data: { user },
  } = await insforge.auth.getCurrentUser();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 text-center shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
        <h1 className="text-xl font-semibold text-text-primary">Dashboard</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Signed in as{" "}
          <span className="font-medium text-text-primary">{user?.email}</span>
        </p>
        <form action={signOut} className="mt-6">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
