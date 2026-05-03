// src/components/cart/CartSummary.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Tag, X, ArrowRight, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { Cart } from "../../types/cart.types";
import { couponService } from "../../services/coupon.service";
import { useCartStore } from "../../stores/cart.store";
import { ROUTES } from "../../constants/routes";

interface CartSummaryProps {
  cart: Cart;
}

function SummaryRow({
  label,
  value,
  highlight,
  strike,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  strike?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className="text-sm"
        style={{
          color: highlight ? "var(--color-text-primary)" : "var(--color-text-secondary)",
          fontWeight: highlight ? 700 : 400,
        }}
      >
        {label}
      </span>
      <span
        className="text-sm"
        style={{
          color: highlight ? "var(--color-text-primary)" : strike ? "#22c55e" : "var(--color-text-secondary)",
          fontWeight: highlight ? 700 : 500,
          textDecoration: strike ? "none" : "none",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function CartSummary({ cart }: CartSummaryProps) {
  const [couponCode, setCouponCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const { setCoupon } = useCartStore();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || applying) return;
    setApplying(true);
    try {
      const res = await couponService.validate(couponCode.trim());
      setAppliedCoupon({ code: couponCode.trim(), discount: res.data.discount });
      setCoupon?.(res.data);
      toast.success(`Coupon applied! You save $${res.data.discount.toFixed(2)}`);
      setCouponCode("");
    } catch {
      toast.error("Invalid or expired coupon code");
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCoupon?.(null);
    toast.success("Coupon removed");
  };

  const subtotal = cart.subtotal ?? 0;
  const discount = appliedCoupon?.discount ?? cart.discount ?? 0;
  const shipping = cart.shipping ?? (subtotal > 50 ? 0 : 5.99);
  const tax = cart.tax ?? subtotal * 0.08;
  const total = subtotal - discount + shipping + tax;

  return (
    <div
      className="flex flex-col gap-5 p-6 rounded-2xl sticky top-24"
      style={{
        backgroundColor: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
      }}
    >
      <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
        Order Summary
      </h2>

      {/* coupon input */}
      <div className="flex flex-col gap-2">
        <label
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          Coupon Code
        </label>

        {appliedCoupon ? (
          <div
            className="flex items-center justify-between px-3 py-2.5 rounded-xl"
            style={{
              backgroundColor: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.25)",
            }}
          >
            <div className="flex items-center gap-2">
              <Check size={14} className="text-green-500" />
              <span className="text-sm font-semibold text-green-600">
                {appliedCoupon.code}
              </span>
              <span className="text-xs text-green-500">
                (-${appliedCoupon.discount.toFixed(2)})
              </span>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(240,39,87,0.1)", color: "#f02757" }}
            >
              <X size={11} />
            </button>
          </div>
        ) : (
          <div
            className="flex items-center rounded-xl overflow-hidden"
            style={{ border: "0.5px solid var(--color-border-secondary)" }}
          >
            <div className="px-3 flex-shrink-0" style={{ color: "#ef4a23" }}>
              <Tag size={14} />
            </div>
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
              placeholder="Enter coupon code"
              className="flex-1 h-11 text-sm bg-transparent outline-none"
              style={{
                color: "var(--color-text-primary)",
                fontFamily: "'Trebuchet MS', sans-serif",
              }}
            />
            <button
              onClick={handleApplyCoupon}
              disabled={!couponCode.trim() || applying}
              className="h-11 px-4 text-sm font-semibold text-white flex items-center gap-1.5 transition-opacity hover:opacity-85 disabled:opacity-40"
              style={{ backgroundColor: "#ef4a23" }}
            >
              {applying ? <Loader2 size={13} className="animate-spin" /> : "Apply"}
            </button>
          </div>
        )}
      </div>

      {/* divider */}
      <div className="w-full h-px" style={{ backgroundColor: "var(--color-border-tertiary)" }} />

      {/* price breakdown */}
      <div className="flex flex-col gap-3">
        <SummaryRow label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
        {discount > 0 && (
          <SummaryRow label="Discount" value={`-$${discount.toFixed(2)}`} strike />
        )}
        <SummaryRow
          label="Shipping"
          value={shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
        />
        <SummaryRow label="Tax (8%)" value={`$${tax.toFixed(2)}`} />
      </div>

      {/* divider */}
      <div className="w-full h-px" style={{ backgroundColor: "var(--color-border-tertiary)" }} />

      {/* total */}
      <div className="flex items-center justify-between">
        <span className="text-base font-black" style={{ color: "var(--color-text-primary)" }}>
          Total
        </span>
        <span className="text-2xl font-black" style={{ color: "#ef4a23" }}>
          ${total.toFixed(2)}
        </span>
      </div>

      {/* free shipping nudge */}
      {subtotal < 50 && shipping > 0 && (
        <div
          className="px-3 py-2.5 rounded-xl text-xs"
          style={{
            backgroundColor: "rgba(55,73,187,0.06)",
            color: "#3749bb",
            border: "0.5px solid rgba(55,73,187,0.2)",
          }}
        >
          Add <strong>${(50 - subtotal).toFixed(2)}</strong> more for free shipping!
        </div>
      )}

      {/* checkout button */}
      <Link
        href={ROUTES.CHECKOUT ?? "/checkout"}
        className="w-full h-12 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-85"
        style={{ backgroundColor: "#ef4a23" }}
      >
        Proceed to Checkout
        <ArrowRight size={16} />
      </Link>

      <Link
        href={ROUTES.PRODUCTS}
        className="text-center text-sm transition-colors hover:opacity-70"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        ← Continue Shopping
      </Link>
    </div>
  );
}