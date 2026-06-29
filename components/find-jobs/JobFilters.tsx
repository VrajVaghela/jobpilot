"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const MATCH_OPTIONS = ["All Matches", "Strong Matches (85%+)", "Good Matches (70-84%)"];
const SORT_OPTIONS = ["Match Score", "Highest First", "Lowest First"];

const MATCH_MAP: Record<string, string> = {
  "All Matches": "all",
  "Strong Matches (85%+)": "strong",
  "Good Matches (70-84%)": "good",
};

const REVERSE_MATCH_MAP: Record<string, string> = {
  all: "All Matches",
  strong: "Strong Matches (85%+)",
  good: "Good Matches (70-84%)",
};

const SORT_MAP: Record<string, string> = {
  "Match Score": "score",
  "Highest First": "newest",
  "Lowest First": "oldest",
};

const REVERSE_SORT_MAP: Record<string, string> = {
  score: "Match Score",
  newest: "Highest First",
  oldest: "Lowest First",
};

export function JobFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const queryQ = searchParams.get("q") || "";
  const queryMatch = searchParams.get("match") || "all";
  const querySort = searchParams.get("sort") || "score";

  const [searchValue, setSearchValue] = useState(queryQ);
  const [selectedMatch, setSelectedMatch] = useState(REVERSE_MATCH_MAP[queryMatch] || "All Matches");
  const [selectedSort, setSelectedSort] = useState(REVERSE_SORT_MAP[querySort] || "Match Score");
  
  const [isMatchDropdownOpen, setIsMatchDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const matchRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Sync state if URL query params change externally
  useEffect(() => {
    setSearchValue(queryQ);
  }, [queryQ]);

  useEffect(() => {
    setSelectedMatch(REVERSE_MATCH_MAP[queryMatch] || "All Matches");
  }, [queryMatch]);

  useEffect(() => {
    setSelectedSort(REVERSE_SORT_MAP[querySort] || "Match Score");
  }, [querySort]);

  // Close dropdowns if user clicks outside of them
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (matchRef.current && !matchRef.current.contains(event.target as Node)) {
        setIsMatchDropdownOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdowns if user presses the Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMatchDropdownOpen(false);
        setIsSortDropdownOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Helper to push updated search parameters to the URL
  const updateParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(newParams)) {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  // Debounce the text search input parameter change (300ms)
  useEffect(() => {
    const currentQ = searchParams.get("q") || "";
    if (searchValue === currentQ) return;

    const timer = setTimeout(() => {
      updateParams({
        q: searchValue.trim() || null,
        page: "1", // reset to page 1
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

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
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Filter by company or role..."
          className="w-full bg-surface border border-border rounded-lg pl-10 pr-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
        />
      </div>

      {/* Select buttons / dropdown wrappers */}
      <div className="flex items-center gap-3">
        {/* All Matches */}
        <div className="relative" ref={matchRef}>
          <button
            type="button"
            onClick={() => {
              setIsMatchDropdownOpen(!isMatchDropdownOpen);
              setIsSortDropdownOpen(false);
            }}
            aria-haspopup="listbox"
            aria-expanded={isMatchDropdownOpen}
            className="inline-flex items-center justify-between gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary cursor-pointer min-w-[130px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span>{selectedMatch}</span>
            <svg className={`w-4 h-4 text-text-secondary transition-transform ${isMatchDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isMatchDropdownOpen && (
            <div role="listbox" className="absolute right-0 mt-1 w-56 rounded-lg border border-border bg-surface py-1 shadow-lg z-50">
              {MATCH_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={selectedMatch === option}
                  onClick={() => {
                    const mappedValue = MATCH_MAP[option];
                    setSelectedMatch(option);
                    setIsMatchDropdownOpen(false);
                    updateParams({
                      match: mappedValue === "all" ? null : mappedValue,
                      page: "1",
                    });
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-surface-secondary cursor-pointer ${
                    selectedMatch === option ? "text-accent font-semibold" : "text-text-primary font-medium"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Match Score */}
        <div className="relative" ref={sortRef}>
          <button
            type="button"
            onClick={() => {
              setIsSortDropdownOpen(!isSortDropdownOpen);
              setIsMatchDropdownOpen(false);
            }}
            aria-haspopup="listbox"
            aria-expanded={isSortDropdownOpen}
            className="inline-flex items-center justify-between gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary cursor-pointer min-w-[130px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span>{selectedSort}</span>
            <svg className={`w-4 h-4 text-text-secondary transition-transform ${isSortDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isSortDropdownOpen && (
            <div role="listbox" className="absolute right-0 mt-1 w-44 rounded-lg border border-border bg-surface py-1 shadow-lg z-50">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={selectedSort === option}
                  onClick={() => {
                    const mappedValue = SORT_MAP[option];
                    setSelectedSort(option);
                    setIsSortDropdownOpen(false);
                    updateParams({
                      sort: mappedValue === "score" ? null : mappedValue,
                      page: "1",
                    });
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-surface-secondary cursor-pointer ${
                    selectedSort === option ? "text-accent font-semibold" : "text-text-primary font-medium"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
