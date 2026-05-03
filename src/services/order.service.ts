import axiosInstance from "../lib/axios";
import { ApiResponse, PaginatedResponse } from "../types/api.types";
import { Order } from "../types/order.types";

export const placeOrder = async (payload: {
  addressId: string;
  notes?: string;
}) => {
  const res = await axiosInstance.post<ApiResponse<Order>>("/orders", payload);
  return res.data;
};

export const getOrders = async (params: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  const res = await axiosInstance.get<PaginatedResponse<Order>>("/orders", {
    params,
  });
  return res.data;
};

export const getOrder = async (id: string) => {
  const res = await axiosInstance.get<ApiResponse<Order>>(`/orders/${id}`);
  return res.data;
};

export const cancelOrder = async (id: string) => {
  const res = await axiosInstance.post<ApiResponse<Order>>(
    `/orders/${id}/cancel`
  );
  return res.data;
};

export const updateOrderStatus = async (id: string, status: string) => {
  const res = await axiosInstance.patch<ApiResponse<Order>>(
    `/orders/${id}/status`,
    { status }
  );
  return res.data;
};