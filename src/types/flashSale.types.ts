export interface FlashSaleItem {
  id: string;
  flashSaleId: string;
  productId: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxQuantity: number | null;
  soldQuantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  product?: import("./product.types").Product;
}

export interface FlashSale {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  bannerImage: string | null;
  createdAt: string;
  updatedAt: string;
  items?: FlashSaleItem[];
}

export interface CreateFlashSalePayload {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  bannerImage?: string;
}

export interface AddFlashSaleItemPayload {
  productId: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxQuantity?: number;
}

export interface UpdateFlashSalePayload {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  bannerImage?: string;
}