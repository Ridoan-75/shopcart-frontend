export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  website: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface Inventory {
  id: string;
  productId: string;
  quantity: number;
  reservedQty: number;
  lowStockAlert: number;
  allowBackorder: boolean;
  trackInventory: boolean;
  warehouseLocation: string | null;
  lastRestockedAt: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  sku: string;
  price: number;
  comparePrice: number | null;
  costPrice: number | null;
  categoryId: string;
  brandId: string | null;
  images: string[];
  thumbnail: string | null;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  weight: number | null;
  dimensions: Record<string, number> | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string[];
  totalSold: number;
  avgRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  brand?: Brand | null;
  inventory?: Inventory | null;
  tags?: Tag[];
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  tagId?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sort?: string;
  isActive?: boolean;
}