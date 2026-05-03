import axiosInstance from "../lib/axios";
import { ApiResponse, PaginatedResponse } from "../types/api.types";
import { Product, ProductFilters } from "../types/product.types";

export const getProducts = async (filters: ProductFilters = {}) => {
  const res = await axiosInstance.get<PaginatedResponse<Product>>("/products", {
    params: filters,
  });
  return res.data;
};

export const getProduct = async (slug: string) => {
  const res = await axiosInstance.get<ApiResponse<Product>>(
    `/products/${slug}`
  );
  return res.data;
};

export const getFeaturedProducts = async () => {
  const res = await axiosInstance.get<PaginatedResponse<Product>>(
    "/products/featured"
  );
  return res.data;
};

export const getNewArrivals = async () => {
  const res = await axiosInstance.get<PaginatedResponse<Product>>(
    "/products/new-arrivals"
  );
  return res.data;
};

export const getBestSellers = async () => {
  const res = await axiosInstance.get<PaginatedResponse<Product>>(
    "/products/best-sellers"
  );
  return res.data;
};

export const createProduct = async (payload: FormData) => {
  const res = await axiosInstance.post<ApiResponse<Product>>(
    "/products",
    payload,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
};

export const updateProduct = async (id: string, payload: FormData) => {
  const res = await axiosInstance.patch<ApiResponse<Product>>(
    `/products/${id}`,
    payload,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
};

export const deleteProduct = async (id: string) => {
  const res = await axiosInstance.delete<ApiResponse<null>>(
    `/products/${id}`
  );
  return res.data;
};