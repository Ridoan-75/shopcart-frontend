// src/app/(dashboard)/seller/products/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Package,
  ChevronLeft,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import Loader from "../../../../components/common/Loader";
import axiosInstance from "../../../../lib/axios";

const STATUS_TABS = ["ALL", "ACTIVE", "INACTIVE", "OUT_OF_STOCK"];
const PAGE_SIZE = 10;

export default function SellerProductsPage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.SELLER_PRODUCTS, activeTab, search, page],
    queryFn: () =>
      axiosInstance
        .get("/seller/products", {
          params: {
            status: activeTab === "ALL" ? undefined : activeTab,
            search: search || undefined,
            page,
            limit: PAGE_SIZE,
          },
        })
        .then((r) => r.data),
  });

  const products: any[] = data?.data ?? [];
  const totalPages: number = data?.pagination?.totalPages ?? 1;

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      axiosInstance.patch(`/seller/products/${id}`, { isActive }),
    onSuccess: () => {
      toast.success("Product status updated!");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SELLER_PRODUCTS] });
    },
    onError: () => toast.error("Failed to update status"),
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => axiosInstance.delete(`/seller/products/${id}`),
    onSuccess: () => {
      toast.success("Product deleted!");
      setDeletingId(null);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SELLER_PRODUCTS] });
    },
    onError: () => toast.error("Failed to delete product"),
  });

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            My Products
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            Manage your product listings
          </p>
        </div>
        <Link
          href="/seller/products/create"
          className="h-10 px-5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-opacity hover:opacity-85"
          style={{ backgroundColor: "#ef4a23" }}
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(1); }}
              className="h-9 px-4 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0"
              style={{
                backgroundColor: activeTab === tab ? "#ef4a23" : "var(--color-background-secondary)",
                color: activeTab === tab ? "#fff" : "var(--color-text-secondary)",
                border: activeTab === tab ? "none" : "0.5px solid var(--color-border-secondary)",
              }}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="relative flex-shrink-0">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-tertiary)" }} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="h-10 pl-9 pr-4 rounded-xl text-sm outline-none w-full md:w-60"
            style={{
              backgroundColor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-secondary)",
              color: "var(--color-text-primary)",
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
        }}
      >
        {isLoading ? (
          <div className="py-20"><Loader fullPage={false} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ backgroundColor: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                  {["Product", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? products.map((product: any) => (
                  <tr
                    key={product._id}
                    style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = "var(--color-background-secondary)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = "transparent")}
                  >
                    {/* Product */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
                          style={{ backgroundColor: "var(--color-background-secondary)" }}
                        >
                          {product.thumbnail ? (
                            <Image src={product.thumbnail} alt={product.name} fill className="object-cover" sizes="48px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={18} style={{ color: "var(--color-text-tertiary)" }} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate max-w-[180px]" style={{ color: "var(--color-text-primary)" }}>
                            {product.name}
                          </p>
                          <p className="text-xs mt-0.5 font-mono" style={{ color: "var(--color-text-tertiary)" }}>
                            {product.sku ?? "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: "rgba(239,74,35,0.08)", color: "#ef4a23" }}
                      >
                        {product.category?.name ?? "—"}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-black" style={{ color: "var(--color-text-primary)" }}>
                        ${product.price?.toFixed(2)}
                      </p>
                      {product.comparePrice > product.price && (
                        <p className="text-xs line-through" style={{ color: "var(--color-text-tertiary)" }}>
                          ${product.comparePrice?.toFixed(2)}
                        </p>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="px-5 py-4">
                      <span
                        className="text-sm font-bold"
                        style={{
                          color: (product.inventory?.quantity ?? 0) === 0
                            ? "#f02757"
                            : (product.inventory?.quantity ?? 0) <= (product.inventory?.lowStockAlert ?? 5)
                            ? "#ca8a04"
                            : "#16a34a",
                        }}
                      >
                        {product.inventory?.quantity ?? 0}
                      </span>
                      <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                        units
                      </p>
                    </td>

                    {/* Status toggle */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleActive.mutate({ id: product._id, isActive: !product.isActive })}
                        className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
                      >
                        {product.isActive ? (
                          <>
                            <ToggleRight size={22} style={{ color: "#16a34a" }} />
                            <span className="text-xs font-semibold" style={{ color: "#16a34a" }}>Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={22} style={{ color: "var(--color-text-tertiary)" }} />
                            <span className="text-xs font-semibold" style={{ color: "var(--color-text-tertiary)" }}>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/products/${product.slug}`}
                          target="_blank"
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                          style={{ backgroundColor: "rgba(55,73,187,0.08)", color: "#3749bb" }}
                          title="View"
                        >
                          <Eye size={14} />
                        </Link>
                        <Link
                          href={`/seller/products/${product._id}/edit`}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                          style={{ backgroundColor: "rgba(239,74,35,0.08)", color: "#ef4a23" }}
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </Link>
                        <button
                          onClick={() => setDeletingId(product._id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                          style={{ backgroundColor: "rgba(240,39,87,0.08)", color: "#f02757" }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(239,74,35,0.08)" }}>
                          <Package size={24} style={{ color: "#ef4a23" }} />
                        </div>
                        <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>No products found</p>
                        <Link
                          href="/seller/products/create"
                          className="text-xs font-semibold flex items-center gap-1 transition-opacity hover:opacity-70"
                          style={{ color: "#ef4a23" }}
                        >
                          <Plus size={12} /> Add your first product
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

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

      {/* Delete Confirm Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div
            className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4"
            style={{ backgroundColor: "var(--color-background-primary)", border: "0.5px solid var(--color-border-secondary)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(240,39,87,0.1)" }}>
                <AlertCircle size={20} style={{ color: "#f02757" }} />
              </div>
              <div>
                <p className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>Delete Product?</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 h-10 rounded-xl text-sm font-semibold transition-opacity hover:opacity-70"
                style={{ border: "0.5px solid var(--color-border-secondary)", color: "var(--color-text-secondary)" }}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteProduct.mutate(deletingId)}
                disabled={deleteProduct.isPending}
                className="flex-1 h-10 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-50"
                style={{ backgroundColor: "#f02757" }}
              >
                {deleteProduct.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}