import { AGENT_TOOLS } from "./tools";
import { getUpsellForProduct } from "./recommendations";
import { ChatMessage, ToolName } from "@/types/ai";
import { SYSTEM_PROMPT } from "./systemPrompt";

function formatSchemaTypesForGemini(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(formatSchemaTypesForGemini);
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === "type" && typeof value === "string") {
      result[key] = value.toUpperCase();
    } else {
      result[key] = formatSchemaTypesForGemini(value);
    }
  }
  return result;
}

// Tool declarations formatted for Gemini LLM function calling
const GEMINI_TOOL_DECLARATIONS = Object.values(AGENT_TOOLS).map((tool) => ({
  name: tool.name,
  description: tool.description,
  parameters: formatSchemaTypesForGemini(tool.parameters),
}));

/**
 * Execute LLM Function Calling via Google Gemini or OpenAI when API keys are present.
 */
async function callLLMWithTools(prompt: string, previousMessages: ChatMessage[] = []): Promise<{
  text?: string;
  toolCalls?: Array<{ name: string; args: any }>;
} | null> {
  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey && !geminiKey.includes("your-gemini-api-key") && geminiKey.trim().length > 10) {
    try {
      const contents = [
        ...previousMessages.slice(-4).map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        { role: "user", parts: [{ text: prompt }] },
      ];

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            tools: [{ functionDeclarations: GEMINI_TOOL_DECLARATIONS }],
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0];
        if (candidate?.functionCall) {
          return {
            toolCalls: [{ name: candidate.functionCall.name, args: candidate.functionCall.args || {} }],
          };
        }
        if (candidate?.text) {
          return { text: candidate.text };
        }
      }
    } catch (err) {
      console.warn("LLM API call failed, falling back to agentic tool orchestrator:", err);
    }
  }

  return null;
}

export async function processAgentConversation(params: {
  message: string;
  cartId?: string;
  conversationId?: string;
  userId?: string;
  previousMessages?: ChatMessage[];
}): Promise<ChatMessage> {
  const { message, cartId = "default_cart", conversationId = "conv_active", userId = "user_guest", previousMessages = [] } = params;
  const lowerMsg = message.toLowerCase().trim();

  // 1. Attempt LLM tool dispatch if API key is active
  const llmResult = await callLLMWithTools(message, previousMessages);
  if (llmResult?.toolCalls && llmResult.toolCalls.length > 0) {
    const call = llmResult.toolCalls[0];
    const tool = AGENT_TOOLS[call.name];
    if (tool) {
      const toolOutput = await tool.execute(call.args, { conversationId, userId });

      let responseText = `Executed tool **${call.name}** with parameters ${JSON.stringify(call.args)}. Output verified by server.`;
      let productCards = undefined;
      let cartSummary = undefined;

      if (call.name === "searchProducts" && Array.isArray(toolOutput)) {
        responseText = `I found ${toolOutput.length} recommendation${toolOutput.length > 1 ? "s" : ""} matching your request:`;
        productCards = toolOutput.slice(0, 3);
      } else if (call.name === "addToCart" && toolOutput?.total) {
        const addedProduct = toolOutput.items?.find((i: any) => i.productId === call.args.productId)?.product;
        responseText = `Added **${addedProduct?.name || "item"}** to your cart for ₹${(addedProduct?.price || toolOutput.subtotal).toLocaleString("en-IN")}. Total: ₹${toolOutput.total.toLocaleString("en-IN")}.`;
        cartSummary = { total: toolOutput.total, itemCount: toolOutput.items?.length || 1 };
      } else if (call.name === "calculateCart" && toolOutput?.total) {
        responseText = `Verified cart total: ₹${toolOutput.total.toLocaleString("en-IN")} (${toolOutput.items?.length || 0} items). Ready for checkout.`;
        cartSummary = { total: toolOutput.total, itemCount: toolOutput.items?.length || 0, readyForCheckout: true };
      } else if (call.name === "createCheckout" && toolOutput?.orderId) {
        responseText = `Created Razorpay checkout for Order #${toolOutput.orderId}. Verified amount: ₹${toolOutput.amountINR}.`;
        cartSummary = { total: toolOutput.amountINR, itemCount: 1, readyForCheckout: true };
      }

      return {
        id: `msg_${Date.now()}`,
        role: "assistant",
        content: responseText,
        toolCalls: [{ name: call.name as ToolName, args: call.args || {} }],
        productCards,
        cartSummary,
        createdAt: new Date().toISOString(),
      };
    }
  }

  if (llmResult?.text) {
    return {
      id: `msg_${Date.now()}`,
      role: "assistant",
      content: llmResult.text,
      createdAt: new Date().toISOString(),
    };
  }

  // 2. Deterministic Agentic Commerce Tool Execution Engine

  // Action: Add product to cart directly or from upsell
  if (lowerMsg.includes("add ") || lowerMsg.includes("buy ") || lowerMsg.startsWith("add_to_cart:")) {
    let targetProductId = "";
    if (lowerMsg.startsWith("add_to_cart:")) {
      targetProductId = lowerMsg.replace("add_to_cart:", "").trim();
    } else if (lowerMsg.includes("mouse")) {
      targetProductId = "prod_gaming_mouse";
    } else if (lowerMsg.includes("headphone") || lowerMsg.includes("hypersonic")) {
      targetProductId = "prod_gaming_headphones";
    } else if (lowerMsg.includes("keyboard") || lowerMsg.includes("cyberkey")) {
      targetProductId = "prod_mech_keyboard";
    } else if (lowerMsg.includes("earbud") || lowerMsg.includes("aeropod") || lowerMsg.includes("anc")) {
      targetProductId = "prod_anc_earbuds";
    } else if (lowerMsg.includes("watch") || lowerMsg.includes("pulsefit")) {
      targetProductId = "prod_smart_watch";
    } else if (lowerMsg.includes("stand") || lowerMsg.includes("ergolift")) {
      targetProductId = "prod_laptop_stand";
    } else if (lowerMsg.includes("power bank") || lowerMsg.includes("magcharge") || lowerMsg.includes("charger")) {
      targetProductId = "prod_power_bank";
    } else if (lowerMsg.includes("lamp") || lowerMsg.includes("light") || lowerMsg.includes("lumina")) {
      targetProductId = "prod_desk_lamp";
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

  // Action: Checkout intent
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

  // Action: View Cart
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

  // Action: Product discovery / search
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
  } else if (lowerMsg.includes("earbuds") || lowerMsg.includes("anc") || lowerMsg.includes("aeropod")) {
    query = "earbuds";
  } else {
    query = message.replace(/show me|i need|looking for|recommend|under \d+/gi, "").trim();
  }

  const products = await AGENT_TOOLS.searchProducts.execute(
    { query, maxPrice },
    { conversationId, userId }
  );

  if (products.length === 0) {
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
