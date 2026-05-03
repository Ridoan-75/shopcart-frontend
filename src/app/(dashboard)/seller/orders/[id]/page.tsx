"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Package, MapPin, User, Tag, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { QUERY_KEYS } from "../../../../../constants/queryKeys";
import { orderService } from "../../../../../services/order.service";
import Loader from "../../../../../components/common/Loader";

export default function SellerOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.SELLER_ORDERS, id],
    queryFn: () => orderService.getById(id),
  });

  const order = data?.data;

  const updateStatus = useMutation({
    mutationFn: (status: string) => orderService.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.SELLER_ORDERS] });
      toast.success("Order updated successfully");
    },
    onError: () => toast.error("Failed to update order")
  });

  if (isLoading) return <Loader fullPage={false} />;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-6 hover:text-[#ef4a23]">
        <ArrowLeft size={16} /> Back to Orders
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl border border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Package size={20} className="text-[#ef4a23]" /> Order Items
              </h2>
              <span className="text-sm font-mono font-bold text-[#ef4a23]">#{order?.orderNumber}</span>
            </div>
            <div className="space-y-4">
              {order?.items?.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-background-secondary)]">
                   <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-lg border border-[var(--color-border-tertiary)]" />
                      <div>
                        <p className="text-sm font-bold text-[var(--color-text-primary)]">{item.product?.name}</p>
                        <p className="text-xs text-[var(--color-text-tertiary)]">Qty: {item.quantity}</p>
                      </div>
                   </div>
                   <p className="text-sm font-bold text-[#ef4a23]">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)]">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-[#ef4a23]" /> Update Status
            </h2>
            <div className="flex flex-wrap gap-3">
              {["PROCESSING", "SHIPPED", "DELIVERED"].map((s) => (
                <button
                  key={s}
                  disabled={order?.status === s || updateStatus.isPending}
                  onClick={() => updateStatus.mutate(s)}
                  className={`px-6 py-2 rounded-xl text-xs font-bold border transition-all ${
                    order?.status === s ? "bg-green-500 text-white border-green-500" : "bg-white text-[var(--color-text-primary)] hover:border-[#ef4a23]"
                  }`}
                >
                  Mark as {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)]">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-[var(--color-text-tertiary)] uppercase tracking-wider">
              <User size={16} /> Customer
            </h3>
            <p className="font-bold text-[var(--color-text-primary)]">{order?.user?.name}</p>
            <p className="text-sm text-[var(--color-text-secondary)]">{order?.user?.email}</p>
          </div>

          <div className="p-6 rounded-2xl border border-[var(--color-border-tertiary)] bg-[var(--color-background-primary)]">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-[var(--color-text-tertiary)] uppercase tracking-wider">
              <MapPin size={16} /> Shipping Address
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {order?.shippingAddress?.street}, <br />
              {order?.shippingAddress?.city}, {order?.shippingAddress?.state} <br />
              {order?.shippingAddress?.zip}, {order?.shippingAddress?.country}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}// src/app/(dashboard)/seller/orders/[id]/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  CreditCard,
  Copy,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import Loader from "../../../../components/common/Loader";
import axiosInstance from "../../../../lib/axios";

const STATUS_CONFIG: Record<string, { bg: string; color: string; icon: React.ElementType; label: string }> = {
  PENDING: { bg: "rgba(234,179,8,0.1)", color: "#ca8a04", icon: Clock, label: "Pending" },
  PROCESSING: { bg: "rgba(139,92,246,0.1)", color: "#7c3aed", icon: Package, label: "Processing" },
  SHIPPED: { bg: "rgba(6,182,212,0.1)", color: "#0891b2", icon: Truck, label: "Shipped" },
  DELIVERED: { bg: "rgba(34,197,94,0.1)", color: "#16a34a", icon: CheckCircle2, label: "Delivered" },
  CANCELLED: { bg: "rgba(240,39,87,0.1)", color: "#f02757", icon: AlertCircle, label: "Cancelled" },
};

const SELLER_ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  const Icon = config.icon;
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      <Icon size={13} />
      {config.label}
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{
        backgroundColor: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
      }}
    >
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm flex-shrink-0" style={{ color: "var(--color-text-tertiary)" }}>
        {label}
      </span>
      <span className="text-sm font-semibold text-right" style={{ color: "var(--color-text-primary)" }}>
        {value}
      </span>
    </div>
  );
}

