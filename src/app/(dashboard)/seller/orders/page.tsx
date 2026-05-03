// src/app/(dashboard)/seller/orders/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import Loader from "../../../../components/common/Loader";
import axiosInstance from "../../../../lib/axios";

const STATUS_TABS = ["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

const STATUS_CONFIG: Record<string, { bg: string; color: string; icon: React.ElementType }> = {
  PENDING: { bg: "rgba(234,179,8,0.1)", color: "#ca8a04", icon: Clock },
  PROCESSING: { bg: "rgba(139,92,246,0.1)", color: "#7c3aed", icon: Package },
  SHIPPED: { bg: "rgba(6,182,212,0.1)", color: "#0891b2", icon: Truck },
  DELIVERED: { bg: "rgba(34,197,94,0.1)", color: "#16a34a", icon: CheckCircle2 },
  CANCELLED: { bg: "rgba(240,39,87,0.1)", color: "#f02757", icon: AlertCircle },
};

const STAT_CARDS = [
  { label: "Total Orders", key: "total", icon: Package, color: "#ef4a23" },
  { label: "Pending", key: "pending", icon: Clock, color: "#ca8a04" },
  { label: "Shipped", key: "shipped", icon: Truck, color: "#0891b2" },
  { label: "Delivered", key: "delivered", icon: CheckCircle2, color: "#16a34a" },
];

const PAGE_SIZE = 10;

export default function SellerOrdersPage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.SELLER_ORDERS, activeTab, searchQuery, page],
    queryFn: () =>
      axiosInstance
        .get(`/seller/orders`, {
          params: {
            status: activeTab === "ALL" ? undefined : activeTab,
            search: searchQuery || undefined,
            page,
            limit: PAGE_SIZE,
          },
        })
        .then((r) => r.data),
  });

  const orders: any[] = data?.data ?? [];
  const totalPages: number = data?.pagination?.totalPages ?? 1;
  const stats = data?.stats ?? {};

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          Manage Orders
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
          Track and process your incoming customer orders
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{
                backgroundColor: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${card.color}18`, color: card.color }}
              >
                <Icon size={18} />
              </div>
              <div>
                <p className="text-xl font-black" style={{ color: "var(--color-text-primary)" }}>
                  {stats[card.key] ?? 0}
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                  {card.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(1); }}
              className="h-9 px-4 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0"
              style={{
                backgroundColor: activeTab === tab ? "#ef4a23" : "var(--color-background-secondary)",
                color: activeTab === tab ? "#fff" : "var(--color-text-secondary)",
                border: activeTab === tab ? "1px solid #ef4a23" : "1px solid var(--color-border-secondary)",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-shrink-0">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--color-text-tertiary)" }}
          />
          <input
            type="text"
            placeholder="Search order or customer..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="h-10 pl-9 pr-4 rounded-xl text-sm outline-none w-full md:w-64"
            style={{
              backgroundColor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-secondary)",
              color: "var(--color-text-primary)",
            }}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
        }}
      >
        {isLoading ? (
          <div className="py-20">
            <Loader fullPage={false} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr
                  style={{
                    backgroundColor: "var(--color-background-secondary)",
                    borderBottom: "0.5px solid var(--color-border-tertiary)",
                  }}
                >
                  {["Order", "Customer", "Items", "Total", "Status", "Date", ""].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order: any) => {
                    const config = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
                    const Icon = config.icon;
                    return (
                      <tr
                        key={order._id}
                        className="transition-colors"
                        style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                            "var(--color-background-secondary)")
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                            "transparent")
                        }
                      >
                        {/* Order Number */}
                        <td className="px-5 py-4">
                          <span
                            className="font-mono text-sm font-bold"
                            style={{ color: "#ef4a23" }}
                          >
                            #{order.orderNumber}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="px-5 py-4">
                          <p
                            className="text-sm font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            {order.user?.name}
                          </p>
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: "var(--color-text-tertiary)" }}
                          >
                            {order.user?.email}
                          </p>
                        </td>

                        {/* Items count */}
                        <td className="px-5 py-4">
                          <span
                            className="text-sm"
                            style={{ color: "var(--color-text-secondary)" }}
                          >
                            {order.items?.length ?? order.itemsCount ?? 0} item
                            {(order.items?.length ?? order.itemsCount ?? 0) !== 1 ? "s" : ""}
                          </span>
                        </td>

                        {/* Total */}
                        <td className="px-5 py-4">
                          <span
                            className="text-sm font-black"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            ${order.totalAmount?.toFixed(2)}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="px-5 py-4">
                          <div
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                            style={{ backgroundColor: config.bg, color: config.color }}
                          >
                            <Icon size={11} />
                            {order.status}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4">
                          <span
                            className="text-xs"
                            style={{ color: "var(--color-text-tertiary)" }}
                          >
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/seller/orders/${order._id}`}
                            className="w-8 h-8 rounded-lg inline-flex items-center justify-center transition-all hover:scale-105"
                            style={{
                              backgroundColor: "rgba(239,74,35,0.08)",
                              color: "#ef4a23",
                              border: "0.5px solid rgba(239,74,35,0.2)",
                            }}
                          >
                            <Eye size={15} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center"
                          style={{ backgroundColor: "rgba(239,74,35,0.08)" }}
                        >
                          <Package size={24} style={{ color: "#ef4a23" }} />
                        </div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          No orders found
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--color-text-tertiary)" }}
                        >
                          {activeTab !== "ALL"
                            ? `No ${activeTab.toLowerCase()} orders at the moment`
                            : "Your orders will appear here"}
                        </p>
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
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105"
              style={{
                border: "0.5px solid var(--color-border-secondary)",
                backgroundColor: "var(--color-background-primary)",
                color: "var(--color-text-secondary)",
              }}
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
                  <span key={`ellipsis-${i}`} className="text-xs px-1" style={{ color: "var(--color-text-tertiary)" }}>
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className="w-9 h-9 rounded-xl text-sm font-medium transition-all"
                    style={
                      page === p
                        ? { backgroundColor: "#ef4a23", color: "#fff", border: "none" }
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
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105"
              style={{
                border: "0.5px solid var(--color-border-secondary)",
                backgroundColor: "var(--color-background-primary)",
                color: "var(--color-text-secondary)",
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}