import { Address, User } from "./user.types";
import { Product } from "./product.types";
import { Coupon } from "./cart.types";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export type PaymentMethod =
  | "STRIPE"
  | "PAYPAL"
  | "COD"
  | "BANK_TRANSFER";

export type ShippingStatus =
  | "NOT_SHIPPED"
  | "PROCESSING"
  | "SHIPPED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "RETURNED";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productSku: string;
  image: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
  product?: Product;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId: string | null;
  stripePaymentId: string | null;
  receiptUrl: string | null;
  failureReason: string | null;
  refundedAt: string | null;
  refundAmount: number | null;
  paidAt: string | null;
}

export interface Shipping {
  id: string;
  orderId: string;
  carrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  status: ShippingStatus;
  estimatedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  returnedAt: string | null;
  notes: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  addressId: string | null;
  couponId: string | null;
  subtotal: number;
  discount: number;
  shippingCharge: number;
  tax: number;
  total: number;
  status: OrderStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  address?: Address | null;
  coupon?: Coupon | null;
  items?: OrderItem[];
  payment?: Payment | null;
  shipping?: Shipping | null;
}