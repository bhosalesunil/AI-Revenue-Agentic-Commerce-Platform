import React from "react";
import Link from "next/link";
import { Bot, Shield, Code, ArrowUpRight } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/60 pt-12 pb-8 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800/60">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <span className="font-bold text-white tracking-tight">SellPilot</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Track: AI Growth & Agentic Commerce
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Autonomous conversational shopping agent, bounded server-side money actions, Razorpay verified checkout, and merchant explainability analytics.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Agentic Commerce</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/api/ai-catalog" target="_blank" className="hover:text-white flex items-center gap-1">
                  Machine-Readable Catalog <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link href="/chat" className="hover:text-white">AI Shopping Assistant</Link>
              </li>
              <li>
                <Link href="/dashboard/ai-activity" className="hover:text-white">Agent Audit Logs</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Merchant Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="hover:text-white">Revenue & AOV Analytics</Link>
              </li>
              <li>
                <Link href="/dashboard/orders" className="hover:text-white">Razorpay Orders</Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white">Merchant Plans</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SellPilot — AI Revenue & Agentic Commerce Platform.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-emerald-400" /> Bounded Money Guard
            </span>
            <span className="flex items-center gap-1">
              <Code className="h-3.5 w-3.5 text-blue-400" /> Next.js App Router + TypeScript
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
