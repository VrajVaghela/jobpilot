import { redirect } from "next/navigation";
import Link from "next/link";
import { createInsforgeServer } from "@/lib/insforge-server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/**
 * Simple helper to format dates relative to now.
 */
function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
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
  params: Promise<{
    id: string;
  }>;
}

export default async function JobDetailPage({ params }: PageProps) {
  const insforge = await createInsforgeServer();
  const {
    data: { user },
    error: authError,
  } = await insforge.auth.getCurrentUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { id } = await params;

  // Retrieve the job record and verify ownership
  const { data: job, error: dbError } = await insforge.database
    .from("jobs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (dbError || !job) {
    redirect("/find-jobs");
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background px-6 py-8">
        <div className="mx-auto max-w-4xl flex flex-col gap-6">
          {/* Back Navigation Link */}
          <div>
            <Link
              href="/find-jobs"
              className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-accent transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Back to Jobs
            </Link>
          </div>

          {/* Job Header Card */}
          <div className="w-full rounded-2xl border border-border bg-surface p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-secondary text-text-secondary">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-text-primary">{job.title || "Unknown Role"}</h1>
                <div className="flex items-center gap-2 mt-1 text-sm font-semibold text-text-secondary">
                  <span>{job.company || "Unknown Company"}</span>
                  <span className="text-text-muted">•</span>
                  <span className="inline-flex items-center rounded-full bg-success-light px-2.5 py-0.5 text-xs font-semibold text-success-foreground">
                    {job.match_score ?? 0}% Match Score
                  </span>
                </div>
              </div>
            </div>
            {job.external_apply_url || job.source_url ? (
              <a
                href={job.external_apply_url || job.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-bold text-text-primary shadow-sm hover:bg-surface-secondary transition-colors"
              >
                View Job Post
                <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            ) : null}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Salary Est */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success-light text-success-foreground">
                <span className="text-lg font-extrabold">$</span>
              </div>
              <div className="min-w-0">
                <div className="text-base font-bold text-text-primary truncate">{job.salary || "Not specified"}</div>
                <div className="text-[10px] font-bold tracking-wider text-text-secondary uppercase mt-0.5">SALARY EST.</div>
              </div>
            </div>

            {/* Location */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-info-light text-info-foreground">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-base font-bold text-text-primary truncate">{job.location || "Remote"}</div>
                <div className="text-[10px] font-bold tracking-wider text-text-secondary uppercase mt-0.5">LOCATION</div>
              </div>
            </div>

            {/* Job Type */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-light text-accent">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875A1.125 1.125 0 013.75 18.4V14.15M9 3.75h6a1.125 1.125 0 011.125 1.125v1.5H7.875v-1.5A1.125 1.125 0 019 3.75z" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-base font-bold text-text-primary truncate capitalize">{job.job_type || "—"}</div>
                <div className="text-[10px] font-bold tracking-wider text-text-secondary uppercase mt-0.5">JOB TYPE</div>
              </div>
            </div>

            {/* Date Found */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-base font-bold text-text-primary truncate">{job.found_at ? timeAgo(job.found_at) : "—"}</div>
                <div className="text-[10px] font-bold tracking-wider text-text-secondary uppercase mt-0.5">DATE FOUND</div>
              </div>
            </div>
          </div>

          {/* AI Match Reasoning */}
          <div className="w-full rounded-2xl border border-border bg-surface p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2.5 text-xs font-bold tracking-wider text-text-secondary uppercase">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L14.7 9.3L22 12L14.7 14.7L12 22L9.3 14.7L2 12L9.3 9.3L12 2Z" />
                </svg>
              </div>
              AI Match Reasoning
            </div>
            <p className="text-sm font-medium text-text-primary leading-relaxed">
              {job.match_reason || "No explanation provided."}
            </p>
          </div>

          {/* Required Skills vs Your Profile */}
          <div className="w-full rounded-2xl border border-border bg-surface p-6 shadow-sm flex flex-col gap-5">
            <div className="text-xs font-bold tracking-wider text-text-secondary uppercase">
              Required Skills VS Your Profile
            </div>
            
            <div>
              <div className="text-xs font-semibold text-text-secondary mb-2">You have</div>
              <div className="flex flex-wrap gap-2">
                {job.matched_skills && job.matched_skills.length > 0 ? (
                  job.matched_skills.map((skill: string) => (
                    <span key={skill} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
                      <svg className="w-3 h-3 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-text-muted">None specified</span>
                )}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-text-secondary mb-2">Gap skills</div>
              <div className="flex flex-wrap gap-2">
                {job.missing_skills && job.missing_skills.length > 0 ? (
                  job.missing_skills.map((skill: string) => (
                    <span key={skill} className="inline-flex items-center gap-1 rounded-full bg-accent-light px-3 py-1 text-xs font-semibold text-accent border border-accent-light shrink-0">
                      <svg className="w-2.5 h-2.5 text-accent shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-text-muted">None specified</span>
                )}
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="w-full rounded-2xl border border-border bg-surface p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 text-base font-bold text-text-primary">
              <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Job Description
            </div>
            
            <div className="relative">
              <div className="text-sm font-medium text-text-primary leading-relaxed whitespace-pre-wrap pb-6">
                {job.about_role || "No description provided."}
              </div>
              {/* Fade out gradient at the bottom of the snippet container */}
              <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-surface to-transparent pointer-events-none" />
            </div>

            {(job.external_apply_url || job.source_url) && (
              <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-xs font-semibold text-text-secondary">
                  Showing job description summary preview.
                </span>
                <a
                  href={job.external_apply_url || job.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent-dark hover:underline transition-colors"
                >
                  Read full description on source
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              </div>
            )}
          </div>

          {/* Company Research Card */}
          <div className="w-full rounded-2xl border border-border bg-surface p-6 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-base font-bold text-text-primary">
                <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                </svg>
                Company Research
              </div>
              <button className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-accent-foreground shadow-sm hover:opacity-90 transition-opacity">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                </svg>
                Research Company
              </button>
            </div>

            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border-muted rounded-xl bg-surface-secondary">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface text-text-muted mb-4 border border-border shadow-sm">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-text-primary">No research yet</h3>
              <p className="max-w-xs text-xs font-semibold text-text-secondary mt-1.5 leading-relaxed">
                Click &ldquo;Research Company&rdquo; to let the AI browse {job.company || "the company"}&apos;s public pages and build a dossier.
              </p>
            </div>
          </div>

          {/* Sticky Bottom Apply Button */}
          {job.external_apply_url || job.source_url ? (
            <a
              href={job.external_apply_url || job.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center rounded-xl bg-accent py-3.5 text-base font-bold text-accent-foreground shadow-sm hover:opacity-95 transition-opacity mt-4"
            >
              Apply Now at {job.company || "Company"}
            </a>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
