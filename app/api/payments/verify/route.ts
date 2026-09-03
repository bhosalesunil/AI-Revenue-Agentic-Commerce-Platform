import { NextResponse } from "next/server";
import { processVerifyPayment } from "@/lib/payments/verifyPayment";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Missing required payment verification parameters." },
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
      return NextResponse.json(verificationResult, { status: 400 });
    }

    return NextResponse.json(verificationResult);
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error during verification." },
      { status: 500 }
    );
  }
}
