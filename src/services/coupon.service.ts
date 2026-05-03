import axiosInstance from "../lib/axios";
import { ApiResponse, PaginatedResponse } from "../types/api.types";
import { Coupon } from "../types/cart.types";

export const validateCoupon = async (code: string) => {
  const res = await axiosInstance.post<ApiResponse<Coupon>>(
    "/coupons/validate",
    { code }
  );
  return res.data;
};

export const getAllCoupons = async (params: {
  page?: number;
  limit?: number;
}) => {
  const res = await axiosInstance.get<PaginatedResponse<Coupon>>("/coupons", {
    params,
  });
  return res.data;
};

export const createCoupon = async (payload: Partial<Coupon>) => {
  const res = await axiosInstance.post<ApiResponse<Coupon>>(
    "/coupons",
    payload
  );
  return res.data;
};

export const updateCoupon = async (id: string, payload: Partial<Coupon>) => {
  const res = await axiosInstance.patch<ApiResponse<Coupon>>(
    `/coupons/${id}`,
    payload
  );
  return res.data;
};

export const deleteCoupon = async (id: string) => {
  const res = await axiosInstance.delete<ApiResponse<null>>(`/coupons/${id}`);
  return res.data;
};