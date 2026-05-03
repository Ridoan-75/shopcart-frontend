// src/app/(main)/checkout/success/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import Link from "next/link";
import { orderService } from "../../../../services/order.service";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import { ROUTES } from "../../../../constants/routes";
import { useCartStore } from "../../../../stores/cart.store";
import { useEffect } from "react";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { clearCart } = useCartStore();

  useEffect(() => { clearCart(); }, []);

  const { data } = useQuery({
    queryKey: [QUERY_KEYS.ORDERS, orderId],
    queryFn: () => orderService.getById(orderId!),
    enabled: !!orderId,
  });

  const order = data?.data;

  return (
    <div className="max-w-lg mx-auto px-4 py-20 flex flex-col items-center text-center gap-6">
      {/* success animation */}
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center"
        style={{ backgroundColor: "rgba(34,197,94,0.1)" }}
      >
        <CheckCircle2 size={48} className="text-green-500" />
      </div>

      <div>
        <h1 className="text-2xl font-black mb-2" style={{ color: "var(--color-text-primary)" }}>
          Order Placed! 🎉
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Thank you for your purchase. We'll send you a confirmation email shortly.
        </p>
      </div>

      {order && (
        <div
          className="w-full rounded-2xl p-5"
          style={{
            backgroundColor: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Package size={16} style={{ color: "#ef4a23" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
              Order #{order.orderNumber}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: "var(--color-text-secondary)" }}>Total</span>
            <span className="font-bold" style={{ color: "#ef4a23" }}>
              ${order.total?.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 w-full">
        <Link
          href={`${ROUTES.USER_ORDERS}/${orderId}`}
          className="w-full h-12 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-85"
          style={{ backgroundColor: "#ef4a23" }}
        >
          View Order <ArrowRight size={16} />
        </Link>
        <Link
          href={ROUTES.PRODUCTS}
          className="w-full h-12 rounded-xl text-sm font-medium flex items-center justify-center transition-colors"
          style={{
            border: "1px solid var(--color-border-secondary)",
            color: "var(--color-text-secondary)",
          }}
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}