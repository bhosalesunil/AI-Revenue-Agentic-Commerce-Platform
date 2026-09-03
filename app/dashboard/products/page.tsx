"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Edit2, Trash2, Check, X, Search, Package } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function DashboardProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Audio");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const loadProducts = () => {
    setLoading(true);
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.products) {
          setProducts(data.products);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          price: Number(price),
          stock: Number(stock),
          description,
          imageUrl: imageUrl || "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        // Reset
        setName("");
        setPrice("");
        setStock("");
        setDescription("");
        setImageUrl("");
        loadProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStock = async (id: string, newStock: number) => {
    try {
      await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Product Catalog Management</h1>
          <p className="text-xs text-slate-400">Manage items discoverable by customers and autonomous AI buyers.</p>
        </div>
        <Button variant="agent" size="sm" onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 text-xs">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center gap-3">
        <Search className="h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Filter inventory by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none w-full"
        />
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price (INR)</th>
                <th className="p-4">Stock Level</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                      <Image
                        src={p.imageUrl || "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800"}
                        alt={p.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <span className="font-semibold text-white block truncate max-w-xs">{p.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{p.id}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-300">{p.category}</td>
                  <td className="p-4 font-bold text-white">{formatINR(p.price)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        defaultValue={p.stock}
                        onBlur={(e) => handleUpdateStock(p.id, Number(e.target.value))}
                        className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-slate-500 text-[10px]">units</span>
                    </div>
                  </td>
                  <td className="p-4 text-amber-400 font-semibold">★ {p.rating}</td>
                  <td className="p-4">
                    <Badge variant={p.isActive ? "success" : "secondary"} className="text-[10px]">
                      {p.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleUpdateStock(p.id, p.stock + 10)}
                      className="text-blue-400 hover:text-blue-300 text-xs font-medium"
                    >
                      +10 Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Add New Product to Catalog</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Product Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Ergonomic Cyber Keyboard" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="Audio">Audio</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Price (INR ₹)</label>
                  <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="1999" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Initial Stock</label>
                  <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required placeholder="50" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Image URL</label>
                  <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  placeholder="Key specs, low-latency performance, features..."
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="agent" size="sm">
                  Save Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
