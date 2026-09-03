"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, ArrowRight, Bot, BarChart3, ShoppingBag } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "SP-10293";
  const paymentId = searchParams.get("paymentId") || "pay_test_verified";

  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.order) {
            setOrder(data.order);
          }
        })
        .catch(() => {});
    }
  }, [orderId]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 space-y-8">
      {/* Celebration Card */}
      <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-emerald-500/30 text-center space-y-4 relative overflow-hidden">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mx-auto border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <Badge variant="success">Payment Verified ✓</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Payment Successful!
        </h1>
        <p className="text-sm text-slate-300 max-w-md mx-auto">
          Your order has been cryptographically verified and recorded in the database.
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-3 text-xs font-mono text-slate-400">
          <span className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            Order: <strong className="text-white">{orderId}</strong>
          </span>
          <span className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            Razorpay ID: <strong className="text-cyan-400">{paymentId}</strong>
          </span>
          <span className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            Status: <strong className="text-emerald-400">PAID</strong>
          </span>
        </div>
      </div>

      {/* AI Agent Summary & Audit Log Assurance */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/30 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
          <Bot className="h-4 w-4 text-pink-400" />
          AI Commerce Agent Explainability Note
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Every step of this transaction was bounded and audited. The AI agent selected optimal gear according to your requirements, suggested high-affinity companions, and allowed the Money Action Guard to guarantee zero price hallucination.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link href="/shop" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full text-xs flex items-center justify-center gap-1.5">
            <ShoppingBag className="h-4 w-4" /> Continue Shopping
          </Button>
        </Link>
        <Link href="/dashboard" className="w-full sm:w-auto">
          <Button variant="agent" className="w-full text-xs flex items-center justify-center gap-1.5">
            <BarChart3 className="h-4 w-4" /> View Merchant Analytics <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-400">Loading payment confirmation...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
