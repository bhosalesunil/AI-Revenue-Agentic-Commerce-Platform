"use client";

import React from "react";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: any[];
  onAskAi?: (product: any) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, onAskAi }) => {
  if (!products || products.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
        <p className="text-lg font-medium text-white mb-2">No matching products found</p>
        <p className="text-sm">Try broadening your search query or adjusting your price filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAskAi={onAskAi} />
      ))}
    </div>
  );
};
