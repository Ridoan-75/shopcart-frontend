// src/app/(main)/brands/[slug]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { brandService } from "../../../../services/brand.service";
import { productService } from "../../../../services/product.service";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import ProductGrid from "../../../../components/product/ProductGrid";

export default function BrandDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: brandData, isLoading: brandLoading } = useQuery({
    queryKey: [QUERY_KEYS.BRANDS, slug],
    queryFn: () => brandService.getBySlug(slug),
    enabled: !!slug,
  });

  const brand = brandData?.data;

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, "brand", brand?._id],
    queryFn: () => productService.getAll({ brandId: brand._id, limit: 20 }),
    enabled: !!brand?._id,
  });

  const products = productsData?.data ?? [];

  if (!brandLoading && !brand) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-base font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
          Brand not found
        </p>
        <Link href="/brands" className="text-sm font-medium hover:underline" style={{ color: "#ef4a23" }}>
          ← Back to Brands
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
        <Link href="/brands" className="hover:text-[#ef4a23] transition-colors">Brands</Link>
        <ChevronRight size={12} />
        <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>
          {brand?.name ?? "..."}
        </span>
      </nav>

      {/* brand hero */}
      {brandLoading ? (
        <div
          className="w-full h-44 rounded-2xl animate-pulse mb-10"
          style={{ backgroundColor: "var(--color-background-secondary)" }}
        />
      ) : (
        <div
          className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-7 rounded-2xl mb-10"
          style={{
            backgroundColor: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
          }}
        >
          {/* logo */}
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0"
            style={{
              backgroundColor: "var(--color-background-secondary)",
              border: "0.5px solid var(--color-border-tertiary)",
            }}
          >
            {brand?.logo ? (
              <Image
                src={brand.logo}
                alt={brand.name}
                width={96}
                height={96}
                className="object-contain w-full h-full"
              />
            ) : (
              <span className="text-3xl font-black" style={{ color: "#ef4a23" }}>
                {brand?.name?.[0]?.toUpperCase()}
              </span>
            )}
          </div>

          {/* info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-black mb-2" style={{ color: "var(--color-text-primary)" }}>
              {brand?.name}
            </h1>
            {brand?.description && (
              <p className="text-sm leading-relaxed mb-3 max-w-xl" style={{ color: "var(--color-text-secondary)" }}>
                {brand.description}
              </p>
            )}
            <div className="flex items-center gap-3 justify-center sm:justify-start flex-wrap">
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ backgroundColor: "rgba(239,74,35,0.08)", color: "#ef4a23" }}
              >
                {products.length} Products
              </span>
              {brand?.website && (
                
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium hover:underline"
                  style={{ color: "#3749bb" }}
                >
                  Visit Website →
                </a>
              )}
            </div>
          </div>

          {/* back */}
          <Link
            href="/brands"
            className="flex items-center gap-1.5 text-xs font-semibold hover:opacity-70 transition-opacity flex-shrink-0"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            <ArrowLeft size={13} />
            All Brands
          </Link>
        </div>
      )}

      {/* products */}
      <div className="mb-5">
        <h2 className="text-lg font-black" style={{ color: "var(--color-text-primary)" }}>
          Products by {brand?.name}
        </h2>
      </div>
      <ProductGrid products={products} isLoading={productsLoading || brandLoading} />
    </div>
  );
}