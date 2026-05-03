// src/components/product/ProductCard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { Product } from "../../types/product.types";
import { useCartStore } from "../../stores/cart.store";
import { useWishlistStore } from "../../stores/wishlist.store";
import { useAuthStore } from "../../stores/auth.store";
import { ROUTES } from "../../constants/routes";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const { addItem } = useCartStore();
  const { addItem: addToWishlist, removeItem, isInWishlist } = useWishlistStore();
  const { user } = useAuthStore();

  const wishlisted = isInWishlist(product._id);

  const discountPercent =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null;

  const truncatedName =
    product.name.length > 40 ? product.name.slice(0, 40) + "..." : product.name;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ productId: product._id, quantity: 1 });
    toast.success("Added to cart!", {
      description: truncatedName,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const productHref = `${ROUTES.PRODUCTS}/${product.slug}`;

  return (
    <Link
      href={productHref}
      className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        backgroundColor: "var(--color-background-primary, #fff)",
        border: "0.5px solid var(--color-border-tertiary)",
        boxShadow: "0 0 0 0 rgba(239,74,35,0)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.boxShadow =
          "0 8px 32px rgba(239,74,35,0.1)";
        (e.currentTarget as HTMLAnchorElement).style.borderColor =
          "rgba(239,74,35,0.3)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.boxShadow =
          "0 0 0 0 rgba(239,74,35,0)";
        (e.currentTarget as HTMLAnchorElement).style.borderColor =
          "var(--color-border-tertiary)";
      }}
    >
      {/* image container */}
      <div
        className="relative w-full h-52 overflow-hidden flex-shrink-0"
        style={{ backgroundColor: "var(--color-background-secondary, #f4f4f5)" }}
      >
        {!imgError && product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart size={32} style={{ color: "var(--color-text-tertiary)" }} />
          </div>
        )}

        {/* discount badge */}
        {discountPercent && (
          <div
            className="absolute top-3 left-3 px-2 py-0.5 rounded-lg text-xs font-bold text-white"
            style={{ backgroundColor: "#ef4a23" }}
          >
            -{discountPercent}%
          </div>
        )}

        {/* wishlist button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{
            backgroundColor: wishlisted
              ? "rgba(240,39,87,0.12)"
              : "rgba(255,255,255,0.9)",
            border: wishlisted
              ? "0.5px solid rgba(240,39,87,0.3)"
              : "0.5px solid var(--color-border-tertiary)",
            backdropFilter: "blur(4px)",
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={15}
            fill={wishlisted ? "#f02757" : "none"}
            stroke={wishlisted ? "#f02757" : "var(--color-text-secondary)"}
            strokeWidth={1.8}
          />
        </button>
      </div>

      {/* content */}
      <div className="flex flex-col gap-2.5 p-4 flex-1">
        {/* category badge */}
        {product.category?.name && (
          <span
            className="text-xs font-semibold w-fit px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: "rgba(239,74,35,0.08)",
              color: "#ef4a23",
            }}
          >
            {product.category.name}
          </span>
        )}

        {/* product name */}
        <p
          className="text-sm font-semibold leading-snug"
          style={{ color: "var(--color-text-primary)" }}
        >
          {truncatedName}
        </p>

        {/* rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={12}
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
          <span
            className="text-xs"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            ({product.reviewCount ?? 0})
          </span>
        </div>

        {/* price row */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-2">
            <span
              className="text-base font-bold"
              style={{ color: "var(--color-text-primary)" }}
            >
              ${product.price.toFixed(2)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span
                className="text-xs line-through"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                ${product.comparePrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* stock indicator */}
          {product.inventory?.quantity === 0 && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: "rgba(240,39,87,0.08)",
                color: "#f02757",
              }}
            >
              Out of stock
            </span>
          )}
        </div>

        {/* add to cart button */}
        <button
          onClick={handleAddToCart}
          disabled={product.inventory?.quantity === 0}
          className="w-full h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 mt-1 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-85 active:scale-95"
          style={{ backgroundColor: "#ef4a23", color: "#fff" }}
        >
          <ShoppingCart size={15} />
          Add to Cart
        </button>
      </div>
    </Link>
  );
}