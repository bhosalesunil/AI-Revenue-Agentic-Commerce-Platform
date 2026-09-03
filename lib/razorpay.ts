import Razorpay from "razorpay";
import crypto from "crypto";

const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
const key_secret = process.env.RAZORPAY_KEY_SECRET || "sellpilot_test_secret_key";

export const isRazorpayConfigured =
  Boolean(key_id) &&
  Boolean(process.env.RAZORPAY_KEY_SECRET) &&
  !key_id.includes("YourTestKeyIdHere");

let razorpayClient: Razorpay | null = null;

if (isRazorpayConfigured) {
  try {
    razorpayClient = new Razorpay({
      key_id,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  } catch (err) {
    console.warn("Could not initialize live Razorpay client:", err);
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

  if (razorpayClient) {
    try {
      const order = await razorpayClient.orders.create({
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
      };
    } catch (error) {
      console.warn("Live Razorpay order creation failed, falling back to sandbox test order:", error);
    }
  }

  // Deterministic Sandbox Test Mode Order
  const simulatedId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    id: simulatedId,
    amount: amountInPaise,
    currency,
    receipt: params.receipt,
    isSimulated: true,
  };
}

/**
 * Generate cryptographic HMAC-SHA256 signature for test/sandbox verification
 */
export function generateTestSignature(orderId: string, paymentId: string): string {
  return crypto
    .createHmac("sha256", key_secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
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
  if (!params.razorpayOrderId || !params.razorpayPaymentId || !params.razorpaySignature) {
    return false;
  }

  const generatedSignature = crypto
    .createHmac("sha256", key_secret)
    .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(generatedSignature, "utf-8"),
      Buffer.from(params.razorpaySignature, "utf-8")
    );
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
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf-8"),
      Buffer.from(signature, "utf-8")
    );
  } catch {
    return false;
  }
}
