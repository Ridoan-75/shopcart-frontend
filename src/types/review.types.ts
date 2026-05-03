import { User } from "./user.types";
import { Product } from "./product.types";

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string | null;
  body: string;
  images: string[];
  isApproved: boolean;
  isVerified: boolean;
  helpful: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  product?: Product;
}

export interface CreateReviewPayload {
  productId: string;
  rating: number;
  title?: string;
  body: string;
  images?: string[];
}

export interface UpdateReviewPayload {
  rating?: number;
  title?: string;
  body?: string;
}