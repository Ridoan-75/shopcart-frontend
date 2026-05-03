import axiosInstance from "../lib/axios";
import { ApiResponse } from "../types/api.types";
import { User } from "../types/user.types";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
}

export const login = async (payload: LoginPayload) => {
  const res = await axiosInstance.post<ApiResponse<AuthResponse>>(
    "/auth/login",
    payload
  );
  return res.data;
};

export const register = async (payload: RegisterPayload) => {
  const res = await axiosInstance.post<ApiResponse<{ email: string }>>(
    "/auth/register",
    payload
  );
  return res.data;
};

export const verifyEmail = async (payload: {
  email: string;
  otp: string;
}) => {
  const res = await axiosInstance.post<ApiResponse<AuthResponse>>(
    "/auth/verify-email",
    payload
  );
  return res.data;
};

export const resendOtp = async (email: string) => {
  const res = await axiosInstance.post<ApiResponse<null>>(
    "/auth/resend-otp",
    { email }
  );
  return res.data;
};

export const googleLogin = async (token: string) => {
  const res = await axiosInstance.post<ApiResponse<AuthResponse>>(
    "/auth/google",
    { token }
  );
  return res.data;
};

export const forgotPassword = async (email: string) => {
  const res = await axiosInstance.post<ApiResponse<null>>(
    "/auth/forgot-password",
    { email }
  );
  return res.data;
};

export const resetPassword = async (payload: {
  token: string;
  password: string;
}) => {
  const res = await axiosInstance.post<ApiResponse<null>>(
    "/auth/reset-password",
    payload
  );
  return res.data;
};

export const logout = async () => {
  const res = await axiosInstance.post<ApiResponse<null>>("/auth/logout");
  return res.data;
};

export const refreshToken = async () => {
  const res = await axiosInstance.post<ApiResponse<{ accessToken: string }>>(
    "/auth/refresh-token"
  );
  return res.data;
};