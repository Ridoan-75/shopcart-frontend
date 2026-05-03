"use client";

import { useQuery } from "@tanstack/react-query";
import { getFeaturedBlogs } from "../../services/blog.service";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { Blog } from "../../types/blog.types";
import { formatDateShort, truncateText } from "../../lib/utils";
import { ROUTES } from "../../constants/routes";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Clock, ArrowRight } from "lucide-react";
import { Skeleton } from "../../components/ui/skeleton";

function BlogCardSkeleton() {
  return (
    <div className="bg-white dark:bg-tech-dark rounded-2xl overflow-hidden shadow-sm">
      <Skeleton className="w-full h-52" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

function BlogCard({ blog }: { blog: Blog }) {
  return (
    <Link
      href={ROUTES.BLOG_DETAIL(blog.slug)}
      className="group bg-white dark:bg-tech-dark rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="relative w-full h-52 overflow-hidden">
        <Image
          src={blog.coverImage ?? "/images/blog-placeholder.jpg"}
          alt={blog.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {blog.category && (
          <span className="absolute top-3 left-3 bg-tech_orange text-white text-xs font-semibold px-3 py-1 rounded-full">
            {blog.category.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-tech_light_color dark:text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays size={13} />
            {formatDateShort(blog.publishedAt ?? blog.createdAt)}
          </span>
          {blog.readingTime && (
            <span className="flex items-center gap-1">
              <Clock size={13} />
              {blog.readingTime} min read
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-base text-tech_black dark:text-white leading-snug group-hover:text-tech_orange transition-colors duration-200">
          {truncateText(blog.title, 60)}
        </h3>

        {/* Excerpt */}
        {blog.excerpt && (
          <p className="text-sm text-tech_light_color dark:text-muted-foreground leading-relaxed flex-1">
            {truncateText(blog.excerpt, 100)}
          </p>
        )}

        {/* Read More */}
        <span className="flex items-center gap-1 text-sm font-semibold text-tech_orange mt-auto group-hover:gap-2 transition-all duration-200">
          Read More <ArrowRight size={15} />
        </span>
      </div>
    </Link>
  );
}

export default function BlogSection() {
  const { data, isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.BLOGS,
    queryFn: getFeaturedBlogs,
    staleTime: 1000 * 60 * 5,
  });

  const blogs = data?.data?.slice(0, 3) ?? [];

  return (
    <section className="py-14 bg-tech_bg_color dark:bg-[#081621]">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-tech_orange font-semibold text-sm uppercase tracking-widest mb-1">
              Latest News
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-tech_black dark:text-white">
              From Our Blog
            </h2>
          </div>
          <Link
            href={ROUTES.BLOG}
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-tech_orange hover:gap-2 transition-all duration-200"
          >
            View All <ArrowRight size={15} />
          </Link>
        </div>

        {/* Grid */}
        {isError ? (
          <p className="text-center text-muted-foreground py-10">
            Failed to load blogs.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <BlogCardSkeleton key={i} />
                ))
              : blogs.map((blog) => <BlogCard key={blog.id} blog={blog} />)}
          </div>
        )}

        {/* Mobile View All */}
        <div className="mt-8 flex justify-center sm:hidden">
          <Link
            href={ROUTES.BLOG}
            className="flex items-center gap-1 text-sm font-semibold text-tech_orange"
          >
            View All Blogs <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}