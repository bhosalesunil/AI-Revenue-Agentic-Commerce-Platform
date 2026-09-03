import { store } from "../data/store";
import { verifyRazorpaySignature } from "../razorpay";
import { PaymentVerificationRequest, PaymentVerificationResponse } from "@/types/payment";

export async function processVerifyPayment(params: PaymentVerificationRequest): Promise<PaymentVerificationResponse> {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = params;

  // 1. Verify cryptographic HMAC-SHA256 signature
  const isValid = verifyRazorpaySignature({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
  });

  if (!isValid) {
    store.logAgentEvent({
      conversationId: "sys_pay_verify",
      eventType: "PAYMENT_VERIFICATION" as any,
      toolName: "verifyPayment",
      input: JSON.stringify({ orderId, razorpay_order_id, razorpay_payment_id }),
      output: JSON.stringify({ verified: false, error: "SIGNATURE_MISMATCH" }),
      status: "FAILED",
      justification: "Cryptographic signature validation failed. Order remains UNPAID.",
    });

    return {
      success: false,
      orderId,
      message: "Payment verification failed: Signature mismatch.",
    };
  }

  // 2. Transition Order to PAID
  const order = store.updateOrderStatus(orderId, "PAID");

  // 3. Log verified audit event
  store.logAgentEvent({
    conversationId: "sys_pay_verify",
    eventType: "PAYMENT_VERIFICATION" as any,
    toolName: "verifyPayment",
    input: JSON.stringify({ orderId, razorpay_order_id, razorpay_payment_id }),
    output: JSON.stringify({ verified: true, orderStatus: "PAID", amount: order?.totalAmount }),
    status: "SUCCESS",
    amount: order?.totalAmount,
    justification: `Cryptographic signature verified. Order ${orderId} marked PAID.`,
  });

  return {
    success: true,
    orderId,
    paymentId: razorpay_payment_id,
    message: "Payment verified successfully.",
  };
}
