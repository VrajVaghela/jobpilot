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

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Fetch completeness and statistics in parallel
  const [
    profileResult,
    totalJobsResult,
    scoresResult,
    researchedResult,
    jobsThisWeekResult,
  ] = await Promise.all([
    insforge.database
      .from("profiles")
      .select("is_complete")
      .eq("id", user.id)
      .maybeSingle(),
    insforge.database
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    insforge.database
      .from("jobs")
      .select("match_score")
      .eq("user_id", user.id),
    insforge.database
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .not("company_research", "is", null),
    insforge.database
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("found_at", sevenDaysAgo.toISOString()),
  ]);

  if (profileResult.error) {
    console.error("[DashboardPage] Error fetching profile completeness:", profileResult.error);
  }
  if (totalJobsResult.error) {
    console.error("[DashboardPage] Error fetching total jobs count:", totalJobsResult.error);
  }
  if (scoresResult.error) {
    console.error("[DashboardPage] Error fetching job scores:", scoresResult.error);
  }
  if (researchedResult.error) {
    console.error("[DashboardPage] Error fetching researched companies count:", researchedResult.error);
  }
  if (jobsThisWeekResult.error) {
    console.error("[DashboardPage] Error fetching jobs this week count:", jobsThisWeekResult.error);
  }

  const isProfileComplete = profileResult.data?.is_complete || false;
  const totalJobsFound = totalJobsResult.count || 0;
  const companiesResearched = researchedResult.count || 0;
  const jobsThisWeek = jobsThisWeekResult.count || 0;

  // Calculate average match rate
  const scoreData = scoresResult.data || [];
  const validScores = scoreData
    .map((j) => j.match_score)
    .filter((s): s is number => s !== null && s !== undefined);
  const avgMatchRate = validScores.length > 0
    ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
    : 0;

  const stats = {
    totalJobsFound,
    avgMatchRate,
    companiesResearched,
    jobsThisWeek,
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <DashboardClient 
          userEmail={user.email} 
          isProfileComplete={isProfileComplete} 
          stats={stats}
        />
      </main>
      <Footer />
    </>
  );
}
