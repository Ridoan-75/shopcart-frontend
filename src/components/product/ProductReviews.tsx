// src/components/product/ProductReviews.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, ThumbsUp, Send, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { reviewService } from "../../services/review.service";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { useAuthStore } from "../../stores/auth.store";
import Pagination from "../common/Pagination";
import EmptyState from "../common/EmptyState";

interface ProductReviewsProps {
  productId: string;
}

const reviewSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  body: z.string().min(10, "Review must be at least 10 characters"),
  rating: z.number().min(1).max(5),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < (hovered || value);
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            onMouseEnter={() => setHovered(i + 1)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              size={22}
              fill={filled ? "#ef4a23" : "none"}
              stroke={filled ? "#ef4a23" : "var(--color-border-secondary)"}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
      {value > 0 && (
        <span className="text-sm ml-2 font-medium" style={{ color: "#ef4a23" }}>
          {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][value]}
        </span>
      )}
    </div>
  );
}

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs w-4 text-right" style={{ color: "var(--color-text-tertiary)" }}>
        {star}
      </span>
      <Star size={11} fill="#ef4a23" stroke="#ef4a23" />
      <div
        className="flex-1 h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: "var(--color-background-secondary)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: "#ef4a23" }}
        />
      </div>
      <span className="text-xs w-8" style={{ color: "var(--color-text-tertiary)" }}>
        {pct}%
      </span>
    </div>
  );
}

function ReviewCard({ review }: { review: any }) {
  const initials = review.user?.name
    ? review.user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "AN";

  return (
    <div
      className="flex flex-col gap-3 p-5 rounded-2xl"
      style={{
        backgroundColor: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
      }}
    >
      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{
              backgroundColor: "rgba(239,74,35,0.1)",
              color: "#ef4a23",
              border: "1px solid rgba(239,74,35,0.2)",
            }}
          >
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {review.user?.name ?? "Anonymous"}
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              {review.createdAt
                ? new Date(review.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : ""}
            </p>
          </div>
        </div>
        {/* rating */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={13}
              fill={i < review.rating ? "#ef4a23" : "none"}
              stroke={i < review.rating ? "#ef4a23" : "var(--color-border-secondary)"}
              strokeWidth={1.5}
            />
          ))}
        </div>
      </div>

      {/* title */}
      {review.title && (
        <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
          {review.title}
        </p>
      )}

      {/* body */}
      <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
        {review.body}
      </p>

      {/* helpful */}
      {review.helpfulCount > 0 && (
        <div className="flex items-center gap-1.5 mt-1">
          <ThumbsUp size={12} style={{ color: "var(--color-text-tertiary)" }} />
          <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            {review.helpfulCount} found this helpful
          </span>
        </div>
      )}
    </div>
  );
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.REVIEWS, productId, page],
    queryFn: () => reviewService.getProductReviews(productId, { page, limit: 5 }),
  });

  const reviews = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const summary = data?.summary;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0 },
  });

  const rating = watch("rating");

  const { mutate: submitReview, isPending } = useMutation({
    mutationFn: (data: ReviewFormData) =>
      reviewService.createReview({ ...data, productId }),
    onSuccess: () => {
      toast.success("Review submitted!");
      reset();
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REVIEWS, productId] });
    },
    onError: () => toast.error("Failed to submit review. Please try again."),
  });

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
        Customer Reviews
      </h2>

      {/* rating summary */}
      {summary && (
        <div
          className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl"
          style={{
            backgroundColor: "var(--color-background-secondary)",
            border: "0.5px solid var(--color-border-tertiary)",
          }}
        >
          {/* avg score */}
          <div className="flex flex-col items-center justify-center gap-1 md:w-36 flex-shrink-0">
            <span className="text-6xl font-black" style={{ color: "#ef4a23" }}>
              {(summary.avgRating ?? 0).toFixed(1)}
            </span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i < Math.round(summary.avgRating ?? 0) ? "#ef4a23" : "none"}
                  stroke={i < Math.round(summary.avgRating ?? 0) ? "#ef4a23" : "var(--color-border-secondary)"}
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              {summary.totalReviews} reviews
            </p>
          </div>

          {/* bar chart */}
          <div className="flex-1 flex flex-col gap-2 justify-center">
            {[5, 4, 3, 2, 1].map((star) => (
              <RatingBar
                key={star}
                star={star}
                count={summary.ratingBreakdown?.[star] ?? 0}
                total={summary.totalReviews ?? 0}
              />
            ))}
          </div>
        </div>
      )}

      {/* write review button */}
      {user && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="self-start h-10 px-5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
          style={{ backgroundColor: "#ef4a23" }}
        >
          Write a Review
        </button>
      )}

      {/* review form */}
      {showForm && user && (
        <div
          className="p-6 rounded-2xl flex flex-col gap-5"
          style={{
            backgroundColor: "var(--color-background-primary)",
            border: "1px solid rgba(239,74,35,0.25)",
          }}
        >
          <h3 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
            Write Your Review
          </h3>

          <form onSubmit={handleSubmit((d) => submitReview(d))} className="flex flex-col gap-4">
            {/* star rating */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>
                Your Rating *
              </label>
              <StarInput value={rating} onChange={(v) => setValue("rating", v)} />
              {errors.rating && (
                <p className="text-xs" style={{ color: "#f02757" }}>Please select a rating</p>
              )}
            </div>

            {/* title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>
                Review Title *
              </label>
              <input
                {...register("title")}
                placeholder="Summarize your experience..."
                className="h-11 px-4 rounded-xl text-sm outline-none transition-all"
                style={{
                  backgroundColor: "var(--color-background-secondary)",
                  border: errors.title
                    ? "1px solid #f02757"
                    : "0.5px solid var(--color-border-secondary)",
                  color: "var(--color-text-primary)",
                  fontFamily: "'Trebuchet MS', sans-serif",
                }}
              />
              {errors.title && (
                <p className="text-xs" style={{ color: "#f02757" }}>{errors.title.message}</p>
              )}
            </div>

            {/* body */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>
                Review *
              </label>
              <textarea
                {...register("body")}
                placeholder="Share your experience with this product..."
                rows={4}
                className="px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
                style={{
                  backgroundColor: "var(--color-background-secondary)",
                  border: errors.body
                    ? "1px solid #f02757"
                    : "0.5px solid var(--color-border-secondary)",
                  color: "var(--color-text-primary)",
                  fontFamily: "'Trebuchet MS', sans-serif",
                }}
              />
              {errors.body && (
                <p className="text-xs" style={{ color: "#f02757" }}>{errors.body.message}</p>
              )}
            </div>

            {/* actions */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="h-10 px-6 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-opacity hover:opacity-85 disabled:opacity-50"
                style={{ backgroundColor: "#ef4a23" }}
              >
                {isPending ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
                Submit Review
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); reset(); }}
                className="h-10 px-5 rounded-xl text-sm font-medium transition-colors"
                style={{
                  border: "0.5px solid var(--color-border-secondary)",
                  color: "var(--color-text-secondary)",
                  backgroundColor: "transparent",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* not logged in nudge */}
      {!user && (
        <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
          Please{" "}
          <a href="/login" style={{ color: "#ef4a23" }} className="font-semibold hover:underline">
            login
          </a>{" "}
          to write a review.
        </p>
      )}

      {/* reviews list */}
      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl animate-pulse"
              style={{ backgroundColor: "var(--color-background-secondary)" }}
            />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          title="No reviews yet"
          description="Be the first to review this product!"
        />
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((review: any) => (
            <ReviewCard key={review._id} review={review} />
          ))}
        </div>
      )}

      {/* pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}