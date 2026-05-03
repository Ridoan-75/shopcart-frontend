// src/components/cart/CartDrawer.tsx
"use client";

import { useUIStore } from "../../stores/ui.store";
import { useCartStore } from "../../stores/cart.store";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ShoppingBag, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import EmptyState from "../common/EmptyState";
import { ROUTES } from "../../constants/routes";

export default function CartDrawer() {
  const { cartDrawerOpen, closeCartDrawer } = useUIStore();
  const { items, cart } = useCartStore();

  return (
    <Sheet open={cartDrawerOpen} onOpenChange={closeCartDrawer}>
      <SheetContent
        side="right"
        className="w-full sm:w-[420px] p-0 flex flex-col"
        style={{ backgroundColor: "var(--color-background-primary)" }}
      >
        {/* header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0 border-b"
          style={{ borderColor: "var(--color-border-tertiary)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "rgba(239,74,35,0.1)", color: "#ef4a23" }}
            >
              <ShoppingBag size={16} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                My Cart
              </p>
              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                {items.length} {items.length === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
          <button
            onClick={closeCartDrawer}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
            style={{ color: "var(--color-text-secondary)" }}
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        {/* content */}
        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              title="Your cart is empty"
              description="Add some products to get started!"
              actionLabel="Browse Products"
              actionHref={ROUTES.PRODUCTS}
            />
          </div>
        ) : (
          <>
            {/* items list */}
            <div
              className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3"
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(239,74,35,0.2) transparent" }}
            >
              {items.map((item) => (
                <CartItem key={item._id} item={item} />
              ))}
            </div>

            {/* summary + actions */}
            <div
              className="flex-shrink-0 border-t px-5 py-4 flex flex-col gap-3"
              style={{ borderColor: "var(--color-border-tertiary)" }}
            >
              {/* subtotal quick view */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                  Subtotal
                </span>
                <span className="text-base font-black" style={{ color: "var(--color-text-primary)" }}>
                  ${(cart?.subtotal ?? items.reduce((acc, i) => acc + i.price * i.quantity, 0)).toFixed(2)}
                </span>
              </div>

              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                Shipping & taxes calculated at checkout
              </p>

              {/* buttons */}
              <Link
                href={ROUTES.CART ?? "/cart"}
                onClick={closeCartDrawer}
                className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center transition-colors"
                style={{
                  border: "1px solid rgba(239,74,35,0.4)",
                  color: "#ef4a23",
                  backgroundColor: "transparent",
                }}
              >
                View Full Cart
              </Link>
              <Link
                href={ROUTES.CHECKOUT ?? "/checkout"}
                onClick={closeCartDrawer}
                className="w-full h-11 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-85"
                style={{ backgroundColor: "#ef4a23" }}
              >
                Checkout
                <ArrowRight size={15} />
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}