import React from "react";

interface CompletionIndicatorProps {
  percent: number;
  missingFields: string[];
}

export function CompletionIndicator({ percent, missingFields }: CompletionIndicatorProps) {
  // SVG progress ring configuration
  const radius = 38;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  // Determine progress color based on completeness (red/orange for incomplete, green for complete)
  const progressColor = percent === 100 ? "stroke-success" : "stroke-error";

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        {/* Left Side: Notice & Badges */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {/* Warning Icon */}
            <svg
              className="h-5 w-5 text-error"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-base font-semibold text-text-primary">
              {percent === 100 ? "Profile complete" : "Profile needs attention"}
            </h2>
          </div>
          <p className="mt-1.5 text-sm text-text-secondary">
            {percent === 100
              ? "Your profile is fully configured. You are ready to search for tailored matches and generate resumes."
              : "Complete the missing fields to improve your chance of getting tailored matches and generating quality resumes."}
          </p>

          {/* Missing Fields Badges */}
          {missingFields.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {missingFields.map((field) => (
                <span
                  key={field}
                  className="rounded-sm bg-error/5 px-2.5 py-0.5 text-[10px] font-semibold text-error border border-error/25 tracking-wider"
                >
                  {field}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Circular Progress */}
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
          <svg className="h-full w-full -rotate-90">
            {/* Background circle */}
            <circle
              className="stroke-surface-muted"
              strokeWidth={strokeWidth}
              fill="transparent"
              r={radius}
              cx="48"
              cy="48"
            />
            {/* Foreground circle */}
            <circle
              className={`${progressColor} transition-all duration-500 ease-in-out`}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              r={radius}
              cx="48"
              cy="48"
            />
          </svg>
          {/* Centered Percentage Text */}
          <span className="absolute text-xl font-bold text-text-primary">
            {percent}%
          </span>
        </div>
      </div>
    </div>
  );
}
