export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockProducts: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  dailyRevenue: number;
}

export interface SalesChartData {
  labels: string[];
  data: number[];
  period: "daily" | "weekly" | "monthly";
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalSold: number;
  revenue: number;
  product?: import("./product.types").Product;
}