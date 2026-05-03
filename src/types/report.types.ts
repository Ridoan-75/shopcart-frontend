export interface SalesReport {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    revenue: number;
    quantity: number;
  }>;
  salesByDate: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export interface OrderReport {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  ordersByStatus: Record<string, number>;
  ordersByDate: Array<{
    date: string;
    count: number;
  }>;
}

export interface UserReport {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  usersByDate: Array<{
    date: string;
    count: number;
  }>;
}

export interface ProductReport {
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  topSellingProducts: Array<{
    productId: string;
    productName: string;
    soldQuantity: number;
    revenue: number;
  }>;
}