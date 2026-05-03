// src/app/(dashboard)/seller/overview/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  DollarSign,
  Package,
  Star,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useState } from "react";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import Loader from "../../../../components/common/Loader";
import { useAuthStore } from "../../../../stores/auth.store";
import axiosInstance from "../../../../lib/axios";

const STATUS_CONFIG: Record<string, { bg: string; color: string; icon: React.ElementType }> = {
  PENDING: { bg: "rgba(234,179,8,0.1)", color: "#ca8a04", icon: Clock },
  PROCESSING: { bg: "rgba(139,92,246,0.1)", color: "#7c3aed", icon: Package },
  SHIPPED: { bg: "rgba(6,182,212,0.1)", color: "#0891b2", icon: Truck },
  DELIVERED: { bg: "rgba(34,197,94,0.1)", color: "#16a34a", icon: CheckCircle2 },
  CANCELLED: { bg: "rgba(240,39,87,0.1)", color: "#f02757", icon: AlertCircle },
};

const CHART_PERIODS = ["Weekly", "Monthly", "Yearly"] as const;
type Period = (typeof CHART_PERIODS)[number];

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  change,
  prefix = "",
  suffix = "",
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
  change?: number;
  prefix?: string;
  suffix?: string;
}) {
  const isPositive = (change ?? 0) >= 0;

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{
        backgroundColor: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
      }}
    >
      <div className="flex items-center justify-between">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${iconColor}18`, color: iconColor }}
        >
          <Icon size={20} />
        </div>
        {change !== undefined && (
          <div
            className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full"
            style={{
              backgroundColor: isPositive ? "rgba(34,197,94,0.1)" : "rgba(240,39,87,0.1)",
              color: isPositive ? "#16a34a" : "#f02757",
            }}
          >
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-black" style={{ color: "var(--color-text-primary)" }}>
          {prefix}{typeof value === "number" ? value.toLocaleString() : value}{suffix}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
          {title}
        </p>
      </div>
    </div>
  );
}

function SectionHeader({ title, href, linkLabel = "View all" }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
          style={{ color: "#ef4a23" }}
        >
          {linkLabel}
          <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2 text-sm"
      style={{
        backgroundColor: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-secondary)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
      }}
    >
      <p className="font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: <span className="font-bold">${entry.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SellerOverviewPage() {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<Period>("Monthly");

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.SELLER_OVERVIEW, period],
    queryFn: () =>
      axiosInstance
        .get("/seller/dashboard/overview", { params: { period: period.toLowerCase() } })
        .then((r) => r.data),
  });

  const overview = data?.data;

  if (isLoading) return <Loader />;

  const stats = overview?.stats ?? {};
  const chartData = overview?.chartData ?? [];
  const recentOrders = overview?.recentOrders ?? [];
  const topProducts = overview?.topProducts ?? [];
  const lowStockProducts = overview?.lowStockProducts ?? [];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-8">

      {/* Welcome Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            {greeting()}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            Here's what's happening with your store today.
          </p>
        </div>
        <Link
          href="/seller/products/create"
          className="h-10 px-5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-opacity hover:opacity-85"
          style={{ backgroundColor: "#ef4a23" }}
        >
          <Package size={15} />
          Add Product
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue ?? 0}
          prefix="$"
          icon={DollarSign}
          iconColor="#ef4a23"
          change={stats.revenueChange}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders ?? 0}
          icon={ShoppingBag}
          iconColor="#3749bb"
          change={stats.ordersChange}
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts ?? 0}
          icon={Package}
          iconColor="#7c3aed"
        />
        <StatCard
          title="Avg. Rating"
          value={stats.avgRating?.toFixed(1) ?? "0.0"}
          suffix=" ★"
          icon={Star}
          iconColor="#ca8a04"
        />
      </div>

      {/* Order Status Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pending", key: "pending", status: "PENDING" },
          { label: "Processing", key: "processing", status: "PROCESSING" },
          { label: "Shipped", key: "shipped", status: "SHIPPED" },
          { label: "Delivered", key: "delivered", status: "DELIVERED" },
        ].map(({ label, key, status }) => {
          const config = STATUS_CONFIG[status];
          const Icon = config.icon;
          return (
            <div
              key={key}
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{
                backgroundColor: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: config.bg, color: config.color }}
              >
                <Icon size={16} />
              </div>
              <div>
                <p className="text-lg font-black" style={{ color: "var(--color-text-primary)" }}>
                  {stats[key] ?? 0}
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                  {label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sales Chart */}
      <div
        className="rounded-2xl p-5"
        style={{
          backgroundColor: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
        }}
      >
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} style={{ color: "#ef4a23" }} />
            <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
              Revenue Overview
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {CHART_PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="h-8 px-3 rounded-lg text-xs font-semibold transition-all"
                style={{
                  backgroundColor: period === p ? "#ef4a23" : "var(--color-background-secondary)",
                  color: period === p ? "#fff" : "var(--color-text-secondary)",
                  border: period === p ? "none" : "0.5px solid var(--color-border-secondary)",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4a23" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ef4a23" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#ef4a23"
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{ r: 5, fill: "#ef4a23", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Grid — Recent Orders + Top Products + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent Orders */}
        <div
          className="lg:col-span-2 rounded-2xl p-5"
          style={{
            backgroundColor: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
          }}
        >
          <SectionHeader title="Recent Orders" href="/seller/orders" />
          <div className="flex flex-col gap-2">
            {recentOrders.length > 0 ? (
              recentOrders.map((order: any) => {
                const config = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
                const Icon = config.icon;
                return (
                  <Link
                    key={order._id}
                    href={`/seller/orders/${order._id}`}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all"
                    style={{ border: "0.5px solid var(--color-border-tertiary)" }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.borderColor = "#ef4a23")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.borderColor =
                        "var(--color-border-tertiary)")
                    }
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: config.bg, color: config.color }}
                    >
                      <Icon size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                        #{order.orderNumber}
                      </p>
                      <p className="text-xs truncate" style={{ color: "var(--color-text-tertiary)" }}>
                        {order.user?.name} · {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-black" style={{ color: "var(--color-text-primary)" }}>
                        ${order.totalAmount?.toFixed(2)}
                      </p>
                      <div
                        className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5"
                        style={{ backgroundColor: config.bg, color: config.color }}
                      >
                        {order.status}
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div
                className="py-10 text-center text-sm"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                No recent orders
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">

          {/* Top Products */}
          <div
            className="rounded-2xl p-5"
            style={{
              backgroundColor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
            }}
          >
            <SectionHeader title="Top Products" href="/seller/products" />
            <div className="flex flex-col gap-3">
              {topProducts.length > 0 ? (
                topProducts.slice(0, 4).map((product: any, i: number) => (
                  <div key={product._id} className="flex items-center gap-3">
                    <span
                      className="text-xs font-black w-5 text-center flex-shrink-0"
                      style={{ color: i === 0 ? "#ef4a23" : "var(--color-text-tertiary)" }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold truncate"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {product.name}
                      </p>
                      <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                        {product.soldCount ?? 0} sold
                      </p>
                    </div>
                    <span
                      className="text-sm font-black flex-shrink-0"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      ${product.revenue?.toFixed(0)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-center py-4" style={{ color: "var(--color-text-tertiary)" }}>
                  No products yet
                </p>
              )}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div
            className="rounded-2xl p-5"
            style={{
              backgroundColor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
            }}
          >
            <SectionHeader title="Low Stock Alert" href="/seller/products" linkLabel="Manage" />
            <div className="flex flex-col gap-2">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.slice(0, 4).map((product: any) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl"
                    style={{ backgroundColor: "rgba(240,39,87,0.05)", border: "0.5px solid rgba(240,39,87,0.15)" }}
                  >
                    <p
                      className="text-sm font-semibold truncate flex-1"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {product.name}
                    </p>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: "rgba(240,39,87,0.1)", color: "#f02757" }}
                    >
                      {product.inventory?.quantity ?? 0} left
                    </span>
                  </div>
                ))
              ) : (
                <div
                  className="flex items-center gap-2 p-3 rounded-xl text-sm"
                  style={{ backgroundColor: "rgba(34,197,94,0.07)", color: "#16a34a" }}
                >
                  <CheckCircle2 size={15} />
                  All products well stocked
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}