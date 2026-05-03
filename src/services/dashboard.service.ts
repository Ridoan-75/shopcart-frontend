import axiosInstance from "../lib/axios";
import { ApiResponse } from "../types/api.types";
import { DashboardStats, SalesChartData, TopProduct } from "../types/dashboard.types";
import { Order } from "../types/order.types";
import { Product } from "../types/product.types";

export const getDashboardStats = async () => {
  const res = await axiosInstance.get<ApiResponse<DashboardStats>>(
    "/dashboard/stats"
  );
  return res.data;
};

export const getSalesChart = async (params: {
  period?: "daily" | "weekly" | "monthly";
}) => {
  const res = await axiosInstance.get<ApiResponse<SalesChartData>>(
    "/dashboard/sales-chart",
    { params }
  );
  return res.data;
};

export const getTopProducts = async () => {
  const res = await axiosInstance.get<ApiResponse<TopProduct[]>>(
    "/dashboard/top-products"
  );
  return res.data;
};

export const getRecentOrders = async () => {
  const res = await axiosInstance.get<ApiResponse<Order[]>>(
    "/dashboard/recent-orders"
  );
  return res.data;
};

export const getLowStockProducts = async () => {
  const res = await axiosInstance.get<ApiResponse<Product[]>>(
    "/dashboard/low-stock"
  );
  return res.data;
};