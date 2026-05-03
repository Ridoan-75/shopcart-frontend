// src/app/(dashboard)/admin/orders/[id]/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  ChevronDown,
  User,
  Clock,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { QUERY_KEYS } from "../../../../../constants/queryKeys";
import Loader from "../../../../../components/common/Loader";
import { orderService } from "../../../../../services/order.service";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: "rgba(234,179,8,0.1)", color: "#ca8a04" },
  CONFIRMED: { bg: "rgba(55,73,187,0.1)", color: "#3749bb" },
  PROCESSING: { bg: "rgba(139,92,246,0.1)", color: "#7c3aed" },
  SHIPPED: { bg: "rgba(6,182,212,0.1)", color: "#0891b2" },
  DELIVERED: { bg: "rgba(34,197,94,0.1)", color: "#16a34a" },
  CANCELLED: { bg: "rgba(240,39,87,0.1)", color: "#f02757" },
};

const INPUT_STYLE = {
  border: "0.5px solid var(--color-border-secondary)",
  backgroundColor: "var(--color-background-secondary)",
  color: "var(--color-text-primary)",
};

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
      }}
    >
      <div
        className="flex items-center gap-3 px-5 py-4 border-b"
        style={{ borderColor: "var(--color-border-tertiary)" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "rgba(239,74,35,0.1)", color: "#ef4a23" }}
        >
          <Icon size={15} />
        </div>
        <h2
          className="font-bold text-sm"
          style={{ color: "var(--color-text-primary)" }}
        >
          {title}
        </h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span
        className="text-xs font-semibold uppercase tracking-widest flex-shrink-0"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        {label}
      </span>
      <span
        className="text-sm font-medium text-right"
        style={{ color: "var(--color-text-primary)" }}
      >
        {value}
      </span>
    </div>
  );
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [statusOpen, setStatusOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ORDERS, id],
    queryFn: () => orderService.getById(id),
    enabled: !!id,
  });

  const order = data?.data;

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => orderService.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS, id] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      toast.success("Order status updated!");
      setStatusOpen(false);
    },
    onError: () => toast.error("Failed to update status"),
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (isLoading) return <Loader fullPage={false} text="Loading order..." />;
  if (!order)
    return (
      <div className="p-6 text-center" style={{ color: "var(--color-text-secondary)" }}>
        Order not found.
      </div>
    );

  const badge = STATUS_BADGE[order.status] ?? {
    bg: "var(--color-background-secondary)",
    color: "var(--color-text-secondary)",
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{
            border: "0.5px solid var(--color-border-secondary)",
            color: "var(--color-text-secondary)",
          }}
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1
              className="text-xl font-bold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Order{" "}
              <span
                className="font-mono px-2 py-0.5 rounded-lg text-base"
                style={{ backgroundColor: "rgba(239,74,35,0.08)", color: "#ef4a23" }}
              >
                #{order.orderNumber}
              </span>
            </h1>
            <span
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ backgroundColor: badge.bg, color: badge.color }}
            >
              {order.status}
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
            Placed {formatDate(order.createdAt)}
          </p>
        </div>

        {/* status updater */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setStatusOpen((p) => !p)}
            className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
            style={{ backgroundColor: "#ef4a23" }}
          >
            Update Status
            <ChevronDown
              size={14}
              style={{
                transform: statusOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          </button>
          {statusOpen && (
            <div
              className="absolute top-full right-0 mt-1.5 w-48 rounded-xl overflow-hidden z-20"
              style={{
                backgroundColor: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-secondary)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              }}
            >
              {ORDER_STATUSES.map((s) => {
                const b = STATUS_BADGE[s];
                return (
                  <button
                    key={s}
                    onClick={() => updateStatusMutation.mutate(s)}
                    disabled={order.status === s || updateStatusMutation.isPending}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors disabled:opacity-40"
                    style={{
                      backgroundColor:
                        order.status === s ? "rgba(239,74,35,0.06)" : "transparent",
                      color: order.status === s ? "#ef4a23" : "var(--color-text-secondary)",
                    }}
                    onMouseEnter={(e) => {
                      if (order.status !== s)
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                          "var(--color-background-secondary)";
                    }}
                    onMouseLeave={(e) => {
                      if (order.status !== s)
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                          "transparent";
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: b?.color }}
                    />
                    {s}
                    {order.status === s && (
                      <span className="ml-auto text-xs">(current)</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* left — items + timeline */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* order items */}
          <SectionCard title="Order Items" icon={Package}>
            <div className="flex flex-col gap-3">
              {order.items?.map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-xl"
                  style={{
                    backgroundColor: "var(--color-background-secondary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                  }}
                >
                  {/* product image */}
                  <div
                    className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: "var(--color-background-primary)" }}
                  >
                    {item.product?.thumbnail ? (
                      <Image
                        src={item.product.thumbnail}
                        alt={item.product.name}
                        width={56}
                        height={56}
                        className="object-cover"
                      />
                    ) : (
                      <Package
                        size={20}
                        style={{ color: "var(--color-text-tertiary)" }}
                      />
                    )}
                  </div>

                  {/* info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {item.product?.name ?? "Unknown Product"}
                    </p>
                    {item.variant && (
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--color-text-tertiary)" }}
                      >
                        {item.variant}
                      </p>
                    )}
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      Qty: {item.quantity} ×{" "}
                      <span style={{ color: "#ef4a23" }}>
                        ${item.price?.toFixed(2)}
                      </span>
                    </p>
                  </div>

                  {/* subtotal */}
                  <p
                    className="text-sm font-bold flex-shrink-0"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    ${(item.quantity * item.price).toFixed(2)}
                  </p>
                </div>
              ))}

              {/* price summary */}
              <div
                className="mt-2 pt-4 border-t flex flex-col gap-2"
                style={{ borderColor: "var(--color-border-tertiary)" }}
              >
                {[
                  {
                    label: "Subtotal",
                    value: `$${order.subtotal?.toFixed(2) ?? "0.00"}`,
                  },
                  {
                    label: "Shipping",
                    value: order.shippingCost
                      ? `$${order.shippingCost.toFixed(2)}`
                      : "Free",
                    green: !order.shippingCost,
                  },
                  order.discount && {
                    label: "Discount",
                    value: `-$${order.discount.toFixed(2)}`,
                    red: true,
                  },
                  order.couponCode && {
                    label: "Coupon",
                    value: order.couponCode,
                    mono: true,
                  },
                ]
                  .filter(Boolean)
                  .map((row: any) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between text-sm"
                    >
                      <span style={{ color: "var(--color-text-secondary)" }}>
                        {row.label}
                      </span>
                      <span
                        style={{
                          color: row.red
                            ? "#f02757"
                            : row.green
                            ? "#16a34a"
                            : "var(--color-text-primary)",
                          fontFamily: row.mono ? "monospace" : undefined,
                        }}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}

                <div
                  className="flex items-center justify-between pt-3 border-t mt-1"
                  style={{ borderColor: "var(--color-border-tertiary)" }}
                >
                  <span className="font-bold text-sm" style={{ color: "var(--color-text-primary)" }}>
                    Total
                  </span>
                  <span className="font-black text-lg" style={{ color: "#ef4a23" }}>
                    ${order.totalAmount?.toFixed(2) ?? "0.00"}
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* order timeline */}
          {order.statusHistory?.length > 0 && (
            <SectionCard title="Order Timeline" icon={Clock}>
              <div className="flex flex-col gap-0">
                {order.statusHistory.map((entry: any, i: number) => {
                  const b = STATUS_BADGE[entry.status];
                  const isLast = i === order.statusHistory.length - 1;
                  return (
                    <div key={i} className="flex gap-4">
                      {/* dot + line */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                          style={{ backgroundColor: b?.color ?? "#ef4a23" }}
                        />
                        {!isLast && (
                          <div
                            className="w-px flex-1 my-1"
                            style={{ backgroundColor: "var(--color-border-tertiary)" }}
                          />
                        )}
                      </div>
                      {/* content */}
                      <div className={`pb-4 ${isLast ? "" : ""}`}>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: b?.color ?? "var(--color-text-primary)" }}
                        >
                          {entry.status}
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "var(--color-text-tertiary)" }}
                        >
                          {formatDate(entry.changedAt)}
                        </p>
                        {entry.note && (
                          <p
                            className="text-xs mt-1"
                            style={{ color: "var(--color-text-secondary)" }}
                          >
                            {entry.note}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          )}
        </div>

        {/* right — customer, shipping, payment */}
        <div className="flex flex-col gap-5">

          {/* customer */}
          <SectionCard title="Customer" icon={User}>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0"
                style={{ backgroundColor: "rgba(239,74,35,0.1)", color: "#ef4a23" }}
              >
                {order.user?.name?.[0]?.toUpperCase() ?? "G"}
              </div>
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {order.user?.name ?? "Guest"}
                </p>
                <p
                  className="text-xs truncate max-w-[160px]"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {order.user?.email ?? "—"}
                </p>
              </div>
            </div>
            <div
              className="flex flex-col divide-y"
              style={{ borderColor: "var(--color-border-tertiary)" }}
            >
              <InfoRow label="Phone" value={order.user?.phone ?? "—"} />
              <InfoRow
                label="Member Since"
                value={
                  order.user?.createdAt
                    ? new Date(order.user.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })
                    : "—"
                }
              />
            </div>
          </SectionCard>

          {/* shipping address */}
          <SectionCard title="Shipping Address" icon={MapPin}>
            {order.shippingAddress ? (
              <div className="text-sm flex flex-col gap-1" style={{ color: "var(--color-text-secondary)" }}>
                <p className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  {order.shippingAddress.name}
                </p>
                <p>{order.shippingAddress.street}</p>
                {order.shippingAddress.street2 && <p>{order.shippingAddress.street2}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.zip}
                </p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className="mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                    {order.shippingAddress.phone}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
                No address provided
              </p>
            )}
          </SectionCard>

          {/* payment */}
          <SectionCard title="Payment" icon={CreditCard}>
            <div
              className="flex flex-col divide-y"
              style={{ borderColor: "var(--color-border-tertiary)" }}
            >
              <InfoRow
                label="Method"
                value={
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: "var(--color-background-secondary)",
                      border: "0.5px solid var(--color-border-tertiary)",
                    }}
                  >
                    {order.paymentMethod ?? "—"}
                  </span>
                }
              />
              <InfoRow
                label="Payment Status"
                value={
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={
                      order.paymentStatus === "PAID"
                        ? { backgroundColor: "rgba(34,197,94,0.1)", color: "#16a34a" }
                        : { backgroundColor: "rgba(234,179,8,0.1)", color: "#ca8a04" }
                    }
                  >
                    {order.paymentStatus ?? "PENDING"}
                  </span>
                }
              />
              {order.transactionId && (
                <InfoRow
                  label="Transaction ID"
                  value={
                    <span
                      className="text-xs font-mono"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      {order.transactionId}
                    </span>
                  }
                />
              )}
              <InfoRow
                label="Total Paid"
                value={
                  <span className="font-black" style={{ color: "#ef4a23" }}>
                    ${order.totalAmount?.toFixed(2) ?? "0.00"}
                  </span>
                }
              />
            </div>
          </SectionCard>

          {/* notes */}
          {order.notes && (
            <SectionCard title="Order Notes" icon={Package}>
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                {order.notes}
              </p>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}