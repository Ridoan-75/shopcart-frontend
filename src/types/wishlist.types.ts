import { Product } from "./product.types";

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
  product?: Product;
}