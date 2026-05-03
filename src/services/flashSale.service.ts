import axiosInstance from "../lib/axios";
import { ApiResponse, PaginatedResponse } from "../types/api.types";
import {
  FlashSale,
  FlashSaleItem,
  CreateFlashSalePayload,
  AddFlashSaleItemPayload,
  UpdateFlashSalePayload
} from "../types/flashSale.types";

export const getActiveFlashSale = async () => {
  const res = await axiosInstance.get<ApiResponse<FlashSale>>("/flash-sales/active");
  return res.data;
};

export const getAllFlashSales = async (params: {
  page?: number;
  limit?: number;
}) => {
  const res = await axiosInstance.get<PaginatedResponse<FlashSale>>(
    "/flash-sales",
    { params }
  );
  return res.data;
};

export const createFlashSale = async (payload: CreateFlashSalePayload) => {
  const res = await axiosInstance.post<ApiResponse<FlashSale>>(
    "/flash-sales",
    payload
  );
  return res.data;
};

export const addFlashSaleItem = async (id: string, payload: AddFlashSaleItemPayload) => {
  const res = await axiosInstance.post<ApiResponse<FlashSaleItem>>(
    `/flash-sales/${id}/items`,
    payload
  );
  return res.data;
};

export const updateFlashSale = async (id: string, payload: UpdateFlashSalePayload) => {
  const res = await axiosInstance.patch<ApiResponse<FlashSale>>(
    `/flash-sales/${id}`,
    payload
  );
  return res.data;
};

export const deleteFlashSale = async (id: string) => {
  const res = await axiosInstance.delete<ApiResponse<null>>(
    `/flash-sales/${id}`
  );
  return res.data;
};