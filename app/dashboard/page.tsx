import { redirect } from "next/navigation";
import { createInsforgeServer } from "@/lib/insforge-server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const insforge = await createInsforgeServer();
  const {
    data: { user },
    error: authError,
  } = await insforge.auth.getCurrentUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Fetch the user's profile to check completeness
  const { data: dbProfile, error: dbError } = await insforge.database
    .from("profiles")
    .select("is_complete")
    .eq("id", user.id)
    .maybeSingle();

  if (dbError) {
    console.error("[DashboardPage] Error fetching profile completeness:", dbError);
  }

  const isProfileComplete = dbProfile?.is_complete || false;

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <DashboardClient 
          userEmail={user.email} 
          isProfileComplete={isProfileComplete} 
        />
      </main>
      <Footer />
    </>
  );
}
