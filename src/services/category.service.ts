import axiosInstance from "../lib/axios";
import { ApiResponse, PaginatedResponse } from "../types/api.types";
import { Category } from "../types/product.types";

export const getCategories = async () => {
  const res = await axiosInstance.get<ApiResponse<Category[]>>("/categories");
  return res.data;
};

export const getCategory = async (slug: string) => {
  const res = await axiosInstance.get<ApiResponse<Category>>(
    `/categories/${slug}`
  );
  return res.data;
};

export const createCategory = async (payload: FormData) => {
  const res = await axiosInstance.post<ApiResponse<Category>>(
    "/categories",
    payload,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
};

export const updateCategory = async (id: string, payload: FormData) => {
  const res = await axiosInstance.patch<ApiResponse<Category>>(
    `/categories/${id}`,
    payload,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
};

export const deleteCategory = async (id: string) => {
  const res = await axiosInstance.delete<ApiResponse<null>>(
    `/categories/${id}`
  );
  return res.data;
};