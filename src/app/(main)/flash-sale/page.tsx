// src/app/(main)/flash-sale/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Zap, Clock, ShoppingCart, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { flashSaleService } from "../../../services/flashSale.service";
import { QUERY_KEYS } from "../../../constants/queryKeys";
import { useCartStore } from "../../../stores/cart.store";
import SkeletonCard from "../../../components/common/SkeletonCard";

// ── Countdown ─────────────────────────────────────────────────────────────────

function useCountdown(endTime: string | undefined) {
  const calc = () => {
    if (!endTime) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const diff = Math.max(0, new Date(endTime).getTime() - Date.now());
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };

  const [time, setTime] = useState(calc);

  useEffect(() => {
    if (!endTime) return;
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [endTime]);

  return time;
}

function CountdownBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center text-white text-3xl md:text-4xl font-black tabular-nums"
        style={{ backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
      >
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-xs font-semibold uppercase tracking-widest text-white/60">{label}</span>
    </div>
  );
}

// ── Flash Item Card ───────────────────────────────────────────────────────────

function FlashItemCard({ item }: { item: any }) {
  const { addItem } = useCartStore();
  const [imgError, setImgError] = useState(false);

  const name = item.product?.name ?? item.name ?? "Product";
  const thumbnail = item.product?.thumbnail ?? item.thumbnail ?? "";
  const slug = item.product?.slug ?? item.slug ?? "";
  const salePrice = item.salePrice ?? item.price ?? 0;
  const originalPrice = item.originalPrice ?? item.comparePrice ?? salePrice;
  const discountPct = item.discountPercent ?? (
    originalPrice > salePrice ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0
  );
  const totalStock = item.stockLimit ?? 100;
  const soldCount = item.soldCount ?? Math.floor(totalStock * 0.62);
  const pct = Math.min(100, Math.round((soldCount / totalStock) * 100));

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        backgroundColor: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(239,74,35,0.12)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(239,74,35,0.3)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border-tertiary)";
      }}
    >
      <Link href={`/products/${slug}`} className="relative w-full h-52 overflow-hidden block" style={{ backgroundColor: "var(--color-background-secondary)" }}>
        {!imgError && thumbnail ? (
          <Image src={thumbnail} alt={name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-transform duration-500 hover:scale-105" onError={() => setImgError(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🔥</div>
        )}
        {discountPct > 0 && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black text-white" style={{ backgroundColor: "#ef4a23" }}>
            <Zap size={11} fill="white" />
            -{discountPct}%
          </div>
        )}
      </Link>

      <div className="flex flex-col gap-3 p-4">
        <Link href={`/products/${slug}`}>
          <p className="text-sm font-semibold line-clamp-2 hover:text-[#ef4a23] transition-colors" style={{ color: "var(--color-text-primary)" }}>
            {name}
          </p>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-base font-black" style={{ color: "#ef4a23" }}>${salePrice.toFixed(2)}</span>
          {originalPrice > salePrice && (
            <span className="text-xs line-through" style={{ color: "var(--color-text-tertiary)" }}>${originalPrice.toFixed(2)}</span>
          )}
        </div>

        {/* sold progress */}
        <div className="flex flex-col gap-1.5">
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-background-secondary)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: pct > 80 ? "#f02757" : "#ef4a23" }}
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>
              <span className="font-semibold" style={{ color: pct > 80 ? "#f02757" : "#ef4a23" }}>{soldCount} sold</span> / {totalStock}
            </p>
            {pct > 80 && (
              <span className="text-[10px] font-semibold" style={{ color: "#f02757" }}>Almost gone!</span>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            addItem({ productId: item.product?._id ?? item._id, quantity: 1 });
            toast.success("Added to cart!", { description: name });
          }}
          className="w-full h-10 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-85 active:scale-95"
          style={{ backgroundColor: "#ef4a23" }}
        >
          <ShoppingCart size={13} />
          Add to Cart
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function FlashSalePage() {
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.FLASH_SALES, "active"],
    queryFn: () => flashSaleService.getActive(),
  });

  const sale = data?.data;
  const items = sale?.items ?? [];
  const countdown = useCountdown(sale?.endTime);

  if (!isLoading && !sale) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: "rgba(239,74,35,0.1)" }}>
          <AlertCircle size={36} style={{ color: "#ef4a23" }} />
        </div>
        <h1 className="text-2xl font-black mb-3" style={{ color: "var(--color-text-primary)" }}>No Active Flash Sale</h1>
        <p className="text-sm mb-6 max-w-sm" style={{ color: "var(--color-text-secondary)" }}>
          There's no flash sale running right now. Check back soon for amazing deals!
        </p>
        <Link
          href="/products"
          className="h-11 px-6 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-opacity hover:opacity-85"
          style={{ backgroundColor: "#ef4a23" }}
        >
          Browse All Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* hero banner */}
      <section className="py-16 relative overflow-hidden" style={{ backgroundColor: "#081621" }}>
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(239,74,35,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(239,74,35,0.5) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(239,74,35,0.5), transparent)" }} />

        <div className="relative max-w-[1440px] mx-auto px-4 md:px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(239,74,35,0.2)", border: "1px solid rgba(239,74,35,0.3)" }}>
              <Zap size={24} fill="#ef4a23" stroke="#ef4a23" />
            </div>
            <div className="text-left">
              <span className="block text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: "rgba(239,74,35,0.7)" }}>
                Limited Time
              </span>
              <h1 className="text-2xl md:text-4xl font-black text-white">
                {sale?.name ?? "Flash Sale"}
              </h1>
            </div>
          </div>

          {sale?.description && (
            <p className="text-sm text-white/60 max-w-md mx-auto mb-10">
              {sale.description}
            </p>
          )}

          {/* large countdown */}
          <div className="flex items-center justify-center gap-3 md:gap-5 mb-3">
            <Clock size={18} style={{ color: "rgba(255,255,255,0.4)" }} />
            <span className="text-sm text-white/50 font-medium">Ends in:</span>
          </div>
          <div className="flex items-end justify-center gap-3 md:gap-4">
            <CountdownBlock value={countdown.days} label="Days" />
            <span className="text-white/30 font-black text-3xl mb-7">:</span>
            <CountdownBlock value={countdown.hours} label="Hours" />
            <span className="text-white/30 font-black text-3xl mb-7">:</span>
            <CountdownBlock value={countdown.minutes} label="Minutes" />
            <span className="text-white/30 font-black text-3xl mb-7">:</span>
            <CountdownBlock value={countdown.seconds} label="Seconds" />
          </div>
        </div>
      </section>

      {/* products grid */}
      <section className="py-14" style={{ backgroundColor: "var(--color-background-tertiary)" }}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black" style={{ color: "var(--color-text-primary)" }}>Flash Sale Items</h2>
              <p className="text-sm mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                {isLoading ? "Loading..." : `${items.length} deals available`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : items.map((item: any) => <FlashItemCard key={item._id} item={item} />)}
          </div>

          {!isLoading && items.length === 0 && (
            <div className="text-center py-16">
              <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>No items in this sale yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}