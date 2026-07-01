"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { StatsBar } from "@/components/dashboard/StatsBar";
// Inline SVGs are used instead of icon library imports to keep dependencies minimal.


// Dynamically import chart components to prevent SSR hydration mismatches
const JobsFoundChart = dynamic(
  () => import("@/components/dashboard/charts/JobsFoundChart"),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center bg-surface-secondary/50 rounded-lg animate-pulse text-sm text-text-muted">
        Loading chart...
      </div>
    )
  }
);

const ResumeTailoringChart = dynamic(
  () => import("@/components/dashboard/charts/ResumeTailoringChart"),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center bg-surface-secondary/50 rounded-lg animate-pulse text-sm text-text-muted">
        Loading chart...
      </div>
    )
  }
);

const MatchScoreChart = dynamic(
  () => import("@/components/dashboard/charts/MatchScoreChart"),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center bg-surface-secondary/50 rounded-lg animate-pulse text-sm text-text-muted">
        Loading chart...
      </div>
    )
  }
);

interface ActivityItem {
  id: string;
  type: "found" | "researched" | "failed" | "running";
  text: string;
  timestamp: string;
}

interface DashboardClientProps {
  userEmail: string | undefined;
  isProfileComplete: boolean;
  stats: {
    totalJobsFound: number;
    avgMatchRate: number;
    companiesResearched: number;
    jobsThisWeek: number;
  };
  activities: ActivityItem[];
  jobsFoundChartData: any[];
  tailoringChartData: any[];
  matchScoreChartData: any[];
}

export function DashboardClient({ 
  userEmail, 
  isProfileComplete, 
  stats, 
  activities,
  jobsFoundChartData,
  tailoringChartData,
  matchScoreChartData
}: DashboardClientProps) {
  const username = userEmail ? userEmail.split("@")[0] : "Developer";

  // Render correct dot color depending on activity type
  const renderActivityDot = (type: string) => {
    switch (type) {
      case "researched":
        return (
          <div className="relative flex h-4 w-4 items-center justify-center rounded-full border-2 border-surface bg-[#F3E8FF] shadow-sm">
            <div className="h-2 w-2 rounded-full bg-[#7C5CFC]" />
          </div>
        );
      case "running":
        return (
          <div className="relative flex h-4 w-4 items-center justify-center rounded-full border-2 border-surface bg-[#DBEAFE] shadow-sm">
            <div className="h-2 w-2 rounded-full bg-[#61A8FF] animate-pulse" />
          </div>
        );
      case "failed":
        return (
          <div className="relative flex h-4 w-4 items-center justify-center rounded-full border-2 border-surface bg-red-100 shadow-sm">
            <div className="h-2 w-2 rounded-full bg-red-500" />
          </div>
        );
      case "found":
      default:
        return (
          <div className="relative flex h-4 w-4 items-center justify-center rounded-full border-2 border-surface bg-[#D0FAE5] shadow-sm">
            <div className="h-2 w-2 rounded-full bg-[#00BC7D]" />
          </div>
        );
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] px-8 py-8 flex flex-col gap-6">
      {/* 1. Incomplete Profile Banner */}
      {!isProfileComplete && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-warning/20 bg-warning/10 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-warning/20 p-2 text-warning">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-text-primary text-sm">Your profile is incomplete</h3>
              <p className="mt-0.5 text-xs text-text-secondary">
                Upload your resume or fill out your profile details to unlock accurate job matching and AI-powered tailoring.
              </p>
            </div>
          </div>
          <Link
            href="/profile"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground shadow-sm transition-all hover:bg-accent-dark hover:shadow-md"
          >
            <span>Complete Setup</span>
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      )}

      {/* 2. Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Welcome back, <span className="capitalize">{username}</span>
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Here's a snapshot of your job search funnel and AI analytics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/find-jobs"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition-all hover:bg-accent-dark hover:shadow-md"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Find Jobs</span>
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-primary shadow-sm transition-colors hover:bg-surface-secondary"
          >
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      {/* 3. Stats Grid */}
      <StatsBar stats={stats} />

      {/* 4. Charts & Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Charts) - Spans 2 */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Main Chart: Jobs Found Over Time */}
          <div className="rounded-xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-text-primary">
                Jobs Found Over Time
              </h2>
              <p className="text-[12px] text-text-muted">
                Daily trend of jobs discovered by matching agents
              </p>
            </div>
            <JobsFoundChart data={jobsFoundChartData} />
          </div>

          {/* Sub Charts: Tailoring & Score Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-text-primary">
                  Resume Tailoring Activity
                </h2>
                <p className="text-[12px] text-text-muted">
                  Resumes customized by day of the week
                </p>
              </div>
              <ResumeTailoringChart data={tailoringChartData} />
            </div>

            <div className="rounded-xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-text-primary">
                  Match Score Distribution
                </h2>
                <p className="text-[12px] text-text-muted">
                  Frequency of jobs by score ranges
                </p>
              </div>
              <MatchScoreChart data={matchScoreChartData} />
            </div>
          </div>
        </div>

        {/* Right Column (Activity Feed) - Spans 1 */}
        <div className="lg:col-span-1">
          <div className="h-full rounded-xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-text-primary">
                Recent Activity
              </h2>
              <p className="text-[12px] text-text-muted">
                Logs of your agent runs and application steps
              </p>
            </div>
            <div className="flex-1 flow-root">
              {activities.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-center">
                  <div className="rounded-full bg-surface-secondary p-3 text-text-muted">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-text-primary">No recent activity</h3>
                  <p className="mt-1 text-xs text-text-muted">
                    Start searching for jobs or request company research.
                  </p>
                </div>
              ) : (
                <ul className="-mb-8">
                  {activities.map((activity, activityIdx) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {activityIdx !== activities.length - 1 ? (
                          <span className="absolute top-4 left-2.5 -ml-px h-full w-0.5 bg-border" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div className="flex h-5 items-center">
                            {renderActivityDot(activity.type)}
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-0.5">
                            <div>
                              <p className="text-sm text-text-primary font-medium">
                                {activity.text}
                              </p>
                            </div>
                            <div className="whitespace-nowrap text-right text-[12px] text-text-muted pl-2">
                              <time>{activity.timestamp}</time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
