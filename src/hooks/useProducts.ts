import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { getProducts } from "@/services/product.service";

interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sort?: string;
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PRODUCTS, filters],
    queryFn: () => getProducts(filters),
    staleTime: 1000 * 60 * 5,
  });
}