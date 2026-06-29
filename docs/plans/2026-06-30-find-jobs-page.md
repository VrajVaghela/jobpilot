# Find Jobs Page — Full UI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the complete static Find Jobs page UI using mock data, matching the design exactly as shown in `find-jobs.png`.

**Architecture:** Create modular, client-side, and server-side Next.js components to represent the search bar, filter bar, jobs table, and pagination. Connect these components together inside `app/find-jobs/page.tsx` with the `Navbar` and `Footer` layouts, rendering a fully responsive view styled with CSS variables and Tailwind.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, InsForge SDK

---

### Task 1: SearchControls Component

**Files:**
- Create: `components/find-jobs/SearchControls.tsx`

**Step 1: Write SearchControls UI**
Create the search input block card containing `JOB TITLE` (input + search SVG), `LOCATION` (input + location SVG), a `Find Jobs` primary button (accent-bg, search SVG), and the green notification banner below.

```tsx
import React from "react";

export function SearchControls() {
  return (
    <div className="w-full rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        {/* Job Title */}
        <div className="flex-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
            Job Title
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Frontend Engineer"
              className="w-full bg-surface border border-border rounded-lg pl-10 pr-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
              readOnly
            />
          </div>
        </div>

        {/* Location */}
        <div className="flex-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
            Location
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
              {/* Simple Location marker icon */}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Remote, New York..."
              className="w-full bg-surface border border-border rounded-lg pl-10 pr-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
              readOnly
            />
          </div>
        </div>

        {/* Find Jobs Button */}
        <div>
          <button
            type="button"
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Find Jobs
          </button>
        </div>
      </div>

      {/* Success Banner */}
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-success-lightest border border-success-light/30 px-4 py-3 text-sm text-success-darker font-medium">
        <svg className="w-4 h-4 shrink-0 text-success" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
        <span>Found 8 jobs and saved 4 strong matches.</span>
      </div>
    </div>
  );
}
```

---

### Task 2: JobFilters Component

**Files:**
- Create: `components/find-jobs/JobFilters.tsx`

**Step 1: Write JobFilters UI**
Create the filter controls layout featuring the text input on the left ("Filter by company or role...") and the two dropdown selects on the right ("All Matches" and "Match Score").

```tsx
import React from "react";

export function JobFilters() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
      {/* Text filter */}
      <div className="relative max-w-md w-full">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Filter by company or role..."
          className="w-full bg-surface border border-border rounded-lg pl-10 pr-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
          readOnly
        />
      </div>

      {/* Select buttons / dropdown wrappers */}
      <div className="flex items-center gap-3">
        {/* All Matches */}
        <div className="relative">
          <button
            type="button"
            className="inline-flex items-center justify-between gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary cursor-pointer"
          >
            <span>All Matches</span>
            <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Match Score */}
        <div className="relative">
          <button
            type="button"
            className="inline-flex items-center justify-between gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary cursor-pointer"
          >
            <span>Match Score</span>
            <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### Task 3: JobsTable Component

**Files:**
- Create: `components/find-jobs/JobsTable.tsx`

**Step 1: Write JobsTable UI**
Build the tables showing mock roles matching Vercel, Stripe, Linear, Notion, OpenAI, Figma with their respective match percentages, custom colored progress indicators, salaries, and times.

```tsx
import React from "react";

export interface JobRow {
  id: string;
  company: string;
  role: string;
  matchScore: number;
  salaryEst: string;
  dateFound: string;
}

interface JobsTableProps {
  jobs: JobRow[];
}

export function JobsTable({ jobs }: JobsTableProps) {
  // Helper to color code match scores
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-info";
    return "bg-warning";
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-text-secondary w-[22%]">
                Company
              </th>
              <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-text-secondary w-[32%]">
                Role
              </th>
              <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-text-secondary w-[20%]">
                Match Score
              </th>
              <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-text-secondary w-[14%]">
                Salary Est.
              </th>
              <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-text-secondary w-[12%]">
                Date Found
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {jobs.map((job) => (
              <tr
                key={job.id}
                className="hover:bg-surface-secondary transition-colors"
              >
                {/* Company info */}
                <td className="whitespace-nowrap px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-secondary text-text-secondary">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <span className="font-semibold text-text-primary text-sm">
                      {job.company}
                    </span>
                  </div>
                </td>

                {/* Role */}
                <td className="px-6 py-5 text-sm font-medium text-text-primary">
                  {job.role}
                </td>

                {/* Match Score Progress block */}
                <td className="whitespace-nowrap px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-border">
                      <div
                        className={`h-full rounded-full ${getScoreColorClass(
                          job.matchScore
                        )}`}
                        style={{ width: `${job.matchScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-text-primary">
                      {job.matchScore}%
                    </span>
                  </div>
                </td>

                {/* Salary Est */}
                <td className="whitespace-nowrap px-6 py-5 text-sm font-medium text-text-primary">
                  {job.salaryEst}
                </td>

                {/* Date Found */}
                <td className="whitespace-nowrap px-6 py-5 text-sm text-text-secondary">
                  {job.dateFound}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

### Task 4: JobsPagination Component

**Files:**
- Create: `components/find-jobs/JobsPagination.tsx`

**Step 1: Write JobsPagination UI**
Build pagination components containing page numbering exactly like the mockup: `Showing 1 to 6 of 24 results` on the left, and button options on the right (`Previous`, page `1` (selected), `2`, `3`, `...`, `8`, `Next`).

```tsx
import React from "react";

export function JobsPagination() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full mt-4">
      {/* Showing entries status */}
      <span className="text-xs text-text-secondary font-normal">
        Showing <span className="font-medium text-text-primary">1</span> to{" "}
        <span className="font-medium text-text-primary">6</span> of{" "}
        <span className="font-medium text-text-primary">24</span> results
      </span>

      {/* Pages control buttons */}
      <div className="flex items-center gap-1.5 self-end sm:self-auto">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-secondary cursor-pointer disabled:opacity-50"
          disabled
        >
          Previous
        </button>

        {/* Selected Page Button */}
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent-light text-accent text-sm font-semibold cursor-pointer"
        >
          1
        </button>

        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-text-primary text-sm font-medium hover:bg-surface-secondary cursor-pointer"
        >
          2
        </button>

        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-text-primary text-sm font-medium hover:bg-surface-secondary cursor-pointer"
        >
          3
        </button>

        <span className="inline-flex h-8 w-8 items-center justify-center text-text-muted text-sm font-medium">
          ...
        </span>

        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-text-primary text-sm font-medium hover:bg-surface-secondary cursor-pointer"
        >
          8
        </button>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-primary hover:bg-surface-secondary cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

---

### Task 5: Find Jobs Page Route Integration

**Files:**
- Create: `app/find-jobs/page.tsx`

**Step 1: Write Route Integration with Layout & Mock Data**
Assemble the page component, protecting it on the server using `insforge.auth.getCurrentUser()`, mapping layout items, injecting mock data rows, and wrapping it in `Navbar` and `Footer`.

```tsx
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
```

**Step 2: Verify visually and run production build**
- Run `npm run build` to confirm compilation is clean.
- Visually verify styling aligns exactly with the design.
