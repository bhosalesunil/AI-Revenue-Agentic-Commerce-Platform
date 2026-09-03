"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShieldCheck, ArrowRight, Sparkles, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CartPage() {
  const { cart, addToCart, removeFromCart, clearCart } = useCart();
  const [upsell, setUpsell] = useState<any>(null);

  useEffect(() => {
    if (cart.items.length > 0) {
      const firstId = cart.items[0].productId;
      fetch(`/api/ai/recommendations?productId=${firstId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.recommendation) {
            const alreadyInCart = cart.items.some((i) => i.productId === data.recommendation.product.id);
            if (!alreadyInCart) {
              setUpsell(data.recommendation);
            }
          }
        })
        .catch(() => {});
    }
  }, [cart.items]);

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center space-y-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 mx-auto text-slate-500 border border-slate-800">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-white">Your Shopping Cart is Empty</h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Explore our collection of cutting-edge tech or talk with our AI assistant to find the perfect gear.
        </p>
        <Link href="/shop">
          <Button variant="agent" size="lg">
            Browse Catalog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <Badge variant="default" className="mb-2">Review Items</Badge>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Shopping Cart
          </h1>
        </div>
        <Button variant="ghost" size="sm" onClick={clearCart} className="text-xs text-rose-400 hover:text-rose-300">
          Clear Entire Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 divide-y divide-slate-800/80">
            {cart.items.map((item) => (
              <div key={item.productId} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 border border-slate-800">
                  <Image
                    src={item.product?.imageUrl || "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800"}
                    alt={item.product?.name || "Product"}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.productId}`} className="hover:text-blue-400 transition-colors">
                    <h3 className="font-semibold text-white text-sm truncate">{item.product?.name || item.productId}</h3>
                  </Link>
                  <span className="text-xs text-slate-400 block mt-0.5">{formatINR(item.price)} each</span>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-slate-700 rounded-lg bg-slate-900 px-1 py-0.5">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            addToCart(item.productId, -1);
                          } else {
                            removeFromCart(item.productId);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-2.5 text-xs font-bold text-white">{item.quantity}</span>
                      <button
                        onClick={() => addToCart(item.productId, 1)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 space-y-2">
                  <div className="text-base font-bold text-white">
                    {formatINR(item.price * item.quantity)}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-xs text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1 ml-auto"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* AI Upsell proposal */}
          {upsell && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/50 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-pink-400" /> Frequently Purchased Companion
                </span>
                <p className="text-xs text-slate-300">
                  {upsell.product.name} — {upsell.reason}
                </p>
                <span className="text-xs font-bold text-emerald-400">
                  {formatINR(upsell.product.price)}
                </span>
              </div>
              <Button
                variant="agent"
                size="sm"
                onClick={() => addToCart(upsell.product.id, 1)}
                className="text-xs flex-shrink-0"
              >
                + Add to Cart
              </Button>
            </div>
          )}
        </div>

        {/* Order Summary Box */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="font-bold text-lg text-white">Order Summary</h3>

            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
              <ShieldCheck className="h-4 w-4 flex-shrink-0" />
              <span>Money Guard: All line items verified from merchant database.</span>
            </div>

            <div className="space-y-2 text-sm pt-2">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="text-white font-medium">{formatINR(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping</span>
                <span className="text-emerald-400 font-medium">FREE</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Tax</span>
                <span className="text-emerald-400 font-medium">₹0 (Included)</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-white pt-3 border-t border-slate-800">
                <span>Total Amount</span>
                <span className="text-2xl text-blue-400">{formatINR(cart.total)}</span>
              </div>
            </div>

            <Link href="/checkout" className="block pt-2">
              <Button variant="agent" size="lg" className="w-full flex items-center justify-center gap-2">
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
