import { NextResponse } from "next/server";
import { processCreatePaymentOrder } from "@/lib/payments/createOrder";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cartId = "default_cart", customerName, customerEmail, userId } = body;

    const paymentOrder = await processCreatePaymentOrder({
      cartId,
      customerName,
      customerEmail,
      userId,
    });

    return NextResponse.json({
      success: true,
      ...paymentOrder,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_YourTestKeyIdHere",
    });
  } catch (error: any) {
    console.error("Payment order creation failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create payment order" },
      { status: 400 }
    );
  }
}
