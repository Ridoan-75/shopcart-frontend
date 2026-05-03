export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "ORDER" | "PAYMENT" | "PRODUCT" | "SYSTEM" | "PROMOTION";
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}