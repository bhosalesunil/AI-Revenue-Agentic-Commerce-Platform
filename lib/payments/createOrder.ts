import { store } from "../data/store";
import { createRazorpayOrder } from "../razorpay";
import { MoneySecurityGuard } from "../ai/security";
import { AgentEventType } from "@prisma/client";

export async function processCreatePaymentOrder(params: {
  cartId: string;
  customerName?: string;
  customerEmail?: string;
  userId?: string;
}) {
  const { cartId, customerName, customerEmail, userId } = params;

  // 1. Calculate & validate server amounts
  const { verifiedTotal, cart } = await MoneySecurityGuard.validateAndCalculateCart(cartId);

  // 2. Generate Razorpay Order
  const receipt = `rcpt_${Date.now()}`;
  const razorpayOrder = await createRazorpayOrder({
    amount: verifiedTotal,
    currency: "INR",
    receipt,
    notes: {
      cartId,
      customerName: customerName || "Guest",
    },
  });

  const hasUpsellItem = cart.items.some((i: any) => i.isUpsell);

  // 3. Persist Order in database with PENDING status
  const order = await store.createOrder({
    userId,
    items: cart.items.map((i: any) => ({
      productId: i.productId,
      quantity: i.quantity,
      price: i.price,
      isUpsell: i.isUpsell,
    })),
    totalAmount: verifiedTotal,
    razorpayOrderId: razorpayOrder.id,
    isAiAssisted: true,
    isAiUpsold: hasUpsellItem,
    customerName,
    customerEmail,
  });

  // 4. Log creation event in PostgreSQL
  await store.logAgentEvent({
    conversationId: "sys_pay",
    userId,
    eventType: "CREATE_CHECKOUT" as AgentEventType,
    toolName: "createCheckout",
    input: JSON.stringify({ cartId, customerName, customerEmail }),
    output: JSON.stringify({ orderId: order.id, razorpayOrderId: razorpayOrder.id, amount: verifiedTotal }),
    status: "SUCCESS",
    amount: verifiedTotal,
    justification: `Order ${order.id} registered for checkout. Amount: ₹${verifiedTotal}`,
  });

  return {
    orderId: order.id,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount, // in paise
    amountINR: verifiedTotal,
    currency: "INR",
    isSimulated: razorpayOrder.isSimulated,
    keyId: razorpayOrder.keyId || process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  };
}
