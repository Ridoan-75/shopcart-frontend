import axiosInstance from "../lib/axios";
import { ApiResponse } from "../types/api.types";
import { Cart } from "../types/cart.types";

export const getCart = async () => {
  const res = await axiosInstance.get<ApiResponse<Cart>>("/cart");
  return res.data;
};

export const addToCart = async (payload: {
  productId: string;
  quantity: number;
}) => {
  const res = await axiosInstance.post<ApiResponse<Cart>>(
    "/cart/items",
    payload
  );
  return res.data;
};

export const updateCartItem = async (itemId: string, quantity: number) => {
  const res = await axiosInstance.patch<ApiResponse<Cart>>(
    `/cart/items/${itemId}`,
    { quantity }
  );
  return res.data;
};

export const removeCartItem = async (itemId: string) => {
  const res = await axiosInstance.delete<ApiResponse<Cart>>(
    `/cart/items/${itemId}`
  );
  return res.data;
};

export const clearCart = async () => {
  const res = await axiosInstance.delete<ApiResponse<null>>("/cart/clear");
  return res.data;
};

export const applyCoupon = async (code: string) => {
  const res = await axiosInstance.post<ApiResponse<Cart>>(
    "/cart/apply-coupon",
    { code }
  );
  return res.data;
};

export const removeCoupon = async () => {
  const res = await axiosInstance.delete<ApiResponse<Cart>>(
    "/cart/remove-coupon"
  );
  return res.data;
};