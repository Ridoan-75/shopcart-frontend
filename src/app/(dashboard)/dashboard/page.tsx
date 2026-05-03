// src/app/(dashboard)/dashboard/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, Clock, Heart, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "../../../stores/auth.store";
import { dashboardService } from "../../../services/dashboard.service";
import { orderService } from "../../../services/order.service";
import { QUERY_KEYS } from "../../../constants/queryKeys";
import { ROUTES } from "../../../constants/routes";
import StatsCard from "../../../components/dashboard/StatsCard";
import { useWishlistStore } from "../../../stores/wishlist.store";

type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const STATUS_STYLES: Record<OrderStatus, { bg: string; color: string; label: string }> = {
  PENDING:    { bg: "rgba(245,158,11,0.1)",  color: "#f59e0b", label: "Pending" },
  CONFIRMED:  { bg: "rgba(55,73,187,0.1)",   color: "#3749bb", label: "Confirmed" },
  PROCESSING: { bg: "rgba(139,92,246,0.1)",  color: "#8b5cf6", label: "Processing" },
  SHIPPED:    { bg: "rgba(6,182,212,0.1)",   color: "#06b6d4", label: "Shipped" },
  DELIVERED:  { bg: "rgba(34,197,94,0.1)",   color: "#22c55e", label: "Delivered" },
  CANCELLED:  { bg: "rgba(240,39,87,0.1)",   color: "#f02757", label: "Cancelled" },
};

export default function UserDashboardPage() {
  const { user } = useAuthStore();
  const { items: wishlistItems } = useWishlistStore();

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: [QUERY_KEYS.ORDERS],
    queryFn: () => orderService.getMyOrders({ limit: 5 }),
  });

  const orders = ordersData?.data ?? [];
  const totalOrders = ordersData?.total ?? 0;
  const pendingOrders = orders.filter((o: any) => o.status === "PENDING").length;

  const quickLinks = [
    { label: "My Orders", href: ROUTES.USER_ORDERS, icon: ShoppingBag, color: "#ef4a23" },
    { label: "Wishlist", href: "/user/wishlist", icon: Heart, color: "#f02757" },
    { label: "Addresses", href: "/user/addresses", icon: ShoppingBag, color: "#3749bb" },
    { label: "Reviews", href: "/user/reviews", icon: Star, color: "#f59e0b" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* welcome */}
      <div
        className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{
          background: "linear-gradient(135deg, #ef4a23 0%, #c73d1a 100%)",
        }}
      >
        <div>
          <p className="text-white/70 text-sm mb-1">Welcome back 👋</p>
          <h1 className="text-2xl font-black text-white">{user?.name}</h1>
          <p className="text-white/60 text-xs mt-1">{user?.email}</p>
        </div>
        <Link
          href={ROUTES.USER_PROFILE}
          className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold transition-opacity hover:opacity-85 flex-shrink-0"
          style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#fff" }}
        >
          Edit Profile <ArrowRight size={14} />
        </Link>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Orders"
          value={totalOrders}
          icon={ShoppingBag}
          color="#ef4a23"
        />
        <StatsCard
          title="Pending Orders"
          value={pendingOrders}
          icon={Clock}
          color="#f59e0b"
        />
        <StatsCard
          title="Wishlist Items"
          value={wishlistItems.length}
          icon={Heart}
          color="#f02757"
        />
        <StatsCard
          title="Reviews Given"
          value={0}
          icon={Star}
          color="#3749bb"
        />
      </div>

      {/* quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="flex flex-col items-center gap-3 p-5 rounded-2xl text-center transition-all hover:-translate-y-0.5"
            style={{
              backgroundColor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${link.color}15`, color: link.color }}
            >
              <link.icon size={22} />
            </div>
            <span className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {link.label}
            </span>
          </Link>
        ))}
      </div>

      {/* recent orders */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "var(--color-border-tertiary)" }}
        >
          <h2 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
            Recent Orders
          </h2>
          <Link
            href={ROUTES.USER_ORDERS}
            className="text-xs font-semibold flex items-center gap-1 hover:opacity-70 transition-opacity"
            style={{ color: "#ef4a23" }}
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {ordersLoading ? (
          <div className="flex flex-col gap-3 p-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-xl animate-pulse"
                style={{ backgroundColor: "var(--color-background-secondary)" }}
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
              No orders yet.{" "}
              <Link href="/products" className="font-semibold hover:underline" style={{ color: "#ef4a23" }}>
                Start shopping!
              </Link>
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                  {["Order", "Date", "Total", "Status", ""].map((col) => (
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
                {orders.map((order: any, i: number) => {
                  const style = STATUS_STYLES[order.status as OrderStatus] ?? STATUS_STYLES.PENDING;
                  return (
                    <tr
                      key={order._id}
                      style={{ borderBottom: i < orders.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}
                    >
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold" style={{ color: "#ef4a23" }}>
                          #{order.orderNumber}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                          ${order.total?.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: style.bg, color: style.color }}
                        >
                          {style.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`${ROUTES.USER_ORDERS}/${order._id}`}
                          className="text-xs font-semibold hover:underline"
                          style={{ color: "#ef4a23" }}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}