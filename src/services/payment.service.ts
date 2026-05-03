import axiosInstance from "../lib/axios";
import { ApiResponse } from "../types/api.types";
import { Payment } from "../types/order.types";

export const createStripeSession = async (orderId: string) => {
  const res = await axiosInstance.post<ApiResponse<{ url: string }>>(
    "/payments/create-session",
    { orderId }
  );
  return res.data;
};

export const getPayment = async (orderId: string) => {
  const res = await axiosInstance.get<ApiResponse<Payment>>(
    `/payments/${orderId}`
  );
  return res.data;
};

export const getAllPayments = async (params: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  const res = await axiosInstance.get<ApiResponse<Payment[]>>("/payments", {
    params,
  });
  return res.data;
};