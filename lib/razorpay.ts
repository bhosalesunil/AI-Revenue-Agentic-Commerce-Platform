import Razorpay from "razorpay";
import crypto from "crypto";

export interface RazorpayConfigStatus {
  key_id: string;
  key_secret: string;
  configured: boolean;
  mode: "test" | "live" | "not_configured";
  keyIdMasked: string | null;
}

export function getRazorpayConfig(): RazorpayConfigStatus {
  const key_id = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "").trim();
  const key_secret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

  const configured = Boolean(key_id && key_secret);
  const mode: "test" | "live" | "not_configured" = !configured
    ? "not_configured"
    : key_id.startsWith("rzp_live")
    ? "live"
    : "test";

  const prefixLen = key_id.startsWith("rzp_test_") || key_id.startsWith("rzp_live_") ? 9 : 8;
  const keyIdMasked =
    configured && key_id.length >= prefixLen
      ? `${key_id.substring(0, prefixLen)}••••••••`
      : null;

  return {
    key_id,
    key_secret,
    configured,
    mode,
    keyIdMasked,
  };
}

export function isRazorpayConfigured(): boolean {
  return getRazorpayConfig().configured;
}

export function getRazorpayClient(): Razorpay | null {
  const config = getRazorpayConfig();
  if (!config.configured) {
    return null;
  }
  try {
    return new Razorpay({
      key_id: config.key_id,
      key_secret: config.key_secret,
    });
  } catch (err) {
    console.warn("Could not initialize Razorpay client:", err);
    return null;
  }
}

export interface RazorpayCreateOrderParams {
  amount: number; // in INR
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export async function createRazorpayOrder(params: RazorpayCreateOrderParams) {
  const amountInPaise = Math.round(params.amount * 100);
  const currency = params.currency || "INR";
  const config = getRazorpayConfig();
  const client = getRazorpayClient();

  if (client) {
    try {
      const order = await client.orders.create({
        amount: amountInPaise,
        currency,
        receipt: params.receipt,
        notes: params.notes,
      });
      return {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        isSimulated: false,
        keyId: config.key_id,
      };
    } catch (error: any) {
      console.error("Razorpay API order creation failed:", error?.error?.description || error?.message || "Authentication/API error");
      const isAuthErr =
        error?.statusCode === 401 ||
        (error?.error?.code === "BAD_REQUEST_ERROR" &&
          error?.error?.description?.toLowerCase().includes("authentication failed"));
      if (isAuthErr) {
        throw new Error(
          "Razorpay authentication failed. Verify that the Test Mode Key ID and Key Secret are a matching pair."
        );
      }
      throw new Error(
        `Razorpay order creation failed: ${error?.error?.description || error?.message || "Gateway rejection"}`
      );
    }
  }

  // If Razorpay credentials are not configured or invalid
  if (!config.configured) {
    throw new Error(
      "Razorpay credentials are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local."
    );
  }

  throw new Error("Unable to initialize Razorpay payment client.");
}

/**
 * Cryptographically verify Razorpay HMAC-SHA256 signature on the server.
 * Guarantees zero fake payments: payment status can only be updated to PAID
 * if the cryptographic digest strictly matches.
 */
export function verifyRazorpaySignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const { key_secret, configured } = getRazorpayConfig();
  if (!configured || !key_secret) {
    return false;
  }
  if (!params.razorpayOrderId || !params.razorpayPaymentId || !params.razorpaySignature) {
    return false;
  }

  const generatedSignature = crypto
    .createHmac("sha256", key_secret)
    .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
    .digest("hex");

  try {
    const expectedBuf = Buffer.from(generatedSignature, "utf-8");
    const providedBuf = Buffer.from(params.razorpaySignature, "utf-8");
    if (expectedBuf.length !== providedBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(expectedBuf, providedBuf);
  } catch {
    return false;
  }
}

export function verifyWebhookSignature(body: string, signature: string, webhookSecret: string): boolean {
  if (!webhookSecret || !signature) return false;
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");
  try {
    const expectedBuf = Buffer.from(expectedSignature, "utf-8");
    const providedBuf = Buffer.from(signature, "utf-8");
    if (expectedBuf.length !== providedBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(expectedBuf, providedBuf);
  } catch {
    return false;
  }
}
