import React from "react";

interface StatsBarProps {
  stats: {
    totalJobsFound: number;
    avgMatchRate: number;
    companiesResearched: number;
    jobsThisWeek: number;
  };
}

export function StatsBar({ stats }: StatsBarProps) {
  const cards = [
    {
      title: "Total Jobs Found",
      value: stats.totalJobsFound.toString(),
      subtitle: "All discovered matches",
      icon: (
        <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Avg. Match Rate",
      value: `${stats.avgMatchRate}%`,
      subtitle: "Overall average score",
      icon: (
        <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: "Companies Researched",
      value: stats.companiesResearched.toString(),
      subtitle: "With AI dossiers",
      icon: (
        <svg className="h-5 w-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      title: "Jobs This Week",
      value: stats.jobsThisWeek.toString(),
      subtitle: "Discovered last 7 days",
      icon: (
        <svg className="h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="rounded-xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium uppercase tracking-wider text-text-muted">
              {card.title}
            </span>
            <div className="rounded-lg bg-background p-2">
              {card.icon}
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-[30px] font-semibold text-text-primary leading-[36px]">
              {card.value}
            </span>
          </div>
          <div className="mt-1">
            <span className="text-[12px] font-normal text-text-muted">
              {card.subtitle}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
