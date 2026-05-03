// src/app/(main)/products/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { productService } from "../../../services/product.service";
import { QUERY_KEYS } from "../../../constants/queryKeys";
import { useDebounce } from "../../../hooks/useDebounce";
import ProductGrid from "../../../components/product/ProductGrid";
import ProductFilters, { FilterState } from "../../../components/product/ProductFilters";
import ProductSort, { SortOption } from "../../../components/product/ProductSort";
import Pagination from "../../../components/common/Pagination";

const DEFAULT_FILTERS: FilterState = {
  categoryId: "",
  brandId: "",
  minPrice: 0,
  maxPrice: 10000,
  rating: 0,
};

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [sort, setSort] = useState<SortOption>((searchParams.get("sort") as SortOption) ?? "newest");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [filters, setFilters] = useState<FilterState>({
    categoryId: searchParams.get("categoryId") ?? "",
    brandId: searchParams.get("brandId") ?? "",
    minPrice: Number(searchParams.get("minPrice")) || 0,
    maxPrice: Number(searchParams.get("maxPrice")) || 10000,
    rating: Number(searchParams.get("rating")) || 0,
  });

  const debouncedSearch = useDebounce(search, 400);

  // sync URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (sort !== "newest") params.set("sort", sort);
    if (page > 1) params.set("page", String(page));
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.brandId) params.set("brandId", filters.brandId);
    if (filters.minPrice > 0) params.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice < 10000) params.set("maxPrice", String(filters.maxPrice));
    if (filters.rating > 0) params.set("rating", String(filters.rating));
    router.replace(`/products?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, sort, page, filters]);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, debouncedSearch, sort, page, filters],
    queryFn: () =>
      productService.getAll({
        search: debouncedSearch,
        sort,
        page,
        limit: 12,
        ...filters,
      }),
  });

  const products = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    setPage(1);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-8">
      {/* page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black" style={{ color: "var(--color-text-primary)" }}>
          All Products
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-tertiary)" }}>
          {isLoading ? "Loading..." : `${total.toLocaleString()} products found`}
        </p>
      </div>

      {/* search bar */}
      <div
        className="flex items-center rounded-2xl overflow-hidden mb-6"
        style={{
          border: "1px solid var(--color-border-secondary)",
          backgroundColor: "var(--color-background-primary)",
        }}
      >
        <div className="px-4 flex-shrink-0" style={{ color: "#ef4a23" }}>
          <Search size={18} />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search products, brands, categories..."
          className="flex-1 h-13 py-4 text-sm bg-transparent outline-none"
          style={{ color: "var(--color-text-primary)", fontFamily: "'Trebuchet MS', sans-serif" }}
        />
        {search && (
          <button
            onClick={() => { setSearch(""); setPage(1); }}
            className="px-4 flex-shrink-0"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* layout */}
      <div className="flex gap-6">
        {/* filters sidebar */}
        <ProductFilters filters={filters} onFilterChange={handleFilterChange} />

        {/* main content */}
        <div className="flex-1 min-w-0">
          {/* sort + result count */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <p className="text-sm hidden sm:block" style={{ color: "var(--color-text-tertiary)" }}>
              Showing <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>{products.length}</span> of {total} results
            </p>
            <div className="flex items-center gap-2 ml-auto">
              <ProductFilters filters={filters} onFilterChange={handleFilterChange} />
              <ProductSort sort={sort} onSortChange={handleSortChange} />
            </div>
          </div>

          <ProductGrid products={products} isLoading={isLoading} />

          {totalPages > 1 && !isLoading && (
            <div className="mt-10 flex justify-center">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}