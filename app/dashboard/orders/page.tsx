"use client";

import React, { useState, useEffect } from "react";
import { Search, ShoppingCart, ShieldCheck, CheckCircle2, Clock, XCircle, Bot } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.orders) {
          setOrders(data.orders);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.razorpayOrderId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Orders & Razorpay Transactions</h1>
          <p className="text-xs text-slate-400">Track paid orders, line items, and AI attribution telemetry.</p>
        </div>
        <Badge variant="success" className="py-1 px-3">
          <ShieldCheck className="h-3.5 w-3.5" /> Razorpay Signature Verified
        </Badge>
      </div>

      {/* Search */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center gap-3">
        <Search className="h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Filter by Order ID, Customer, or Razorpay Order ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none w-full"
        />
      </div>

      {/* Orders Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Razorpay Ref</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4">AI Attributed</th>
                <th className="p-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4 font-mono font-bold text-white">{order.id}</td>
                  <td className="p-4">
                    <span className="font-semibold text-slate-200 block">{order.user?.name || "Customer"}</span>
                    <span className="text-[10px] text-slate-500">{order.user?.email || "customer@example.com"}</span>
                  </td>
                  <td className="p-4 text-slate-300">
                    {order.items?.length || 1} item{(order.items?.length || 1) > 1 ? "s" : ""}
                  </td>
                  <td className="p-4 font-bold text-white">{formatINR(order.totalAmount)}</td>
                  <td className="p-4 font-mono text-[11px] text-cyan-400 truncate max-w-[120px]">
                    {order.razorpayOrderId || "N/A"}
                  </td>
                  <td className="p-4">
                    <Badge variant={order.status === "PAID" ? "success" : "warning"} className="text-[10px]">
                      {order.status === "PAID" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {order.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    {order.isAiAssisted ? (
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Bot className="h-2.5 w-2.5" /> AI Assisted
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Organic</span>
                    )}
                  </td>
                  <td className="p-4 text-right text-slate-400 font-mono text-[11px]">
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
