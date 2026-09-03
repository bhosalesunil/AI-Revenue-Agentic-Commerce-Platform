"use client";

import React from "react";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Badge } from "@/components/ui/badge";
import { Bot, Sparkles, ShieldCheck } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="agent" className="text-xs">
              <Sparkles className="h-3 w-3 text-pink-400" /> Conversational Agent
            </Badge>
            <Badge variant="success" className="text-xs">
              <ShieldCheck className="h-3 w-3" /> Gated Security
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Shopping Assistant & Upsell Engine
          </h1>
        </div>
        <p className="text-xs text-slate-400 max-w-xs sm:text-right">
          Directly queries merchant catalog, applies bounded budget rules, and initiates Razorpay orders.
        </p>
      </div>

      <div className="w-full flex justify-center">
        <ChatWindow isFullPage={true} />
      </div>
    </div>
  );
}
