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
