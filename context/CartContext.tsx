"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Cart } from "@/types/cart";

interface CartContextType {
  cart: Cart;
  isLoading: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  totalItemsCount: number;
}

const defaultCart: Cart = {
  id: "default_cart",
  status: "ACTIVE",
  items: [],
  subtotal: 0,
  tax: 0,
  discount: 0,
  total: 0,
};

const CartContext = createContext<CartContextType>({
  cart: defaultCart,
  isLoading: false,
  isCartOpen: false,
  setIsCartOpen: () => {},
  addToCart: async () => {},
  removeFromCart: async () => {},
  clearCart: async () => {},
  refreshCart: async () => {},
  totalItemsCount: 0,
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart>(defaultCart);
  const [isLoading, setIsLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const refreshCart = async () => {
    try {
      const res = await fetch("/api/cart?cartId=default_cart");
      const data = await res.json();
      if (data.success && data.cart) {
        setCart(data.cart);
      }
    } catch (err) {
      console.error("Failed to load cart:", err);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const addToCart = async (productId: string, quantity: number = 1) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId: "default_cart", productId, quantity }),
      });
      const data = await res.json();
      if (data.success && data.cart) {
        setCart(data.cart);
        setIsCartOpen(true);
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/cart/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId: "default_cart", productId }),
      });
      const data = await res.json();
      if (data.success && data.cart) {
        setCart(data.cart);
      }
    } catch (err) {
      console.error("Error removing from cart:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      await fetch("/api/cart?cartId=default_cart", { method: "DELETE" });
      setCart({ ...defaultCart, items: [] });
    } catch (err) {
      console.error("Error clearing cart:", err);
    }
  };

  const totalItemsCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        clearCart,
        refreshCart,
        totalItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
