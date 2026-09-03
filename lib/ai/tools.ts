import { store } from "../data/store";
import { createRazorpayOrder } from "../razorpay";
import { MoneySecurityGuard } from "./security";

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required: string[];
  };
  execute: (args: any, context?: { conversationId?: string; userId?: string }) => Promise<any>;
}

export const AGENT_TOOLS: Record<string, ToolDefinition> = {
  searchProducts: {
    name: "searchProducts",
    description: "Search products in the catalog by keyword query, category, and maximum price boundary.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search keyword e.g. 'gaming headphones', 'wireless mouse', 'smart watch'" },
        category: { type: "string", description: "Product category: Audio, Gaming, Wearables, Accessories" },
        maxPrice: { type: "number", description: "Maximum price budget in INR" },
      },
      required: [],
    },
    execute: async (args, context) => {
      const results = await store.getProducts({
        query: args.query,
        category: args.category,
        maxPrice: args.maxPrice ? Number(args.maxPrice) : undefined,
      });

      store.logAgentEvent({
        conversationId: context?.conversationId,
        userId: context?.userId,
        eventType: "SEARCH_PRODUCTS" as any,
        toolName: "searchProducts",
        input: JSON.stringify(args),
        output: JSON.stringify({ count: results.length, ids: results.map(r => r.id) }),
        status: "SUCCESS",
        justification: `Found ${results.length} products matching query: "${args.query || 'any'}"`,
      });

      return results.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        currency: p.currency,
        category: p.category,
        rating: p.rating,
        stock: p.stock,
        description: p.description,
        imageUrl: p.imageUrl,
      }));
    },
  },

  getProductDetails: {
    name: "getProductDetails",
    description: "Get detailed specifications and availability for a single product.",
    parameters: {
      type: "object",
      properties: {
        productId: { type: "string", description: "The unique product ID" },
      },
      required: ["productId"],
    },
    execute: async (args, context) => {
      const product = await store.getProductById(args.productId);
      if (!product) {
        throw new Error(`Product with ID ${args.productId} not found.`);
      }

      store.logAgentEvent({
        conversationId: context?.conversationId,
        userId: context?.userId,
        eventType: "GET_PRODUCT_DETAILS" as any,
        toolName: "getProductDetails",
        input: JSON.stringify(args),
        output: JSON.stringify({ name: product.name, price: product.price, inStock: product.stock > 0 }),
        status: "SUCCESS",
        justification: `Retrieved product specifications for ${product.name}`,
      });

      return product;
    },
  },

  createCart: {
    name: "createCart",
    description: "Initialize a new shopping cart session for the customer.",
    parameters: {
      type: "object",
      properties: {
        userId: { type: "string", description: "Optional user ID" },
      },
      required: [],
    },
    execute: async (args, context) => {
      const cartId = `cart_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const cart = store.getOrCreateCart(cartId);

      store.logAgentEvent({
        conversationId: context?.conversationId,
        userId: context?.userId,
        eventType: "CREATE_CART" as any,
        toolName: "createCart",
        input: JSON.stringify(args),
        output: JSON.stringify({ cartId }),
        status: "SUCCESS",
        justification: "Created isolated shopping cart session",
      });

      return cart;
    },
  },

  addToCart: {
    name: "addToCart",
    description: "Add a product with verified pricing to the active cart.",
    parameters: {
      type: "object",
      properties: {
        cartId: { type: "string", description: "Cart session ID" },
        productId: { type: "string", description: "Product ID to add" },
        quantity: { type: "number", description: "Quantity (default 1)" },
      },
      required: ["productId"],
    },
    execute: async (args, context) => {
      const cartId = args.cartId || "default_cart";
      const quantity = Math.max(1, Number(args.quantity) || 1);
      const updatedCart = store.addToCart(cartId, args.productId, quantity);
      const addedItem = updatedCart.items.find(i => i.productId === args.productId);

      store.logAgentEvent({
        conversationId: context?.conversationId,
        userId: context?.userId,
        eventType: "ADD_TO_CART" as any,
        toolName: "addToCart",
        input: JSON.stringify({ cartId, productId: args.productId, quantity }),
        output: JSON.stringify({ cartTotal: updatedCart.total, itemsCount: updatedCart.items.length }),
        status: "SUCCESS",
        amount: addedItem ? addedItem.price * quantity : undefined,
        justification: `Added ${quantity}x ${addedItem?.product?.name || args.productId} at verified price ₹${addedItem?.price}`,
      });

      return updatedCart;
    },
  },

  removeFromCart: {
    name: "removeFromCart",
    description: "Remove an item from the cart.",
    parameters: {
      type: "object",
      properties: {
        cartId: { type: "string", description: "Cart session ID" },
        productId: { type: "string", description: "Product ID to remove" },
      },
      required: ["productId"],
    },
    execute: async (args, context) => {
      const cartId = args.cartId || "default_cart";
      const updatedCart = store.removeFromCart(cartId, args.productId);

      store.logAgentEvent({
        conversationId: context?.conversationId,
        userId: context?.userId,
        eventType: "REMOVE_FROM_CART" as any,
        toolName: "removeFromCart",
        input: JSON.stringify({ cartId, productId: args.productId }),
        output: JSON.stringify({ newTotal: updatedCart.total, remainingItems: updatedCart.items.length }),
        status: "SUCCESS",
        justification: `Removed product ${args.productId} from cart`,
      });

      return updatedCart;
    },
  },

  calculateCart: {
    name: "calculateCart",
    description: "Calculate server-verified subtotal, discounts, and final payable total.",
    parameters: {
      type: "object",
      properties: {
        cartId: { type: "string", description: "Cart session ID" },
      },
      required: [],
    },
    execute: async (args) => {
      const cartId = args.cartId || "default_cart";
      const { verifiedTotal, cart } = await MoneySecurityGuard.validateAndCalculateCart(cartId);
      return {
        cartId,
        items: cart.items,
        subtotal: verifiedTotal,
        total: verifiedTotal,
        currency: "INR",
        securityVerified: true,
      };
    },
  },

  createCheckout: {
    name: "createCheckout",
    description: "Prepare an order and create a secure Razorpay payment intent for the verified cart amount.",
    parameters: {
      type: "object",
      properties: {
        cartId: { type: "string", description: "Cart session ID" },
        customerName: { type: "string", description: "Customer name" },
        customerEmail: { type: "string", description: "Customer email" },
      },
      required: [],
    },
    execute: async (args, context) => {
      const cartId = args.cartId || "default_cart";
      const { verifiedTotal, cart } = await MoneySecurityGuard.validateAndCalculateCart(cartId);

      // Create Razorpay Order
      const receipt = `rcpt_${Date.now()}`;
      const razorpayOrder = await createRazorpayOrder({
        amount: verifiedTotal,
        currency: "INR",
        receipt,
        notes: {
          cartId,
          customerName: args.customerName || "Customer",
        }
      });

      // Save database order in PENDING status
      const dbOrder = store.createOrder({
        userId: context?.userId,
        items: cart.items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
        totalAmount: verifiedTotal,
        razorpayOrderId: razorpayOrder.id,
        isAiAssisted: true,
        customerName: args.customerName,
        customerEmail: args.customerEmail,
      });

      store.logAgentEvent({
        conversationId: context?.conversationId,
        userId: context?.userId,
        eventType: "CREATE_CHECKOUT" as any,
        toolName: "createCheckout",
        input: JSON.stringify({ cartId, customerName: args.customerName }),
        output: JSON.stringify({ orderId: dbOrder.id, razorpayOrderId: razorpayOrder.id, totalAmount: verifiedTotal }),
        status: "SUCCESS",
        amount: verifiedTotal,
        justification: `Created Razorpay checkout for Order ${dbOrder.id} with verified amount ₹${verifiedTotal}`,
      });

      return {
        orderId: dbOrder.id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount, // in paise for Razorpay frontend SDK
        amountINR: verifiedTotal,
        currency: "INR",
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_YourTestKeyIdHere",
        customerName: args.customerName || "Customer",
        customerEmail: args.customerEmail || "customer@example.com",
      };
    },
  },

  getPaymentStatus: {
    name: "getPaymentStatus",
    description: "Check the payment verification and fulfillment status of an order.",
    parameters: {
      type: "object",
      properties: {
        orderId: { type: "string", description: "The order ID e.g. SP-10292" },
      },
      required: ["orderId"],
    },
    execute: async (args, context) => {
      const order = store.getOrderById(args.orderId);
      if (!order) {
        throw new Error(`Order ${args.orderId} not found.`);
      }

      store.logAgentEvent({
        conversationId: context?.conversationId,
        userId: context?.userId,
        eventType: "PAYMENT_VERIFICATION" as any,
        toolName: "getPaymentStatus",
        input: JSON.stringify(args),
        output: JSON.stringify({ status: order.status, total: order.totalAmount }),
        status: "SUCCESS",
        amount: order.totalAmount,
        justification: `Order ${order.id} status is ${order.status}`,
      });

      return {
        orderId: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        currency: order.currency,
        razorpayOrderId: order.razorpayOrderId,
      };
    },
  },
};
