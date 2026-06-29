import { redirect } from "next/navigation";
import { createInsforgeServer } from "@/lib/insforge-server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SearchControls } from "@/components/find-jobs/SearchControls";
import { JobFilters } from "@/components/find-jobs/JobFilters";
import { JobsTable, JobRow } from "@/components/find-jobs/JobsTable";
import { JobsPagination } from "@/components/find-jobs/JobsPagination";

/**
 * Simple helper to format dates relative to now.
 */
function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  // Guard against future system times or small clock drift
  if (diffMs < 0) return "Just now";
  
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

interface PageProps {
  searchParams: Promise<{
    page?: string;
    sort?: string;
    match?: string;
    q?: string;
  }>;
}

export default async function FindJobsPage({ searchParams }: PageProps) {
  const insforge = await createInsforgeServer();
  const {
    data: { user },
    error: authError,
  } = await insforge.auth.getCurrentUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Resolve search parameters with fallback defaults
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1", 10);
  const sort = resolvedParams.sort || "score";
  const match = resolvedParams.match || "all";
  const q = resolvedParams.q || "";

  const itemsPerPage = 20;
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  // Build filtered and sorted query with exact count
  let query = insforge.database
    .from("jobs")
    .select("*", { count: "exact" })
    .eq("user_id", user.id);

  // Text search filter (company or title)
  if (q.trim()) {
    query = query.or(`title.ilike.%${q.trim()}%,company.ilike.%${q.trim()}%`);
  }

  // Match score category filters
  if (match === "strong") {
    query = query.gte("match_score", 85);
  } else if (match === "good") {
    query = query.gte("match_score", 70).lt("match_score", 85);
  }

  // Sorting
  if (sort === "score") {
    query = query.order("match_score", { ascending: false });
  } else if (sort === "newest") {
    query = query.order("found_at", { ascending: false });
  } else if (sort === "oldest") {
    query = query.order("found_at", { ascending: true });
  }

  // Range-based pagination
  query = query.range(from, to);

  const { data: dbJobs, error: dbJobsError, count: totalCount } = await query;

  if (dbJobsError) {
    console.error("[FindJobsPage] Error fetching jobs from database:", dbJobsError);
  }

  // Map database format to JobRow interface for display
  const jobs: JobRow[] = (dbJobs || []).map((job: any) => ({
    id: job.id,
    company: job.company || "Unknown Company",
    role: job.title || "Unknown Role",
    matchScore: job.match_score ?? 0,
    salaryEst: job.salary || "Not specified",
    dateFound: job.found_at ? timeAgo(job.found_at) : "Unknown",
  }));

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background px-6 py-8">
        <div className="mx-auto max-w-6xl flex flex-col gap-6">
          <SearchControls />
          <JobFilters />
          <JobsTable jobs={jobs} />
          <JobsPagination
            totalCount={totalCount ?? 0}
            itemsPerPage={itemsPerPage}
            currentPage={page}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}

