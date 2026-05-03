// src/app/(dashboard)/admin/reviews/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Star,
  Trash2,
  Search,
  ChevronDown,
  ToggleLeft,
  ToggleRight,
  MessageSquare,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import Loader from "../../../../components/common/Loader";
import axiosInstance from "../../../../lib/axios";

interface Review {
  _id: string;
  user: { _id: string; name: string; avatar?: string };
  product: { _id: string; name: string; thumbnail?: string };
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

type FilterType = "all" | "approved" | "pending";
type RatingFilter = "all" | "5" | "4" | "3" | "2" | "1";

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: "all", label: "All Reviews" },
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
];

const RATING_OPTIONS: { value: RatingFilter; label: string }[] = [
  { value: "all", label: "All Ratings" },
  { value: "5", label: "5 Stars" },
  { value: "4", label: "4 Stars" },
  { value: "3", label: "3 Stars" },
  { value: "2", label: "2 Stars" },
  { value: "1", label: "1 Star" },
];

const INPUT_STYLE = {
  border: "0.5px solid var(--color-border-secondary)",
  backgroundColor: "var(--color-background-secondary)",
  color: "var(--color-text-primary)",
};

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          fill={i < rating ? "#ef4a23" : "none"}
          stroke={i < rating ? "#ef4a23" : "var(--color-border-secondary)"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function FilterDropdown({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: any) => void;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium transition-all"
        style={{ ...INPUT_STYLE, minWidth: "140px" }}
      >
        <span className="flex-1 text-left">{selected?.label}</span>
        <ChevronDown
          size={14}
          style={{
            color: "var(--color-text-tertiary)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1.5 w-44 rounded-xl overflow-hidden z-20"
          style={{
            backgroundColor: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-secondary)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors"
              style={{
                backgroundColor:
                  value === opt.value
                    ? "rgba(239,74,35,0.07)"
                    : "transparent",
                color:
                  value === opt.value
                    ? "#ef4a23"
                    : "var(--color-text-secondary)",
              }}
              onMouseEnter={(e) => {
                if (value !== opt.value)
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "var(--color-background-secondary)";
              }}
              onMouseLeave={(e) => {
                if (value !== opt.value)
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "transparent";
              }}
            >
              {opt.label}
              {value === opt.value && (
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

export default function AdminReviewsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const LIMIT = 15;

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.REVIEWS, search, filter, ratingFilter, page],
    queryFn: () =>
      axiosInstance
        .get("/reviews", {
          params: {
            search: search || undefined,
            isApproved:
              filter === "approved"
                ? true
                : filter === "pending"
                ? false
                : undefined,
            rating: ratingFilter !== "all" ? ratingFilter : undefined,
            page,
            limit: LIMIT,
          },
        })
        .then((r) => r.data),
  });

  const reviews: Review[] = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;
  const totalReviews = data?.meta?.total ?? 0;

  const approveMutation = useMutation({
    mutationFn: ({ id, isApproved }: { id: string; isApproved: boolean }) =>
      axiosInstance.patch(`/reviews/${id}`, { isApproved }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.REVIEWS] });
      toast.success("Review updated!");
    },
    onError: () => toast.error("Failed to update review"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axiosInstance.delete(`/reviews/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.REVIEWS] });
      toast.success("Review deleted!");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete review"),
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  // summary counts from current page
  const approvedCount = reviews.filter((r) => r.isApproved).length;
  const pendingCount = reviews.filter((r) => !r.isApproved).length;
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "—";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Reviews
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {totalReviews} total reviews
          </p>
        </div>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Approved",
            value: approvedCount,
            color: "#16a34a",
            bg: "rgba(34,197,94,0.08)",
            border: "rgba(34,197,94,0.2)",
          },
          {
            label: "Pending",
            value: pendingCount,
            color: "#ca8a04",
            bg: "rgba(234,179,8,0.08)",
            border: "rgba(234,179,8,0.2)",
          },
          {
            label: "Avg Rating",
            value: avgRating,
            color: "#ef4a23",
            bg: "rgba(239,74,35,0.08)",
            border: "rgba(239,74,35,0.2)",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{
              backgroundColor: stat.bg,
              border: `0.5px solid ${stat.border}`,
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${stat.color}15` }}
            >
              <Star size={18} style={{ color: stat.color }} fill={stat.color} />
            </div>
            <div>
              <p
                className="text-2xl font-black leading-none"
                style={{ color: stat.color }}
              >
                {stat.value}
              </p>
              <p
                className="text-xs font-medium mt-0.5"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* search */}
        <div
          className="flex items-center rounded-xl overflow-hidden flex-1 min-w-[200px] max-w-xs"
          style={{ border: "0.5px solid var(--color-border-secondary)" }}
        >
          <div className="pl-3">
            <Search size={15} style={{ color: "var(--color-text-tertiary)" }} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by product or user..."
            className="flex-1 h-10 px-3 text-sm outline-none"
            style={{
              backgroundColor: "var(--color-background-secondary)",
              color: "var(--color-text-primary)",
            }}
          />
        </div>

        <FilterDropdown
          value={filter}
          onChange={(v: FilterType) => {
            setFilter(v);
            setPage(1);
          }}
          options={FILTER_OPTIONS}
        />

        <FilterDropdown
          value={ratingFilter}
          onChange={(v: RatingFilter) => {
            setRatingFilter(v);
            setPage(1);
          }}
          options={RATING_OPTIONS}
        />
      </div>

      {/* table */}
      {isLoading ? (
        <Loader fullPage={false} text="Loading reviews..." />
      ) : reviews.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ border: "0.5px solid var(--color-border-tertiary)" }}
        >
          <MessageSquare
            size={32}
            style={{ color: "var(--color-text-tertiary)" }}
            className="mb-3"
          />
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            No reviews found.
          </p>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "0.5px solid var(--color-border-tertiary)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{ backgroundColor: "var(--color-background-secondary)" }}
              >
                {[
                  "Product",
                  "User",
                  "Rating",
                  "Comment",
                  "Date",
                  "Approved",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reviews.map((review, i) => (
                <tr
                  key={review._id}
                  style={{
                    borderTop:
                      i > 0
                        ? "0.5px solid var(--color-border-tertiary)"
                        : "none",
                    backgroundColor: "var(--color-background-primary)",
                  }}
                >
                  {/* product */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                        style={{
                          backgroundColor: "var(--color-background-secondary)",
                          border: "0.5px solid var(--color-border-tertiary)",
                        }}
                      >
                        {review.product?.thumbnail ? (
                          <Image
                            src={review.product.thumbnail}
                            alt={review.product.name}
                            width={36}
                            height={36}
                            className="object-cover"
                          />
                        ) : (
                          <Star
                            size={14}
                            style={{ color: "var(--color-text-tertiary)" }}
                          />
                        )}
                      </div>
                      <p
                        className="text-xs font-medium max-w-[120px] truncate"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {review.product?.name ?? "—"}
                      </p>
                    </div>
                  </td>

                  {/* user */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{
                          backgroundColor: "rgba(239,74,35,0.1)",
                          color: "#ef4a23",
                        }}
                      >
                        {review.user?.name?.[0]?.toUpperCase() ?? "U"}
                      </div>
                      <span
                        className="text-xs font-medium max-w-[100px] truncate"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {review.user?.name ?? "—"}
                      </span>
                    </div>
                  </td>

                  {/* rating */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <StarDisplay rating={review.rating} />
                      <span
                        className="text-xs font-bold"
                        style={{ color: "#ef4a23" }}
                      >
                        {review.rating}
                      </span>
                    </div>
                  </td>

                  {/* comment */}
                  <td className="px-4 py-3 max-w-[200px]">
                    <p
                      className="text-xs leading-relaxed line-clamp-2"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {review.comment || (
                        <span style={{ color: "var(--color-text-tertiary)" }}>
                          No comment
                        </span>
                      )}
                    </p>
                  </td>

                  {/* date */}
                  <td
                    className="px-4 py-3 text-xs whitespace-nowrap"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {formatDate(review.createdAt)}
                  </td>

                  {/* approve toggle */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        approveMutation.mutate({
                          id: review._id,
                          isApproved: !review.isApproved,
                        })
                      }
                      className="transition-opacity hover:opacity-70"
                    >
                      {review.isApproved ? (
                        <ToggleRight
                          size={28}
                          style={{ color: "#ef4a23" }}
                        />
                      ) : (
                        <ToggleLeft
                          size={28}
                          style={{ color: "var(--color-text-tertiary)" }}
                        />
                      )}
                    </button>
                  </td>

                  {/* delete */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDeleteId(review._id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                      style={{ color: "#f02757" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-9 px-3 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
            style={{
              border: "0.5px solid var(--color-border-secondary)",
              backgroundColor: "var(--color-background-primary)",
              color: "var(--color-text-secondary)",
            }}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
            )
            .reduce<(number | "...")[]>((acc, p, idx, arr) => {
              if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                acc.push("...");
              acc.push(p);
              return acc;
            }, [])
            .map((p, idx) =>
              p === "..." ? (
                <span
                  key={`e-${idx}`}
                  className="w-9 h-9 flex items-center justify-center text-sm"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className="w-9 h-9 rounded-xl text-sm font-medium transition-all"
                  style={
                    page === p
                      ? {
                          backgroundColor: "#ef4a23",
                          color: "#fff",
                          border: "0.5px solid #ef4a23",
                        }
                      : {
                          backgroundColor: "var(--color-background-primary)",
                          color: "var(--color-text-primary)",
                          border: "0.5px solid var(--color-border-secondary)",
                        }
                  }
                >
                  {p}
                </button>
              )
            )}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="h-9 px-3 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
            style={{
              border: "0.5px solid var(--color-border-secondary)",
              backgroundColor: "var(--color-background-primary)",
              color: "var(--color-text-secondary)",
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4"
            style={{
              backgroundColor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-secondary)",
            }}
          >
            <h2
              className="font-bold text-base"
              style={{ color: "var(--color-text-primary)" }}
            >
              Delete Review?
            </h2>
            <p
              className="text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              This will permanently delete the review. The product rating may be
              affected.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="h-10 px-4 rounded-xl text-sm font-medium"
                style={{
                  border: "0.5px solid var(--color-border-secondary)",
                  color: "var(--color-text-secondary)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                className="h-10 px-5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-40"
                style={{ backgroundColor: "#f02757" }}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}