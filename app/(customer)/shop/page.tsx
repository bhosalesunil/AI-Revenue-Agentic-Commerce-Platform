"use client";

import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Sparkles, X, RotateCcw } from "lucide-react";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import { ChatWindow } from "@/components/chat/ChatWindow";

const CATEGORIES = ["All", "Audio", "Gaming", "Wearables", "Accessories"];

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAiPrompt, setActiveAiPrompt] = useState<string | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "All") params.append("category", selectedCategory);
      if (searchQuery.trim()) params.append("query", searchQuery.trim());
      if (maxPrice) params.append("maxPrice", maxPrice.toString());

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, maxPrice]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const resetFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
    setMaxPrice(5000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <Badge variant="agent" className="mb-2">
            <Sparkles className="h-3 w-3 text-pink-400" /> AI-Guided Catalog
          </Badge>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Discover Tech & Gear
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse verified inventory or ask our AI agent to locate products within your exact budget.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="agent"
            size="sm"
            onClick={() => setActiveAiPrompt("I need low-latency gaming accessories under ₹2500")}
            className="text-xs flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-pink-400" /> Find with AI
          </Button>
        </div>
      </div>

      {/* Filters & Search Controls */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Search by keywords, specs, or product names..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="primary" size="md" className="px-6 text-xs">
            Search
          </Button>
          {(selectedCategory !== "All" || searchQuery || maxPrice < 5000) && (
            <Button type="button" variant="ghost" size="md" onClick={resetFilters} className="text-xs flex items-center gap-1 text-slate-400">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </Button>
          )}
        </form>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-800/60">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-500 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="h-3 w-3" /> Category:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white font-semibold shadow-sm"
                    : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Price Range Slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 whitespace-nowrap">
              Max Budget: <strong className="text-white font-semibold">{formatINR(maxPrice)}</strong>
            </span>
            <input
              type="range"
              min={800}
              max={5000}
              step={100}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-32 accent-blue-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* AI Modal if triggered */}
      {activeAiPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative">
            <button
              onClick={() => setActiveAiPrompt(null)}
              className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-white border border-slate-700 shadow-xl"
            >
              <X className="h-4 w-4" />
            </button>
            <ChatWindow initialMessage={activeAiPrompt} />
          </div>
        </div>
      )}

      {/* Product Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400 animate-pulse">
          Loading catalog items...
        </div>
      ) : (
        <ProductGrid
          products={products}
          onAskAi={(p) => setActiveAiPrompt(`Tell me more about ${p.name} and why I should buy it`)}
        />
      )}
    </div>
  );
}
