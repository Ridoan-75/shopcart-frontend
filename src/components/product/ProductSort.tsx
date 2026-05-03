// src/components/product/ProductSort.tsx
"use client";

import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export type SortOption =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "popular"
  | "top_rated";

interface SortItem {
  value: SortOption;
  label: string;
}

const SORT_OPTIONS: SortItem[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "top_rated", label: "Top Rated" },
];

interface ProductSortProps {
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export default function ProductSort({ sort, onSortChange }: ProductSortProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = SORT_OPTIONS.find((o) => o.value === sort) ?? SORT_OPTIONS[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium transition-all"
        style={{
          border: "0.5px solid var(--color-border-secondary)",
          backgroundColor: "var(--color-background-primary)",
          color: "var(--color-text-primary)",
          minWidth: "180px",
        }}
      >
        <span className="flex-1 text-left">{selected.label}</span>
        <ChevronDown
          size={15}
          className="transition-transform duration-200 flex-shrink-0"
          style={{
            color: "var(--color-text-tertiary)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-1.5 w-52 rounded-xl overflow-hidden z-30"
          style={{
            backgroundColor: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-secondary)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          }}
        >
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onSortChange(option.value);
                setOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors"
              style={{
                backgroundColor:
                  sort === option.value
                    ? "rgba(239,74,35,0.07)"
                    : "transparent",
                color:
                  sort === option.value
                    ? "#ef4a23"
                    : "var(--color-text-secondary)",
              }}
              onMouseEnter={(e) => {
                if (sort !== option.value)
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "var(--color-background-secondary)";
              }}
              onMouseLeave={(e) => {
                if (sort !== option.value)
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "transparent";
              }}
            >
              {option.label}
              {sort === option.value && (
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: "#ef4a23" }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}