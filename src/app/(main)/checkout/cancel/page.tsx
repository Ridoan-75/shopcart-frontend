// src/app/(main)/checkout/cancel/page.tsx
"use client";

import { XCircle, ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "../../../../constants/routes";

export default function CheckoutCancelPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 flex flex-col items-center text-center gap-6">
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center"
        style={{ backgroundColor: "rgba(240,39,87,0.08)" }}
      >
        <XCircle size={48} style={{ color: "#f02757" }} />
      </div>

      <div>
        <h1 className="text-2xl font-black mb-2" style={{ color: "var(--color-text-primary)" }}>
          Payment Cancelled
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Your payment was not completed. Your cart items are still saved.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <Link
          href="/checkout"
          className="w-full h-12 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-85"
          style={{ backgroundColor: "#ef4a23" }}
        >
          <RotateCcw size={15} /> Retry Payment
        </Link>
        <Link
          href={ROUTES.CART ?? "/cart"}
          className="w-full h-12 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          style={{ border: "1px solid var(--color-border-secondary)", color: "var(--color-text-secondary)" }}
        >
          <ArrowLeft size={15} /> Back to Cart
        </Link>
      </div>
    </div>
  );
}