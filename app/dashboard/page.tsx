import { redirect } from "next/navigation";
import { createInsforgeServer } from "@/lib/insforge-server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (seconds < 60) return "just now";
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

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

  // Fetch completeness, statistics, and recent activity feed in parallel
  const [
    profileResult,
    totalJobsResult,
    scoresResult,
    researchedResult,
    jobsThisWeekResult,
    recentRunsResult,
    recentResearchResult,
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
    insforge.database
      .from("agent_runs")
      .select("id, status, job_title_searched, started_at, jobs_found")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(10),
    insforge.database
      .from("jobs")
      .select("id, company, found_at")
      .eq("user_id", user.id)
      .not("company_research", "is", null)
      .order("found_at", { ascending: false })
      .limit(10),
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
  if (recentRunsResult.error) {
    console.error("[DashboardPage] Error fetching recent agent runs:", recentRunsResult.error);
  }
  if (recentResearchResult.error) {
    console.error("[DashboardPage] Error fetching recent researched jobs:", recentResearchResult.error);
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

  // Process activities
  const recentRuns = recentRunsResult.data || [];
  const recentResearch = recentResearchResult.data || [];

  interface ActivityItem {
    id: string;
    type: "found" | "researched" | "failed" | "running";
    text: string;
    timestamp: string;
    rawDate: Date;
  }

  const activities: ActivityItem[] = [];

  // Add agent runs
  recentRuns.forEach((run) => {
    let text = "";
    let type: "found" | "failed" | "running" = "found";

    if (run.status === "completed") {
      text = `Found ${run.jobs_found || 0} matching jobs for "${run.job_title_searched}"`;
      type = "found";
    } else if (run.status === "failed") {
      text = `Job discovery failed for "${run.job_title_searched}"`;
      type = "failed";
    } else {
      text = `Searching jobs for "${run.job_title_searched}"...`;
      type = "running";
    }

    activities.push({
      id: run.id,
      type,
      text,
      timestamp: run.started_at ? formatTimeAgo(run.started_at) : "",
      rawDate: new Date(run.started_at || new Date()),
    });
  });

  // Add company research entries
  recentResearch.forEach((job) => {
    activities.push({
      id: job.id,
      type: "researched",
      text: `Researched ${job.company}`,
      timestamp: job.found_at ? formatTimeAgo(job.found_at) : "",
      rawDate: new Date(job.found_at || new Date()),
    });
  });

  // Merge and sort all by timestamp descending, limit to top 5
  const sortedActivities = activities
    .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime())
    .slice(0, 5)
    .map(({ id, type, text, timestamp }) => ({ id, type, text, timestamp }));

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <DashboardClient 
          userEmail={user.email} 
          isProfileComplete={isProfileComplete} 
          stats={stats}
          activities={sortedActivities}
        />
      </main>
      <Footer />
    </>
  );
}
