import axiosInstance from "../lib/axios";
import { ApiResponse } from "../types/api.types";
import {
  SalesReport,
  OrderReport,
  UserReport,
  ProductReport
} from "../types/report.types";

export const getSalesReport = async (params: {
  startDate: string;
  endDate: string;
}) => {
  const res = await axiosInstance.get<ApiResponse<SalesReport>>(
    "/reports/sales",
    { params }
  );
  return res.data;
};

export const getOrderReport = async (params: {
  startDate: string;
  endDate: string;
}) => {
  const res = await axiosInstance.get<ApiResponse<OrderReport>>(
    "/reports/orders",
    { params }
  );
  return res.data;
};

export const getUserReport = async (params: {
  startDate: string;
  endDate: string;
}) => {
  const res = await axiosInstance.get<ApiResponse<UserReport>>(
    "/reports/users",
    { params }
  );
  return res.data;
};

export const getProductReport = async (params: {
  startDate: string;
  endDate: string;
}) => {
  const res = await axiosInstance.get<ApiResponse<ProductReport>>(
    "/reports/products",
    { params }
  );
  return res.data;
};