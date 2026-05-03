"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, ShoppingCart, Heart, Eye, TrendingUp, Trophy } from "lucide-react";

// ── Types ─────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  soldCount: number;
  rank: number;
}

// ── Skeleton ──────────────────────────────────────────────
function BestSellersSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left big card skeleton */}
      <div className="animate-pulse bg-white rounded-2xl p-6 flex gap-5">
        <div className="w-40 h-40 bg-gray-200 rounded-xl flex-shrink-0" />
        <div className="flex-1">
          <div className="h-3 bg-gray-200 rounded-full w-1/3 mb-3" />
          <div className="h-5 bg-gray-200 rounded-full w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded-full w-2/4 mb-4" />
          <div className="h-6 bg-gray-200 rounded-full w-1/3" />
        </div>
      </div>
      {/* Right list skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-2xl p-4 flex gap-4">
            <div className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0" />
            <div className="flex-1">
              <div className="h-3 bg-gray-200 rounded-full w-1/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded-full w-3/4 mb-3" />
              <div className="h-5 bg-gray-200 rounded-full w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Rank Badge ────────────────────────────────────────────
function RankBadge({ rank }: { rank: number }) {
  const colors: Record<number, string> = {
    1: "bg-yellow-400 text-yellow-900",
    2: "bg-gray-300 text-gray-700",
    3: "bg-orange-400 text-orange-900",
  };
  return (
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0 ${
        colors[rank] ?? "bg-tech_purple/10 text-tech_purple"
      }`}
    >
      {rank <= 3 ? <Trophy size={13} /> : `#${rank}`}
    </div>
  );
}

// ── Featured Big Card (rank 1) ────────────────────────────
function FeaturedBestSellerCard({ product }: { product: Product }) {
  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-tech_purple/20 transition-all duration-300 flex flex-col">
      {/* Image */}
      <div className="relative h-56 bg-[#f2f4f8] overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
        />
        {/* Rank */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
            <Trophy size={11} />
            #1 Best Seller
          </span>
        </div>
        {discount && (
          <div className="absolute top-4 right-4">
            <span className="bg-tech_dark_red text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          </div>
        )}
        {/* Actions */}
        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <button className="w-8 h-8 rounded-xl bg-white shadow-md flex items-center justify-center hover:bg-tech_purple hover:text-white transition-colors">
            <Heart size={14} />
          </button>
          <Link href={`/products/${product.slug}`}>
            <button className="w-8 h-8 rounded-xl bg-white shadow-md flex items-center justify-center hover:bg-tech_purple hover:text-white transition-colors">
              <Eye size={14} />
            </button>
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <p className="text-[11px] text-tech_purple font-semibold uppercase tracking-wider mb-1">
          {product.category}
        </p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-lg font-black text-tech_black hover:text-tech_purple transition-colors line-clamp-2 mb-3 leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={13}
                className={
                  i < Math.floor(product.rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-200 fill-gray-200"
                }
              />
            ))}
          </div>
          <span className="text-xs text-gray-400">({product.reviewCount})</span>
          <span className="text-xs text-gray-300">•</span>
          <span className="text-xs text-gray-400">{product.soldCount.toLocaleString()} sold</span>
        </div>

        {/* Price + Cart */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            {product.discountPrice ? (
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-tech_black">
                  ${product.discountPrice.toFixed(2)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-xl font-black text-tech_black">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
          <button className="flex items-center gap-2 bg-tech_purple hover:bg-tech_purple/90 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
            <ShoppingCart size={15} />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Small List Card (rank 2-5) ────────────────────────────
function SmallBestSellerCard({ product }: { product: Product }) {
  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-tech_purple/20 transition-all duration-300 flex gap-4 p-4">
      {/* Rank */}
      <div className="flex flex-col items-center justify-start pt-1">
        <RankBadge rank={product.rank} />
      </div>

      {/* Image */}
      <div className="relative w-20 h-20 bg-[#f2f4f8] rounded-xl overflow-hidden flex-shrink-0">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-tech_purple font-semibold uppercase tracking-wider mb-0.5">
          {product.category}
        </p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-bold text-tech_black hover:text-tech_purple transition-colors line-clamp-2 mb-1.5 leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={10}
                className={
                  i < Math.floor(product.rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-200 fill-gray-200"
                }
              />
            ))}
          </div>
          <span className="text-[10px] text-gray-400">{product.soldCount.toLocaleString()} sold</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {product.discountPrice ? (
              <>
                <span className="text-sm font-black text-tech_black">
                  ${product.discountPrice.toFixed(2)}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
                {discount && (
                  <span className="text-[10px] bg-tech_dark_red/10 text-tech_dark_red font-bold px-1.5 py-0.5 rounded-full">
                    -{discount}%
                  </span>
                )}
              </>
            ) : (
              <span className="text-sm font-black text-tech_black">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
          <button className="w-8 h-8 rounded-xl bg-tech_purple/10 hover:bg-tech_purple flex items-center justify-center transition-colors group/btn flex-shrink-0">
            <ShoppingCart
              size={13}
              className="text-tech_purple group-hover/btn:text-white transition-colors"
            />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Fetch ─────────────────────────────────────────────────
async function getBestSellers(): Promise<Product[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products?sort=best&limit=5`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    if (data?.data?.length > 0) return data.data;
    return FALLBACK_BEST_SELLERS;
  } catch {
    return FALLBACK_BEST_SELLERS;
  }
}

// ── Main Component ───────────────────────────────
export default async function BestSellers() {
  const products = await getBestSellers();
  const [first, ...rest] = products;

  return (
    <section className="w-full bg-white py-14">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-tech_purple" />
              <p className="text-tech_purple text-sm font-semibold uppercase tracking-widest">
                Top Picks
              </p>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-tech_black">
              Best Sellers
            </h2>
          </div>
          <Link
            href="/products?sort=best"
            className="hidden sm:flex items-center gap-2 text-sm font-semibold text-tech_purple hover:text-tech_purple/80 transition-colors group"
          >
            <span>View All</span>
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Layout: Big card left + list right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left — Featured #1 */}
          {first && <FeaturedBestSellerCard product={first} />}

          {/* Right — Ranked list */}
          <div className="flex flex-col gap-4">
            {rest.map((product) => (
              <SmallBestSellerCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Mobile View All */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/products?sort=best"
            className="inline-flex items-center gap-2 text-sm font-semibold text-tech_purple border border-tech_purple px-5 py-2.5 rounded-xl hover:bg-tech_purple hover:text-white transition-colors"
          >
            View All Best Sellers
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Fallback Data ─────────────────────────────────────────
const FALLBACK_BEST_SELLERS: Product[] = [
  {
    id: "1",
    name: "Wireless Noise Cancelling Headphones Pro Max",
    slug: "wireless-headphones-pro-max",
    price: 129.99,
    discountPrice: 89.99,
    rating: 5,
    reviewCount: 1284,
    image: "/images/products/headphones.png",
    category: "Electronics",
    soldCount: 8420,
    rank: 1,
  },
  {
    id: "2",
    name: "Smart Fitness Watch Series 5",
    slug: "smart-fitness-watch",
    price: 199.99,
    discountPrice: 149.99,
    rating: 4,
    reviewCount: 892,
    image: "/images/products/watch.png",
    category: "Electronics",
    soldCount: 5310,
    rank: 2,
  },
  {
    id: "3",
    name: "Men's Running Shoes Ultra Boost",
    slug: "mens-running-shoes",
    price: 119.99,
    discountPrice: 89.99,
    rating: 5,
    reviewCount: 634,
    image: "/images/products/shoes.png",
    category: "Sports",
    soldCount: 4190,
    rank: 3,
  },
  {
    id: "4",
    name: "Organic Face Serum With Vitamin C",
    slug: "organic-face-serum",
    price: 45.99,
    discountPrice: null,
    rating: 4,
    reviewCount: 421,
    image: "/images/products/serum.png",
    category: "Beauty",
    soldCount: 3870,
    rank: 4,
  },
  {
    id: "5",
    name: "Portable Bluetooth Speaker Waterproof",
    slug: "bluetooth-speaker",
    price: 59.99,
    discountPrice: 44.99,
    rating: 4,
    reviewCount: 378,
    image: "/images/products/speaker.png",
    category: "Electronics",
    soldCount: 3210,
    rank: 5,
  },
];