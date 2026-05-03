"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck } from "lucide-react";

// ── Types ─────────────────────────────────────────────────
interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  productCount: number;
  isVerified: boolean;
}

// ── Skeleton ──────────────────────────────────────────────
function BrandsSkeleton() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-white rounded-2xl h-24 flex items-center justify-center"
        >
          <div className="w-20 h-8 bg-gray-200 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

// ── Brand Card ────────────────────────────────────────────
function BrandCard({ brand }: { brand: Brand }) {
  return (
    <Link href={`/brands/${brand.slug}`} className="group block">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col items-center justify-center gap-3 hover:border-tech_purple/30 hover:shadow-md transition-all duration-300 hover:-translate-y-1 aspect-square">
        {/* Logo */}
        <div className="relative w-full h-12">
          <Image
            src={brand.logo}
            alt={brand.name}
            fill
            className="object-contain grayscale group-hover:grayscale-0 transition-all duration-300 group-hover:scale-105"
          />
        </div>

        {/* Name + Verified */}
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold text-gray-500 group-hover:text-tech_purple transition-colors text-center leading-tight">
            {brand.name}
          </span>
          {brand.isVerified && (
            <BadgeCheck size={13} className="text-tech_purple flex-shrink-0" />
          )}
        </div>

        {/* Product Count */}
        <span className="text-[10px] text-gray-400">
          {brand.productCount} Products
        </span>
      </div>
    </Link>
  );
}

// ── Fetch ─────────────────────────────────────────────────
async function getBrands(): Promise<Brand[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/brands?isFeatured=true&limit=12`,
      { next: { revalidate: 3600 } },
    );
    const data = await res.json();
    if (data?.data?.length > 0) return data.data;
    return FALLBACK_BRANDS;
  } catch {
    return FALLBACK_BRANDS;
  }
}

// ── Main Component ───────────────────────────────
export default async function BrandsSection() {
  const brands = await getBrands();

  return (
    <section className="w-full bg-[#f2f4f8] py-14">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-tech_purple text-sm font-semibold uppercase tracking-widest mb-2">
              Trusted Partners
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-tech_black">
              Top Brands
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-2 text-sm font-semibold text-tech_purple hover:text-tech_purple/80 transition-colors group"
          >
            <span>View All</span>
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-tech_purple border border-tech_purple px-5 py-2.5 rounded-xl hover:bg-tech_purple hover:text-white transition-colors"
          >
            View All Brands
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Fallback Data ─────────────────────────────────────────
const FALLBACK_BRANDS: Brand[] = [
  {
    id: "1",
    name: "Samsung",
    slug: "samsung",
    logo: "/images/brands/samsung.png",
    productCount: 124,
    isVerified: true,
  },
  {
    id: "2",
    name: "Apple",
    slug: "apple",
    logo: "/images/brands/apple.png",
    productCount: 98,
    isVerified: true,
  },
  {
    id: "3",
    name: "Sony",
    slug: "sony",
    logo: "/images/brands/sony.png",
    productCount: 76,
    isVerified: true,
  },
  {
    id: "4",
    name: "Nike",
    slug: "nike",
    logo: "/images/brands/nike.png",
    productCount: 89,
    isVerified: true,
  },
  {
    id: "5",
    name: "Adidas",
    slug: "adidas",
    logo: "/images/brands/adidas.png",
    productCount: 67,
    isVerified: true,
  },
  {
    id: "6",
    name: "LG",
    slug: "lg",
    logo: "/images/brands/lg.png",
    productCount: 54,
    isVerified: true,
  },
  {
    id: "7",
    name: "Dell",
    slug: "dell",
    logo: "/images/brands/dell.png",
    productCount: 43,
    isVerified: false,
  },
  {
    id: "8",
    name: "Logitech",
    slug: "logitech",
    logo: "/images/brands/logitech.png",
    productCount: 38,
    isVerified: true,
  },
  {
    id: "9",
    name: "Philips",
    slug: "philips",
    logo: "/images/brands/philips.png",
    productCount: 61,
    isVerified: false,
  },
  {
    id: "10",
    name: "Puma",
    slug: "puma",
    logo: "/images/brands/puma.png",
    productCount: 45,
    isVerified: true,
  },
  {
    id: "11",
    name: "Xiaomi",
    slug: "xiaomi",
    logo: "/images/brands/xiaomi.png",
    productCount: 82,
    isVerified: true,
  },
  {
    id: "12",
    name: "Bosch",
    slug: "bosch",
    logo: "/images/brands/bosch.png",
    productCount: 29,
    isVerified: false,
  },
];