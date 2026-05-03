// src/app/(main)/wishlist/page.tsx
"use client";

import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useWishlistStore } from "../../../stores/wishlist.store";
import { useCartStore } from "../../../stores/cart.store";
import { useAuthStore } from "../../../stores/auth.store";
import EmptyState from "../../../components/common/EmptyState";
import { ROUTES } from "../../../constants/routes";

function WishlistItem({ product }: { product: any }) {
  const { removeItem } = useWishlistStore();
  const { addItem } = useCartStore();

  const discountPercent =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null;

  const handleAddToCart = () => {
    addItem({ productId: product._id, quantity: 1 });
    toast.success("Added to cart!", { description: product.name });
  };

  const handleRemove = () => {
    removeItem(product._id);
    toast.success("Removed from wishlist");
  };

  return (
    <div
      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl transition-all"
      style={{
        backgroundColor: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
      }}
    >
      {/* image */}
      <Link
        href={`${ROUTES.PRODUCTS}/${product.slug}`}
        className="relative w-full sm:w-24 h-40 sm:h-24 rounded-xl overflow-hidden flex-shrink-0"
        style={{ backgroundColor: "var(--color-background-secondary)" }}
      >
        {product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.name}
            fill
            sizes="96px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Heart size={24} style={{ color: "var(--color-text-tertiary)" }} />
          </div>
        )}
        {discountPercent && (
          <span
            className="absolute top-2 left-2 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-md"
            style={{ backgroundColor: "#ef4a23" }}
          >
            -{discountPercent}%
          </span>
        )}
      </Link>

      {/* info */}
      <div className="flex-1 min-w-0">
        <Link href={`${ROUTES.PRODUCTS}/${product.slug}`}>
          <p
            className="text-sm font-semibold line-clamp-2 hover:text-[#ef4a23] transition-colors"
            style={{ color: "var(--color-text-primary)" }}
          >
            {product.name}
          </p>
        </Link>
        {product.category?.name && (
          <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
            {product.category.name}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-base font-black" style={{ color: "#ef4a23" }}>
            ${product.price?.toFixed(2)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-xs line-through" style={{ color: "var(--color-text-tertiary)" }}>
              ${product.comparePrice?.toFixed(2)}
            </span>
          )}
        </div>
        {/* stock */}
        {product.inventory?.quantity === 0 && (
          <span
            className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "rgba(240,39,87,0.08)", color: "#f02757" }}
          >
            Out of stock
          </span>
        )}
      </div>

      {/* actions */}
      <div className="flex sm:flex-col items-center gap-2 flex-shrink-0 w-full sm:w-auto">
        <button
          onClick={handleAddToCart}
          disabled={product.inventory?.quantity === 0}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#ef4a23" }}
        >
          <ShoppingCart size={13} />
          Add to Cart
        </button>
        <button
          onClick={handleRemove}
          className="flex items-center justify-center w-10 h-10 rounded-xl transition-colors"
          style={{
            backgroundColor: "rgba(240,39,87,0.08)",
            color: "#f02757",
            border: "0.5px solid rgba(240,39,87,0.2)",
          }}
          aria-label="Remove from wishlist"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

export default function WishlistPage() {
  const { items, clearWishlist } = useWishlistStore();
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ backgroundColor: "rgba(240,39,87,0.08)" }}
        >
          <Heart size={36} style={{ color: "#f02757" }} />
        </div>
        <h1 className="text-xl font-black mb-2" style={{ color: "var(--color-text-primary)" }}>
          Sign in to see your Wishlist
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
          Save your favorite products and shop them anytime.
        </p>
        <Link
          href={ROUTES.LOGIN}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-85"
          style={{ backgroundColor: "#ef4a23" }}
        >
          Sign In <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-10">
      {/* header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: "var(--color-text-primary)" }}>
            <Heart size={22} style={{ color: "#f02757" }} />
            My Wishlist
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-tertiary)" }}>
            {items.length} {items.length === 1 ? "item" : "items"} saved
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => {
              clearWishlist();
              toast.success("Wishlist cleared");
            }}
            className="text-xs font-semibold hover:opacity-70 transition-opacity"
            style={{ color: "#f02757" }}
          >
            Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<Heart size={28} />}
          title="Your wishlist is empty"
          description="Save products you love by clicking the heart icon. They'll appear here!"
          actionLabel="Browse Products"
          actionHref={ROUTES.PRODUCTS}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* items */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {items.map((product: any) => (
              <WishlistItem key={product._id} product={product} />
            ))}
          </div>

          {/* summary sidebar */}
          <div
            className="h-fit rounded-2xl p-6 flex flex-col gap-4 sticky top-24"
            style={{
              backgroundColor: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
            }}
          >
            <h2 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
              Wishlist Summary
            </h2>

            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--color-text-secondary)" }}>Total Items</span>
                <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>{items.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--color-text-secondary)" }}>Total Value</span>
                <span className="font-bold" style={{ color: "#ef4a23" }}>
                  ${items.reduce((acc: number, p: any) => acc + (p.price ?? 0), 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="h-px" style={{ backgroundColor: "var(--color-border-tertiary)" }} />

            <Link
              href={ROUTES.PRODUCTS}
              className="w-full h-11 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-85"
              style={{ backgroundColor: "#ef4a23" }}
            >
              Continue Shopping <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}