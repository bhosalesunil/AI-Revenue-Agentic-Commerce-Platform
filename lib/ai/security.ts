import { store } from "../data/store";
import { AgentEventType } from "@prisma/client";

export class MoneyActionSecurityError extends Error {
  constructor(message: string) {
    super(`[MoneyActionSecurityViolation] ${message}`);
    this.name = "MoneyActionSecurityError";
  }
}

/**
 * Money Action Security Guard
 * Core Engineering Principle:
 * "Never trust amounts or pricing provided by an AI model.
 * Every money action must be bounded, explainable, and gated on the server."
 */
export class MoneySecurityGuard {
  /**
   * Validate and compute cart amount directly from verified server database.
   */
  static async validateAndCalculateCart(cartId: string) {
    const cart = store.getCartDetails(cartId);
    if (!cart.items || cart.items.length === 0) {
      throw new MoneyActionSecurityError("Cannot process checkout for an empty cart.");
    }

    let verifiedTotal = 0;
    for (const item of cart.items) {
      if (item.quantity <= 0 || item.quantity > 50) {
        throw new MoneyActionSecurityError(`Invalid quantity ${item.quantity} for product ${item.productId}`);
      }
      const product = await store.getProductById(item.productId);
      if (!product) {
        throw new MoneyActionSecurityError(`Product ${item.productId} no longer exists.`);
      }
      if (product.stock < item.quantity) {
        throw new MoneyActionSecurityError(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
      }

      // Security guarantee: Always use verified product price from database
      verifiedTotal += product.price * item.quantity;
    }

    // Log the security validation event
    store.logAgentEvent({
      conversationId: "sys_checkout",
      eventType: "CALCULATE_CART" as AgentEventType,
      toolName: "calculateCart",
      input: JSON.stringify({ cartId, itemsCount: cart.items.length }),
      output: JSON.stringify({ verifiedTotal, status: "BOUNDED_VERIFIED" }),
      status: "SUCCESS",
      amount: verifiedTotal,
      justification: "Verified all item prices against canonical DB records. No client or LLM price overrides permitted.",
    });

    return {
      verifiedTotal,
      cart,
    };
  }

  /**
   * Enforces that checkout creation cannot bypass verification.
   */
  static assertSafeAmount(requestedAmount: number, canonicalAmount: number) {
    if (Math.abs(requestedAmount - canonicalAmount) > 0.01) {
      throw new MoneyActionSecurityError(
        `Amount tampering detected! Requested ₹${requestedAmount} does not match verified server calculation ₹${canonicalAmount}. Transaction halted.`
      );
    }
  }
}
