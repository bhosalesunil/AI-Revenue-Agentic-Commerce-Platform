export interface Product {
  id: string;
  merchantId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  stock: number;
  imageUrl?: string | null;
  rating: number;
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  merchant?: {
    storeName: string;
  };
}

export interface ProductFilterParams {
  category?: string;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}
