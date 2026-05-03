import { Product } from "./product.types";

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
  product?: Product;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  value: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  startsAt: string | null;
  expiresAt: string | null;
}

export interface Cart {
  id: string;
  userId: string;
  couponId: string | null;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
  coupon?: Coupon | null;
}