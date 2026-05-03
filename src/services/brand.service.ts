import axiosInstance from "../lib/axios";
import { ApiResponse } from "../types/api.types";
import { Brand } from "../types/product.types";

export const getBrands = async () => {
  const res = await axiosInstance.get<ApiResponse<Brand[]>>("/brands");
  return res.data;
};

export const getBrand = async (slug: string) => {
  const res = await axiosInstance.get<ApiResponse<Brand>>(`/brands/${slug}`);
  return res.data;
};

export const createBrand = async (payload: FormData) => {
  const res = await axiosInstance.post<ApiResponse<Brand>>(
    "/brands",
    payload,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
};

export const updateBrand = async (id: string, payload: FormData) => {
  const res = await axiosInstance.patch<ApiResponse<Brand>>(
    `/brands/${id}`,
    payload,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
};

export const deleteBrand = async (id: string) => {
  const res = await axiosInstance.delete<ApiResponse<null>>(`/brands/${id}`);
  return res.data;
};