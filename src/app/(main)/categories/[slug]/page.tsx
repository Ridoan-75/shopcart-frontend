// src/app/(main)/categories/[slug]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { categoryService } from "../../../../services/category.service";
import { productService } from "../../../../services/product.service";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import ProductGrid from "../../../../components/product/ProductGrid";

export default function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES, slug],
    queryFn: () => categoryService.getBySlug(slug),
    enabled: !!slug,
  });

  const category = categoryData?.data;

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, "category", category?._id],
    queryFn: () => productService.getAll({ categoryId: category._id, limit: 20 }),
    enabled: !!category?._id,
  });

  const products = productsData?.data ?? [];

  if (!categoryLoading && !category) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-base font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
          Category not found
        </p>
        <Link href="/categories" className="text-sm font-medium hover:underline" style={{ color: "#ef4a23" }}>
          ← Back to Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-10">
      {/* breadcrumb */}
      <nav className="flex items-center gap-2 text-xs mb-8" style={{ color: "var(--color-text-tertiary)" }}>
        <Link href="/" className="hover:text-[#ef4a23] transition-colors">Home</Link>
        <ChevronRight size={12} />
        <Link href="/categories" className="hover:text-[#ef4a23] transition-colors">Categories</Link>
        <ChevronRight size={12} />
        <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>
          {category?.name ?? "..."}
        </span>
      </nav>

      {/* category hero */}
      {categoryLoading ? (
        <div
          className="w-full h-44 rounded-2xl animate-pulse mb-10"
          style={{ backgroundColor: "var(--color-background-secondary)" }}
        />
      ) : (
        <div
          className="relative w-full rounded-2xl overflow-hidden mb-10"
          style={{ border: "0.5px solid var(--color-border-tertiary)" }}
        >
          {/* bg image or gradient */}
          {category?.image ? (
            <div className="relative w-full h-48">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(8,22,33,0.85) 0%, rgba(8,22,33,0.3) 100%)" }} />
            </div>
          ) : (
            <div
              className="w-full h-48"
              style={{ background: "linear-gradient(135deg, #ef4a23 0%, #c73d1a 100%)" }}
            />
          )}

          {/* content overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-7">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-2xl font-black text-white mb-1">{category?.name}</h1>
                {category?.description && (
                  <p className="text-sm text-white/70 max-w-lg">{category.description}</p>
                )}
                <span
                  className="inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#fff" }}
                >
                  {products.length} Products
                </span>
              </div>
              <Link
                href="/categories"
                className="flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft size={13} />
                All Categories
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* products */}
      <div className="mb-5">
        <h2 className="text-lg font-black" style={{ color: "var(--color-text-primary)" }}>
          Products in {category?.name}
        </h2>
      </div>
      <ProductGrid products={products} isLoading={productsLoading || categoryLoading} />
    </div>
  );
}