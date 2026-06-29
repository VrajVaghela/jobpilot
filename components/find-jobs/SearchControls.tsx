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
