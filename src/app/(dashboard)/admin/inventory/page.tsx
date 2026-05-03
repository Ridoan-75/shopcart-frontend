// src/app/(dashboard)/admin/inventory/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  AlertTriangle,
  Package,
  Pencil,
  X,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import Loader from "../../../../components/common/Loader";
import axiosInstance from "../../../../lib/axios";
import Image from "next/image";

interface InventoryProduct {
  _id: string;
  name: string;
  thumbnail?: string;
  sku?: string;
  price: number;
  category?: { name: string };
  brand?: { name: string };
  inventory: {
    quantity: number;
    lowStockAlert: number;
    reserved?: number;
  };
}

interface UpdateForm {
  quantity: number;
  lowStockAlert: number;
}

const INPUT_STYLE = {
  border: "0.5px solid var(--color-border-secondary)",
  backgroundColor: "var(--color-background-secondary)",
  color: "var(--color-text-primary)",
};

type FilterType = "all" | "low" | "out";

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: "all", label: "All Products" },
  { value: "low", label: "Low Stock" },
  { value: "out", label: "Out of Stock" },
];

function StockBadge({ quantity, lowStockAlert }: { quantity: number; lowStockAlert: number }) {
  if (quantity === 0) {
    return (
      <span
        className="px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: "rgba(240,39,87,0.1)", color: "#f02757" }}
      >
        Out of Stock
      </span>
    );
  }
  if (quantity <= lowStockAlert) {
    return (
      <span
        className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"
        style={{ backgroundColor: "rgba(234,179,8,0.1)", color: "#ca8a04" }}
      >
        <AlertTriangle size={10} />
        Low Stock
      </span>
    );
  }
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: "rgba(34,197,94,0.1)", color: "#16a34a" }}
    >
      In Stock
    </span>
  );
}

