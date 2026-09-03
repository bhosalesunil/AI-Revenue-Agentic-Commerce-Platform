"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, RotateCcw, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "Order";
  const reason = searchParams.get("reason") || "Payment verification failed or user dismissed modal.";

  return (
    <div className="mx-auto max-w-xl px-4 py-20 space-y-8 text-center">
      <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-rose-500/30 space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 mx-auto border border-rose-500/30">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <Badge variant="danger">Payment Unsuccessful</Badge>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Transaction Incomplete
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
          {reason}
        </p>

        <p className="text-xs text-slate-500 font-mono">
          Order ID: {orderId}
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/checkout" className="w-full sm:w-auto">
            <Button variant="agent" size="md" className="w-full text-xs flex items-center justify-center gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Retry Checkout
            </Button>
          </Link>
          <Link href="/cart" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full text-xs flex items-center justify-center gap-1.5">
              <ShoppingBag className="h-3.5 w-3.5" /> Return to Cart
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-400">Loading error details...</div>}>
      <PaymentFailedContent />
    </Suspense>
  );
}
