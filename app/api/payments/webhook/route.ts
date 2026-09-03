import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { store } from "@/lib/data/store";

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-razorpay-signature") || "";
    const rawBody = await request.text();
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    if (webhookSecret && !verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      return NextResponse.json({ success: false, error: "Invalid webhook signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === "payment.captured" || event === "order.paid") {
      const razorpayOrderId = payload.payload?.payment?.entity?.order_id || payload.payload?.order?.entity?.id;
      if (razorpayOrderId) {
        store.updateOrderStatus(razorpayOrderId, "PAID");
        store.logAgentEvent({
          conversationId: "webhook",
          eventType: "PAYMENT_VERIFICATION" as any,
          toolName: "razorpayWebhook",
          input: JSON.stringify({ event, razorpayOrderId }),
          output: JSON.stringify({ status: "PAID" }),
          status: "SUCCESS",
          justification: `Order verified via Razorpay Webhook [${event}]`,
        });
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
