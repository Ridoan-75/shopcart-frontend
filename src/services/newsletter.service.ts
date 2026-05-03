import axiosInstance from "../lib/axios";
import { ApiResponse, PaginatedResponse } from "../types/api.types";

export const subscribe = async (payload: {
  email: string;
  name?: string;
}) => {
  const res = await axiosInstance.post<ApiResponse<null>>(
    "/newsletter/subscribe",
    payload
  );
  return res.data;
};

export const unsubscribe = async (token: string) => {
  const res = await axiosInstance.get<ApiResponse<null>>(
    `/newsletter/unsubscribe?token=${token}`
  );
  return res.data;
};

export const getSubscribers = async (params: {
  page?: number;
  limit?: number;
}) => {
  const res = await axiosInstance.get<PaginatedResponse<any>>(
    "/newsletter/subscribers",
    { params }
  );
  return res.data;
};