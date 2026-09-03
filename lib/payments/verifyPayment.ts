import { store } from "../data/store";
import prisma from "../prisma";
import { verifyRazorpaySignature } from "../razorpay";
import { PaymentVerificationRequest, PaymentVerificationResponse } from "@/types/payment";
import { AgentEventType } from "@prisma/client";

export async function processVerifyPayment(params: PaymentVerificationRequest): Promise<PaymentVerificationResponse> {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = params;

  // 1. Fetch order from server-side store
  const existingOrder = await store.getOrderById(orderId);
  if (!existingOrder) {
    return {
      success: false,
      orderId,
      message: `Order ${orderId} not found.`,
    };
  }

  // Idempotency: If order was already verified and marked PAID, return success safely
  if (existingOrder.status === "PAID") {
    return {
      success: true,
      orderId,
      paymentId: razorpay_payment_id,
      message: "Payment already verified.",
    };
  }

  // 2. Strict server-side cryptographic HMAC-SHA256 signature verification
  const isValid = verifyRazorpaySignature({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
  });

  if (!isValid) {
    await store.logAgentEvent({
      conversationId: "sys_pay_verify",
      eventType: "PAYMENT_VERIFICATION" as AgentEventType,
      toolName: "verifyPayment",
      input: JSON.stringify({ orderId, razorpay_order_id, razorpay_payment_id }),
      output: JSON.stringify({ verified: false, error: "CRYPTOGRAPHIC_SIGNATURE_MISMATCH" }),
      status: "FAILED",
      justification: `Payment verification failed: Cryptographic HMAC signature rejected for Order ${orderId}. Order remains UNPAID.`,
    });

    return {
      success: false,
      orderId,
      message: "Payment verification failed: Cryptographic signature mismatch. Transaction rejected.",
    };
  }

  // 3. Transition Order to PAID in PostgreSQL
  const updatedOrder = await store.updateOrderStatus(orderId, "PAID");

  // 4. Create Payment Record in PostgreSQL
  try {
    await prisma.payment.create({
      data: {
        id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        orderId: existingOrder.id,
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        amount: existingOrder.totalAmount,
        currency: existingOrder.currency,
        status: "CAPTURED",
        method: "razorpay",
        signature: razorpay_signature,
      }
    });
  } catch {}

  // 5. Log verified audit event to PostgreSQL
  await store.logAgentEvent({
    conversationId: "sys_pay_verify",
    eventType: "PAYMENT_VERIFICATION" as AgentEventType,
    toolName: "verifyPayment",
    input: JSON.stringify({ orderId, razorpay_order_id, razorpay_payment_id }),
    output: JSON.stringify({ verified: true, orderStatus: "PAID", amount: updatedOrder?.totalAmount }),
    status: "SUCCESS",
    amount: updatedOrder?.totalAmount,
    justification: `Cryptographic HMAC-SHA256 signature verified. Order ${orderId} marked PAID. Inventory deducted.`,
  });

  return {
    success: true,
    orderId,
    paymentId: razorpay_payment_id,
    message: "Payment verified successfully.",
  };
}
