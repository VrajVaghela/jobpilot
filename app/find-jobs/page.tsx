import { redirect } from "next/navigation";
import { createInsforgeServer } from "@/lib/insforge-server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SearchControls } from "@/components/find-jobs/SearchControls";
import { JobFilters } from "@/components/find-jobs/JobFilters";
import { JobsTable, JobRow } from "@/components/find-jobs/JobsTable";
import { JobsPagination } from "@/components/find-jobs/JobsPagination";

// Mock jobs from mockups
const MOCK_JOBS: JobRow[] = [
  {
    id: "1",
    company: "Vercel",
    role: "Senior Frontend Engineer",
    matchScore: 94,
    salaryEst: "$160k - $200k",
    dateFound: "2 hours ago",
  },
  {
    id: "2",
    company: "Stripe",
    role: "Staff UI Engineer",
    matchScore: 88,
    salaryEst: "$180k - $240k",
    dateFound: "Yesterday",
  },
  {
    id: "3",
    company: "Linear",
    role: "Product Engineer",
    matchScore: 96,
    salaryEst: "$150k - $190k",
    dateFound: "Yesterday",
  },
  {
    id: "4",
    company: "Notion",
    role: "Frontend Developer",
    matchScore: 72,
    salaryEst: "$130k - $170k",
    dateFound: "2 days ago",
  },
  {
    id: "5",
    company: "OpenAI",
    role: "Design Engineer",
    matchScore: 91,
    salaryEst: "$200k - $280k",
    dateFound: "3 days ago",
  },
  {
    id: "6",
    company: "Figma",
    role: "Software Engineer, Editor",
    matchScore: 85,
    salaryEst: "$170k - $220k",
    dateFound: "4 days ago",
  },
];

export default async function FindJobsPage() {
  const insforge = await createInsforgeServer();
  const {
    data: { user },
    error: authError,
  } = await insforge.auth.getCurrentUser();

  if (authError || !user) {
    redirect("/login");
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background px-6 py-8">
        <div className="mx-auto max-w-6xl flex flex-col gap-6">
          <SearchControls />
          <JobFilters />
          <JobsTable jobs={MOCK_JOBS} />
          <JobsPagination />
        </div>
      </main>
      <Footer />
    </>
  );
}
