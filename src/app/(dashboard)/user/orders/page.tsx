// src/app/(dashboard)/user/orders/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Eye } from "lucide-react";
import { orderService } from "../../../../services/order.service";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import { ROUTES } from "../../../../constants/routes";
import DataTable, { Column } from "../../../../components/dashboard/DataTable";

type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "ALL";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  PENDING:    { bg: "rgba(245,158,11,0.1)",  color: "#f59e0b" },
  CONFIRMED:  { bg: "rgba(55,73,187,0.1)",   color: "#3749bb" },
  PROCESSING: { bg: "rgba(139,92,246,0.1)",  color: "#8b5cf6" },
  SHIPPED:    { bg: "rgba(6,182,212,0.1)",   color: "#06b6d4" },
  DELIVERED:  { bg: "rgba(34,197,94,0.1)",   color: "#22c55e" },
  CANCELLED:  { bg: "rgba(240,39,87,0.1)",   color: "#f02757" },
};

const STATUS_TABS: OrderStatus[] = ["ALL", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function UserOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus>("ALL");

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ORDERS, statusFilter],
    queryFn: () =>
      orderService.getMyOrders({ status: statusFilter === "ALL" ? undefined : statusFilter }),
  });

  const orders = data?.data ?? [];

  const columns: Column<any>[] = [
    {
      key: "orderNumber",
      label: "Order #",
      render: (row) => (
        <span className="text-sm font-semibold" style={{ color: "#ef4a23" }}>
          #{row.orderNumber}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (row) => (
        <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"}
        </span>
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
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: s.bg, color: s.color }}
          >
            {row.status}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <Link
          href={`${ROUTES.USER_ORDERS}/${row._id}`}
          className="flex items-center gap-1.5 text-xs font-semibold hover:opacity-70 transition-opacity"
          style={{ color: "#ef4a23" }}
        >
          <Eye size={13} /> View
        </Link>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-black" style={{ color: "var(--color-text-primary)" }}>
        My Orders
      </h1>

      {/* status filter tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl overflow-x-auto"
        style={{ backgroundColor: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)" }}
      >
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className="px-4 h-8 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
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
        searchPlaceholder="Search by order number..."
      />
    </div>
  );
}