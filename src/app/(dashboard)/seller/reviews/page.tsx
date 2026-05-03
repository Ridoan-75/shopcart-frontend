// src/app/(dashboard)/seller/reviews/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Star,
  Search,
  MessageSquare,
  ThumbsUp,
  Flag,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import Loader from "../../../../components/common/Loader";
import axiosInstance from "../../../../lib/axios";

const RATING_TABS = ["ALL", "5", "4", "3", "2", "1"];
const PAGE_SIZE = 10;

function StarRow({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={13}
          fill={i < Math.round(rating) ? "#ef4a23" : "none"}
          stroke={i < Math.round(rating) ? "#ef4a23" : "var(--color-border-secondary)"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs w-3 text-right flex-shrink-0" style={{ color: "var(--color-text-tertiary)" }}>
        {label}
      </span>
      <Star size={10} fill="#ef4a23" stroke="#ef4a23" />
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-background-secondary)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: "#ef4a23" }}
        />
      </div>
      <span className="text-xs w-6 flex-shrink-0" style={{ color: "var(--color-text-tertiary)" }}>
        {count}
      </span>
    </div>
  );
}

export default function SellerReviewsPage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.SELLER_REVIEWS, activeTab, search, page],
    queryFn: () =>
      axiosInstance
        .get("/seller/reviews", {
          params: {
            rating: activeTab === "ALL" ? undefined : activeTab,
            search: search || undefined,
            page,
            limit: PAGE_SIZE,
          },
        })
        .then((r) => r.data),
  });

  const reviews: any[] = data?.data ?? [];
  const totalPages: number = data?.pagination?.totalPages ?? 1;
  const stats = data?.stats ?? {};

  const submitReply = useMutation({
    mutationFn: ({ id, reply }: { id: string; reply: string }) =>
      axiosInstance.post(`/seller/reviews/${id}/reply`, { reply }),
    onSuccess: () => {
      toast.success("Reply posted!");
      setReplyingId(null);
      setReplyText("");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SELLER_REVIEWS] });
    },
    onError: () => toast.error("Failed to post reply"),
  });

  const reportReview = useMutation({
    mutationFn: (id: string) => axiosInstance.post(`/seller/reviews/${id}/report`),
    onSuccess: () => toast.success("Review reported"),
    onError: () => toast.error("Failed to report review"),
  });

  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          Customer Reviews
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
          Monitor and respond to your product reviews
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Overall Rating */}
        <div
          className="rounded-2xl p-5 flex items-center gap-5"
          style={{ backgroundColor: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)" }}
        >
          <div className="text-center flex-shrink-0">
            <p className="text-5xl font-black" style={{ color: "var(--color-text-primary)" }}>
              {(stats.avgRating ?? 0).toFixed(1)}
            </p>
            <StarRow rating={stats.avgRating ?? 0} />
            <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
              {stats.totalReviews ?? 0} reviews
            </p>
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            {[5, 4, 3, 2, 1].map((r) => (
              <RatingBar
                key={r}
                label={String(r)}
                count={stats.breakdown?.[r] ?? 0}
                total={stats.totalReviews ?? 0}
              />
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        {[
          { label: "Total Reviews", value: stats.totalReviews ?? 0, icon: MessageSquare, color: "#3749bb" },
          { label: "Replied", value: stats.replied ?? 0, icon: ThumbsUp, color: "#16a34a" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-2xl p-5 flex flex-col justify-between"
            style={{ backgroundColor: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${color}18`, color }}
            >
              <Icon size={18} />
            </div>
            <div>
              <p className="text-3xl font-black mt-3" style={{ color: "var(--color-text-primary)" }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {RATING_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(1); }}
              className="h-9 px-4 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-1.5"
              style={{
                backgroundColor: activeTab === tab ? "#ef4a23" : "var(--color-background-secondary)",
                color: activeTab === tab ? "#fff" : "var(--color-text-secondary)",
                border: activeTab === tab ? "none" : "0.5px solid var(--color-border-secondary)",
              }}
            >
              {tab !== "ALL" && <Star size={12} fill={activeTab === tab ? "#fff" : "#ef4a23"} stroke={activeTab === tab ? "#fff" : "#ef4a23"} />}
              {tab === "ALL" ? "All Reviews" : `${tab} Star`}
            </button>
          ))}
        </div>

        <div className="relative flex-shrink-0">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-tertiary)" }} />
          <input
            type="text"
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="h-10 pl-9 pr-4 rounded-xl text-sm outline-none w-full md:w-56"
            style={{ backgroundColor: "var(--color-background-primary)", border: "0.5px solid var(--color-border-secondary)", color: "var(--color-text-primary)" }}
          />
        </div>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <Loader fullPage={false} />
      ) : reviews.length > 0 ? (
        <div className="flex flex-col gap-4">
          {reviews.map((review: any) => (
            <div
              key={review._id}
              className="rounded-2xl p-5 flex flex-col gap-4"
              style={{ backgroundColor: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)" }}
            >
              {/* Review Header */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  {/* User Avatar */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: "rgba(239,74,35,0.1)", color: "#ef4a23" }}
                  >
                    {review.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                      {review.user?.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                      {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StarRow rating={review.rating} />
                  <button
                    onClick={() => reportReview.mutate(review._id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                    style={{ backgroundColor: "rgba(240,39,87,0.08)", color: "#f02757" }}
                    title="Report"
                  >
                    <Flag size={13} />
                  </button>
                </div>
              </div>

              {/* Product Reference */}
              {review.product && (
                <div
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ backgroundColor: "var(--color-background-secondary)" }}
                >
                  {review.product.thumbnail && (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={review.product.thumbnail} alt={review.product.name} fill className="object-cover" sizes="40px" />
                    </div>
                  )}
                  <p className="text-xs font-semibold truncate" style={{ color: "var(--color-text-secondary)" }}>
                    {review.product.name}
                  </p>
                </div>
              )}

              {/* Review Text */}
              {review.title && (
                <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  "{review.title}"
                </p>
              )}
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                {review.body}
              </p>

              {/* Existing Reply */}
              {review.reply && (
                <div
                  className="flex gap-3 p-4 rounded-xl"
                  style={{ backgroundColor: "rgba(239,74,35,0.04)", border: "0.5px solid rgba(239,74,35,0.15)" }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: "#ef4a23" }}
                  >
                    S
                  </div>
                  <div>
                    <p className="text-xs font-bold mb-1" style={{ color: "#ef4a23" }}>Your Reply</p>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{review.reply}</p>
                  </div>
                </div>
              )}

              {/* Reply Input */}
              {replyingId === review._id ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={3}
                    placeholder="Write a helpful, professional reply..."
                    className="px-4 py-3 rounded-xl text-sm outline-none w-full resize-none"
                    style={{ backgroundColor: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-secondary)", color: "var(--color-text-primary)" }}
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => { setReplyingId(null); setReplyText(""); }}
                      className="h-9 px-4 rounded-xl text-sm font-semibold transition-opacity hover:opacity-70"
                      style={{ border: "0.5px solid var(--color-border-secondary)", color: "var(--color-text-secondary)" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => submitReply.mutate({ id: review._id, reply: replyText })}
                      disabled={!replyText.trim() || submitReply.isPending}
                      className="h-9 px-4 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ backgroundColor: "#ef4a23" }}
                    >
                      {submitReply.isPending ? "Posting..." : "Post Reply"}
                    </button>
                  </div>
                </div>
              ) : (
                !review.reply && (
                  <button
                    onClick={() => { setReplyingId(review._id); setReplyText(""); }}
                    className="self-start flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70"
                    style={{ color: "#ef4a23" }}
                  >
                    <MessageSquare size={13} />
                    Reply to this review
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(239,74,35,0.08)" }}>
            <Star size={24} style={{ color: "#ef4a23" }} />
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>No reviews yet</p>
          <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Reviews will appear here once customers rate your products</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ border: "0.5px solid var(--color-border-secondary)", backgroundColor: "var(--color-background-primary)", color: "var(--color-text-secondary)" }}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | "...")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`e-${i}`} className="text-xs px-1" style={{ color: "var(--color-text-tertiary)" }}>...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className="w-9 h-9 rounded-xl text-sm font-medium transition-all"
                    style={page === p
                      ? { backgroundColor: "#ef4a23", color: "#fff", border: "none" }
                      : { backgroundColor: "var(--color-background-primary)", color: "var(--color-text-primary)", border: "0.5px solid var(--color-border-secondary)" }}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ border: "0.5px solid var(--color-border-secondary)", backgroundColor: "var(--color-background-primary)", color: "var(--color-text-secondary)" }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}