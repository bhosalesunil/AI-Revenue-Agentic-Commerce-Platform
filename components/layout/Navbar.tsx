"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, ShoppingBag, BarChart3, Sparkles, Cpu, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Badge } from "@/components/ui/badge";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { totalItemsCount, setIsCartOpen } = useCart();

  const isLinkActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-pink-500 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                SellPilot
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Agentic
                </span>
              </span>
              <span className="text-[10px] text-slate-400 -mt-1">AI Revenue Platform</span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/shop"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isLinkActive("/shop")
                  ? "bg-slate-800 text-blue-400"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              Shop Catalog
            </Link>
            <Link
              href="/chat"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isLinkActive("/chat")
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-pink-400" />
              AI Assistant
            </Link>
            <Link
              href="/dashboard"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isLinkActive("/dashboard")
                  ? "bg-slate-800 text-blue-400"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Merchant Dashboard
            </Link>
            <Link
              href="/docs/ai-catalog"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isLinkActive("/docs/ai-catalog")
                  ? "bg-slate-800 text-cyan-400"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
              API Docs
            </Link>
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Badge variant="success" className="hidden sm:inline-flex gap-1 py-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            Razorpay Test Mode
          </Badge>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex h-10 items-center gap-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 px-3.5 py-2 text-sm font-medium text-slate-100 border border-slate-700/80 transition-all hover:border-slate-600 active:scale-95"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag className="h-4 w-4 text-blue-400" />
            <span className="hidden sm:inline">Cart</span>
            {totalItemsCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white shadow-md">
                {totalItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
