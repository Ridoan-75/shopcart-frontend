import axiosInstance from "../lib/axios";
import { ApiResponse } from "../types/api.types";
import { Banner } from "../types/banner.types";

export const getBanners = async (position?: string) => {
  const res = await axiosInstance.get<ApiResponse<Banner[]>>("/banners", {
    params: position ? { position } : {},
  });
  return res.data;
};

export const createBanner = async (payload: FormData) => {
  const res = await axiosInstance.post<ApiResponse<Banner>>(
    "/banners",
    payload,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
};

export const updateBanner = async (id: string, payload: FormData) => {
  const res = await axiosInstance.patch<ApiResponse<Banner>>(
    `/banners/${id}`,
    payload,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
};

export const deleteBanner = async (id: string) => {
  const res = await axiosInstance.delete<ApiResponse<null>>(`/banners/${id}`);
  return res.data;
};