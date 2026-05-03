// src/components/product/ProductInfo.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Star,
  Heart,
  ShoppingCart,
  Share2,
  Minus,
  Plus,
  Check,
  Tag,
  Package,
  Shield,
  Truck,
} from "lucide-react";
import { Product } from "../../types/product.types";
import { useCartStore } from "../../stores/cart.store";
import { useWishlistStore } from "../../stores/wishlist.store";
import { useAuthStore } from "../../stores/auth.store";

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();
  const { addItem: addToWishlist, removeItem, isInWishlist } = useWishlistStore();
  const { user } = useAuthStore();

  const wishlisted = isInWishlist(product._id);

  const discountPercent =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(
          ((product.comparePrice - product.price) / product.comparePrice) * 100
        )
      : null;

  const inStock =
    product.inventory?.quantity !== undefined
      ? product.inventory.quantity > 0
      : true;

  const handleAddToCart = () => {
    if (!inStock) return;
    addItem({ productId: product._id, quantity });
    toast.success("Added to cart!", { description: product.name });
  };

  const handleWishlist = () => {
    if (!user) {
      toast.error("Please login to use wishlist");
      return;
    }
    if (wishlisted) {
      removeItem(product._id);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist(product);
      toast.success("Added to wishlist!");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: product.name, url: window.location.href });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* badges row */}
      <div className="flex items-center gap-2 flex-wrap">
        {product.category?.name && (
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: "rgba(239,74,35,0.08)", color: "#ef4a23" }}
          >
            {product.category.name}
          </span>
        )}
        {product.brand?.name && (
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: "var(--color-background-secondary)",
              color: "var(--color-text-secondary)",
              border: "0.5px solid var(--color-border-tertiary)",
            }}
          >
            {product.brand.name}
          </span>
        )}
        {product.isFeatured && (
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
            style={{ backgroundColor: "#3749bb" }}
          >
            Featured
          </span>
        )}
      </div>

      {/* product name */}
      <h1
        className="text-2xl md:text-3xl font-bold leading-snug"
        style={{ color: "var(--color-text-primary)" }}
      >
        {product.name}
      </h1>

      {/* SKU */}
      {product.sku && (
        <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          SKU: <span className="font-medium">{product.sku}</span>
        </p>
      )}

      {/* rating row */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={16}
              fill={i < Math.round(product.avgRating ?? 0) ? "#ef4a23" : "none"}
              stroke={
                i < Math.round(product.avgRating ?? 0)
                  ? "#ef4a23"
                  : "var(--color-border-secondary)"
              }
              strokeWidth={1.5}
            />
          ))}
        </div>
        <span className="text-sm font-semibold" style={{ color: "#ef4a23" }}>
          {(product.avgRating ?? 0).toFixed(1)}
        </span>
        <span className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
          ({product.reviewCount ?? 0} reviews)
        </span>
      </div>

      {/* divider */}
      <div
        className="w-full h-px"
        style={{ backgroundColor: "var(--color-border-tertiary)" }}
      />

      {/* price block */}
      <div className="flex items-end gap-3">
        <span
          className="text-4xl font-black"
          style={{ color: "var(--color-text-primary)" }}
        >
          ${product.price.toFixed(2)}
        </span>
        {product.comparePrice && product.comparePrice > product.price && (
          <span
            className="text-lg line-through mb-1"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            ${product.comparePrice.toFixed(2)}
          </span>
        )}
        {discountPercent && (
          <span
            className="text-sm font-bold px-2.5 py-1 rounded-lg mb-1"
            style={{ backgroundColor: "rgba(239,74,35,0.1)", color: "#ef4a23" }}
          >
            -{discountPercent}% OFF
          </span>
        )}
      </div>

      {/* stock status */}
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: inStock ? "#22c55e" : "#f02757" }}
        />
        <span
          className="text-sm font-medium"
          style={{ color: inStock ? "#22c55e" : "#f02757" }}
        >
          {inStock
            ? `In Stock${product.inventory?.quantity ? ` (${product.inventory.quantity} available)` : ""}`
            : "Out of Stock"}
        </span>
      </div>

      {/* short description */}
      {product.shortDescription && (
        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {product.shortDescription}
        </p>
      )}

      {/* divider */}
      <div
        className="w-full h-px"
        style={{ backgroundColor: "var(--color-border-tertiary)" }}
      />

      {/* quantity + actions */}
      <div className="flex flex-wrap items-center gap-3">
        {/* quantity stepper */}
        <div
          className="flex items-center rounded-xl overflow-hidden"
          style={{ border: "0.5px solid var(--color-border-secondary)" }}
        >
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="w-11 h-11 flex items-center justify-center transition-colors disabled:opacity-30"
            style={{
              backgroundColor: "var(--color-background-secondary)",
              color: "var(--color-text-primary)",
            }}
          >
            <Minus size={15} />
          </button>
          <span
            className="w-12 text-center text-sm font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            {quantity}
          </span>
          <button
            onClick={() =>
              setQuantity((q) =>
                Math.min(q + 1, product.inventory?.quantity ?? 99)
              )
            }
            disabled={!inStock}
            className="w-11 h-11 flex items-center justify-center transition-colors disabled:opacity-30"
            style={{
              backgroundColor: "var(--color-background-secondary)",
              color: "var(--color-text-primary)",
            }}
          >
            <Plus size={15} />
          </button>
        </div>

        {/* add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className="flex-1 h-11 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-85 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#ef4a23", minWidth: "140px" }}
        >
          <ShoppingCart size={16} />
          {inStock ? "Add to Cart" : "Out of Stock"}
        </button>

        {/* wishlist */}
        <button
          onClick={handleWishlist}
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:scale-105"
          style={{
            border: wishlisted
              ? "1.5px solid rgba(240,39,87,0.4)"
              : "0.5px solid var(--color-border-secondary)",
            backgroundColor: wishlisted
              ? "rgba(240,39,87,0.08)"
              : "var(--color-background-primary)",
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={17}
            fill={wishlisted ? "#f02757" : "none"}
            stroke={wishlisted ? "#f02757" : "var(--color-text-secondary)"}
            strokeWidth={1.8}
          />
        </button>

        {/* share */}
        <button
          onClick={handleShare}
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:scale-105"
          style={{
            border: "0.5px solid var(--color-border-secondary)",
            backgroundColor: "var(--color-background-primary)",
            color: "var(--color-text-secondary)",
          }}
          aria-label="Share product"
        >
          <Share2 size={16} />
        </button>
      </div>

      {/* trust badges */}
      <div
        className="grid grid-cols-3 gap-3 p-4 rounded-2xl"
        style={{
          backgroundColor: "var(--color-background-secondary)",
          border: "0.5px solid var(--color-border-tertiary)",
        }}
      >
        {[
          { icon: Truck, label: "Free Shipping", sub: "Orders over $50" },
          { icon: Shield, label: "Secure Payment", sub: "100% protected" },
          { icon: Package, label: "Easy Returns", sub: "30 day policy" },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center text-center gap-1">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "rgba(239,74,35,0.1)", color: "#ef4a23" }}
            >
              <item.icon size={15} />
            </div>
            <p
              className="text-xs font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              {item.label}
            </p>
            <p className="text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>
              {item.sub}
            </p>
          </div>
        ))}
      </div>

      {/* meta info */}
      <div className="flex flex-col gap-2">
        {product.category?.name && (
          <div className="flex items-center gap-2 text-sm">
            <Tag size={13} style={{ color: "#ef4a23" }} />
            <span style={{ color: "var(--color-text-tertiary)" }}>Category:</span>
            <span
              className="font-medium"
              style={{ color: "var(--color-text-primary)" }}
            >
              {product.category.name}
            </span>
          </div>
        )}
        {product.tags && product.tags.length > 0 && (
          <div className="flex items-start gap-2 text-sm">
            <Tag size={13} className="mt-0.5" style={{ color: "#ef4a23" }} />
            <span style={{ color: "var(--color-text-tertiary)" }}>Tags:</span>
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "var(--color-background-secondary)",
                    color: "var(--color-text-secondary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}