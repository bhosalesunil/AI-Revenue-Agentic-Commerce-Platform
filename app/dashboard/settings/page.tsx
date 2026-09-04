"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  Check,
  Key,
  Bot,
  Cpu,
  Store,
  Lock,
  Info,
  Loader2,
  XCircle,
  Database,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SUPPORTED_CURRENCIES, SettingsStatus } from "@/types/settings";

const CURRENCY_LABELS: Record<string, string> = {
  INR: "INR (₹) - Indian Rupee",
  USD: "USD ($) - US Dollar",
  EUR: "EUR (€) - Euro",
  GBP: "GBP (£) - British Pound",
  CAD: "CAD ($) - Canadian Dollar",
  AUD: "AUD ($) - Australian Dollar",
  SGD: "SGD ($) - Singapore Dollar",
  AED: "AED (د.إ) - UAE Dirham",
  JPY: "JPY (¥) - Japanese Yen",
};

export default function DashboardSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Store Profile State (Persisted in PostgreSQL)
  const [storeName, setStoreName] = useState("");
  const [currency, setCurrency] = useState("INR");

  // Server Configuration Status State (Never contains secrets)
  const [status, setStatus] = useState<SettingsStatus>({
    razorpay: {
      configured: false,
      mode: "not_configured",
      keyIdMasked: null,
    },
    database: {
      connected: false,
      provider: "PostgreSQL",
    },
    ai: {
      configured: false,
      provider: "local",
      model: "Local Agentic Commerce Engine",
      hasApiKey: false,
    },
  });

  // Load Settings & Status on Component Mount
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const [settingsRes, statusRes] = await Promise.all([
          fetch("/api/settings"),
          fetch("/api/settings/status"),
        ]);

        if (settingsRes.ok) {
          const data = await settingsRes.json();
          if (data?.settings && isMounted) {
            setStoreName(data.settings.brandName || "");
            setCurrency(data.settings.currency || "INR");
          }
        }

        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData && isMounted) {
            setStatus({
              razorpay: statusData.razorpay || {
                configured: false,
                mode: "not_configured",
                keyIdMasked: null,
              },
              database: statusData.database || {
                connected: false,
                provider: "PostgreSQL",
              },
              ai: statusData.ai || {
                configured: false,
                provider: "local",
                model: "Local Agentic Commerce Engine",
                hasApiKey: false,
              },
            });
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage("Failed to load platform settings from server.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!storeName.trim() || storeName.trim().length < 2) {
      setErrorMessage("Store brand name must be at least 2 characters long.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: storeName,
          currency,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || "Failed to save settings.");
      }

      setSuccessMessage("✓ Settings saved successfully");
      if (data?.settings) {
        setStoreName(data.settings.brandName);
        setCurrency(data.settings.currency);
      }

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3500);
    } catch (err: any) {
      setErrorMessage(err.message?.startsWith("Store brand name") ? `✕ ${err.message}` : "✕ Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Platform Configuration & API Settings</h1>
          <p className="text-xs text-slate-400">Configure payment gateways, AI models, and Agentic Commerce endpoints.</p>
        </div>
        {successMessage && (
          <Badge variant="success" className="flex items-center gap-1">
            <Check className="h-3 w-3" /> {successMessage}
          </Badge>
        )}
      </div>

      {/* Configuration Health Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Database Health */}
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-slate-300 font-medium">Database</span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
            <span
              className={`h-2 w-2 rounded-full ${
                status.database.connected ? "bg-emerald-400" : "bg-rose-500"
              }`}
            />
            <span className={status.database.connected ? "text-emerald-400" : "text-rose-400"}>
              {status.database.connected ? "Connected" : "Disconnected"}
            </span>
          </span>
        </div>

        {/* Razorpay Health */}
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-emerald-400" />
            <span className="text-xs text-slate-300 font-medium">Razorpay</span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
            <span
              className={`h-2 w-2 rounded-full ${
                status.razorpay.configured ? "bg-emerald-400" : "bg-amber-400"
              }`}
            />
            <span className={status.razorpay.configured ? "text-emerald-400" : "text-amber-400"}>
              {status.razorpay.mode === "live"
                ? "Live Mode Connected"
                : status.razorpay.mode === "test"
                ? "Test Mode Connected"
                : "Not Configured"}
            </span>
          </span>
        </div>

        {/* AI Engine Health */}
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-purple-400" />
            <span className="text-xs text-slate-300 font-medium">AI Engine</span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
            <span
              className={`h-2 w-2 rounded-full ${
                status.ai.configured ? "bg-purple-400" : "bg-blue-400"
              }`}
            />
            <span className={status.ai.configured ? "text-purple-300" : "text-slate-400"}>
              {status.ai.configured ? "Configured" : "Not Configured"}
            </span>
          </span>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 flex items-center gap-2.5">
          <XCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && !errorMessage && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300 flex items-center gap-2.5">
          <Check className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Store Profile */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Store className="h-4 w-4 text-blue-400" /> Store Profile
            </h3>
            <Badge variant="default">PostgreSQL Persistent</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Store Brand Name</label>
              <Input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Nexus Gear & Electronics"
                disabled={loading || saving}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Default Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={loading || saving}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
              >
                {SUPPORTED_CURRENCIES.map((curr) => (
                  <option key={curr} value={curr}>
                    {CURRENCY_LABELS[curr] || curr}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Razorpay Gateway Configuration */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="h-4 w-4 text-emerald-400" /> Razorpay Gateway
            </h3>
            {status.razorpay.configured ? (
              <Badge variant="success">
                {status.razorpay.mode === "live" ? "Live Mode Active" : "Test Mode Active"}
              </Badge>
            ) : (
              <Badge variant="warning">Not Configured</Badge>
            )}
          </div>

          {status.razorpay.configured ? (
            <div className="rounded-xl bg-slate-900/60 p-3.5 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                For security compliance, payment credentials and secrets are managed via server-side environment variables (<code>.env.local</code>) and are never exposed to browser bundles.
              </span>
            </div>
          ) : (
            <div className="rounded-xl bg-amber-500/10 p-3.5 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Razorpay test credentials are not configured in your local environment. Set <code>RAZORPAY_KEY_ID</code> and <code>RAZORPAY_KEY_SECRET</code> in <code>.env.local</code> to enable live Razorpay transactions. SellPilot is currently running in deterministic sandbox simulation mode.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-slate-500" /> Razorpay Key ID
              </label>
              <Input
                value={
                  status.razorpay.configured
                    ? status.razorpay.keyIdMasked || "rzp_test_••••••••"
                    : "Not Configured"
                }
                disabled
                className="font-mono text-slate-400 bg-slate-900/80 cursor-not-allowed"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-slate-500" /> Razorpay Key Secret
              </label>
              <Input
                value={status.razorpay.configured ? "••••••••••••••••" : "Not Configured"}
                disabled
                className="font-mono text-slate-400 bg-slate-900/80 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* AI Shopping Agent Model */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bot className="h-4 w-4 text-purple-400" /> AI Commerce Model Engine
            </h3>
            <Badge variant="agent">Active Server Configuration</Badge>
          </div>

          <div className="rounded-xl bg-slate-900/60 p-3.5 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
            <Info className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
            <span>
              The active AI model and tool-dispatch engine are configured server-side via <code>AI_PROVIDER</code> and API keys. The 8 bounded sandbox tools execute with strict server pricing validation.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-slate-500" /> AI Provider
              </label>
              <Input
                value={
                  status.ai.provider === "gemini"
                    ? "Google Gemini (Agentic Function Calling)"
                    : status.ai.provider === "openai"
                    ? "OpenAI (Tool Calling)"
                    : "Local Agentic Commerce Engine (Deterministic Fallback)"
                }
                disabled
                className="text-slate-300 bg-slate-900/80 cursor-not-allowed font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-slate-500" /> Model Identifier
              </label>
              <Input
                value={status.ai.model}
                disabled
                className="font-mono text-slate-400 bg-slate-900/80 cursor-not-allowed"
              />
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
          <Button
            type="submit"
            variant="agent"
            size="lg"
            disabled={loading || saving}
            className="flex items-center gap-2 min-w-[180px]"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Configuration
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
