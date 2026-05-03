// src/app/(main)/brands/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { brandService } from "../../../services/brand.service";
import { QUERY_KEYS } from "../../../constants/queryKeys";
import { useDebounce } from "../../../hooks/useDebounce";

function BrandCard({ brand }: { brand: any }) {
  return (
    <Link
      href={`/brands/${brand.slug ?? brand._id}`}
      className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 group"
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
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: "var(--color-background-secondary)" }}
      >
        {brand.logo ? (
          <Image
            src={brand.logo}
            alt={brand.name}
            width={80}
            height={80}
            className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <span className="text-2xl font-black" style={{ color: "#ef4a23" }}>
            {brand.name?.[0]?.toUpperCase()}
          </span>
        )}
      </div>
      <div className="text-center">
        <p
          className="text-sm font-bold transition-colors group-hover:text-[#ef4a23]"
          style={{ color: "var(--color-text-primary)" }}
        >
          {brand.name}
        </p>
        {brand.productCount !== undefined && (
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
            {brand.productCount} products
          </p>
        )}
      </div>
    </Link>
  );
}

function BrandSkeleton() {
  return (
    <div
      className="flex flex-col items-center gap-3 p-6 rounded-2xl"
      style={{ backgroundColor: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)" }}
    >
      <div className="w-20 h-20 rounded-2xl animate-pulse" style={{ backgroundColor: "var(--color-background-secondary)" }} />
      <div className="w-16 h-4 rounded-lg animate-pulse" style={{ backgroundColor: "var(--color-background-secondary)" }} />
      <div className="w-12 h-3 rounded animate-pulse" style={{ backgroundColor: "var(--color-background-secondary)" }} />
    </div>
  );
}

export default function BrandsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.BRANDS, debouncedSearch],
    queryFn: () => brandService.getAll({ limit: 100 }),
  });

  const brands = data?.data ?? [];

  const filtered = debouncedSearch
    ? brands.filter((b: any) =>
        b.name?.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : brands;

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-12">
      {/* header */}
      <div className="text-center mb-10">
        <span
          className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
          style={{ backgroundColor: "rgba(239,74,35,0.08)", color: "#ef4a23" }}
        >
          All Brands
        </span>
        <h1 className="text-3xl font-black mb-2" style={{ color: "var(--color-text-primary)" }}>
          Shop by Brand
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {isLoading ? "Loading..." : `${filtered.length} brands available`}
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
          placeholder="Search brands..."
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {isLoading
          ? Array.from({ length: 18 }).map((_, i) => <BrandSkeleton key={i} />)
          : filtered.length === 0
          ? (
            <div className="col-span-full text-center py-20">
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
                No brands found
              </p>
              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                Try a different search term.
              </p>
            </div>
          )
          : filtered.map((brand: any) => (
              <BrandCard key={brand._id} brand={brand} />
            ))}
      </div>
    </div>
  );
}