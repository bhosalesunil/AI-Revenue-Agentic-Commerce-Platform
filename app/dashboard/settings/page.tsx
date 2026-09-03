"use client";

import React, { useState } from "react";
import { Save, Check, ShieldCheck, Key, Bot, Cpu, Store, Lock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function DashboardSettingsPage() {
  const [saved, setSaved] = useState(false);

  // Settings State (Secrets are strictly masked and never transmitted in plaintext)
  const [storeName, setStoreName] = useState("Nexus Gear & Electronics");
  const [razorpayKeyId] = useState("rzp_test_••••••••••••");
  const [razorpayKeySecret] = useState("••••••••••••••••••••");
  const [aiProvider, setAiProvider] = useState("gemini");
  const [modelName, setModelName] = useState("gemini-1.5-flash");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Platform Configuration & API Settings</h1>
          <p className="text-xs text-slate-400">Configure payment gateways, AI models, and Agentic Commerce endpoints.</p>
        </div>
        {saved && (
          <Badge variant="success" className="flex items-center gap-1">
            <Check className="h-3 w-3" /> Changes Saved
          </Badge>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Store Profile */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Store className="h-4 w-4 text-blue-400" /> Store Profile
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Store Brand Name</label>
              <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Default Currency</label>
              <Input value="INR (₹)" disabled className="opacity-70 bg-slate-900 font-mono" />
            </div>
          </div>
        </div>

        {/* Razorpay Gateway Configuration */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="h-4 w-4 text-emerald-400" /> Razorpay Test Mode Gateway
            </h3>
            <Badge variant="success">Test Mode Active</Badge>
          </div>
          
          <div className="rounded-xl bg-slate-900/60 p-3.5 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
            <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              For security compliance, payment credentials and secrets are managed via server-side environment variables (<code>.env</code>) and are never exposed to browser bundles.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-slate-500" /> Razorpay Key ID
              </label>
              <Input value={razorpayKeyId} disabled className="font-mono text-slate-400 bg-slate-900/80 cursor-not-allowed" />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-slate-500" /> Razorpay Key Secret
              </label>
              <Input value={razorpayKeySecret} disabled className="font-mono text-slate-400 bg-slate-900/80 cursor-not-allowed" />
            </div>
          </div>
        </div>

        {/* AI Shopping Agent Model */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bot className="h-4 w-4 text-purple-400" /> AI Shopping Agent Provider
            </h3>
            <Badge variant="agent">Function Calling Enabled</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">LLM Engine</label>
              <select
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="gemini">Google Gemini 1.5 Flash (Agentic)</option>
                <option value="openai">OpenAI GPT-4o Mini (Function Calling)</option>
                <option value="local">Local Agentic Commerce Engine</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Model Endpoint</label>
              <Input value={modelName} onChange={(e) => setModelName(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Machine-Readable Agentic Protocol */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-400" /> Agentic Commerce Catalog
            </h3>
            <Badge variant="agent">Interoperable v1.0</Badge>
          </div>
          <p className="text-xs text-slate-400">
            External autonomous buyer agents discover your inventory via the standardized machine-readable JSON endpoint at <code>/api/ai-catalog</code>.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="/docs/ai-catalog"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4"
            >
              View Developer Documentation & Protocol Spec →
            </a>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" variant="agent" size="lg" className="flex items-center gap-2">
            <Save className="h-4 w-4" /> Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
