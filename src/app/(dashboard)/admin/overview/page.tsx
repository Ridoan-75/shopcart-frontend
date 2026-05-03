// src/app/(dashboard)/admin/overview/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { DollarSign, ShoppingBag, Users, Package, TrendingUp, AlertTriangle } from "lucide-react";
import { dashboardService } from "../../../../services/dashboard.service";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import StatsCard from "../../../../components/dashboard/StatsCard";
import SalesChart from "../../../../components/dashboard/SalesChart";
import RecentOrders from "../../../../components/dashboard/RecentOrders";
import Link from "next/link";

export default function AdminOverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_STATS],
    queryFn: () => dashboardService.getStats(),
  });

  const stats = data?.data;

  const cards = [
    {
      title: "Total Revenue",
      value: stats?.totalRevenue ?? 0,
      icon: DollarSign,
      change: stats?.revenueChange,
      color: "#ef4a23",
      prefix: "$",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingBag,
      change: stats?.ordersChange,
      color: "#3749bb",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      change: stats?.usersChange,
      color: "#8b5cf6",
    },
    {
      title: "Total Products",
      value: stats?.totalProducts ?? 0,
      icon: Package,
      change: stats?.productsChange,
      color: "#06b6d4",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-black" style={{ color: "var(--color-text-primary)" }}>
          Admin Overview
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-tertiary)" }}>
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* stats cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-2xl animate-pulse"
                style={{ backgroundColor: "var(--color-background-primary)" }}
              />
            ))
          : cards.map((card) => <StatsCard key={card.title} {...card} />)}
      </div>

      {/* chart */}
      <SalesChart />

      {/* bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* recent orders — takes 2 cols */}
        <div className="xl:col-span-2">
          <RecentOrders />
        </div>

        {/* right column */}
        <div className="flex flex-col gap-5">
          {/* top products */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)" }}
          >
            <div
              className="flex items-center gap-2 px-5 py-4 border-b"
              style={{ borderColor: "var(--color-border-tertiary)" }}
            >
              <TrendingUp size={15} style={{ color: "#ef4a23" }} />
              <h3 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                Top Products
              </h3>
            </div>
            <div className="flex flex-col">
              {(stats?.topProducts ?? []).slice(0, 5).map((product: any, i: number) => (
                <div
                  key={product._id}
                  className="flex items-center gap-3 px-5 py-3 border-b last:border-0"
                  style={{ borderColor: "var(--color-border-tertiary)" }}
                >
                  <span
                    className="text-xs font-bold w-5 text-center flex-shrink-0"
                    style={{ color: i === 0 ? "#ef4a23" : "var(--color-text-tertiary)" }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>
                      {product.name}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>
                      {product.totalSold} sold
                    </p>
                  </div>
                  <span className="text-xs font-bold flex-shrink-0" style={{ color: "var(--color-text-primary)" }}>
                    ${product.revenue?.toFixed(0)}
                  </span>
                </div>
              ))}
              {!stats?.topProducts?.length && (
                <p className="text-xs text-center py-8" style={{ color: "var(--color-text-tertiary)" }}>No data</p>
              )}
            </div>
          </div>

          {/* low stock alert */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)" }}
          >
            <div
              className="flex items-center gap-2 px-5 py-4 border-b"
              style={{ borderColor: "var(--color-border-tertiary)" }}
            >
              <AlertTriangle size={15} style={{ color: "#f59e0b" }} />
              <h3 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                Low Stock Alert
              </h3>
            </div>
            <div className="flex flex-col">
              {(stats?.lowStockProducts ?? []).slice(0, 5).map((product: any) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between gap-3 px-5 py-3 border-b last:border-0"
                  style={{ borderColor: "var(--color-border-tertiary)" }}
                >
                  <p className="text-xs font-semibold truncate flex-1" style={{ color: "var(--color-text-primary)" }}>
                    {product.name}
                  </p>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: product.inventory?.quantity === 0 ? "rgba(240,39,87,0.1)" : "rgba(245,158,11,0.1)",
                      color: product.inventory?.quantity === 0 ? "#f02757" : "#f59e0b",
                    }}
                  >
                    {product.inventory?.quantity ?? 0} left
                  </span>
                </div>
              ))}
              {!stats?.lowStockProducts?.length && (
                <p className="text-xs text-center py-8" style={{ color: "var(--color-text-tertiary)" }}>
                  All products are well stocked ✓
                </p>
              )}
            </div>
            <div className="px-5 py-3 border-t" style={{ borderColor: "var(--color-border-tertiary)" }}>
              <Link
                href="/admin/inventory"
                className="text-xs font-semibold hover:underline"
                style={{ color: "#ef4a23" }}
              >
                View Inventory →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}