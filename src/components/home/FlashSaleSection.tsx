// components/home/FlashSaleSection.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, ShoppingCart, Heart, Eye, Zap, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────
interface FlashProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  soldCount: number;
  totalStock: number;
}

interface FlashSale {
  id: string;
  title: string;
  endTime: string;
  products: FlashProduct[];
}

// ── Countdown Timer ───────────────────────────────────────
function useCountdown(endTime: string) {
  const getTimeLeft = useCallback(() => {
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    };
  }, [endTime]);

  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [getTimeLeft]);

  return timeLeft;
}

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl flex items-center justify-center shadow-sm">
        <span className="text-lg md:text-xl font-black text-tech_black">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-[10px] text-white/70 mt-1 uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

// ── Flash Product Card ────────────────────────────────────
function FlashProductCard({ product }: { product: FlashProduct }) {
  const discount = Math.round(
    ((product.price - product.discountPrice) / product.price) * 100
  );
  const soldPercent = Math.round((product.soldCount / product.totalStock) * 100);

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-tech_orange/30 transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {/* Image */}
      <div className="relative aspect-square bg-[#f2f4f8] overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
        />

        {/* Discount Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-tech_orange text-white text-[10px] font-black px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <button className="w-8 h-8 rounded-xl bg-white shadow-md flex items-center justify-center hover:bg-tech_orange hover:text-white transition-colors">
            <Heart size={14} />
          </button>
          <Link href={`/products/${product.slug}`}>
            <button className="w-8 h-8 rounded-xl bg-white shadow-md flex items-center justify-center hover:bg-tech_orange hover:text-white transition-colors">
              <Eye size={14} />
            </button>
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[11px] text-tech_purple font-semibold uppercase tracking-wider mb-1">
          {product.category}
        </p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-bold text-tech_black hover:text-tech_orange transition-colors line-clamp-2 mb-2 leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                className={
                  i < Math.floor(product.rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-200 fill-gray-200"
                }
              />
            ))}
          </div>
          <span className="text-[11px] text-gray-400">({product.reviewCount})</span>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-gray-400">Sold: {product.soldCount}</span>
            <span className="text-[11px] text-tech_orange font-semibold">
              {soldPercent}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-tech_orange to-yellow-400 rounded-full transition-all duration-700"
              style={{ width: `${soldPercent}%` }}
            />
          </div>
        </div>

        {/* Price + Cart */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black text-tech_black">
                ${product.discountPrice.toFixed(2)}
              </span>
              <span className="text-xs text-gray-400 line-through">
                ${product.price.toFixed(2)}
              </span>
            </div>
          </div>
          <button className="w-9 h-9 rounded-xl bg-tech_orange/10 hover:bg-tech_orange flex items-center justify-center transition-colors group/btn">
            <ShoppingCart
              size={15}
              className="text-tech_orange group-hover/btn:text-white transition-colors"
            />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────
function FlashSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse bg-white rounded-2xl p-4">
          <div className="aspect-square bg-gray-200 rounded-xl mb-4" />
          <div className="h-3 bg-gray-200 rounded-full w-1/3 mb-2" />
          <div className="h-4 bg-gray-200 rounded-full w-3/4 mb-3" />
          <div className="h-2 bg-gray-100 rounded-full w-full mb-4" />
          <div className="h-5 bg-gray-200 rounded-full w-1/3" />
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────
export default function FlashSaleSection() {
  const [flashSale, setFlashSale] = useState<FlashSale | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashSale = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/flash-sales/active`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (data?.data) {
          setFlashSale(data.data);
        } else {
          setFlashSale(FALLBACK_FLASH_SALE);
        }
      } catch {
        setFlashSale(FALLBACK_FLASH_SALE);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashSale();
  }, []);

  const timeLeft = useCountdown(
    flashSale?.endTime ?? new Date(Date.now() + 86400000).toISOString()
  );

  if (loading) {
    return (
      <section className="w-full bg-white py-14">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="h-24 bg-gray-200 animate-pulse rounded-2xl mb-8" />
          <FlashSkeleton />
        </div>
      </section>
    );
  }

  if (!flashSale) return null;

  return (
    <section className="w-full bg-white py-14">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-tech_black via-[#1a1a2e] to-tech_purple rounded-2xl px-6 md:px-10 py-6 mb-8 overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-tech_orange/10 pointer-events-none" />
          <div className="absolute -bottom-10 right-20 w-28 h-28 rounded-full bg-tech_purple/20 pointer-events-none" />

          {/* Left */}
          <div className="flex items-center gap-4 z-10">
            <div className="w-12 h-12 rounded-xl bg-tech_orange flex items-center justify-center flex-shrink-0">
              <Zap size={22} className="text-white fill-white" />
            </div>
            <div>
              <p className="text-white/60 text-xs uppercase tracking-widest mb-0.5">
                Limited Time Offer
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-white">
                {flashSale.title}
              </h2>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-3 z-10">
            <div className="flex items-center gap-1 text-white/60 text-xs mr-1">
              <Timer size={14} />
              <span>Ends in</span>
            </div>
            <div className="flex items-center gap-2">
              <CountdownBox value={timeLeft.hours} label="Hrs" />
              <span className="text-white font-black text-xl -mt-4">:</span>
              <CountdownBox value={timeLeft.minutes} label="Min" />
              <span className="text-white font-black text-xl -mt-4">:</span>
              <CountdownBox value={timeLeft.seconds} label="Sec" />
            </div>
          </div>

          {/* View All */}
          <Link
            href="/flash-sale"
            className="z-10 flex items-center gap-2 text-sm font-semibold text-white border border-white/20 px-4 py-2 rounded-xl hover:bg-white/10 transition-colors group flex-shrink-0"
          >
            <span>View All</span>
            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {flashSale.products.slice(0, 8).map((product) => (
            <FlashProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Fallback Data ─────────────────────────────────────────
const FALLBACK_FLASH_SALE: FlashSale = {
  id: "1",
  title: "Flash Sale",
  endTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
  products: [
    {
      id: "1",
      name: "Wireless Noise Cancelling Headphones Pro",
      slug: "wireless-headphones-pro",
      price: 129.99,
      discountPrice: 59.99,
      rating: 4,
      reviewCount: 284,
      image: "/images/products/headphones.png",
      category: "Electronics",
      soldCount: 142,
      totalStock: 200,
    },
    {
      id: "2",
      name: "Smart Fitness Watch Series 5",
      slug: "smart-fitness-watch",
      price: 199.99,
      discountPrice: 99.99,
      rating: 5,
      reviewCount: 389,
      image: "/images/products/watch.png",
      category: "Electronics",
      soldCount: 89,
      totalStock: 150,
    },
    {
      id: "3",
      name: "Premium Leather Crossbody Bag",
      slug: "leather-crossbody-bag",
      price: 79.99,
      discountPrice: 39.99,
      rating: 4,
      reviewCount: 142,
      image: "/images/products/bag.png",
      category: "Fashion",
      soldCount: 67,
      totalStock: 100,
    },
    {
      id: "4",
      name: "Portable Bluetooth Speaker Waterproof",
      slug: "bluetooth-speaker",
      price: 59.99,
      discountPrice: 29.99,
      rating: 4,
      reviewCount: 211,
      image: "/images/products/speaker.png",
      category: "Electronics",
      soldCount: 178,
      totalStock: 250,
    },
    {
      id: "5",
      name: "Organic Face Serum With Vitamin C",
      slug: "organic-face-serum",
      price: 45.99,
      discountPrice: 22.99,
      rating: 5,
      reviewCount: 97,
      image: "/images/products/serum.png",
      category: "Beauty",
      soldCount: 54,
      totalStock: 80,
    },
    {
      id: "6",
      name: "Men's Running Shoes Ultra Boost",
      slug: "mens-running-shoes",
      price: 119.99,
      discountPrice: 64.99,
      rating: 5,
      reviewCount: 334,
      image: "/images/products/shoes.png",
      category: "Sports",
      soldCount: 201,
      totalStock: 300,
    },
    {
      id: "7",
      name: "Stainless Steel Water Bottle 1L",
      slug: "stainless-water-bottle",
      price: 29.99,
      discountPrice: 14.99,
      rating: 4,
      reviewCount: 178,
      image: "/images/products/bottle.png",
      category: "Sports",
      soldCount: 312,
      totalStock: 400,
    },
    {
      id: "8",
      name: "Ergonomic Office Chair With Lumbar",
      slug: "ergonomic-office-chair",
      price: 349.99,
      discountPrice: 199.99,
      rating: 4,
      reviewCount: 56,
      image: "/images/products/chair.png",
      category: "Furniture",
      soldCount: 23,
      totalStock: 50,
    },
  ],
};