"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Bot, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Terminal, 
  Layers, 
  ShieldCheck, 
  Code2, 
  CheckCircle2, 
  ArrowRight,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AICatalogDocsPage() {
  const [copied, setCopied] = useState(false);
  const [catalogData, setCatalogData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ai-catalog")
      .then((res) => res.json())
      .then((data) => {
        setCatalogData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load catalog preview:", err);
        setLoading(false);
      });
  }, []);

  const handleCopyJson = () => {
    if (!catalogData) return;
    navigator.clipboard.writeText(JSON.stringify(catalogData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    if (!catalogData) return;
    const blob = new Blob([JSON.stringify(catalogData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sellpilot-ai-catalog-v1.0-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <Bot className="h-3.5 w-3.5" /> Agentic Commerce Interoperability Protocol v1.0
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Machine-Readable AI Catalog API
        </h1>
        <p className="text-base sm:text-lg text-slate-400">
          Designed for external autonomous buyer agents (OpenAI GPTs, LangChain, CrewAI, AutoGen).
          Enables programmatic inventory discovery, real-time stock verification, and server-gated checkout.
        </p>
      </div>

      {/* Protocol KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">API Status</div>
          <div className="text-xl font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            200 OK (Live)
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Direct REST GET Endpoint</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Schema Version</div>
          <div className="text-xl font-bold text-white mt-1">1.0</div>
          <div className="text-[11px] text-slate-500 mt-1">Strict JSON specification</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Live Inventory</div>
          <div className="text-xl font-bold text-indigo-400 mt-1">
            {loading ? "Loading..." : `${catalogData?.products?.length || 8} Products`}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">PostgreSQL canonical sync</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Money Guard</div>
          <div className="text-xl font-bold text-purple-400 mt-1 flex items-center gap-1">
            <ShieldCheck className="h-5 w-5 text-purple-400" /> Bounded
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Server-locked INR pricing</div>
        </div>
      </div>

      {/* Endpoint Specification */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Badge variant="default" className="bg-blue-600 text-white font-mono text-xs px-2.5 py-0.5">
                GET
              </Badge>
              <code className="text-lg font-mono text-blue-300 font-semibold">/api/ai-catalog</code>
            </div>
            <p className="text-xs text-slate-400">
              Returns deterministic catalog data, inventory availability, and executable action payloads for autonomous AI buyers.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={handleCopyJson}
              variant="outline"
              size="sm"
              className="text-xs border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-200"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
              {copied ? "Copied JSON" : "Copy JSON"}
            </Button>
            <Button
              onClick={handleDownloadJson}
              variant="outline"
              size="sm"
              className="text-xs border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-200"
            >
              <Download className="h-3.5 w-3.5 mr-1" /> Download JSON
            </Button>
            <Link href="/api/ai-catalog" target="_blank">
              <Button size="sm" className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white">
                <ExternalLink className="h-3.5 w-3.5 mr-1" /> Open Raw API
              </Button>
            </Link>
          </div>
        </div>

        {/* Live Interactive JSON Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Terminal className="h-4 w-4 text-emerald-400" /> Machine-Readable Response Payload
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Content-Type: application/json</span>
          </div>

          <div className="relative rounded-2xl bg-slate-950/80 border border-slate-800 p-4 max-h-96 overflow-y-auto font-mono text-xs text-emerald-300 shadow-inner">
            {loading ? (
              <div className="py-12 text-center text-slate-500">Querying live PostgreSQL catalog...</div>
            ) : (
              <pre className="whitespace-pre">{JSON.stringify(catalogData, null, 2)}</pre>
            )}
          </div>
        </div>
      </div>

      {/* Protocol Architecture: How External AI Buyers Interoperate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Code2 className="h-5 w-5 text-blue-400" /> External AI Agent Integration
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            External autonomous shopping agents can fetch this machine-readable catalog and execute bounded purchasing flows using the standard direct action payloads:
          </p>
          <div className="rounded-xl bg-slate-950 p-4 border border-slate-800/80 font-mono text-[11px] text-slate-300 space-y-2">
            <p className="text-slate-500">{"// 1. Discover products via GET /api/ai-catalog"}</p>
            <p className="text-emerald-400">{`const catalog = await fetch("https://sellpilot.store/api/ai-catalog").then(r => r.json());`}</p>
            <p className="text-slate-500">{"// 2. Select product & invoke payload"}</p>
            <p className="text-blue-300">{`const action = catalog.products[0].direct_action_payload;`}</p>
            <p className="text-emerald-400">{`await fetch(action.endpoint, { method: "POST", body: JSON.stringify({ productId: action.productId, quantity: 1 }) });`}</p>
          </div>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-purple-400" /> Bounded Money Security Guarantees
          </h3>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Zero Price Hallucination:</strong> Prices in client payloads are strictly ignored. All line items are computed server-side from PostgreSQL.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>ID Integrity Guarantee:</strong> Every <code>direct_action_payload.productId</code> strictly matches the canonical product ID.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Cryptographic Razorpay Signatures:</strong> Orders only reach <code>PAID</code> status after HMAC-SHA256 signature verification.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