export default function SellerOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [trackingInput, setTrackingInput] = useState("");
  const [carrierInput, setCarrierInput] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.SELLER_ORDERS, id],
    queryFn: () => axiosInstance.get(`/seller/orders/${id}`).then((r) => r.data),
  });

  const order = data?.data;

  const updateStatus = useMutation({
    mutationFn: (newStatus: string) =>
      axiosInstance.patch(`/seller/orders/${id}/status`, { status: newStatus }),
    onSuccess: () => {
      toast.success("Order status updated!");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SELLER_ORDERS] });
    },
    onError: () => toast.error("Failed to update status"),
  });

  const updateShipping = useMutation({
    mutationFn: () =>
      axiosInstance.patch(`/seller/orders/${id}/shipping`, {
        trackingNumber: trackingInput,
        carrier: carrierInput,
      }),
    onSuccess: () => {
      toast.success("Shipping info updated!");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SELLER_ORDERS, id] });
    },
    onError: () => toast.error("Failed to update shipping info"),
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (isLoading) return <Loader />;
  if (!order) return (
    <div className="p-6 text-center" style={{ color: "var(--color-text-secondary)" }}>
      Order not found.
    </div>
  );

  const allowedNext = SELLER_ALLOWED_TRANSITIONS[order.status] ?? [];
  const placedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            style={{
              border: "0.5px solid var(--color-border-secondary)",
              backgroundColor: "var(--color-background-primary)",
              color: "var(--color-text-secondary)",
            }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                Order #{order.orderNumber}
              </h1>
              <button onClick={() => copyToClipboard(order.orderNumber)}>
                <Copy size={14} style={{ color: "var(--color-text-tertiary)" }} />
              </button>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
              Placed on {placedDate}
            </p>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left — main content */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Order Items */}
          <InfoCard title="Order Items">
            <div className="flex flex-col gap-3">
              {order.items?.map((item: any) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ backgroundColor: "var(--color-background-secondary)" }}
                >
                  <div
                    className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: "var(--color-background-tertiary)" }}
                  >
                    {item.product?.thumbnail ? (
                      <Image src={item.product.thumbnail} alt={item.product.name} fill className="object-cover" sizes="56px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={20} style={{ color: "var(--color-text-tertiary)" }} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>
                      {item.product?.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                      Qty: {item.quantity} × ${item.price?.toFixed(2)}
                    </p>
                  </div>
                  <span className="text-sm font-bold flex-shrink-0" style={{ color: "var(--color-text-primary)" }}>
                    ${(item.quantity * item.price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div
              className="flex flex-col gap-2 pt-3 border-t"
              style={{ borderColor: "var(--color-border-tertiary)" }}
            >
              <InfoRow label="Subtotal" value={`$${order.subtotal?.toFixed(2)}`} />
              {order.discount > 0 && (
                <InfoRow label="Discount" value={<span style={{ color: "#16a34a" }}>-${order.discount?.toFixed(2)}</span>} />
              )}
              <InfoRow label="Shipping" value={order.shippingCost === 0 ? "Free" : `$${order.shippingCost?.toFixed(2)}`} />
              <InfoRow label="Tax" value={`$${order.tax?.toFixed(2)}`} />
              <div
                className="flex items-center justify-between pt-2 border-t"
                style={{ borderColor: "var(--color-border-tertiary)" }}
              >
                <span className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>Total</span>
                <span className="text-lg font-black" style={{ color: "#ef4a23" }}>
                  ${order.totalAmount?.toFixed(2)}
                </span>
              </div>
            </div>
          </InfoCard>

          {/* Shipping Update (only if can be shipped) */}
          {(order.status === "PROCESSING" || order.status === "SHIPPED") && (
            <InfoCard title="Shipping Information">
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                      Carrier
                    </label>
                    <input
                      type="text"
                      placeholder={order.shippingInfo?.carrier ?? "e.g. DHL, FedEx"}
                      value={carrierInput}
                      onChange={(e) => setCarrierInput(e.target.value)}
                      className="h-10 px-3 rounded-xl text-sm outline-none"
                      style={{
                        backgroundColor: "var(--color-background-secondary)",
                        border: "0.5px solid var(--color-border-secondary)",
                        color: "var(--color-text-primary)",
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                      Tracking Number
                    </label>
                    <input
                      type="text"
                      placeholder={order.shippingInfo?.trackingNumber ?? "Enter tracking #"}
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      className="h-10 px-3 rounded-xl text-sm outline-none"
                      style={{
                        backgroundColor: "var(--color-background-secondary)",
                        border: "0.5px solid var(--color-border-secondary)",
                        color: "var(--color-text-primary)",
                      }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => updateShipping.mutate()}
                  disabled={updateShipping.isPending || (!trackingInput && !carrierInput)}
                  className="self-start h-10 px-5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#ef4a23" }}
                >
                  {updateShipping.isPending ? "Saving..." : "Save Shipping Info"}
                </button>
              </div>
            </InfoCard>
          )}

          {/* Status Update */}
          {allowedNext.length > 0 && (
            <InfoCard title="Update Order Status">
              <div className="flex flex-wrap gap-2">
                {allowedNext.map((nextStatus) => {
                  const config = STATUS_CONFIG[nextStatus];
                  return (
                    <button
                      key={nextStatus}
                      onClick={() => updateStatus.mutate(nextStatus)}
                      disabled={updateStatus.isPending}
                      className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold transition-all hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: nextStatus === "CANCELLED" ? "rgba(240,39,87,0.1)" : "#ef4a23",
                        color: nextStatus === "CANCELLED" ? "#f02757" : "#fff",
                        border: nextStatus === "CANCELLED" ? "1px solid rgba(240,39,87,0.3)" : "none",
                      }}
                    >
                      <config.icon size={15} />
                      Mark as {config.label}
                    </button>
                  );
                })}
              </div>
            </InfoCard>
          )}
        </div>

        {/* Right — meta */}
        <div className="flex flex-col gap-5">

          {/* Customer Info */}
          <InfoCard title="Customer">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: "rgba(239,74,35,0.1)", color: "#ef4a23" }}
              >
                {order.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  {order.user?.name}
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                  {order.user?.email}
                </p>
              </div>
            </div>
          </InfoCard>

          {/* Shipping Address */}
          <InfoCard title="Shipping Address">
            <div className="flex items-start gap-2">
              <MapPin size={15} className="flex-shrink-0 mt-0.5" style={{ color: "#ef4a23" }} />
              <div className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                <p className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  {order.shippingAddress?.fullName}
                </p>
                <p>{order.shippingAddress?.street}</p>
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                  {order.shippingAddress?.postalCode}
                </p>
                <p>{order.shippingAddress?.country}</p>
                {order.shippingAddress?.phone && (
                  <p className="mt-1">{order.shippingAddress.phone}</p>
                )}
              </div>
            </div>
          </InfoCard>

          {/* Payment Info */}
          <InfoCard title="Payment">
            <div className="flex flex-col gap-2">
              <InfoRow
                label="Method"
                value={
                  <span className="flex items-center gap-1.5">
                    <CreditCard size={13} style={{ color: "#ef4a23" }} />
                    {order.paymentMethod ?? "N/A"}
                  </span>
                }
              />
              <InfoRow
                label="Status"
                value={
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor:
                        order.paymentStatus === "PAID"
                          ? "rgba(34,197,94,0.1)"
                          : "rgba(234,179,8,0.1)",
                      color: order.paymentStatus === "PAID" ? "#16a34a" : "#ca8a04",
                    }}
                  >
                    {order.paymentStatus ?? "UNPAID"}
                  </span>
                }
              />
              {order.paymentId && (
                <InfoRow label="Transaction ID" value={
                  <span className="font-mono text-xs truncate max-w-[120px] block">
                    {order.paymentId}
                  </span>
                } />
              )}
            </div>
          </InfoCard>

          {/* Tracking Info (if exists) */}
          {order.shippingInfo?.trackingNumber && (
            <InfoCard title="Tracking">
              <div className="flex flex-col gap-2">
                <InfoRow label="Carrier" value={order.shippingInfo.carrier} />
                <InfoRow
                  label="Tracking #"
                  value={
                    <button
                      className="flex items-center gap-1 font-mono text-xs"
                      style={{ color: "#ef4a23" }}
                      onClick={() => copyToClipboard(order.shippingInfo.trackingNumber)}
                    >
                      {order.shippingInfo.trackingNumber}
                      <Copy size={11} />
                    </button>
                  }
                />
              </div>
            </InfoCard>
          )}

          {/* Notes */}
          {order.notes && (
            <InfoCard title="Customer Notes">
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                {order.notes}
              </p>
            </InfoCard>
          )}
        </div>
      </div>
    </div>
  );
}