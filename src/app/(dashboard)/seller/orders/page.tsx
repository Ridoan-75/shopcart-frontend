"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Eye, Package, Truck, CheckCircle2, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import Loader from "../../../../components/common/Loader";
import axiosInstance from "../../../../lib/axios";

const STATUS_TABS = ["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

const STATUS_STYLE: Record<string, { bg: string; color: string; icon: any }> = {
  PENDING: { bg: "rgba(234,179,8,0.1)", color: "#ca8a04", icon: Clock },
  PROCESSING: { bg: "rgba(139,92,246,0.1)", color: "#7c3aed", icon: Package },
  SHIPPED: { bg: "rgba(6,182,212,0.1)", color: "#089112", icon: Truck },
  DELIVERED: { bg: "rgba(34,197,94,0.1)", color: "#16a34a", icon: CheckCircle2 },
  CANCELLED: { bg: "rgba(240,39,87,0.1)", color: "#f02757", icon: XCircle },
};

export default function SellerOrdersPage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.SELLER_ORDERS, activeTab, search],
    queryFn: () => axiosInstance.get(`/seller/orders?status=${activeTab}&search=${search}`).then(res => res.data),
  });

  const orders = data?.data || [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">My Orders</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Manage your product sales and shipments</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                activeTab === tab ? "bg-[#ef4a23] text-white border-[#ef4a23]" : "bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border-secondary)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" size={16} />
          <input 
            type="text"
            placeholder="Search Order ID..."
            className="pl-10 pr-4 py-2 rounded-xl bg-[var(--color-background-primary)] border border-[var(--color-border-secondary)] text-sm outline-none w-full md:w-64"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)] overflow-hidden">
        {isLoading ? <div className="p-20"><Loader fullPage={false} /></div> : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-[var(--color-background-secondary)] border-b border-[var(--color-border-tertiary)]">
              <tr>
                <th className="p-4 text-xs font-bold uppercase text-[var(--color-text-tertiary)]">Order ID</th>
                <th className="p-4 text-xs font-bold uppercase text-[var(--color-text-tertiary)]">Customer</th>
                <th className="p-4 text-xs font-bold uppercase text-[var(--color-text-tertiary)]">Items</th>
                <th className="p-4 text-xs font-bold uppercase text-[var(--color-text-tertiary)]">Amount</th>
                <th className="p-4 text-xs font-bold uppercase text-[var(--color-text-tertiary)]">Status</th>
                <th className="p-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-tertiary)]">
              {orders.map((order: any) => {
                const style = STATUS_STYLE[order.status] || STATUS_STYLE.PENDING;
                return (
                  <tr key={order.id} className="hover:bg-[var(--color-background-secondary)] transition-colors">
                    <td className="p-4 font-mono text-sm font-bold text-[#ef4a23]">#{order.orderNumber}</td>
                    <td className="p-4 text-sm text-[var(--color-text-primary)]">{order.user?.name}</td>
                    <td className="p-4 text-sm text-[var(--color-text-secondary)]">{order.items?.length} Items</td>
                    <td className="p-4 text-sm font-bold text-[var(--color-text-primary)]">${order.totalAmount.toFixed(2)}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit" style={{ backgroundColor: style.bg, color: style.color }}>
                        <style.icon size={12} /> {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/seller/orders/${order.id}`} className="p-2 inline-block rounded-lg hover:bg-[#ef4a23]/10 text-[var(--color-text-secondary)] hover:text-[#ef4a23]">
                        <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}