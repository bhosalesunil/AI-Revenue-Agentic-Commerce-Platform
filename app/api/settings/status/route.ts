import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getRazorpayConfig } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function GET() {
  // 1. Real Database Connection Check (SELECT 1)
  let dbConnected = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
  } catch {
    dbConnected = false;
  }

  // 2. Real Razorpay Server Environment Configuration
  const rzpConfig = getRazorpayConfig();
  const rawKeyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  const rawKeySecret = process.env.RAZORPAY_KEY_SECRET || "";

  const rzpDiagnostic = {
    keyIdPresent: Boolean(rawKeyId),
    secretPresent: Boolean(rawKeySecret),
    isTestKey: rawKeyId.startsWith("rzp_test_"),
    keyIdPrefix: rawKeyId.startsWith("rzp_test_") ? "rzp_test_" : rawKeyId.substring(0, 8),
  };

  // 3. Real AI Configuration Detection
  const geminiKey = process.env.GEMINI_API_KEY || "";
  const openaiKey = process.env.OPENAI_API_KEY || "";
  const aiProviderEnv = (process.env.AI_PROVIDER || "gemini").toLowerCase();

  const hasValidGemini = Boolean(
    geminiKey &&
      !geminiKey.includes("your-gemini-api-key") &&
      !geminiKey.includes("YOUR_GEMINI_API_KEY") &&
      geminiKey.trim().length > 5
  );
  const hasValidOpenAI = Boolean(
    openaiKey &&
      !openaiKey.includes("your-openai-api-key") &&
      openaiKey.trim().length > 10
  );

  let aiConfigured = false;
  let activeProvider = "local";
  let activeModel = "Local Agentic Commerce Engine (Deterministic)";
  let hasApiKey = false;

  if (aiProviderEnv === "openai" && hasValidOpenAI) {
    aiConfigured = true;
    activeProvider = "openai";
    activeModel = "gpt-4o-mini";
    hasApiKey = true;
  } else if (hasValidGemini) {
    aiConfigured = true;
    activeProvider = "gemini";
    activeModel = "gemini-1.5-flash";
    hasApiKey = true;
  } else if (hasValidOpenAI) {
    aiConfigured = true;
    activeProvider = "openai";
    activeModel = "gpt-4o-mini";
    hasApiKey = true;
  } else {
    aiConfigured = false;
    activeProvider = "local";
    activeModel = "Local Agentic Commerce Engine (Deterministic)";
    hasApiKey = false;
  }

  return NextResponse.json(
    {
      success: true,
      razorpay: {
        configured: rzpConfig.configured,
        mode: rzpConfig.mode,
        keyIdMasked: rzpConfig.keyIdMasked,
        diagnostic: rzpDiagnostic,
      },
      database: {
        connected: dbConnected,
        provider: "PostgreSQL",
      },
      ai: {
        configured: aiConfigured,
        provider: activeProvider,
        model: activeModel,
        hasApiKey,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