export default function AdminInventoryPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<InventoryProduct | null>(null);
  const [editForm, setEditForm] = useState<UpdateForm>({ quantity: 0, lowStockAlert: 5 });
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, "inventory", search, filter, page],
    queryFn: () =>
      axiosInstance
        .get("/products", {
          params: {
            search: search || undefined,
            stockStatus: filter !== "all" ? filter : undefined,
            page,
            limit: LIMIT,
          },
        })
        .then((r) => r.data),
  });

  const products: InventoryProduct[] = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateForm }) =>
      axiosInstance.patch(`/products/${id}/inventory`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS, "inventory"] });
      toast.success("Inventory updated!");
      setEditProduct(null);
    },
    onError: () => toast.error("Failed to update inventory"),
  });

  const openEdit = (product: InventoryProduct) => {
    setEditProduct(product);
    setEditForm({
      quantity: product.inventory?.quantity ?? 0,
      lowStockAlert: product.inventory?.lowStockAlert ?? 5,
    });
  };

  const handleUpdate = () => {
    if (!editProduct) return;
    if (editForm.quantity < 0) return toast.error("Quantity cannot be negative");
    if (editForm.lowStockAlert < 0) return toast.error("Low stock alert cannot be negative");
    updateMutation.mutate({ id: editProduct._id, payload: editForm });
  };

  // summary stats
  const outOfStock = products.filter((p) => p.inventory?.quantity === 0).length;
  const lowStock = products.filter(
    (p) =>
      p.inventory?.quantity > 0 &&
      p.inventory?.quantity <= p.inventory?.lowStockAlert
  ).length;
  const inStock = products.filter(
    (p) => p.inventory?.quantity > p.inventory?.lowStockAlert
  ).length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          Inventory
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
          Monitor and update product stock levels
        </p>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "In Stock",
            value: inStock,
            color: "#16a34a",
            bg: "rgba(34,197,94,0.08)",
          },
          {
            label: "Low Stock",
            value: lowStock,
            color: "#ca8a04",
            bg: "rgba(234,179,8,0.08)",
          },
          {
            label: "Out of Stock",
            value: outOfStock,
            color: "#f02757",
            bg: "rgba(240,39,87,0.08)",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{
              backgroundColor: stat.bg,
              border: `0.5px solid ${stat.color}30`,
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${stat.color}15` }}
            >
              <Package size={18} style={{ color: stat.color }} />
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

      {/* search + filter */}
      <div className="flex items-center gap-3 mb-5">
        {/* search */}
        <div
          className="flex items-center flex-1 max-w-sm rounded-xl overflow-hidden"
          style={{ border: "0.5px solid var(--color-border-secondary)" }}
        >
          <div className="pl-3">
            <Search size={15} style={{ color: "var(--color-text-tertiary)" }} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="flex-1 h-10 px-3 text-sm outline-none"
            style={{
              backgroundColor: "var(--color-background-secondary)",
              color: "var(--color-text-primary)",
            }}
          />
        </div>

        {/* filter dropdown */}
        <div className="relative">
          <button
            onClick={() => setFilterOpen((p) => !p)}
            className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium transition-all"
            style={{
              border: "0.5px solid var(--color-border-secondary)",
              backgroundColor: "var(--color-background-primary)",
              color: "var(--color-text-primary)",
              minWidth: "150px",
            }}
          >
            <span className="flex-1 text-left">
              {FILTER_OPTIONS.find((f) => f.value === filter)?.label}
            </span>
            <ChevronDown
              size={14}
              style={{
                color: "var(--color-text-tertiary)",
                transform: filterOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          </button>
          {filterOpen && (
            <div
              className="absolute top-full right-0 mt-1.5 w-44 rounded-xl overflow-hidden z-20"
              style={{
                backgroundColor: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-secondary)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              }}
            >
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setFilter(opt.value);
                    setPage(1);
                    setFilterOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors"
                  style={{
                    backgroundColor:
                      filter === opt.value
                        ? "rgba(239,74,35,0.07)"
                        : "transparent",
                    color:
                      filter === opt.value
                        ? "#ef4a23"
                        : "var(--color-text-secondary)",
                  }}
                  onMouseEnter={(e) => {
                    if (filter !== opt.value)
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                        "var(--color-background-secondary)";
                  }}
                  onMouseLeave={(e) => {
                    if (filter !== opt.value)
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                        "transparent";
                  }}
                >
                  {opt.label}
                  {filter === opt.value && (
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
      </div>

      {/* table */}
      {isLoading ? (
        <Loader fullPage={false} text="Loading inventory..." />
      ) : products.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ border: "0.5px solid var(--color-border-tertiary)" }}
        >
          <Package size={32} style={{ color: "var(--color-text-tertiary)" }} className="mb-3" />
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            No products match your search or filter.
          </p>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "0.5px solid var(--color-border-tertiary)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "var(--color-background-secondary)" }}>
                {[
                  "Product",
                  "SKU",
                  "Category",
                  "Price",
                  "Stock",
                  "Reserved",
                  "Alert At",
                  "Status",
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
              {products.map((product, i) => (
                <tr
                  key={product._id}
                  style={{
                    borderTop:
                      i > 0 ? "0.5px solid var(--color-border-tertiary)" : "none",
                    backgroundColor: "var(--color-background-primary)",
                  }}
                >
                  {/* product */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                        style={{
                          backgroundColor: "var(--color-background-secondary)",
                          border: "0.5px solid var(--color-border-tertiary)",
                        }}
                      >
                        {product.thumbnail ? (
                          <Image
                            src={product.thumbnail}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        ) : (
                          <Package
                            size={16}
                            style={{ color: "var(--color-text-tertiary)" }}
                          />
                        )}
                      </div>
                      <p
                        className="font-medium max-w-[160px] truncate"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {product.name}
                      </p>
                    </div>
                  </td>

                  {/* sku */}
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-mono"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      {product.sku ?? "—"}
                    </span>
                  </td>

                  {/* category */}
                  <td
                    className="px-4 py-3 text-xs"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {product.category?.name ?? "—"}
                  </td>

                  {/* price */}
                  <td
                    className="px-4 py-3 font-semibold text-sm"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    ${product.price.toFixed(2)}
                  </td>

                  {/* quantity */}
                  <td className="px-4 py-3">
                    <span
                      className="text-base font-black"
                      style={{
                        color:
                          product.inventory?.quantity === 0
                            ? "#f02757"
                            : product.inventory?.quantity <=
                              product.inventory?.lowStockAlert
                            ? "#ca8a04"
                            : "var(--color-text-primary)",
                      }}
                    >
                      {product.inventory?.quantity ?? 0}
                    </span>
                  </td>

                  {/* reserved */}
                  <td
                    className="px-4 py-3 text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {product.inventory?.reserved ?? 0}
                  </td>

                  {/* alert at */}
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-mono px-2 py-0.5 rounded-md"
                      style={{
                        backgroundColor: "rgba(234,179,8,0.08)",
                        color: "#ca8a04",
                        border: "0.5px solid rgba(234,179,8,0.2)",
                      }}
                    >
                      ≤ {product.inventory?.lowStockAlert ?? 5}
                    </span>
                  </td>

                  {/* status */}
                  <td className="px-4 py-3">
                    <StockBadge
                      quantity={product.inventory?.quantity ?? 0}
                      lowStockAlert={product.inventory?.lowStockAlert ?? 5}
                    />
                  </td>

                  {/* actions */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openEdit(product)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/30"
                      style={{ color: "#3749bb" }}
                      aria-label="Edit inventory"
                    >
                      <Pencil size={14} />
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
              (p) =>
                p === 1 || p === totalPages || Math.abs(p - page) <= 1
            )
            .reduce<(number | "...")[]>((acc, p, idx, arr) => {
              if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
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

      {/* Edit Modal */}
      {editProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{
              backgroundColor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-secondary)",
            }}
          >
            {/* header */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: "var(--color-border-tertiary)" }}
            >
              <h2
                className="font-bold text-base"
                style={{ color: "var(--color-text-primary)" }}
              >
                Update Inventory
              </h2>
              <button
                onClick={() => setEditProduct(null)}
                style={{ color: "var(--color-text-secondary)" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* product info */}
            <div
              className="px-6 py-3 flex items-center gap-3 border-b"
              style={{
                borderColor: "var(--color-border-tertiary)",
                backgroundColor: "var(--color-background-secondary)",
              }}
            >
              <div
                className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                style={{ backgroundColor: "var(--color-background-primary)" }}
              >
                {editProduct.thumbnail ? (
                  <Image
                    src={editProduct.thumbnail}
                    alt={editProduct.name}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                ) : (
                  <Package size={16} style={{ color: "var(--color-text-tertiary)" }} />
                )}
              </div>
              <div>
                <p
                  className="text-sm font-semibold truncate max-w-[220px]"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {editProduct.name}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Current stock:{" "}
                  <span className="font-bold" style={{ color: "#ef4a23" }}>
                    {editProduct.inventory?.quantity ?? 0}
                  </span>
                </p>
              </div>
            </div>

            {/* body */}
            <div className="p-6 flex flex-col gap-4">
              {/* quantity */}
              <div>
                <label
                  className="text-xs font-bold uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  New Quantity
                </label>
                <input
                  type="number"
                  value={editForm.quantity}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      quantity: Number(e.target.value),
                    }))
                  }
                  min={0}
                  className="w-full h-10 px-3 rounded-xl text-sm outline-none"
                  style={INPUT_STYLE}
                />
              </div>

              {/* low stock alert */}
              <div>
                <label
                  className="text-xs font-bold uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Low Stock Alert Threshold
                </label>
                <input
                  type="number"
                  value={editForm.lowStockAlert}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      lowStockAlert: Number(e.target.value),
                    }))
                  }
                  min={0}
                  className="w-full h-10 px-3 rounded-xl text-sm outline-none"
                  style={INPUT_STYLE}
                />
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Alert will show when stock falls to or below this number
                </p>
              </div>

              {/* preview badge */}
              <div
                className="flex items-center justify-between p-3 rounded-xl"
                style={{
                  backgroundColor: "var(--color-background-secondary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                }}
              >
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Status preview
                </span>
                <StockBadge
                  quantity={editForm.quantity}
                  lowStockAlert={editForm.lowStockAlert}
                />
              </div>
            </div>

            {/* footer */}
            <div
              className="flex items-center justify-end gap-3 px-6 py-4 border-t"
              style={{ borderColor: "var(--color-border-tertiary)" }}
            >
              <button
                onClick={() => setEditProduct(null)}
                className="h-10 px-4 rounded-xl text-sm font-medium"
                style={{
                  border: "0.5px solid var(--color-border-secondary)",
                  color: "var(--color-text-secondary)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
                className="h-10 px-5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-40"
                style={{ backgroundColor: "#ef4a23" }}
              >
                {updateMutation.isPending ? "Saving..." : "Update Stock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}