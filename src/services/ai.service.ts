import axiosInstance from "../lib/axios";
import { ApiResponse } from "../types/api.types";
import { Product } from "../types/product.types";

export const getRecommendations = async (userId: string) => {
  const res = await axiosInstance.get<ApiResponse<Product[]>>(
    `/ai/recommendations/${userId}`
  );
  return res.data;
};

export const getSimilarProducts = async (productId: string) => {
  const res = await axiosInstance.get<ApiResponse<Product[]>>(
    `/ai/similar/${productId}`
  );
  return res.data;
};

export const getSearchSuggestions = async (query: string) => {
  const res = await axiosInstance.get<ApiResponse<string[]>>(
    "/ai/search-suggestions",
    { params: { q: query } }
  );
  return res.data;
};

export const getTrendingProducts = async () => {
  const res = await axiosInstance.get<ApiResponse<Product[]>>("/ai/trending");
  return res.data;
};

export const sendChatMessage = async (payload: {
  message: string;
  history: { role: string; content: string }[];
}) => {
  const res = await axiosInstance.post<ApiResponse<{ reply: string }>>(
    "/ai/chat",
    payload
  );
  return res.data;
};