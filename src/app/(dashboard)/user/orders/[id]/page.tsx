// src/app/(dashboard)/user/orders/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Package, MapPin, CreditCard, Loader2, ArrowLeft, XCircle } from "lucide-react";
import Link from "next/link";
import { orderService } from "../../../../../services/order.service";
import { QUERY_KEYS } from "../../../../../constants/queryKeys";
import { ROUTES } from "../../../../../constants/routes";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  PENDING:    { bg: "rgba(245,158,11,0.1)",  color: "#f59e0b" },
  CONFIRMED:  { bg: "rgba(55,73,187,0.1)",   color: "#3749bb" },
  PROCESSING: { bg: "rgba(139,92,246,0.1)",  color: "#8b5cf6" },
  SHIPPED:    { bg: "rgba(6,182,212,0.1)",   color: "#06b6d4" },
  DELIVERED:  { bg: "rgba(34,197,94,0.1)",   color: "#22c55e" },
  CANCELLED:  { bg: "rgba(240,39,87,0.1)",   color: "#f02757" },
};

function InfoCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{ backgroundColor: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)" }}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(239,74,35,0.1)", color: "#ef4a23" }}>
          <Icon size={15} />
        </div>
        <h3 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ORDERS, id],
    queryFn: () => orderService.getById(id),
    enabled: !!id,
  });

  const order = data?.data;

  const { mutate: cancelOrder, isPending: cancelling } = useMutation({
    mutationFn: () => orderService.cancel(id),
    onSuccess: () => {
      toast.success("Order cancelled successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
    },
    onError: () => toast.error("Failed to cancel order"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin" style={{ color: "#ef4a23" }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-sm mb-3" style={{ color: "var(--color-text-tertiary)" }}>Order not found</p>
        <Link href={ROUTES.USER_ORDERS} className="text-sm font-semibold hover:underline" style={{ color: "#ef4a23" }}>
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[order.status] ?? STATUS_STYLES.PENDING;

  return (
    <div className="flex flex-col gap-5">
      {/* header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.USER_ORDERS}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ border: "0.5px solid var(--color-border-secondary)", color: "var(--color-text-secondary)" }}
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-lg font-black" style={{ color: "var(--color-text-primary)" }}>
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US", { dateStyle: "long" }) : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
          >
            {order.status}
          </span>
          {order.status === "PENDING" && (
            <button
              onClick={() => cancelOrder()}
              disabled={cancelling}
              className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ backgroundColor: "rgba(240,39,87,0.08)", color: "#f02757", border: "0.5px solid rgba(240,39,87,0.2)" }}
            >
              {cancelling ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
              Cancel Order
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* order items */}
        <div className="lg:col-span-2">
          <InfoCard icon={Package} title="Order Items">
            <div className="flex flex-col gap-3">
              {order.items?.map((item: any) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 py-3 border-b last:border-0"
                  style={{ borderColor: "var(--color-border-tertiary)" }}
                >
                  <div
                    className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: "var(--color-background-secondary)" }}
                  >
                    {item.thumbnail && <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{item.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                      ${item.price?.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-bold flex-shrink-0" style={{ color: "var(--color-text-primary)" }}>
                    ${(item.price * item.quantity)?.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* totals */}
            <div className="flex flex-col gap-2 pt-3 border-t" style={{ borderColor: "var(--color-border-tertiary)" }}>
              {[
                { label: "Subtotal", value: `$${order.subtotal?.toFixed(2) ?? "0.00"}` },
                { label: "Shipping", value: order.shipping === 0 ? "FREE" : `$${order.shipping?.toFixed(2) ?? "0.00"}` },
                { label: "Tax", value: `$${order.tax?.toFixed(2) ?? "0.00"}` },
                ...(order.discount > 0 ? [{ label: "Discount", value: `-$${order.discount?.toFixed(2)}` }] : []),
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{row.label}</span>
                  <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{row.value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "var(--color-border-tertiary)" }}>
                <span className="text-base font-black" style={{ color: "var(--color-text-primary)" }}>Total</span>
                <span className="text-xl font-black" style={{ color: "#ef4a23" }}>${order.total?.toFixed(2)}</span>
              </div>
            </div>
          </InfoCard>
        </div>

        {/* sidebar info */}
        <div className="flex flex-col gap-4">
          <InfoCard icon={MapPin} title="Delivery Address">
            {order.address ? (
              <div className="text-sm flex flex-col gap-1" style={{ color: "var(--color-text-secondary)" }}>
                <p className="font-semibold" style={{ color: "var(--color-text-primary)" }}>{order.address.fullName}</p>
                <p>{order.address.street}</p>
                <p>{order.address.city}, {order.address.state} {order.address.zip}</p>
                <p>{order.address.phone}</p>
              </div>
            ) : (
              <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>No address info</p>
            )}
          </InfoCard>

          <InfoCard icon={CreditCard} title="Payment Info">
            <div className="flex flex-col gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              <div className="flex justify-between">
                <span>Method</span>
                <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  {order.paymentMethod ?? "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span
                  className="font-semibold"
                  style={{ color: order.paymentStatus === "PAID" ? "#22c55e" : "#f59e0b" }}
                >
                  {order.paymentStatus ?? "PENDING"}
                </span>
              </div>
            </div>
          </InfoCard>

          {order.tracking && (
            <InfoCard icon={Package} title="Tracking">
              <div className="flex flex-col gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                {order.tracking.carrier && (
                  <div className="flex justify-between">
                    <span>Carrier</span>
                    <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>{order.tracking.carrier}</span>
                  </div>
                )}
                {order.tracking.trackingNumber && (
                  <div className="flex justify-between">
                    <span>Tracking #</span>
                    <span className="font-semibold font-mono text-xs" style={{ color: "#ef4a23" }}>{order.tracking.trackingNumber}</span>
                  </div>
                )}
              </div>
            </InfoCard>
          )}
        </div>
      </div>
    </div>
  );
}