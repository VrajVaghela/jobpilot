"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface JobsPaginationProps {
  totalCount: number;
  itemsPerPage: number;
  currentPage: number;
}

export function JobsPagination({
  totalCount,
  itemsPerPage,
  currentPage,
}: JobsPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const startEntry = totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endEntry = Math.min(currentPage * itemsPerPage, totalCount);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1; // Number of pages to show around current page

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full mt-4">
      {/* Showing entries status */}
      <span className="text-xs text-text-secondary font-normal">
        Showing <span className="font-medium text-text-primary">{startEntry}</span> to{" "}
        <span className="font-medium text-text-primary">{endEntry}</span> of{" "}
        <span className="font-medium text-text-primary">{totalCount}</span> results
      </span>

      {/* Pages control buttons */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {/* Previous Button */}
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-primary hover:bg-surface-secondary cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed"
            aria-label="Go to previous page"
          >
            Previous
          </button>

          {/* Page numbers */}
          {pageNumbers.map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="inline-flex h-8 w-8 items-center justify-center text-text-muted text-sm font-medium"
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isSelected = pageNum === currentPage;

            return (
              <button
                key={`page-${pageNum}`}
                type="button"
                onClick={() => handlePageChange(pageNum)}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium cursor-pointer ${
                  isSelected
                    ? "bg-accent-light text-accent font-semibold"
                    : "border border-border bg-surface text-text-primary hover:bg-surface-secondary"
                }`}
                aria-current={isSelected ? "page" : undefined}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Next Button */}
          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-primary hover:bg-surface-secondary cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed"
            aria-label="Go to next page"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
