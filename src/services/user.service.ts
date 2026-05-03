import axiosInstance from "../lib/axios";
import { ApiResponse, PaginatedResponse } from "../types/api.types";
import { User } from "../types/user.types";

export const getMe = async () => {
  const res = await axiosInstance.get<ApiResponse<User>>("/users/me");
  return res.data;
};

export const updateProfile = async (payload: FormData) => {
  const res = await axiosInstance.patch<ApiResponse<User>>(
    "/users/me",
    payload,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
};

export const changePassword = async (payload: {
  oldPassword: string;
  newPassword: string;
}) => {
  const res = await axiosInstance.post<ApiResponse<null>>(
    "/users/me/change-password",
    payload
  );
  return res.data;
};

export const getAllUsers = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}) => {
  const res = await axiosInstance.get<PaginatedResponse<User>>("/users", {
    params,
  });
  return res.data;
};

export const getUserById = async (id: string) => {
  const res = await axiosInstance.get<ApiResponse<User>>(`/users/${id}`);
  return res.data;
};

export const updateUserStatus = async (id: string, isActive: boolean) => {
  const res = await axiosInstance.patch<ApiResponse<User>>(
    `/users/${id}/status`,
    { isActive }
  );
  return res.data;
};

export const updateUserRole = async (id: string, role: string) => {
  const res = await axiosInstance.patch<ApiResponse<User>>(
    `/users/${id}/role`,
    { role }
  );
  return res.data;
};