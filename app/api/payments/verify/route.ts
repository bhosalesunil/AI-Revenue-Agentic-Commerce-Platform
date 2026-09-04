import { NextResponse } from "next/server";
import { processVerifyPayment } from "@/lib/payments/verifyPayment";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Malformed JSON request body.",
          },
        },
        { status: 400 }
      );
    }

    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body || {};

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Missing required payment verification parameters (orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature).",
          },
        },
        { status: 400 }
      );
    }

    const verificationResult = await processVerifyPayment({
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!verificationResult.success) {
      return NextResponse.json(
        {
          error: {
            code: "PAYMENT_VERIFICATION_FAILED",
            message: verificationResult.message || "Payment verification failed.",
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: verificationResult.orderId,
      paymentId: verificationResult.paymentId,
      message: verificationResult.message,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      {
        error: {
          code: "PAYMENT_VERIFICATION_FAILED",
          message: error.message || "Internal server error during verification.",
        },
      },
      { status: 500 }
    );
  }
}
