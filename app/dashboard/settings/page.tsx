"use client";

import React, { useState } from "react";
import { Save, Check, ShieldCheck, Key, Bot, Cpu, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function DashboardSettingsPage() {
  const [saved, setSaved] = useState(false);

  // Settings State
  const [storeName, setStoreName] = useState("Nexus Gear & Electronics");
  const [razorpayKeyId, setRazorpayKeyId] = useState("rzp_test_YourTestKeyIdHere");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("••••••••••••••••••••");
  const [aiProvider, setAiProvider] = useState("gemini");
  const [modelName, setModelName] = useState("gemini-1.5-pro");
  const [agenticCatalogEnabled, setAgenticCatalogEnabled] = useState(true);

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
              <Input value="INR (₹)" disabled className="opacity-70" />
            </div>
          </div>
        </div>

        {/* Razorpay Gateway */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="h-4 w-4 text-emerald-400" /> Razorpay Test Mode Gateway
            </h3>
            <Badge variant="success">Test Mode Active</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Razorpay Key ID</label>
              <Input value={razorpayKeyId} onChange={(e) => setRazorpayKeyId(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Razorpay Key Secret</label>
              <Input type="password" value={razorpayKeySecret} onChange={(e) => setRazorpayKeySecret(e.target.value)} />
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            For development and hackathon judging, SellPilot runs in sandbox simulation mode when keys are omitted.
          </p>
        </div>

        {/* AI Model & Agent Settings */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Bot className="h-4 w-4 text-indigo-400" /> AI Commerce Model Engine
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">AI Provider</label>
              <select
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="gemini">Google Gemini 1.5 Pro / Flash</option>
                <option value="openai">OpenAI GPT-4o</option>
                <option value="anthropic">Anthropic Claude 3.5 Sonnet</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Model Identifier</label>
              <Input value={modelName} onChange={(e) => setModelName(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Agentic Commerce Protocol Endpoint */}
        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-400" /> Machine-Readable Agentic Catalog (/api/ai-catalog)
            </h3>
            <Badge variant="agent">Interoperable</Badge>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Permit external autonomous agents and AI buyers to query live pricing and stock without human UI navigation.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enableCatalog"
              checked={agenticCatalogEnabled}
              onChange={(e) => setAgenticCatalogEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 accent-indigo-600"
            />
            <label htmlFor="enableCatalog" className="text-xs text-white font-medium cursor-pointer">
              Expose public structured machine-readable catalog endpoint
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" variant="agent" size="lg" className="flex items-center gap-2">
            <Save className="h-4 w-4" /> Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
