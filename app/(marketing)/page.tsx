"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bot,
  Sparkles,
  ShieldCheck,
  CreditCard,
  BarChart3,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/products/ProductCard";
import { ChatWindow } from "@/components/chat/ChatWindow";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.products) {
          setFeaturedProducts(data.products.slice(0, 4));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge variant="agent" className="py-1 px-3 text-xs">
                  <Sparkles className="h-3 w-3 text-pink-400" />
                  Track: AI Growth & Agentic Commerce
                </Badge>
                <Badge variant="success" className="py-1 px-3 text-xs">
                  <ShieldCheck className="h-3 w-3" />
                  Razorpay Verified
                </Badge>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                Autonomous AI Revenue &{" "}
                <span className="agent-gradient-text">Agentic Commerce</span>
              </h1>

              <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
                Empower your store with an autonomous shopping agent that discovers customer needs, recommends companion upsells, gates money actions server-side, and completes secure Razorpay checkouts.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/shop">
                  <Button size="lg" variant="agent" className="flex items-center gap-2">
                    <Bot className="h-5 w-5" /> Start Shopping Experience
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="secondary" className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-400" /> Merchant Analytics
                  </Button>
                </Link>
              </div>

              {/* Security Guarantee List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t border-slate-800/80 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-emerald-400" />
                  <span>Bounded Money Guard (Zero LLM Price Tampering)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-400" />
                  <span>Razorpay Test Mode with HMAC Signature Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span>Autonomous Upsell & Companion Affinity Engine</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-indigo-400" />
                  <span>Machine-Readable External AI Buyer Catalog API</span>
                </div>
              </div>
            </div>

            {/* Right Live Assistant Preview */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-500 opacity-30 blur-xl animate-pulse-glow" />
                <div className="relative">
                  <ChatWindow
                    initialMessage="I need wireless headphones under ₹3000 for gaming"
                    isFullPage={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Flow Interactive Architecture Visualizer */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-slate-800">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
            <Badge variant="default">Complete Platform Flow</Badge>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Explainable, Gated & High-Converting Commerce Flow
            </h2>
            <p className="text-sm text-slate-400">
              How SellPilot orchestrates every step from customer discovery to Razorpay payment and merchant analytics.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 text-center">
            {[
              { step: "01", title: "Customer", desc: "Browses or talks to AI", icon: Bot, color: "text-blue-400" },
              { step: "02", title: "Search", desc: "Bounded catalog query", icon: Zap, color: "text-indigo-400" },
              { step: "03", title: "Recommends", desc: "Top matched gear", icon: Sparkles, color: "text-pink-400" },
              { step: "04", title: "Upsell", desc: "Synergistic companion", icon: Layers, color: "text-amber-400" },
              { step: "05", title: "Cart", desc: "Server price locked", icon: Lock, color: "text-emerald-400" },
              { step: "06", title: "Razorpay", desc: "Test mode order", icon: CreditCard, color: "text-cyan-400" },
              { step: "07", title: "Verify", desc: "HMAC signature verified", icon: ShieldCheck, color: "text-green-400" },
              { step: "08", title: "Audit Log", desc: "Merchant revenue metrics", icon: BarChart3, color: "text-purple-400" },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 mb-1">{item.step}</span>
                <item.icon className={`h-6 w-6 ${item.color} mb-2`} />
                <h4 className="text-xs font-bold text-white mb-0.5">{item.title}</h4>
                <p className="text-[10px] text-slate-400 leading-tight">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Badge variant="default" className="mb-2">Verified Inventory</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Featured Products & AI Recommendations
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Add products to test automated upselling and Razorpay test checkout.
            </p>
          </div>
          <Link href="/shop">
            <Button variant="outline" className="flex items-center gap-1.5 text-xs">
              View All Products <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* AI Buyer / Agentic Commerce Showcase */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-indigo-500/20 bg-gradient-to-r from-slate-950 via-indigo-950/30 to-slate-950">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <Badge variant="agent">Machine-Readable Standard</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Empower External AI Buyers with <code className="text-cyan-400 font-mono text-xl">/api/ai-catalog</code>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                SellPilot implements the Agentic Commerce protocol. External autonomous agents can discover your store, ingest structured inventory, inspect stock availability, and programmatically invoke secure payment checkouts without human intervention.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <Link href="/api/ai-catalog" target="_blank">
                  <Button variant="agent" size="sm" className="flex items-center gap-2">
                    <Cpu className="h-4 w-4" /> Inspect AI Catalog JSON
                  </Button>
                </Link>
                <Link href="/docs">
                  <Button variant="outline" size="sm" className="text-xs">
                    Read Agentic Protocol Docs
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-x-auto shadow-xl">
                <div className="text-slate-500 mb-2">// GET /api/ai-catalog response snippet</div>
                <pre className="text-cyan-400">
{`{
  "merchant": { "name": "Nexus Gear" },
  "capabilities": {
    "automated_checkout_supported": true
  },
  "products": [
    {
      "id": "prod_gaming_headphones",
      "name": "HyperSonic Pro Wireless",
      "price": 1799,
      "currency": "INR",
      "available": true
    }
  ]
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
