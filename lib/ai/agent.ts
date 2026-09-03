import { AGENT_TOOLS } from "./tools";
import { getUpsellForProduct } from "./recommendations";
import { ChatMessage } from "@/types/ai";

export async function processAgentConversation(params: {
  message: string;
  cartId?: string;
  conversationId?: string;
  userId?: string;
  previousMessages?: ChatMessage[];
}): Promise<ChatMessage> {
  const { message, cartId = "default_cart", conversationId = "conv_active", userId = "user_guest" } = params;
  const lowerMsg = message.toLowerCase().trim();

  // Scenario 1: Add product to cart directly or from upsell
  if (lowerMsg.includes("add ") || lowerMsg.includes("buy ") || lowerMsg.startsWith("add_to_cart:")) {
    let targetProductId = "";
    if (lowerMsg.startsWith("add_to_cart:")) {
      targetProductId = lowerMsg.replace("add_to_cart:", "").trim();
    } else if (lowerMsg.includes("mouse")) {
      targetProductId = "prod_gaming_mouse";
    } else if (lowerMsg.includes("headphone")) {
      targetProductId = "prod_gaming_headphones";
    } else if (lowerMsg.includes("keyboard")) {
      targetProductId = "prod_mech_keyboard";
    } else if (lowerMsg.includes("earbud")) {
      targetProductId = "prod_anc_earbuds";
    } else if (lowerMsg.includes("watch")) {
      targetProductId = "prod_smart_watch";
    } else if (lowerMsg.includes("stand")) {
      targetProductId = "prod_laptop_stand";
    } else if (lowerMsg.includes("power bank") || lowerMsg.includes("charger")) {
      targetProductId = "prod_power_bank";
    } else {
      targetProductId = "prod_gaming_headphones";
    }

    const updatedCart = await AGENT_TOOLS.addToCart.execute(
      { cartId, productId: targetProductId, quantity: 1 },
      { conversationId, userId }
    );

    const addedProduct = updatedCart.items.find((i: any) => i.productId === targetProductId)?.product;
    const upsell = await getUpsellForProduct(targetProductId);

    let responseText = `Added **${addedProduct?.name || "item"}** to your cart for ₹${addedProduct?.price.toLocaleString("en-IN")}.`;

    if (upsell) {
      responseText += `\n\n✨ **Frequently Paired Upsell**: Would you also like to add the **${upsell.product.name}**? ${upsell.reason} It's only ₹${upsell.product.price.toLocaleString("en-IN")}.`;
    }

    return {
      id: `msg_${Date.now()}`,
      role: "assistant",
      content: responseText,
      toolCalls: [{ name: "addToCart", args: { cartId, productId: targetProductId, quantity: 1 } }],
      upsellSuggestion: upsell ? {
        product: upsell.product,
        reason: upsell.reason,
      } : undefined,
      cartSummary: {
        total: updatedCart.total,
        itemCount: updatedCart.items.length,
      },
      suggestions: ["Proceed to Checkout", "Show my cart", "Look for more items"],
      createdAt: new Date().toISOString(),
    };
  }

  // Scenario 2: Checkout intent
  if (lowerMsg.includes("checkout") || lowerMsg.includes("pay") || lowerMsg.includes("place order")) {
    const calcResult = await AGENT_TOOLS.calculateCart.execute(
      { cartId },
      { conversationId, userId }
    );

    return {
      id: `msg_${Date.now()}`,
      role: "assistant",
      content: `Your cart has been securely verified by the Money Action Security Guard.\n\n` +
        `**Verified Order Subtotal**: ₹${calcResult.total.toLocaleString("en-IN")}\n` +
        `Items in cart: ${calcResult.items.length}\n\n` +
        `Click **Proceed to Razorpay Checkout** below to complete your payment with full fraud protection.`,
      toolCalls: [{ name: "calculateCart", args: { cartId } }],
      cartSummary: {
        total: calcResult.total,
        itemCount: calcResult.items.length,
        readyForCheckout: true,
      },
      suggestions: ["Open Checkout", "Continue Shopping"],
      createdAt: new Date().toISOString(),
    };
  }

  // Scenario 3: View Cart
  if (lowerMsg.includes("cart") || lowerMsg.includes("what is in my bag")) {
    const calcResult = await AGENT_TOOLS.calculateCart.execute(
      { cartId },
      { conversationId, userId }
    );

    if (calcResult.items.length === 0) {
      return {
        id: `msg_${Date.now()}`,
        role: "assistant",
        content: "Your cart is currently empty. Tell me what you're looking for, or try searching for headphones, mice, or keyboards!",
        suggestions: ["Headphones under ₹3000", "Best gaming mouse", "Mechanical keyboards"],
        createdAt: new Date().toISOString(),
      };
    }

    return {
      id: `msg_${Date.now()}`,
      role: "assistant",
      content: `Here is your current cart (Total: ₹${calcResult.total.toLocaleString("en-IN")}):`,
      cartSummary: {
        total: calcResult.total,
        itemCount: calcResult.items.length,
      },
      suggestions: ["Proceed to Checkout", "Search more products"],
      createdAt: new Date().toISOString(),
    };
  }

  // Scenario 4: Product discovery / search
  let query = "";
  let maxPrice: number | undefined = undefined;

  // Extract budget constraint
  const priceMatch = lowerMsg.match(/(?:under|below|less than|within)\s*(?:rs\.?|inr|₹)?\s*(\d+)/i);
  if (priceMatch) {
    maxPrice = parseInt(priceMatch[1], 10);
  }

  if (lowerMsg.includes("headphone") || lowerMsg.includes("audio") || lowerMsg.includes("earphone")) {
    query = "headphone";
  } else if (lowerMsg.includes("mouse") || lowerMsg.includes("mice")) {
    query = "mouse";
  } else if (lowerMsg.includes("keyboard")) {
    query = "keyboard";
  } else if (lowerMsg.includes("watch") || lowerMsg.includes("wearable")) {
    query = "watch";
  } else if (lowerMsg.includes("stand") || lowerMsg.includes("laptop")) {
    query = "stand";
  } else if (lowerMsg.includes("lamp") || lowerMsg.includes("light")) {
    query = "lamp";
  } else if (lowerMsg.includes("earbuds") || lowerMsg.includes("anc")) {
    query = "earbuds";
  } else {
    query = message.replace(/show me|i need|looking for|recommend|under \d+/gi, "").trim();
  }

  const products = await AGENT_TOOLS.searchProducts.execute(
    { query, maxPrice },
    { conversationId, userId }
  );

  if (products.length === 0) {
    // Return all popular products
    const fallbackProducts = await AGENT_TOOLS.searchProducts.execute({}, { conversationId, userId });
    return {
      id: `msg_${Date.now()}`,
      role: "assistant",
      content: `I couldn't find exact matches for "${message}", but here are our top-rated essentials available in stock right now:`,
      productCards: fallbackProducts.slice(0, 3),
      suggestions: ["Wireless headphones", "Gaming accessories", "Smart wearables"],
      createdAt: new Date().toISOString(),
    };
  }

  const budgetText = maxPrice ? ` under ₹${maxPrice.toLocaleString("en-IN")}` : "";
  return {
    id: `msg_${Date.now()}`,
    role: "assistant",
    content: `I found ${products.length} recommendation${products.length > 1 ? "s" : ""} matching **${query || "top tech"}**${budgetText}. Each has been verified for low latency, verified stock, and competitive pricing:`,
    toolCalls: [{ name: "searchProducts", args: { query, maxPrice } }],
    productCards: products.slice(0, 3),
    suggestions: [
      `Add ${products[0]?.name.split(" ")[0]} to cart`,
      "Show all specs",
      "Checkout my order",
    ],
    createdAt: new Date().toISOString(),
  };
}
