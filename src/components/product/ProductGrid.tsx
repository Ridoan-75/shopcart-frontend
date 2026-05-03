// src/components/product/ProductGrid.tsx
import ProductCard from "./ProductCard";
import SkeletonCard from "../common/SkeletonCard";
import EmptyState from "../common/EmptyState";
import { Product } from "../../types/product.types";
import { ShoppingBag } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
}

const SKELETON_COUNT = 8;

export default function ProductGrid({ products, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag size={28} />}
        title="No products found"
        description="Try adjusting your filters or search query to find what you're looking for."
        actionLabel="Browse all products"
        actionHref="/products"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}