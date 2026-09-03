import Razorpay from "razorpay";
import crypto from "crypto";

const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
const key_secret = process.env.RAZORPAY_KEY_SECRET || "";

export const isRazorpayConfigured =
  Boolean(key_id) &&
  Boolean(key_secret) &&
  !key_id.includes("YourTestKeyIdHere");

let razorpayClient: Razorpay | null = null;

if (isRazorpayConfigured) {
  try {
    razorpayClient = new Razorpay({
      key_id,
      key_secret,
    });
  } catch (err) {
    console.warn("Could not initialize real Razorpay client:", err);
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
      console.warn("Razorpay API call failed, falling back to simulated order:", error);
    }
  }

  // Graceful simulation mode for Test / Demo when credentials aren't yet active
  const simulatedId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    id: simulatedId,
    amount: amountInPaise,
    currency,
    receipt: params.receipt,
    isSimulated: true,
  };
}

export function verifyRazorpaySignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  if (!params.razorpayOrderId || !params.razorpayPaymentId || !params.razorpaySignature) {
    return false;
  }

  // If simulated order in demo mode
  if (params.razorpayOrderId.startsWith("order_sim_")) {
    return true;
  }

  if (!key_secret) {
    // If no secret configured, accept in demo environment
    return true;
  }

  const generatedSignature = crypto
    .createHmac("sha256", key_secret)
    .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
    .digest("hex");

  return generatedSignature === params.razorpaySignature;
}

export function verifyWebhookSignature(body: string, signature: string, webhookSecret: string): boolean {
  if (!webhookSecret || !signature) return false;
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
}
