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

  // Fetch profile completeness, jobs, and recent runs in parallel (consolidated query strategy)
  const [
    profileResult,
    jobsResult,
    recentRunsResult,
  ] = await Promise.all([
    insforge.database
      .from("profiles")
      .select("is_complete")
      .eq("id", user.id)
      .maybeSingle(),
    insforge.database
      .from("jobs")
      .select("id, company, found_at, match_score, company_research")
      .eq("user_id", user.id),
    insforge.database
      .from("agent_runs")
      .select("id, status, job_title_searched, started_at, jobs_found")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(10),
  ]);

  if (profileResult.error) {
    console.error("[DashboardPage] Error fetching profile completeness:", profileResult.error);
  }
  if (jobsResult.error) {
    console.error("[DashboardPage] Error fetching jobs data:", jobsResult.error);
  }
  if (recentRunsResult.error) {
    console.error("[DashboardPage] Error fetching recent agent runs:", recentRunsResult.error);
  }

  const isProfileComplete = profileResult.data?.is_complete || false;
  const jobs = jobsResult.data || [];
  const totalJobsFound = jobs.length;
  
  // Filter jobs with company research complete
  const researchedJobs = jobs.filter((j) => j.company_research !== null);
  const companiesResearched = researchedJobs.length;

  // Filter jobs created within the last 7 days
  const jobsThisWeek = jobs.filter(
    (j) => j.found_at && new Date(j.found_at) >= sevenDaysAgo
  ).length;

  // Calculate average match rate
  const validScores = jobs
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
  
  // Sort researched jobs by found_at descending to get recent research activity
  const recentResearch = [...researchedJobs]
    .sort((a, b) => {
      const aTime = a.found_at ? new Date(a.found_at).getTime() : 0;
      const bTime = b.found_at ? new Date(b.found_at).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 10);

  interface ActivityItem {
    id: string;
    type: "found" | "researched" | "failed" | "running";
    text: string;
    timestamp: string;
    rawDate: Date;
  }

  const activities: ActivityItem[] = [];

  // Add agent runs to activities
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

  // Add company research entries to activities
  recentResearch.forEach((job) => {
    activities.push({
      id: job.id,
      type: "researched",
      text: `Researched ${job.company}`,
      timestamp: job.found_at ? formatTimeAgo(job.found_at) : "",
      rawDate: new Date(job.found_at || new Date()),
    });
  });

  // Merge and sort all activities by timestamp descending, limit to top 5
  const sortedActivities = activities
    .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime())
    .slice(0, 5)
    .map(({ id, type, text, timestamp }) => ({ id, type, text, timestamp }));

  // --- Compute 1. Jobs Found Over Time (Last 30 Days daily trend) ---
  const jobsFoundChartData: { day: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    jobsFoundChartData.push({ day: dateStr, count: 0 });
  }

  jobs.forEach((job) => {
    if (job.found_at) {
      const jobDate = new Date(job.found_at);
      const jobDateStr = jobDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const dayPoint = jobsFoundChartData.find((pt) => pt.day === jobDateStr);
      if (dayPoint) {
        dayPoint.count++;
      }
    }
  });

  // --- Compute 2. Match Score Distribution ---
  const matchScoreChartData = [
    { range: "50-60%", count: 0 },
    { range: "60-70%", count: 0 },
    { range: "70-80%", count: 0 },
    { range: "80-90%", count: 0 },
    { range: "90-100%", count: 0 },
  ];

  validScores.forEach((score) => {
    if (score >= 90 && score <= 100) {
      matchScoreChartData[4].count++;
    } else if (score >= 80 && score < 90) {
      matchScoreChartData[3].count++;
    } else if (score >= 70 && score < 80) {
      matchScoreChartData[2].count++;
    } else if (score >= 60 && score < 70) {
      matchScoreChartData[1].count++;
    } else {
      // Anything below 60% goes to 50-60% range (absorbed)
      matchScoreChartData[0].count++;
    }
  });

  // --- Compute 3. Company Research (Resume Tailoring) Activity ---
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const tailoringChartData = weekdays.map((day) => ({ day, count: 0 }));

  researchedJobs.forEach((job) => {
    if (job.found_at) {
      const date = new Date(job.found_at);
      let dayIndex = date.getDay() - 1; // 0 is Sunday, 1 is Monday, etc.
      if (dayIndex === -1) dayIndex = 6; // Map Sunday to index 6
      tailoringChartData[dayIndex].count++;
    }
  });

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <DashboardClient 
          userEmail={user.email} 
          isProfileComplete={isProfileComplete} 
          stats={stats}
          activities={sortedActivities}
          jobsFoundChartData={jobsFoundChartData}
          tailoringChartData={tailoringChartData}
          matchScoreChartData={matchScoreChartData}
        />
      </main>
      <Footer />
    </>
  );
}
