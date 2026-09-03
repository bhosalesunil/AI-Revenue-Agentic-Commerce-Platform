"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LineChart,
  Bot,
  Settings,
  Store,
  ExternalLink,
} from "lucide-react";

export const DashboardSidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Products", href: "/dashboard/products", icon: Package },
    { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
    { name: "Analytics", href: "/dashboard/analytics", icon: LineChart },
    { name: "AI Activity Logs", href: "/dashboard/ai-activity", icon: Bot },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-slate-950/60 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div className="px-3 py-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Merchant Workspace
          </span>
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Store className="h-4 w-4 text-blue-400" /> Nexus Gear & Tech
          </h2>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Customer Storefront</span>
          <Link href="/shop" className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
            Open <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
        <p className="text-[11px] text-slate-500">View real-time updates as AI shopper guides customers.</p>
      </div>
    </aside>
  );
};
