"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Star, ShieldCheck, ShoppingCart, Sparkles, ArrowLeft, Check, Plus, Minus, Lock } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChatWindow } from "@/components/chat/ChatWindow";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { addToCart, isLoading: isCartLoading } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [upsell, setUpsell] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.product) {
          setProduct(data.product);
          // Fetch upsell recommendation
          fetch(`/api/ai/recommendations?productId=${id}`)
            .then((r) => r.json())
            .then((uData) => {
              if (uData.success && uData.recommendation) {
                setUpsell(uData.recommendation);
              }
            })
            .catch(() => {});
        }
      })
      .catch((err) => console.error("Error loading product:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-slate-400">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Product Not Found</h2>
        <Link href="/shop">
          <Button variant="agent" size="sm">Back to Catalog</Button>
        </Link>
      </div>
    );
  }

  const handleAddToCart = async () => {
    await addToCart(product.id, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Back button */}
      <div>
        <Link href="/shop" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Gallery / Image */}
        <div className="lg:col-span-6">
          <div className="relative h-96 sm:h-[480px] w-full rounded-3xl overflow-hidden glass-panel border border-slate-800 bg-slate-950">
            <Image
              src={product.imageUrl || "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800"}
              alt={product.name}
              fill
              priority
              className="object-cover object-center"
            />
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="bg-slate-950/80 backdrop-blur-md">
                {product.category}
              </Badge>
            </div>
            <div className="absolute top-4 right-4">
              <span className="flex items-center gap-1 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-amber-400 backdrop-blur-md border border-amber-500/30">
                <Star className="h-3.5 w-3.5 fill-amber-400" />
                {product.rating.toFixed(1)} / 5.0
              </span>
            </div>
          </div>
        </div>

        {/* Info & Buying Box */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-slate-500">ID: {product.id}</span>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                In Stock ({product.stock} units)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {product.name}
            </h1>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block">Verified Server Price</span>
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {formatINR(product.price)}
              </span>
            </div>
            <span className="text-xs text-slate-400 ml-auto flex items-center gap-1">
              <Lock className="h-3 w-3 text-emerald-400" /> Bounded & Fraud Protected
            </span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            {product.description}
          </p>

          {/* Quantity & Add to Cart */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-700 rounded-xl bg-slate-900 px-2 py-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 text-sm font-bold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Button
                variant={justAdded ? "primary" : "agent"}
                size="lg"
                onClick={handleAddToCart}
                disabled={isCartLoading}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {justAdded ? (
                  <>
                    <Check className="h-5 w-5 text-emerald-400" /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" /> Add to Cart ({formatINR(product.price * quantity)})
                  </>
                )}
              </Button>
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={() => setIsAiOpen(true)}
              className="w-full text-xs text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/10 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-pink-400" /> Ask AI Shopper About Compatibility & Specs
            </Button>
          </div>

          {/* AI Companion Upsell Box */}
          {upsell && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-purple-950/30 to-slate-950 border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-pink-400" /> Frequently Paired Companion
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  {formatINR(upsell.product.price)}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                {upsell.reason}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-indigo-500/20">
                <div className="text-xs font-semibold text-white">
                  {upsell.product.name}
                </div>
                <Button
                  size="sm"
                  variant="agent"
                  onClick={() => addToCart(upsell.product.id, 1)}
                  className="text-xs h-8 px-3"
                >
                  + Add Companion
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant Modal */}
      {isAiOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative">
            <button
              onClick={() => setIsAiOpen(false)}
              className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-white border border-slate-700 shadow-xl"
            >
              ✕
            </button>
            <ChatWindow
              initialMessage={`What are the main advantages of the ${product.name}?`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
