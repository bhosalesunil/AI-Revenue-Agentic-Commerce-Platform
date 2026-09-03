import { Product } from "./product";

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Cart {
  id: string;
  userId?: string | null;
  status: "ACTIVE" | "CHECKED_OUT" | "ABANDONED";
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
}
