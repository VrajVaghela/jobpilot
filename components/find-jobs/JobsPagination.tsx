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
          className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-secondary cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed"
          disabled
          aria-label="Go to previous page"
        >
          Previous
        </button>

        {/* Selected Page Button */}
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent-light text-accent text-sm font-semibold cursor-pointer"
          aria-current="page"
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
          aria-label="Go to next page"
        >
          Next
        </button>
      </div>
    </div>
  );
}
