import React from "react";
import Link from "next/link";
import { Check, Bot, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PricingPage() {
  const plans = [
    {
      name: "Starter Merchant",
      price: "₹0",
      period: "forever during sandbox",
      description: "Ideal for testing autonomous AI shopping agents and Razorpay test payments.",
      features: [
        "Up to 50 active products",
        "Autonomous AI Shopping Agent",
        "Controlled Tool Execution Guard",
        "Razorpay Test Mode integration",
        "Standard Audit Logging",
        "Community Support",
      ],
      popular: false,
      buttonText: "Get Started Free",
      buttonVariant: "outline" as const,
    },
    {
      name: "Agentic Growth",
      price: "₹2,499",
      period: "per month",
      description: "For scaling online stores looking to lift Average Order Value through AI upselling.",
      features: [
        "Unlimited products & categories",
        "Intelligent Companion Upsell Engine",
        "Machine-Readable /api/ai-catalog",
        "Live Merchant Analytics Dashboard",
        "Real-Time HMAC Webhook Receiver",
        "Custom Agent Tone & Instructions",
        "Priority Support",
      ],
      popular: true,
      buttonText: "Start 14-Day Free Trial",
      buttonVariant: "agent" as const,
    },
    {
      name: "Enterprise Agentic",
      price: "Custom",
      period: "annual billing",
      description: "Dedicated infrastructure, custom LLM fine-tuning, and multi-merchant federation.",
      features: [
        "Dedicated isolated Postgres instance",
        "Multi-agent collaborative shopping",
        "Custom ERP & Warehouse API sync",
        "Zero-latency edge tool execution",
        "Dedicated Account Engineer",
        "99.99% Uptime SLA",
      ],
      popular: false,
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="agent">Transparent Pricing</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Scale Revenue with Autonomous Agents
        </h1>
        <p className="text-base text-slate-400">
          Every plan includes our Bounded Money Guard, Razorpay integration, and explainable audit trail.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`glass-panel rounded-3xl p-8 flex flex-col justify-between relative border ${
              plan.popular ? "border-indigo-500 shadow-2xl shadow-indigo-500/20 bg-slate-900/80" : "border-slate-800"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 px-3 py-1 text-xs font-bold text-white shadow-md flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Most Popular
                </span>
              </div>
            )}

            <div>
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-xs text-slate-400 mb-6">{plan.description}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                <span className="text-xs text-slate-500">/{plan.period}</span>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-800/80">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Includes:</p>
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <Link href="/shop" className="w-full">
                <Button variant={plan.buttonVariant} className="w-full text-xs">
                  {plan.buttonText}
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
