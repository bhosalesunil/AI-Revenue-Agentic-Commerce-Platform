import { NextResponse } from "next/server";
import { processCreatePaymentOrder } from "@/lib/payments/createOrder";

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

    const { cartId = "default_cart", customerName, customerEmail, userId } = body || {};

    const paymentOrder = await processCreatePaymentOrder({
      cartId,
      customerName,
      customerEmail,
      userId,
    });

    return NextResponse.json({
      success: true,
      orderId: paymentOrder.orderId,
      razorpayOrderId: paymentOrder.razorpayOrderId,
      amount: paymentOrder.amount,
      amountINR: paymentOrder.amountINR,
      currency: paymentOrder.currency,
      keyId: paymentOrder.keyId,
    });
  } catch (error: any) {
    console.error("Payment order creation failed:", error.message || "Failed to create payment order.");
    return NextResponse.json(
      {
        error: {
          code: "PAYMENT_CREATION_FAILED",
          message: error.message || "Failed to create payment order.",
        },
      },
      { status: 400 }
    );
  }
}
