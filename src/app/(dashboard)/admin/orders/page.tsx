// src/app/(dashboard)/admin/orders/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { orderService } from "../../../../services/order.service";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import DataTable, { Column } from "../../../../components/dashboard/DataTable";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  PENDING:    { bg: "rgba(245,158,11,0.1)",  color: "#f59e0b" },
  CONFIRMED:  { bg: "rgba(55,73,187,0.1)",   color: "#3749bb" },
  PROCESSING: { bg: "rgba(139,92,246,0.1)",  color: "#8b5cf6" },
  SHIPPED:    { bg: "rgba(6,182,212,0.1)",   color: "#06b6d4" },
  DELIVERED:  { bg: "rgba(34,197,94,0.1)",   color: "#22c55e" },
  CANCELLED:  { bg: "rgba(240,39,87,0.1)",   color: "#f02757" },
};

const STATUS_TABS = ["ALL", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrdersPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ORDERS, "admin", statusFilter],
    queryFn: () =>
      orderService.getAll({ status: statusFilter === "ALL" ? undefined : statusFilter }),
  });

  const orders = data?.data ?? [];

  const columns: Column<any>[] = [
    {
      key: "orderNumber",
      label: "Order #",
      render: (row) => (
        <span className="text-sm font-semibold" style={{ color: "#ef4a23" }}>#{row.orderNumber}</span>
      ),
    },
    {
      key: "user",
      label: "Customer",
      render: (row) => (
        <div>
          <p className="text-sm" style={{ color: "var(--color-text-primary)" }}>{row.user?.name ?? "Guest"}</p>
          <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>{row.user?.email}</p>
        </div>
      ),
    },
    {
      key: "total",
      label: "Total",
      sortable: true,
      render: (row) => (
        <span className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
          ${row.total?.toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const s = STATUS_STYLES[row.status] ?? STATUS_STYLES.PENDING;
        return (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>
            {row.status}
          </span>
        );
      },
    },
    {
      key: "paymentStatus",
      label: "Payment",
      render: (row) => (
        <span
          className="text-xs font-semibold"
          style={{ color: row.paymentStatus === "PAID" ? "#22c55e" : "#f59e0b" }}
        >
          {row.paymentStatus ?? "PENDING"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (row) => (
        <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-black" style={{ color: "var(--color-text-primary)" }}>All Orders</h1>

      {/* status filter tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl overflow-x-auto"
        style={{ backgroundColor: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)" }}
      >
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className="px-3 h-8 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
            style={{
              backgroundColor: statusFilter === tab ? "#ef4a23" : "transparent",
              color: statusFilter === tab ? "#fff" : "var(--color-text-secondary)",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        rowKey={(row) => row._id}
        searchable
        searchPlaceholder="Search by order number or customer..."
        onRowClick={(row) => router.push(`/admin/orders/${row._id}`)}
      />
    </div>
  );
}