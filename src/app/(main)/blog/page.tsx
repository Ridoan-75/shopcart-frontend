// src/app/(main)/blog/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { blogService } from "../../../services/blog.service";
import { QUERY_KEYS } from "../../../constants/queryKeys";
import { useDebounce } from "../../../hooks/useDebounce";
import Pagination from "../../../components/common/Pagination";
import SkeletonCard from "../../../components/common/SkeletonCard";
import EmptyState from "../../../components/common/EmptyState";
import { BookOpen } from "lucide-react";

function BlogCard({ post }: { post: any }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        backgroundColor: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 32px rgba(239,74,35,0.1)";
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(239,74,35,0.3)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--color-border-tertiary)";
      }}
    >
      {/* cover image */}
      <div
        className="relative w-full h-48 overflow-hidden flex-shrink-0"
        style={{ backgroundColor: "var(--color-background-secondary)" }}
      >
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={32} style={{ color: "var(--color-text-tertiary)" }} />
          </div>
        )}
        {post.category && (
          <span
            className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full text-white"
            style={{ backgroundColor: "#ef4a23" }}
          >
            {post.category}
          </span>
        )}
      </div>

      {/* content */}
      <div className="flex flex-col gap-3 p-5 flex-1">
        <h3
          className="text-sm font-bold leading-snug line-clamp-2 group-hover:text-[#ef4a23] transition-colors"
          style={{ color: "var(--color-text-primary)" }}
        >
          {post.title}
        </h3>
        {post.excerpt && (
          <p
            className="text-xs leading-relaxed line-clamp-3"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto pt-2 border-t" style={{ borderColor: "var(--color-border-tertiary)" }}>
          <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            {post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
          </span>
          <span className="text-xs font-semibold" style={{ color: "#ef4a23" }}>
            Read more →
          </span>
        </div>
      </div>
    </Link>
  );
}

function BlogSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)" }}>
      <div className="w-full h-48 animate-pulse" style={{ backgroundColor: "var(--color-background-secondary)" }} />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-4 w-full rounded-lg animate-pulse" style={{ backgroundColor: "var(--color-background-secondary)" }} />
        <div className="h-4 w-3/4 rounded-lg animate-pulse" style={{ backgroundColor: "var(--color-background-secondary)" }} />
        <div className="h-3 w-full rounded animate-pulse" style={{ backgroundColor: "var(--color-background-secondary)" }} />
        <div className="h-3 w-2/3 rounded animate-pulse" style={{ backgroundColor: "var(--color-background-secondary)" }} />
      </div>
    </div>
  );
}

const CATEGORIES = ["All", "Technology", "Fashion", "Lifestyle", "Health", "Travel", "Business"];

export default function BlogPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.BLOGS, debouncedSearch, category, page],
    queryFn: () =>
      blogService.getAll({
        search: debouncedSearch,
        category: category === "All" ? undefined : category,
        page,
        limit: 9,
      }),
  });

  const posts = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-10">
      {/* header */}
      <div className="text-center mb-10">
        <span
          className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
          style={{ backgroundColor: "rgba(239,74,35,0.08)", color: "#ef4a23" }}
        >
          Our Blog
        </span>
        <h1 className="text-3xl font-black mb-2" style={{ color: "var(--color-text-primary)" }}>
          Latest Articles & News
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {isLoading ? "Loading..." : `${total} articles found`}
        </p>
      </div>

      {/* search */}
      <div
        className="flex items-center rounded-2xl overflow-hidden mb-6 max-w-xl mx-auto"
        style={{ border: "1px solid var(--color-border-secondary)", backgroundColor: "var(--color-background-primary)" }}
      >
        <div className="px-4" style={{ color: "#ef4a23" }}>
          <Search size={16} />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search articles..."
          className="flex-1 h-12 text-sm bg-transparent outline-none"
          style={{ color: "var(--color-text-primary)", fontFamily: "'Trebuchet MS', sans-serif" }}
        />
        {search && (
          <button onClick={() => { setSearch(""); setPage(1); }} className="px-4" style={{ color: "var(--color-text-tertiary)" }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* category tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl overflow-x-auto mb-8 w-fit mx-auto"
        style={{ backgroundColor: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)" }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => { setCategory(cat); setPage(1); }}
            className="px-4 h-8 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
            style={{
              backgroundColor: category === cat ? "#ef4a23" : "transparent",
              color: category === cat ? "#fff" : "var(--color-text-secondary)",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => <BlogSkeleton key={i} />)}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={28} />}
          title="No articles found"
          description="Try a different search term or category."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post: any) => <BlogCard key={post._id} post={post} />)}
        </div>
      )}

      {totalPages > 1 && !isLoading && (
        <div className="mt-10 flex justify-center">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}