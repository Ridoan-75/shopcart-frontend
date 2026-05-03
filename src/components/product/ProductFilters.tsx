// src/components/product/ProductFilters.tsx
"use client";

import { useState } from "react";
import { SlidersHorizontal, X, RotateCcw } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { categoryService } from "../../services/category.service";
import { brandService } from "../../services/brand.service";
import { QUERY_KEYS } from "../../constants/queryKeys";

export interface FilterState {
  categoryId: string;
  brandId: string;
  minPrice: number;
  maxPrice: number;
  rating: number;
}

const DEFAULT_FILTERS: FilterState = {
  categoryId: "",
  brandId: "",
  minPrice: 0,
  maxPrice: 10000,
  rating: 0,
};

interface ProductFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

function StarRatingFilter({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {[5, 4, 3, 2, 1].map((star) => (
        <button
          key={star}
          onClick={() => onChange(value === star ? 0 : star)}
          className="flex items-center gap-2 group"
        >
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill={i < star ? "#ef4a23" : "none"}
                stroke={i < star ? "#ef4a23" : "var(--color-border-secondary)"}
                strokeWidth="1.8"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>
          <span
            className="text-xs"
            style={{
              color:
                value === star ? "#ef4a23" : "var(--color-text-secondary)",
            }}
          >
            & up
          </span>
          {value === star && (
            <div
              className="w-1.5 h-1.5 rounded-full ml-auto"
              style={{ backgroundColor: "#ef4a23" }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="py-4 border-b"
      style={{ borderColor: "var(--color-border-tertiary)" }}
    >
      <p
        className="text-xs font-bold uppercase tracking-widest mb-3"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

function FiltersBody({
  filters,
  onFilterChange,
}: ProductFiltersProps) {
  const { data: categories } = useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES],
    queryFn: () => categoryService.getAll(),
  });

  const { data: brands } = useQuery({
    queryKey: [QUERY_KEYS.BRANDS],
    queryFn: () => brandService.getAll(),
  });

  const hasActiveFilters =
    filters.categoryId ||
    filters.brandId ||
    filters.rating > 0 ||
    filters.minPrice > 0 ||
    filters.maxPrice < 10000;

  const reset = () => onFilterChange(DEFAULT_FILTERS);

  const update = (key: keyof FilterState, value: string | number) =>
    onFilterChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-col">
      {/* header */}
      <div className="flex items-center justify-between mb-1">
        <p
          className="text-sm font-bold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Filters
        </p>
        {hasActiveFilters && (
          <button
            onClick={reset}
            className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-70"
            style={{ color: "#ef4a23" }}
          >
            <RotateCcw size={11} />
            Reset
          </button>
        )}
      </div>

      {/* category */}
      <FilterSection title="Category">
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => update("categoryId", "")}
            className="flex items-center justify-between h-8 px-2 rounded-lg text-sm transition-colors"
            style={{
              backgroundColor: !filters.categoryId
                ? "rgba(239,74,35,0.08)"
                : "transparent",
              color: !filters.categoryId
                ? "#ef4a23"
                : "var(--color-text-secondary)",
            }}
          >
            All Categories
            {!filters.categoryId && (
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: "#ef4a23" }}
              />
            )}
          </button>
          {categories?.data?.map((cat: { _id: string; name: string }) => (
            <button
              key={cat._id}
              onClick={() =>
                update(
                  "categoryId",
                  filters.categoryId === cat._id ? "" : cat._id
                )
              }
              className="flex items-center justify-between h-8 px-2 rounded-lg text-sm transition-colors"
              style={{
                backgroundColor:
                  filters.categoryId === cat._id
                    ? "rgba(239,74,35,0.08)"
                    : "transparent",
                color:
                  filters.categoryId === cat._id
                    ? "#ef4a23"
                    : "var(--color-text-secondary)",
              }}
            >
              {cat.name}
              {filters.categoryId === cat._id && (
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: "#ef4a23" }}
                />
              )}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* brand */}
      <FilterSection title="Brand">
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => update("brandId", "")}
            className="flex items-center justify-between h-8 px-2 rounded-lg text-sm transition-colors"
            style={{
              backgroundColor: !filters.brandId
                ? "rgba(239,74,35,0.08)"
                : "transparent",
              color: !filters.brandId
                ? "#ef4a23"
                : "var(--color-text-secondary)",
            }}
          >
            All Brands
            {!filters.brandId && (
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: "#ef4a23" }}
              />
            )}
          </button>
          {brands?.data?.map((brand: { _id: string; name: string }) => (
            <button
              key={brand._id}
              onClick={() =>
                update("brandId", filters.brandId === brand._id ? "" : brand._id)
              }
              className="flex items-center justify-between h-8 px-2 rounded-lg text-sm transition-colors"
              style={{
                backgroundColor:
                  filters.brandId === brand._id
                    ? "rgba(239,74,35,0.08)"
                    : "transparent",
                color:
                  filters.brandId === brand._id
                    ? "#ef4a23"
                    : "var(--color-text-secondary)",
              }}
            >
              {brand.name}
              {filters.brandId === brand._id && (
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: "#ef4a23" }}
                />
              )}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* price range */}
      <FilterSection title="Price Range">
        <div className="flex flex-col gap-3">
          <input
            type="range"
            min={0}
            max={10000}
            step={50}
            value={filters.maxPrice}
            onChange={(e) => update("maxPrice", Number(e.target.value))}
            className="w-full accent-[#ef4a23] h-1.5 rounded-full cursor-pointer"
          />
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-medium"
              style={{ color: "var(--color-text-secondary)" }}
            >
              $0
            </span>
            <span
              className="text-xs font-bold"
              style={{ color: "#ef4a23" }}
            >
              Up to ${filters.maxPrice.toLocaleString()}
            </span>
          </div>
        </div>
      </FilterSection>

      {/* rating */}
      <FilterSection title="Minimum Rating">
        <StarRatingFilter
          value={filters.rating}
          onChange={(v) => update("rating", v)}
        />
      </FilterSection>
    </div>
  );
}

export default function ProductFilters({
  filters,
  onFilterChange,
}: ProductFiltersProps) {
  return (
    <>
      {/* desktop sidebar */}
      <aside className="hidden lg:block w-56 flex-shrink-0">
        <div
          className="sticky top-24 rounded-2xl p-4"
          style={{
            backgroundColor: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
          }}
        >
          <FiltersBody filters={filters} onFilterChange={onFilterChange} />
        </div>
      </aside>

      {/* mobile sheet trigger */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <button
              className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium transition-all"
              style={{
                border: "0.5px solid var(--color-border-secondary)",
                color: "var(--color-text-primary)",
                backgroundColor: "var(--color-background-primary)",
              }}
            >
              <SlidersHorizontal size={16} style={{ color: "#ef4a23" }} />
              Filters
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-72 overflow-y-auto"
            style={{ backgroundColor: "var(--color-background-primary)" }}
          >
            <div className="pt-6 px-1">
              <FiltersBody filters={filters} onFilterChange={onFilterChange} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}