import { Product } from "./product";

export type OrderStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Order {
  id: string;
  userId?: string | null;
  merchantId?: string | null;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  razorpayOrderId?: string | null;
  isAiAssisted: boolean;
  isAiUpsold: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  items?: OrderItem[];
  user?: {
    name: string;
    email: string;
  } | null;
}
