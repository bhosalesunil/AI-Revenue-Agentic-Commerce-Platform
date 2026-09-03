import { store } from "../data/store";
import { createRazorpayOrder } from "../razorpay";
import { MoneySecurityGuard } from "../ai/security";

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

  // 3. Persist Order in database with PENDING status
  const order = store.createOrder({
    userId,
    items: cart.items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
    totalAmount: verifiedTotal,
    razorpayOrderId: razorpayOrder.id,
    isAiAssisted: true,
    customerName,
    customerEmail,
  });

  // 4. Log creation event
  store.logAgentEvent({
    conversationId: "sys_pay",
    userId,
    eventType: "CREATE_CHECKOUT" as any,
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
  };
}
