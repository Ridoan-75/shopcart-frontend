// src/app/(main)/cart/page.tsx
"use client";

import { useCartStore } from "../../../stores/cart.store";
import CartItem from "../../../components/cart/CartItem";
import CartSummary from "../../../components/cart/CartSummary";
import EmptyState from "../../../components/common/EmptyState";
import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { ROUTES } from "../../../constants/routes";

export default function CartPage() {
  const { items, cart } = useCartStore();

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-8">
      {/* header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black" style={{ color: "var(--color-text-primary)" }}>
            My Cart
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-tertiary)" }}>
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
        <Link
          href={ROUTES.PRODUCTS}
          className="flex items-center gap-2 text-sm font-medium hover:underline"
          style={{ color: "#ef4a23" }}
        >
          <ArrowLeft size={15} />
          Continue Shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={28} />}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Start shopping!"
          actionLabel="Browse Products"
          actionHref={ROUTES.PRODUCTS}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* items list */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {items.map((item) => (
              <CartItem key={item._id} item={item} />
            ))}
          </div>

          {/* summary */}
          <div>
            {cart && <CartSummary cart={cart} />}
          </div>
        </div>
      )}
    </div>
  );
}