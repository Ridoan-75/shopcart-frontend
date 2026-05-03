// src/components/dashboard/RecentOrders.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { dashboardService } from "../../services/dashboard.service";
import { QUERY_KEYS } from "../../constants/queryKeys";

type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const STATUS_STYLES: Record<OrderStatus, { bg: string; color: string; label: string }> = {
  PENDING: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", label: "Pending" },
  CONFIRMED: { bg: "rgba(55,73,187,0.1)", color: "#3749bb", label: "Confirmed" },
  PROCESSING: { bg: "rgba(139,92,246,0.1)", color: "#8b5cf6", label: "Processing" },
  SHIPPED: { bg: "rgba(6,182,212,0.1)", color: "#06b6d4", label: "Shipped" },
  DELIVERED: { bg: "rgba(34,197,94,0.1)", color: "#22c55e", label: "Delivered" },
  CANCELLED: { bg: "rgba(240,39,87,0.1)", color: "#f02757", label: "Cancelled" },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.PENDING;
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {style.label}
    </span>
  );
}

export default function RecentOrders() {
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_RECENT_ORDERS],
    queryFn: () => dashboardService.getRecentOrders(),
  });

  const orders = data?.data ?? [];

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        backgroundColor: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
      }}
    >
      {/* header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: "var(--color-border-tertiary)" }}
      >
        <div>
          <h3 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
            Recent Orders
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
            Latest {orders.length} orders
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
          style={{ color: "#ef4a23" }}
        >
          View all
          <ArrowRight size={12} />
        </Link>
      </div>

      {/* table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={20} className="animate-spin" style={{ color: "#ef4a23" }} />
        </div>
      ) : orders.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
            No recent orders
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                {["Order", "Customer", "Total", "Status", "Date"].map((col) => (
                  <th
                    key={col}
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any, i: number) => (
                <tr
                  key={order._id}
                  className="transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                  style={{
                    borderBottom:
                      i < orders.length - 1
                        ? "0.5px solid var(--color-border-tertiary)"
                        : "none",
                  }}
                >
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/orders/${order._id}`}
                      className="text-sm font-semibold hover:underline"
                      style={{ color: "#ef4a23" }}
                    >
                      #{order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm" style={{ color: "var(--color-text-primary)" }}>
                      {order.user?.name ?? "Guest"}
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                      {order.user?.email}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                      ${order.total?.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "-"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}