"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────
interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
  bgColor: string;
}

// ── Skeleton ──────────────────────────────────────────────
function CategorySkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="rounded-2xl bg-gray-200 aspect-square mb-3" />
          <div className="h-3.5 bg-gray-200 rounded-full w-3/4 mx-auto mb-2" />
          <div className="h-3 bg-gray-100 rounded-full w-1/2 mx-auto" />
        </div>
      ))}
    </div>
  );
}

// ── Category Card ─────────────────────────────────────────
function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/categories/${category.slug}`} className="group block">
      <div
        className="relative rounded-2xl overflow-hidden aspect-square mb-3 transition-transform duration-300 group-hover:-translate-y-1"
        style={{ background: category.bgColor }}
      >
        <Image
          src={category.image}
          alt={category.name}
          fill
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="text-center">
        <h3 className="text-sm font-bold text-tech_black group-hover:text-tech_purple transition-colors">
          {category.name}
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">{category.productCount} Products</p>
      </div>
    </Link>
  );
}

// ── Server Component — data fetch ─────────────────────────
async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/categories?limit=12&isFeatured=true`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    if (data?.data?.length > 0) return data.data;
    return FALLBACK_CATEGORIES;
  } catch {
    return FALLBACK_CATEGORIES;
  }
}

// ── Main Component ───────────────────────────────
export default async function FeaturedCategories() {
  const categories = await getCategories();

  return (
    <section className="w-full bg-white py-14">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-tech_purple text-sm font-semibold uppercase tracking-widest mb-2">
              Browse By
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-tech_black">
              Top Categories
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-tech_purple border border-tech_purple px-5 py-2.5 rounded-xl hover:bg-tech_purple hover:text-white transition-colors"
          >
            View All Categories
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Fallback Data ─────────────────────────────────────────
const FALLBACK_CATEGORIES: Category[] = [
  {
    id: "1",
    name: "Electronics",
    slug: "electronics",
    image: "/images/categories/electronics.png",
    productCount: 240,
    bgColor: "linear-gradient(135deg, #e8f0fe 0%, #c7d7fc 100%)",
  },
  {
    id: "2",
    name: "Fashion",
    slug: "fashion",
    image: "/images/categories/fashion.png",
    productCount: 185,
    bgColor: "linear-gradient(135deg, #fce8f3 0%, #f9c7e0 100%)",
  },
  {
    id: "3",
    name: "Home & Living",
    slug: "home-living",
    image: "/images/categories/home.png",
    productCount: 132,
    bgColor: "linear-gradient(135deg, #e8fce8 0%, #c7f0c7 100%)",
  },
  {
    id: "4",
    name: "Sports",
    slug: "sports",
    image: "/images/categories/sports.png",
    productCount: 98,
    bgColor: "linear-gradient(135deg, #fff3e8 0%, #ffd9b3 100%)",
  },
  {
    id: "5",
    name: "Beauty",
    slug: "beauty",
    image: "/images/categories/beauty.png",
    productCount: 76,
    bgColor: "linear-gradient(135deg, #f3e8ff 0%, #e0c7ff 100%)",
  },
  {
    id: "6",
    name: "Books",
    slug: "books",
    image: "/images/categories/books.png",
    productCount: 310,
    bgColor: "linear-gradient(135deg, #e8f9ff 0%, #c7eeff 100%)",
  },
  {
    id: "7",
    name: "Accessories",
    slug: "accessories",
    image: "/images/categories/accessories.png",
    productCount: 54,
    bgColor: "linear-gradient(135deg, #fffde8 0%, #fff3b3 100%)",
  },
  {
    id: "8",
    name: "Gadgets",
    slug: "gadgets",
    image: "/images/categories/gadgets.png",
    productCount: 167,
    bgColor: "linear-gradient(135deg, #e8fffe 0%, #b3f0ed 100%)",
  },
  {
    id: "9",
    name: "Toys",
    slug: "toys",
    image: "/images/categories/toys.png",
    productCount: 89,
    bgColor: "linear-gradient(135deg, #ffe8e8 0%, #ffb3b3 100%)",
  },
  {
    id: "10",
    name: "Grocery",
    slug: "grocery",
    image: "/images/categories/grocery.png",
    productCount: 210,
    bgColor: "linear-gradient(135deg, #e8ffe8 0%, #b3f0b3 100%)",
  },
  {
    id: "11",
    name: "Furniture",
    slug: "furniture",
    image: "/images/categories/furniture.png",
    productCount: 63,
    bgColor: "linear-gradient(135deg, #f5e8d8 0%, #e8cfa8 100%)",
  },
  {
    id: "12",
    name: "Automotive",
    slug: "automotive",
    image: "/images/categories/automotive.png",
    productCount: 44,
    bgColor: "linear-gradient(135deg, #e8eeff 0%, #c0caff 100%)",
  },
];