"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, Sparkles, Check, ArrowRight } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    category: string;
    stock: number;
    imageUrl?: string | null;
    rating: number;
  };
  onAskAi?: (product: any) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAskAi }) => {
  const { addToCart, isLoading } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = async () => {
    await addToCart(product.id, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="glass-panel glass-panel-hover flex flex-col justify-between overflow-hidden rounded-2xl group border border-slate-800 bg-slate-900/40">
      {/* Product Image */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-950/60">
        <Image
          src={product.imageUrl || "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800"}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="secondary" className="bg-slate-950/70 backdrop-blur-md border-slate-700/60">
            {product.category}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <span className="flex items-center gap-1 rounded-full bg-slate-950/80 px-2.5 py-1 text-xs font-semibold text-amber-400 backdrop-blur-md border border-amber-500/20">
            <Star className="h-3 w-3 fill-amber-400" />
            {product.rating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <Link href={`/products/${product.id}`} className="group-hover:text-blue-400 transition-colors">
          <h3 className="font-semibold text-base text-white line-clamp-1 mb-1">{product.name}</h3>
        </Link>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">{product.description}</p>

        {/* Pricing & Stock */}
        <div className="mt-auto pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">Verified Price</span>
            <span className="text-xl font-bold text-white tracking-tight">{formatINR(product.price)}</span>
          </div>
          <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {product.stock} in stock
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button
            size="sm"
            variant={justAdded ? "primary" : "secondary"}
            onClick={handleAddToCart}
            disabled={isLoading}
            className="flex items-center justify-center gap-1.5"
          >
            {justAdded ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" /> Added
              </>
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5 text-blue-400" /> Add to Cart
              </>
            )}
          </Button>

          {onAskAi ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAskAi(product)}
              className="flex items-center justify-center gap-1 text-xs text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/10"
            >
              <Sparkles className="h-3.5 w-3.5 text-pink-400" /> Ask AI
            </Button>
          ) : (
            <Link href={`/products/${product.id}`} className="w-full">
              <Button size="sm" variant="outline" className="w-full text-xs flex items-center justify-center gap-1">
                Details <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
