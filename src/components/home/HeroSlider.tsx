// components/home/HeroSlider.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────
interface Banner {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  bgColor: string;
}

// ── Skeleton ──────────────────────────────────────────────
function HeroSkeleton() {
  return (
    <div className="w-full h-[420px] md:h-[500px] lg:h-[580px] rounded-2xl bg-gray-200 animate-pulse mx-auto max-w-[1400px] px-6 my-4" />
  );
}

// ── Slide Item ────────────────────────────────────────────
function SlideItem({ banner }: { banner: Banner }) {
  return (
    <div
      className="relative w-full h-[420px] md:h-[500px] lg:h-[580px] rounded-2xl overflow-hidden flex items-center"
      style={{ background: banner.bgColor }}
    >
      {/* Left Content */}
      <div className="relative z-10 px-10 md:px-16 lg:px-20 max-w-[55%] md:max-w-[50%]">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-5">
          <span className="text-white/80 text-sm font-medium">
            {banner.subtitle}
          </span>
          <span className="bg-tech_orange text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {banner.badge}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-white font-black text-3xl md:text-4xl lg:text-5xl leading-tight mb-5">
          {banner.title}
        </h1>

        {/* Description */}
        <p className="text-white/70 text-sm md:text-base mb-8 leading-relaxed max-w-sm">
          Discover your favorite brands, latest trends, and exclusive discounts
          in one place.
        </p>

        {/* CTA Button */}
        <Link href={banner.buttonLink}>
          <button className="group flex items-center gap-3 bg-tech_purple hover:bg-tech_purple/90 text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-300 hover:gap-4">
            <span>{banner.buttonText}</span>
            <div className="w-7 h-7 rounded-full bg-white/20 group-hover:bg-white/30 flex items-center justify-center transition-colors">
              <ArrowRight size={14} className="text-white" />
            </div>
          </button>
        </Link>
      </div>

      {/* Right Image */}
      <div className="absolute right-0 top-0 h-full w-[50%] md:w-[48%] flex items-center justify-center pr-8 md:pr-16">
        <div className="relative w-full h-[90%]">
          <Image
            src={banner.imageUrl}
            alt={banner.title}
            fill
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>
      </div>

      {/* Subtle overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

// ── Main HeroSlider ───────────────────────────────────────
export default function HeroSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Fetch banners from backend
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/banners?isActive=true`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (data?.data?.length > 0) {
          setBanners(data.data);
        } else {
          // Fallback data (until admin adds banners)
          setBanners(FALLBACK_BANNERS);
        }
      } catch {
        setBanners(FALLBACK_BANNERS);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Auto-play
  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (!isPlaying || banners.length === 0) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isPlaying, next, banners.length]);

  if (loading) return <HeroSkeleton />;
  if (banners.length === 0) return null;

  return (
    <section className="w-full bg-[#f2f4f8]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4 md:py-6">
        <div
          className="relative overflow-hidden rounded-2xl"
          onMouseEnter={() => setIsPlaying(false)}
          onMouseLeave={() => setIsPlaying(true)}
        >
          {/* Slides */}
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {banners.map((banner) => (
              <div key={banner.id} className="min-w-full">
                <SlideItem banner={banner} />
              </div>
            ))}
          </div>

          {/* Prev Button */}
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center transition-colors z-10"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>

          {/* Next Button */}
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center transition-colors z-10"
          >
            <ChevronRight size={20} className="text-white" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  i === current
                    ? "w-8 h-2.5 bg-white"
                    : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Fallback Data (যতক্ষণ admin banner add না করে) ────────
const FALLBACK_BANNERS: Banner[] = [
  {
    id: "1",
    title: "Boost your health with trusted supplements.",
    subtitle: "Get your supplement Now",
    badge: "SALE ON FRIDAY",
    buttonText: "Shop Now",
    buttonLink: "/products",
    imageUrl: "/images/banners/banner-1.png",
    bgColor: "linear-gradient(135deg, #1a6b5a 0%, #2d9b7a 50%, #1a4a3a 100%)",
  },
  {
    id: "2",
    title: "Discover your favorite brands and latest trends.",
    subtitle: "Exclusive offer",
    badge: "15% OFF",
    buttonText: "Shop Now",
    buttonLink: "/products",
    imageUrl: "/images/banners/banner-2.png",
    bgColor: "linear-gradient(135deg, #6e2594 0%, #9b3dc8 50%, #4a1a6b 100%)",
  },
  {
    id: "3",
    title: "Premium fashion for every occasion.",
    subtitle: "New Collection",
    badge: "NEW IN",
    buttonText: "Explore Now",
    buttonLink: "/categories/fashion",
    imageUrl: "/images/banners/banner-3.png",
    bgColor: "linear-gradient(135deg, #1a3a6b 0%, #2d5a9b 50%, #0f2040 100%)",
  },
];