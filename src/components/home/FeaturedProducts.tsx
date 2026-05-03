// components/home/FeaturedProducts.tsx
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, Heart, ShoppingCart, Eye } from "lucide-react";

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
  isNew: boolean;
  isBestSeller: boolean;
}

// ── Skeleton ──────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="rounded-2xl bg-gray-200 aspect-square mb-4" />
          <div className="h-3 bg-gray-200 rounded-full w-1/3 mb-2" />
          <div className="h-4 bg-gray-200 rounded-full w-3/4 mb-3" />
          <div className="h-3 bg-gray-100 rounded-full w-1/2 mb-3" />
          <div className="h-5 bg-gray-200 rounded-full w-1/3" />
        </div>
      ))}
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-tech_purple/20 transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {/* Image */}
      <div className="relative aspect-square bg-[#f2f4f8] overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="bg-tech_purple text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              NEW
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-tech_orange text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              BEST
            </span>
          )}
          {discount && (
            <span className="bg-tech_dark_red text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
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
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[11px] text-tech_purple font-semibold uppercase tracking-wider mb-1">
          {product.category}
        </p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-bold text-tech_black hover:text-tech_purple transition-colors line-clamp-2 mb-2 leading-snug">
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

        {/* Price + Cart */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            {product.discountPrice ? (
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-tech_black">
                  ${product.discountPrice.toFixed(2)}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-base font-black text-tech_black">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          <button className="w-9 h-9 rounded-xl bg-tech_purple/10 hover:bg-tech_purple flex items-center justify-center transition-colors group/btn">
            <ShoppingCart
              size={15}
              className="text-tech_purple group-hover/btn:text-white transition-colors"
            />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Fetch ─────────────────────────────────────────────────
async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products?isFeatured=true&limit=8`,
      { next: { revalidate: 1800 } }
    );
    const data = await res.json();
    if (data?.data?.length > 0) return data.data;
    return FALLBACK_PRODUCTS;
  } catch {
    return FALLBACK_PRODUCTS;
  }
}

// ── Main Component (Server) ───────────────────────────────
export default async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  return (
    <section className="w-full bg-[#f2f4f8] py-14">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-tech_purple text-sm font-semibold uppercase tracking-widest mb-2">
              Hand-Picked For You
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-tech_black">
              Featured Products
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-tech_purple border border-tech_purple px-5 py-2.5 rounded-xl hover:bg-tech_purple hover:text-white transition-colors"
          >
            View All Products
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Fallback Data ─────────────────────────────────────────
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Wireless Noise Cancelling Headphones Pro",
    slug: "wireless-headphones-pro",
    price: 129.99,
    discountPrice: 89.99,
    rating: 4,
    reviewCount: 284,
    image: "/images/products/headphones.png",
    category: "Electronics",
    isNew: true,
    isBestSeller: false,
  },
  {
    id: "2",
    name: "Premium Leather Crossbody Bag",
    slug: "leather-crossbody-bag",
    price: 79.99,
    discountPrice: null,
    rating: 5,
    reviewCount: 142,
    image: "/images/products/bag.png",
    category: "Fashion",
    isNew: false,
    isBestSeller: true,
  },
  {
    id: "3",
    name: "Smart Fitness Watch Series 5",
    slug: "smart-fitness-watch",
    price: 199.99,
    discountPrice: 149.99,
    rating: 4,
    reviewCount: 389,
    image: "/images/products/watch.png",
    category: "Electronics",
    isNew: true,
    isBestSeller: true,
  },
  {
    id: "4",
    name: "Organic Face Serum With Vitamin C",
    slug: "organic-face-serum",
    price: 45.99,
    discountPrice: 34.99,
    rating: 5,
    reviewCount: 97,
    image: "/images/products/serum.png",
    category: "Beauty",
    isNew: false,
    isBestSeller: false,
  },
  {
    id: "5",
    name: "Ergonomic Office Chair With Lumbar",
    slug: "ergonomic-office-chair",
    price: 349.99,
    discountPrice: 279.99,
    rating: 4,
    reviewCount: 56,
    image: "/images/products/chair.png",
    category: "Furniture",
    isNew: false,
    isBestSeller: false,
  },
  {
    id: "6",
    name: "Portable Bluetooth Speaker Waterproof",
    slug: "bluetooth-speaker",
    price: 59.99,
    discountPrice: null,
    rating: 4,
    reviewCount: 211,
    image: "/images/products/speaker.png",
    category: "Electronics",
    isNew: false,
    isBestSeller: true,
  },
  {
    id: "7",
    name: "Men's Running Shoes Ultra Boost",
    slug: "mens-running-shoes",
    price: 119.99,
    discountPrice: 89.99,
    rating: 5,
    reviewCount: 334,
    image: "/images/products/shoes.png",
    category: "Sports",
    isNew: true,
    isBestSeller: false,
  },
  {
    id: "8",
    name: "Stainless Steel Water Bottle 1L",
    slug: "stainless-water-bottle",
    price: 29.99,
    discountPrice: null,
    rating: 4,
    reviewCount: 178,
    image: "/images/products/bottle.png",
    category: "Sports",
    isNew: false,
    isBestSeller: true,
  },
];