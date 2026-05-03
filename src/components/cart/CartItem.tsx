// src/components/cart/CartItem.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CartItem as CartItemType } from "../../types/cart.types";
import { useCartStore } from "../../stores/cart.store";
import { cartService } from "../../services/cart.service";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const [imgError, setImgError] = useState(false);
  const [updatingQty, setUpdatingQty] = useState(false);
  const [removing, setRemoving] = useState(false);
  const { updateItem, removeItem } = useCartStore();

  const handleQtyChange = async (newQty: number) => {
    if (newQty < 1 || updatingQty) return;
    setUpdatingQty(true);
    try {
      await cartService.updateItem(item._id, { quantity: newQty });
      updateItem(item._id, newQty);
    } catch {
      toast.error("Failed to update quantity");
    } finally {
      setUpdatingQty(false);
    }
  };

  const handleRemove = async () => {
    if (removing) return;
    setRemoving(true);
    try {
      await cartService.removeItem(item._id);
      removeItem(item._id);
      toast.success("Item removed from cart");
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setRemoving(false);
    }
  };

  const total = (item.price * item.quantity).toFixed(2);

  return (
    <div
      className="flex gap-3 p-3 rounded-2xl transition-all"
      style={{
        backgroundColor: "var(--color-background-secondary)",
        border: "0.5px solid var(--color-border-tertiary)",
        opacity: removing ? 0.5 : 1,
      }}
    >
      {/* image */}
      <div
        className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0"
        style={{ backgroundColor: "var(--color-background-primary)" }}
      >
        {!imgError && item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt={item.name}
            fill
            sizes="80px"
            className="object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
        )}
      </div>

      {/* info */}
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <p
          className="text-sm font-semibold leading-snug truncate"
          style={{ color: "var(--color-text-primary)" }}
        >
          {item.name}
        </p>

        {/* variant info if any */}
        {item.variant && (
          <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            {item.variant}
          </p>
        )}

        {/* price */}
        <p className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
          ${item.price.toFixed(2)} each
        </p>

        {/* qty + total row */}
        <div className="flex items-center justify-between mt-auto">
          {/* qty stepper */}
          <div
            className="flex items-center rounded-lg overflow-hidden"
            style={{ border: "0.5px solid var(--color-border-secondary)" }}
          >
            <button
              onClick={() => handleQtyChange(item.quantity - 1)}
              disabled={item.quantity <= 1 || updatingQty}
              className="w-7 h-7 flex items-center justify-center transition-colors disabled:opacity-30"
              style={{
                backgroundColor: "var(--color-background-primary)",
                color: "var(--color-text-primary)",
              }}
            >
              <Minus size={11} />
            </button>
            <span
              className="w-8 text-center text-xs font-bold"
              style={{ color: "var(--color-text-primary)" }}
            >
              {updatingQty ? (
                <Loader2 size={10} className="animate-spin mx-auto" />
              ) : (
                item.quantity
              )}
            </span>
            <button
              onClick={() => handleQtyChange(item.quantity + 1)}
              disabled={updatingQty}
              className="w-7 h-7 flex items-center justify-center transition-colors disabled:opacity-30"
              style={{
                backgroundColor: "var(--color-background-primary)",
                color: "var(--color-text-primary)",
              }}
            >
              <Plus size={11} />
            </button>
          </div>

          {/* item total */}
          <span className="text-sm font-black" style={{ color: "#ef4a23" }}>
            ${total}
          </span>

          {/* remove */}
          <button
            onClick={handleRemove}
            disabled={removing}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-105 disabled:opacity-40"
            style={{
              backgroundColor: "rgba(240,39,87,0.08)",
              color: "#f02757",
            }}
            aria-label="Remove item"
          >
            {removing ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Trash2 size={12} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}