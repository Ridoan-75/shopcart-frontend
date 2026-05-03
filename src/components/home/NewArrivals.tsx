// components/home/NewArrivals.tsx
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, ShoppingCart, Heart, Eye, Sparkles } from "lucide-react";

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
}

// ── Skeleton ──────────────────────────────────────────────
function NewArrivalsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse bg-white rounded-2xl p-4">
          <div className="aspect-square bg-gray-200 rounded-xl mb-4" />
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
function NewArrivalCard({ product }: { product: Product }) {
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
          <span className="bg-tech_purple text-white text-[10px] font-black px-2 py-0.5 rounded-full">
            NEW
          </span>
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
async function getNewArrivals(): Promise<Product[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products?sort=new&limit=8`,
      { next: { revalidate: 1800 } }
    );
    const data = await res.json();
    if (data?.data?.length > 0) return data.data;
    return FALLBACK_NEW_ARRIVALS;
  } catch {
    return FALLBACK_NEW_ARRIVALS;
  }
}

// ── Main Component (Server) ───────────────────────────────
export default async function NewArrivals() {
  const products = await getNewArrivals();

  return (
    <section className="w-full bg-[#f2f4f8] py-14">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-tech_purple" />
              <p className="text-tech_purple text-sm font-semibold uppercase tracking-widest">
                Just Arrived
              </p>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-tech_black">
              New Arrivals
            </h2>
          </div>
          <Link
            href="/products?sort=new"
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
            <NewArrivalCard key={product.id} product={product} />
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/products?sort=new"
            className="inline-flex items-center gap-2 text-sm font-semibold text-tech_purple border border-tech_purple px-5 py-2.5 rounded-xl hover:bg-tech_purple hover:text-white transition-colors"
          >
            View All New Arrivals
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Fallback Data ─────────────────────────────────────────
const FALLBACK_NEW_ARRIVALS: Product[] = [
  {
    id: "1",
    name: "4K Ultra HD Smart TV 55 inch",
    slug: "4k-smart-tv-55",
    price: 799.99,
    discountPrice: 649.99,
    rating: 5,
    reviewCount: 128,
    image: "/images/products/tv.png",
    category: "Electronics",
    isNew: true,
  },
  {
    id: "2",
    name: "Mechanical Gaming Keyboard RGB",
    slug: "mechanical-gaming-keyboard",
    price: 89.99,
    discountPrice: null,
    rating: 4,
    reviewCount: 76,
    image: "/images/products/keyboard.png",
    category: "Electronics",
    isNew: true,
  },
  {
    id: "3",
    name: "Women's Floral Summer Dress",
    slug: "womens-floral-summer-dress",
    price: 49.99,
    discountPrice: 34.99,
    rating: 4,
    reviewCount: 53,
    image: "/images/products/dress.png",
    category: "Fashion",
    isNew: true,
  },
  {
    id: "4",
    name: "Minimalist Ceramic Vase Set",
    slug: "minimalist-ceramic-vase-set",
    price: 39.99,
    discountPrice: null,
    rating: 5,
    reviewCount: 31,
    image: "/images/products/vase.png",
    category: "Home & Living",
    isNew: true,
  },
  {
    id: "5",
    name: "Yoga Mat Non-Slip Extra Thick",
    slug: "yoga-mat-non-slip",
    price: 34.99,
    discountPrice: 27.99,
    rating: 4,
    reviewCount: 89,
    image: "/images/products/yoga-mat.png",
    category: "Sports",
    isNew: true,
  },
  {
    id: "6",
    name: "Vitamin C Brightening Face Wash",
    slug: "vitamin-c-face-wash",
    price: 19.99,
    discountPrice: null,
    rating: 4,
    reviewCount: 44,
    image: "/images/products/facewash.png",
    category: "Beauty",
    isNew: true,
  },
  {
    id: "7",
    name: "Wireless Charging Pad 15W Fast",
    slug: "wireless-charging-pad-15w",
    price: 29.99,
    discountPrice: 22.99,
    rating: 4,
    reviewCount: 67,
    image: "/images/products/charger.png",
    category: "Electronics",
    isNew: true,
  },
  {
    id: "8",
    name: "Men's Slim Fit Chino Pants",
    slug: "mens-slim-fit-chino",
    price: 54.99,
    discountPrice: null,
    rating: 4,
    reviewCount: 38,
    image: "/images/products/chino.png",
    category: "Fashion",
    isNew: true,
  },
];