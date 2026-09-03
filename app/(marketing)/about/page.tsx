import React from "react";
import Link from "next/link";
import { Bot, ShieldCheck, Cpu, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-12">
      <div className="space-y-4">
        <Badge variant="agent">Track: AI Growth & Agentic Commerce</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          About SellPilot
        </h1>
        <p className="text-lg text-slate-300 leading-relaxed">
          SellPilot was engineered to solve the most critical problem in agentic e-commerce: <strong className="text-white">how do we empower AI agents to transact autonomously without introducing security risks, price hallucination, or user mistrust?</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <ShieldCheck className="h-7 w-7 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Bounded Money Guard</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The LLM never directly sets or updates prices, discounts, or account details. All calculations are executed server-side from verified database state, preventing prompt-injection discount exploits.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <Cpu className="h-7 w-7 text-cyan-400" />
          <h3 className="text-base font-bold text-white">Agentic Interoperability</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Through <code className="text-cyan-400">/api/ai-catalog</code>, external autonomous buyer agents can browse, evaluate, and purchase goods on behalf of users with structured machine-readable protocols.
          </p>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-3xl space-y-4 border border-slate-800">
        <h2 className="text-xl font-bold text-white">Architectural Philosophy</h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          By unifying the front-end shopping interface, conversational agent, Razorpay checkout, and merchant analytics inside a single Next.js App Router monorepo, we reduce latency, simplify auditing, and maintain end-to-end TypeScript type safety.
        </p>
        <div className="pt-2">
          <Link href="/shop">
            <Button variant="agent" className="text-xs flex items-center gap-1.5">
              Explore Live Store <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
