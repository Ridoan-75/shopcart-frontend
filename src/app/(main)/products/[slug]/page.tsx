// src/app/(main)/products/[slug]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { productService } from "../../../../services/product.service";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import ProductImages from "../../../../components/product/ProductImages";
import ProductInfo from "../../../../components/product/ProductInfo";
import ProductSkeleton from "../../../../components/product/ProductSkeleton";
import ProductReviews from "../../../../components/product/ProductReviews";
import RelatedProducts from "../../../../components/product/RelatedProducts";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "../../../../constants/routes";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, slug],
    queryFn: () => productService.getBySlug(slug),
    enabled: !!slug,
  });

  const product = data?.data;

  if (isLoading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-10">
        <ProductSkeleton />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-20 text-center">
        <p className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
          Product not found
        </p>
        <Link
          href={ROUTES.PRODUCTS}
          className="mt-4 inline-block text-sm font-medium hover:underline"
          style={{ color: "#ef4a23" }}
        >
          ← Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-8">
      {/* breadcrumb */}
      <nav className="flex items-center gap-2 text-xs mb-8" style={{ color: "var(--color-text-tertiary)" }}>
        <Link href={ROUTES.HOME} className="hover:text-[#ef4a23] transition-colors">Home</Link>
        <ChevronRight size={13} />
        <Link href={ROUTES.PRODUCTS} className="hover:text-[#ef4a23] transition-colors">Products</Link>
        {product.category?.name && (
          <>
            <ChevronRight size={13} />
            <Link
              href={`/categories/${product.category.slug ?? product.category._id}`}
              className="hover:text-[#ef4a23] transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight size={13} />
        <span className="font-medium truncate max-w-[180px]" style={{ color: "var(--color-text-primary)" }}>
          {product.name}
        </span>
      </nav>

      {/* product main section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        <ProductImages
          images={product.images ?? []}
          thumbnail={product.thumbnail ?? ""}
          name={product.name}
        />
        <ProductInfo product={product} />
      </div>

      {/* tabs: description + specs */}
      <ProductTabs product={product} />

      {/* reviews */}
      <section className="mt-16">
        <ProductReviews productId={product._id} />
      </section>

      {/* related products */}
      {product.category?._id && (
        <section className="mt-16">
          <RelatedProducts
            categoryId={product.category._id}
            currentProductId={product._id}
          />
        </section>
      )}
    </div>
  );
}

function ProductTabs({ product }: { product: any }) {
  const tabs = ["Description", "Specifications"];
  const [active, setActive] = (function () {
    const { useState } = require("react");
    return useState("Description");
  })();

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
      }}
    >
      {/* tab buttons */}
      <div
        className="flex border-b"
        style={{ borderColor: "var(--color-border-tertiary)" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className="px-6 py-4 text-sm font-semibold transition-all relative"
            style={{
              color: active === tab ? "#ef4a23" : "var(--color-text-secondary)",
              backgroundColor: "transparent",
            }}
          >
            {tab}
            {active === tab && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                style={{ backgroundColor: "#ef4a23" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* tab content */}
      <div className="p-6">
        {active === "Description" ? (
          <div
            className="text-sm leading-relaxed prose max-w-none"
            style={{ color: "var(--color-text-secondary)" }}
            dangerouslySetInnerHTML={{
              __html: product.description ?? product.shortDescription ?? "No description available.",
            }}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {product.specifications && Object.entries(product.specifications).length > 0 ? (
              Object.entries(product.specifications).map(([key, val]) => (
                <div
                  key={key}
                  className="flex items-start gap-4 py-3 border-b last:border-0"
                  style={{ borderColor: "var(--color-border-tertiary)" }}
                >
                  <span
                    className="text-sm font-semibold w-40 flex-shrink-0"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {key}
                  </span>
                  <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    {String(val)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
                No specifications available.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}