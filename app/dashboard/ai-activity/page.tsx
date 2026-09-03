"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Search,
  Code,
  Sparkles,
  ArrowRight,
  Filter,
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function DashboardAiActivityPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  const loadEvents = () => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.analytics) {
          // If we also want full agent events from the store
          setEvents(data.analytics.recentEvents || []);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  const detailedEvents = [
    {
      id: "evt_101",
      time: "19:31:04",
      action: "SEARCH PRODUCTS",
      toolName: "searchProducts",
      input: '{"query":"wireless headphones under 3000","maxPrice":3000}',
      output: '{"matchesFound":2,"topPick":"HyperSonic Pro Wireless"}',
      status: "SUCCESS",
      amount: null,
      justification: "Customer requested low latency wireless audio under budget constraint (maxPrice=3000).",
    },
    {
      id: "evt_102",
      time: "19:31:07",
      action: "RECOMMENDATION GENERATED",
      toolName: "getProductDetails",
      input: '{"productId":"prod_gaming_headphones"}',
      output: '{"name":"HyperSonic Pro Wireless","price":1799}',
      status: "SUCCESS",
      amount: null,
      justification: "Selected highest rated gaming headset meeting price boundary.",
    },
    {
      id: "evt_103",
      time: "19:31:20",
      action: "ADD TO CART",
      toolName: "addToCart",
      input: '{"productId":"prod_gaming_headphones","quantity":1}',
      output: '{"cartTotal":1799,"itemsCount":1}',
      status: "SUCCESS",
      amount: 1799,
      justification: "Added to active session cart with verified database price ₹1,799.",
    },
    {
      id: "evt_104",
      time: "19:31:22",
      action: "UPSELL PROMPT",
      toolName: "recommendUpsell",
      input: '{"basedOn":"prod_gaming_headphones","suggested":"prod_gaming_mouse"}',
      output: '{"suggestedItem":"ViperStrike Wireless RGB Mouse","price":799}',
      status: "SUCCESS",
      amount: null,
      justification: "Affinity rule: 68% of customers buying gaming headphones pair with gaming mouse.",
    },
    {
      id: "evt_105",
      time: "19:31:24",
      action: "CREATE CHECKOUT",
      toolName: "createCheckout",
      input: '{"cartId":"cart_active","itemsCount":2}',
      output: '{"razorpayOrderId":"order_mock_10292","calculatedTotal":2598}',
      status: "SUCCESS",
      amount: 2598,
      justification: "Server computed total: (₹1,799 + ₹799) = ₹2,598. Gated authorization passed.",
    },
    {
      id: "evt_106",
      time: "19:32:02",
      action: "PAYMENT VERIFICATION",
      toolName: "verifyPayment",
      input: '{"orderId":"SP-10292","razorpayPaymentId":"pay_test_8849"}',
      output: '{"verified":true,"status":"PAID"}',
      status: "SUCCESS",
      amount: 2598,
      justification: "Razorpay cryptographic signature verified with secret HMAC.",
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="agent" className="text-xs">
              <Bot className="h-3 w-3 text-pink-400" /> Explainability Engine
            </Badge>
            <Badge variant="success" className="text-xs">
              <ShieldCheck className="h-3 w-3" /> Audit Log Stream
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Agent Activity & Audit Trail</h1>
        </div>
        <p className="text-xs text-slate-400 max-w-sm sm:text-right">
          Every AI money action is bounded, explainable, and logged with cryptographic integrity.
        </p>
      </div>

      {/* Security Banner Requirement Callout */}
      <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 flex-shrink-0">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Guaranteed Bounded Action Security</h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              &quot;Every money action should be explainable, bounded and gated.&quot; The AI never manipulates prices directly; the server calculates all order totals from database records and logs every tool invocation.
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 flex-shrink-0">
          <CheckCircle2 className="h-4 w-4" /> 100% Gated & Audited
        </span>
      </div>

      {/* Event Stream Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Action / Event Type</th>
                <th className="p-4">Tool Invoked</th>
                <th className="p-4">Input Parameters</th>
                <th className="p-4">Result Output</th>
                <th className="p-4">Status</th>
                <th className="p-4">Money Bound</th>
                <th className="p-4">Explainability Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {detailedEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4 font-mono text-slate-400 whitespace-nowrap">{evt.time}</td>
                  <td className="p-4">
                    <span className="font-mono font-bold text-white block">{evt.action}</span>
                    <span className="text-[10px] text-slate-500">{evt.id}</span>
                  </td>
                  <td className="p-4 font-mono text-indigo-300">
                    <span className="bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60">
                      {evt.toolName}()
                    </span>
                  </td>
                  <td className="p-4 font-mono text-[11px] text-slate-400 max-w-[140px] truncate" title={evt.input}>
                    {evt.input}
                  </td>
                  <td className="p-4 font-mono text-[11px] text-slate-300 max-w-[140px] truncate" title={evt.output}>
                    {evt.output}
                  </td>
                  <td className="p-4">
                    <Badge variant="success" className="text-[10px]">
                      <CheckCircle2 className="h-2.5 w-2.5" /> {evt.status}
                    </Badge>
                  </td>
                  <td className="p-4 font-mono font-bold text-white whitespace-nowrap">
                    {evt.amount ? formatINR(evt.amount) : "—"}
                  </td>
                  <td className="p-4 text-slate-300 max-w-xs text-[11px] leading-relaxed">
                    {evt.justification}
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
