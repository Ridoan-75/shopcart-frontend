// src/components/product/RelatedProducts.tsx
"use client";

import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { productService } from "../../services/product.service";
import { QUERY_KEYS } from "../../constants/queryKeys";
import ProductCard from "./ProductCard";
import SkeletonCard from "../common/SkeletonCard";

interface RelatedProductsProps {
  categoryId: string;
  currentProductId: string;
}

export default function RelatedProducts({
  categoryId,
  currentProductId,
}: RelatedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, "related", categoryId],
    queryFn: () =>
      productService.getAll({ categoryId, limit: 8 }),
    enabled: !!categoryId,
  });

  const products =
    (data?.data ?? []).filter((p: any) => p._id !== currentProductId);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  if (!isLoading && products.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-2"
            style={{ backgroundColor: "rgba(239,74,35,0.08)", color: "#ef4a23" }}
          >
            You May Also Like
          </span>
          <h2 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            Related Products
          </h2>
        </div>

        {/* nav buttons — hidden on mobile */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            style={{
              border: "0.5px solid var(--color-border-secondary)",
              backgroundColor: "var(--color-background-primary)",
              color: "var(--color-text-secondary)",
            }}
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 text-white"
            style={{ backgroundColor: "#ef4a23" }}
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-60 md:w-64">
                <SkeletonCard />
              </div>
            ))
          : products.map((product: any) => (
              <div key={product._id} className="flex-shrink-0 w-60 md:w-64">
                <ProductCard product={product} />
              </div>
            ))}
      </div>
    </div>
  );
}