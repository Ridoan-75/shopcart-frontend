import axiosInstance from "../lib/axios";
import { ApiResponse } from "../types/api.types";
import { WishlistItem } from "../types/wishlist.types";

export const getWishlist = async () => {
  const res = await axiosInstance.get<ApiResponse<WishlistItem[]>>("/wishlist");
  return res.data;
};

export const toggleWishlist = async (productId: string) => {
  const res = await axiosInstance.post<ApiResponse<{ added: boolean }>>(
    "/wishlist/toggle",
    { productId }
  );
  return res.data;
};

export const removeFromWishlist = async (productId: string) => {
  const res = await axiosInstance.delete<ApiResponse<null>>(
    `/wishlist/${productId}`
  );
  return res.data;
};