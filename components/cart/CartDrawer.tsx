"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Trash2, ShieldCheck, ArrowRight, Sparkles, Plus, Minus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, addToCart } = useCart();
  const [upsellItem, setUpsellItem] = useState<any>(null);

  useEffect(() => {
    // Check if cart has items to recommend companion
    if (cart.items.length > 0) {
      const firstProductId = cart.items[0].productId;
      fetch(`/api/ai/recommendations?productId=${firstProductId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.recommendation) {
            // Only suggest if not already in cart
            const alreadyInCart = cart.items.some(i => i.productId === data.recommendation.product.id);
            if (!alreadyInCart) {
              setUpsellItem(data.recommendation);
            } else {
              setUpsellItem(null);
            }
          }
        })
        .catch(() => setUpsellItem(null));
    } else {
      setUpsellItem(null);
    }
  }, [cart.items]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Your Shopping Cart</h2>
              <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
                {cart.items.reduce((s, i) => s + i.quantity, 0)} items
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.items.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-base text-slate-300 font-medium mb-2">Your cart is empty</p>
                <p className="text-xs text-slate-500 mb-6">Discover our curated AI gear or chat with our assistant.</p>
                <Button variant="agent" size="sm" onClick={() => setIsCartOpen(false)}>
                  <Link href="/shop">Start Shopping</Link>
                </Button>
              </div>
            ) : (
              cart.items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 items-center justify-between"
                >
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                    <Image
                      src={item.product?.imageUrl || "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800"}
                      alt={item.product?.name || "Product"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">{item.product?.name || item.productId}</h4>
                    <span className="text-xs text-slate-400 block">{formatINR(item.price)} each</span>
                    <div className="flex items-center gap-3 mt-2">
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
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-white">{item.quantity}</span>
                        <button
                          onClick={() => addToCart(item.productId, 1)}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-white">
                        {formatINR(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}

            {/* AI Upsell Prompt inside Cart */}
            {upsellItem && (
              <div className="p-4 rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-950/50 mt-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                  <Sparkles className="h-3.5 w-3.5 text-pink-400" />
                  AI Recommended Companion
                </div>
                <p className="text-xs text-slate-300 leading-snug">{upsellItem.reason}</p>
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-xs font-bold text-white block">{upsellItem.product.name}</span>
                    <span className="text-xs text-emerald-400 font-semibold">{formatINR(upsellItem.product.price)}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="agent"
                    onClick={() => addToCart(upsellItem.product.id, 1)}
                    className="text-xs h-7 px-3"
                  >
                    + Add to Order
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer / Checkout */}
          {cart.items.length > 0 && (
            <div className="p-6 border-t border-slate-800 bg-slate-950/80 space-y-4">
              {/* Money Security Guard Assurance */}
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                <span>Bounded Money Guard: Prices verified & locked by server.</span>
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">{formatINR(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Estimated Tax</span>
                  <span className="text-emerald-400 font-medium">₹0 (Included)</span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                  <span>Total Amount</span>
                  <span className="text-xl text-blue-400">{formatINR(cart.total)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full text-xs"
                >
                  Continue Shopping
                </Button>
                <Link href="/checkout" onClick={() => setIsCartOpen(false)} className="w-full">
                  <Button variant="primary" className="w-full text-xs flex items-center justify-center gap-1.5">
                    Checkout <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
