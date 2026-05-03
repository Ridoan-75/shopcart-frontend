// src/app/(main)/categories/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Search, X, LayoutGrid } from "lucide-react";
import { categoryService } from "../../../services/category.service";
import { QUERY_KEYS } from "../../../constants/queryKeys";
import { useDebounce } from "../../../hooks/useDebounce";

function CategoryCard({ category }: { category: any }) {
  return (
    <Link
      href={`/categories/${category.slug ?? category._id}`}
      className="flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 group"
      style={{
        backgroundColor: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(239,74,35,0.4)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 24px rgba(239,74,35,0.1)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--color-border-tertiary)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
      }}
    >
      {/* image */}
      <div
        className="relative w-full h-40 overflow-hidden"
        style={{ backgroundColor: "var(--color-background-secondary)" }}
      >
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-5xl"
            style={{ backgroundColor: "rgba(239,74,35,0.05)" }}
          >
            <LayoutGrid size={40} style={{ color: "rgba(239,74,35,0.3)" }} />
          </div>
        )}
        {/* overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ backgroundColor: "rgba(239,74,35,0.06)" }}
        />
      </div>

      {/* info */}
      <div className="p-4 flex items-center justify-between">
        <div>
          <p
            className="text-sm font-bold transition-colors group-hover:text-[#ef4a23]"
            style={{ color: "var(--color-text-primary)" }}
          >
            {category.name}
          </p>
          {category.productCount !== undefined && (
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
              {category.productCount} items
            </p>
          )}
        </div>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full transition-colors group-hover:bg-[#ef4a23] group-hover:text-white"
          style={{
            backgroundColor: "rgba(239,74,35,0.08)",
            color: "#ef4a23",
          }}
        >
          Shop →
        </span>
      </div>
    </Link>
  );
}

function CategorySkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)" }}
    >
      <div className="w-full h-40 animate-pulse" style={{ backgroundColor: "var(--color-background-secondary)" }} />
      <div className="p-4 flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="w-24 h-4 rounded-lg animate-pulse" style={{ backgroundColor: "var(--color-background-secondary)" }} />
          <div className="w-16 h-3 rounded animate-pulse" style={{ backgroundColor: "var(--color-background-secondary)" }} />
        </div>
        <div className="w-14 h-6 rounded-full animate-pulse" style={{ backgroundColor: "var(--color-background-secondary)" }} />
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES],
    queryFn: () => categoryService.getAll({ limit: 100 }),
  });

  const categories = data?.data ?? [];

  const filtered = debouncedSearch
    ? categories.filter((c: any) =>
        c.name?.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : categories;

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-12">
      {/* header */}
      <div className="text-center mb-10">
        <span
          className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
          style={{ backgroundColor: "rgba(239,74,35,0.08)", color: "#ef4a23" }}
        >
          All Categories
        </span>
        <h1 className="text-3xl font-black mb-2" style={{ color: "var(--color-text-primary)" }}>
          Browse Categories
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {isLoading ? "Loading..." : `${filtered.length} categories available`}
        </p>
      </div>

      {/* search */}
      <div
        className="flex items-center rounded-2xl overflow-hidden mb-10 max-w-md mx-auto"
        style={{
          border: "1px solid var(--color-border-secondary)",
          backgroundColor: "var(--color-background-primary)",
        }}
      >
        <div className="px-4" style={{ color: "#ef4a23" }}>
          <Search size={16} />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="flex-1 h-12 text-sm bg-transparent outline-none"
          style={{ color: "var(--color-text-primary)", fontFamily: "'Trebuchet MS', sans-serif" }}
        />
        {search && (
          <button onClick={() => setSearch("")} className="px-4" style={{ color: "var(--color-text-tertiary)" }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => <CategorySkeleton key={i} />)
          : filtered.length === 0
          ? (
            <div className="col-span-full text-center py-20">
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
                No categories found
              </p>
              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                Try a different search term.
              </p>
            </div>
          )
          : filtered.map((cat: any) => (
              <CategoryCard key={cat._id} category={cat} />
            ))}
      </div>
    </div>
  );
}