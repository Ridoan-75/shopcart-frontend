// src/app/(main)/blog/[slug]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Calendar, User, Clock, ArrowLeft } from "lucide-react";
import { blogService } from "../../../../services/blog.service";
import { QUERY_KEYS } from "../../../../constants/queryKeys";

function BlogDetailSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-6">
      <div className="h-6 w-32 rounded-lg" style={{ backgroundColor: "var(--color-background-secondary)" }} />
      <div className="h-10 w-full rounded-xl" style={{ backgroundColor: "var(--color-background-secondary)" }} />
      <div className="h-10 w-2/3 rounded-xl" style={{ backgroundColor: "var(--color-background-secondary)" }} />
      <div className="w-full h-80 rounded-2xl" style={{ backgroundColor: "var(--color-background-secondary)" }} />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-4 rounded" style={{ backgroundColor: "var(--color-background-secondary)", width: i % 3 === 2 ? "70%" : "100%" }} />
      ))}
    </div>
  );
}

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEYS.BLOGS, slug],
    queryFn: () => blogService.getBySlug(slug),
    enabled: !!slug,
  });

  const { data: relatedData } = useQuery({
    queryKey: [QUERY_KEYS.BLOGS, "related", slug],
    queryFn: () => blogService.getAll({ limit: 3 }),
    enabled: !!slug,
  });

  const post = data?.data;
  const related = relatedData?.data?.filter((p: any) => p.slug !== slug).slice(0, 3) ?? [];

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
        <BlogDetailSkeleton />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-base font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
          Article not found
        </p>
        <Link href="/blog" className="text-sm font-medium hover:underline" style={{ color: "#ef4a23" }}>
          ← Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-10">
      <div className="max-w-3xl mx-auto">
        {/* breadcrumb */}
        <nav className="flex items-center gap-2 text-xs mb-8" style={{ color: "var(--color-text-tertiary)" }}>
          <Link href="/" className="hover:text-[#ef4a23] transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link href="/blog" className="hover:text-[#ef4a23] transition-colors">Blog</Link>
          <ChevronRight size={12} />
          <span className="font-medium truncate max-w-[200px]" style={{ color: "var(--color-text-primary)" }}>
            {post.title}
          </span>
        </nav>

        {/* category */}
        {post.category && (
          <span
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
            style={{ backgroundColor: "rgba(239,74,35,0.1)", color: "#ef4a23" }}
          >
            {post.category}
          </span>
        )}

        {/* title */}
        <h1 className="text-2xl md:text-3xl font-black leading-snug mb-5" style={{ color: "var(--color-text-primary)" }}>
          {post.title}
        </h1>

        {/* meta */}
        <div className="flex flex-wrap items-center gap-4 mb-8 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          {post.author && (
            <div className="flex items-center gap-1.5">
              <User size={13} />
              <span>{post.author?.name ?? post.author}</span>
            </div>
          )}
          {post.createdAt && (
            <div className="flex items-center gap-1.5">
              <Calendar size={13} />
              <span>{new Date(post.createdAt).toLocaleDateString("en-US", { dateStyle: "long" })}</span>
            </div>
          )}
          {post.readTime && (
            <div className="flex items-center gap-1.5">
              <Clock size={13} />
              <span>{post.readTime} min read</span>
            </div>
          )}
        </div>

        {/* cover image */}
        {post.coverImage && (
          <div className="relative w-full h-72 md:h-96 rounded-2xl overflow-hidden mb-10" style={{ backgroundColor: "var(--color-background-secondary)" }}>
            <Image src={post.coverImage} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 800px" />
          </div>
        )}

        {/* content */}
        <div
          className="prose prose-sm max-w-none text-sm leading-relaxed"
          style={{ color: "var(--color-text-secondary)" }}
          dangerouslySetInnerHTML={{ __html: post.content ?? post.body ?? "<p>No content available.</p>" }}
        />

        {/* back link */}
        <div className="mt-12 pt-6 border-t" style={{ borderColor: "var(--color-border-tertiary)" }}>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-opacity"
            style={{ color: "#ef4a23" }}
          >
            <ArrowLeft size={14} />
            Back to Blog
          </Link>
        </div>
      </div>

      {/* related articles */}
      {related.length > 0 && (
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-lg font-black mb-6" style={{ color: "var(--color-text-primary)" }}>
            Related Articles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {related.map((rel: any) => (
              <Link
                key={rel._id}
                href={`/blog/${rel.slug}`}
                className="flex flex-col rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
                style={{ backgroundColor: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)" }}
              >
                {rel.coverImage && (
                  <div className="relative w-full h-36 overflow-hidden" style={{ backgroundColor: "var(--color-background-secondary)" }}>
                    <Image src={rel.coverImage} alt={rel.title} fill className="object-cover" sizes="300px" />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-sm font-semibold line-clamp-2 hover:text-[#ef4a23] transition-colors" style={{ color: "var(--color-text-primary)" }}>
                    {rel.title}
                  </p>
                  <p className="text-xs mt-2" style={{ color: "var(--color-text-tertiary)" }}>
                    {rel.createdAt ? new Date(rel.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}