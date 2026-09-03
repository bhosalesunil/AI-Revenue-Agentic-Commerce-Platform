"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Percent,
  Sparkles,
  Bot,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DashboardOverviewPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics").then((r) => r.json()),
      fetch("/api/orders").then((r) => r.json()),
    ])
      .then(([aData, oData]) => {
        if (aData.success) setAnalytics(aData.analytics);
        if (oData.success) setOrders(oData.orders);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 animate-pulse">
        Loading merchant telemetry...
      </div>
    );
  }

  const rev = analytics?.revenue;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold text-slate-400">Merchant Control Center</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Good evening 👋
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <Badge variant="success" className="py-1 px-3">
            <ShieldCheck className="h-3.5 w-3.5" /> Razorpay Test Gateway Active
          </Badge>
          <Link href="/shop" target="_blank">
            <Button variant="outline" size="sm" className="text-xs">
              Preview Store
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Total Revenue */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Revenue</span>
            <span className="text-emerald-400 flex items-center gap-0.5 font-semibold">
              <TrendingUp className="h-3.5 w-3.5" /> +24.8%
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {formatINR(rev?.total || 124500)}
          </div>
          <span className="text-[11px] text-slate-500 block">Gross revenue across all channels</span>
        </div>

        {/* Total Orders */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Completed Orders</span>
            <ShoppingCart className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {analytics?.orders?.completed || 342}
          </div>
          <span className="text-[11px] text-slate-500 block">342 transactions captured</span>
        </div>

        {/* Conversion Rate */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Conversion Rate</span>
            <Percent className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {analytics?.conversionRate?.overall || 12.4}%
          </div>
          <span className="text-[11px] text-emerald-400 block font-medium">
            AI-Assisted: {analytics?.conversionRate?.aiAssisted || 28.6}% (vs 4.2% organic)
          </span>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Average Order Value (AOV)</span>
            <span className="text-blue-400 font-semibold text-xs">+34% with AI</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {formatINR(analytics?.averageOrderValue?.overall || 1872)}
          </div>
          <span className="text-[11px] text-slate-500 block">Lifting basket sizes via AI affinity</span>
        </div>

        {/* AI Assisted Revenue */}
        <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 space-y-2">
          <div className="flex items-center justify-between text-xs text-indigo-300">
            <span className="flex items-center gap-1 font-semibold">
              <Bot className="h-3.5 w-3.5 text-pink-400" /> AI Assisted Revenue
            </span>
            <Badge variant="agent" className="text-[10px] py-0">Direct Attributed</Badge>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {formatINR(rev?.aiAssisted || 38420)}
          </div>
          <span className="text-[11px] text-slate-400 block">30.8% of total merchant revenue</span>
        </div>

        {/* AI Upsell Revenue */}
        <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 bg-purple-950/20 space-y-2">
          <div className="flex items-center justify-between text-xs text-purple-300">
            <span className="flex items-center gap-1 font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" /> AI Upsell Revenue
            </span>
            <Badge variant="agent" className="text-[10px] py-0">Incremental</Badge>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {formatINR(rev?.aiUpsell || 18420)}
          </div>
          <span className="text-[11px] text-slate-400 block">Pure incremental margin from companions</span>
        </div>
      </div>

      {/* Revenue Trends Bar Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Weekly Revenue Breakdown</h3>
            <p className="text-xs text-slate-400">Total volume vs. AI agent assisted revenue</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Total Volume
            </span>
            <span className="flex items-center gap-1.5 text-indigo-400">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500" /> AI Assisted
            </span>
          </div>
        </div>

        <div className="pt-6 grid grid-cols-7 gap-3 items-end h-48 border-b border-slate-800 pb-3">
          {analytics?.revenueChart?.map((day: any) => {
            const maxVal = 35000;
            const totalHeight = Math.round((day.total / maxVal) * 100);
            const aiHeight = Math.round((day.aiRevenue / maxVal) * 100);

            return (
              <div key={day.date} className="flex flex-col items-center gap-2 h-full justify-end group">
                <div className="relative w-full max-w-[40px] flex items-end justify-center h-full">
                  {/* Total Bar */}
                  <div
                    style={{ height: `${totalHeight}%` }}
                    className="w-full bg-slate-800 rounded-t-lg transition-all group-hover:bg-blue-600/80 relative"
                  >
                    {/* AI Portion Overlay */}
                    <div
                      style={{ height: `${(aiHeight / totalHeight) * 100}%` }}
                      className="w-full bg-gradient-to-t from-indigo-600 to-pink-500 rounded-t-lg absolute bottom-0"
                    />
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-mono">{day.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Recent Orders & AI Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Orders */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Recent Razorpay Orders</h3>
            <Link href="/dashboard/orders" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-white block">{order.id}</span>
                  <span className="text-slate-400 text-[11px]">{order.user?.name || "Customer"} • {new Date(order.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">{formatINR(order.totalAmount)}</span>
                  <Badge variant={order.status === "PAID" ? "success" : "warning"} className="text-[10px]">
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live AI Agent Audit Log Snippet */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Live Agent Activity</h3>
            </div>
            <Link href="/dashboard/ai-activity" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              Audit Stream <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {analytics?.recentEvents?.slice(0, 5).map((evt: any) => (
              <div key={evt.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-indigo-300 font-semibold">{evt.action}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{evt.time}</span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">{evt.detail}</p>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="h-2.5 w-2.5" /> {evt.status}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">• tool: {evt.toolName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
