// src/components/common/Pagination.tsx
"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);
  return pages;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center gap-1.5">
      {/* prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          border: "0.5px solid var(--color-border-secondary)",
          backgroundColor: "var(--color-background-primary)",
          color: "var(--color-text-secondary)",
        }}
        onMouseEnter={(e) => {
          if (currentPage !== 1)
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#ef4a23";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor =
            "var(--color-border-secondary)";
        }}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {/* page numbers */}
      {pages.map((page, idx) =>
        page === "..." ? (
          <div
            key={`ellipsis-${idx}`}
            className="w-9 h-9 flex items-center justify-center"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            <MoreHorizontal size={16} />
          </div>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className="w-9 h-9 rounded-xl text-sm font-medium transition-all duration-150"
            style={
              currentPage === page
                ? {
                    backgroundColor: "#ef4a23",
                    color: "#ffffff",
                    border: "0.5px solid #ef4a23",
                  }
                : {
                    backgroundColor: "var(--color-background-primary)",
                    color: "var(--color-text-primary)",
                    border: "0.5px solid var(--color-border-secondary)",
                  }
            }
            onMouseEnter={(e) => {
              if (currentPage !== page) {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "#ef4a23";
                (e.currentTarget as HTMLButtonElement).style.color = "#ef4a23";
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== page) {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "var(--color-border-secondary)";
                (e.currentTarget as HTMLButtonElement).style.color =
                  "var(--color-text-primary)";
              }
            }}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </button>
        )
      )}

      {/* next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          border: "0.5px solid var(--color-border-secondary)",
          backgroundColor: "var(--color-background-primary)",
          color: "var(--color-text-secondary)",
        }}
        onMouseEnter={(e) => {
          if (currentPage !== totalPages)
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#ef4a23";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor =
            "var(--color-border-secondary)";
        }}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}