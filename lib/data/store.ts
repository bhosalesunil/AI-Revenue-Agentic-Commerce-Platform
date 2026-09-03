import prisma from "../prisma";
import { INITIAL_PRODUCTS, INITIAL_MERCHANT, MockProduct } from "./initialData";
import { AgentEventLog } from "@/types/ai";
import { Order, OrderStatus } from "@/types/order";

// In-memory runtime state for fast, resilient demo operation
class DataStore {
  private products: MockProduct[] = [...INITIAL_PRODUCTS];
  private carts: Map<string, { id: string; userId?: string; items: { productId: string; quantity: number; price: number }[] }> = new Map();
  private orders: Order[] = [
    {
      id: "SP-10291",
      userId: "user_cust_01",
      merchantId: INITIAL_MERCHANT.id,
      totalAmount: 3798,
      currency: "INR",
      status: "PAID",
      razorpayOrderId: "order_mock_10291",
      isAiAssisted: true,
      isAiUpsold: true,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      items: [
        {
          id: "oi_1",
          orderId: "SP-10291",
          productId: "prod_gaming_headphones",
          quantity: 1,
          price: 1799,
          product: INITIAL_PRODUCTS[0],
        },
        {
          id: "oi_2",
          orderId: "SP-10291",
          productId: "prod_smart_watch",
          quantity: 1,
          price: 1999,
          product: INITIAL_PRODUCTS[4],
        }
      ],
      user: { name: "Rohan Sharma", email: "rohan@example.com" },
    },
    {
      id: "SP-10292",
      userId: "user_cust_02",
      merchantId: INITIAL_MERCHANT.id,
      totalAmount: 2598,
      currency: "INR",
      status: "PAID",
      razorpayOrderId: "order_mock_10292",
      isAiAssisted: true,
      isAiUpsold: true,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      items: [
        {
          id: "oi_3",
          orderId: "SP-10292",
          productId: "prod_gaming_headphones",
          quantity: 1,
          price: 1799,
          product: INITIAL_PRODUCTS[0],
        },
        {
          id: "oi_4",
          orderId: "SP-10292",
          productId: "prod_gaming_mouse",
          quantity: 1,
          price: 799,
          product: INITIAL_PRODUCTS[1],
        }
      ],
      user: { name: "Aarav Patel", email: "aarav@example.com" },
    }
  ];

  private agentEvents: AgentEventLog[] = [
    {
      id: "evt_101",
      conversationId: "conv_001",
      userId: "user_demo",
      eventType: "SEARCH_PRODUCTS",
      toolName: "searchProducts",
      input: JSON.stringify({ query: "wireless headphones under 3000", maxPrice: 3000 }),
      output: JSON.stringify({ matchesFound: 2, topPick: "HyperSonic Pro Wireless" }),
      status: "SUCCESS",
      justification: "Customer requested low latency wireless audio under budget constraint.",
      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    },
    {
      id: "evt_102",
      conversationId: "conv_001",
      userId: "user_demo",
      eventType: "RECOMMENDATION_GENERATED",
      toolName: "getProductDetails",
      input: JSON.stringify({ productId: "prod_gaming_headphones" }),
      output: JSON.stringify({ name: "HyperSonic Pro Wireless", price: 1799 }),
      status: "SUCCESS",
      justification: "Selected highest rated gaming headset meeting price boundary.",
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: "evt_103",
      conversationId: "conv_001",
      userId: "user_demo",
      eventType: "ADD_TO_CART",
      toolName: "addToCart",
      input: JSON.stringify({ productId: "prod_gaming_headphones", quantity: 1 }),
      output: JSON.stringify({ cartTotal: 1799, itemsCount: 1 }),
      status: "SUCCESS",
      amount: 1799,
      justification: "Added to active session cart with verified database price ₹1,799.",
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
    {
      id: "evt_104",
      conversationId: "conv_001",
      userId: "user_demo",
      eventType: "UPSELL_PROMPT",
      toolName: "recommendUpsell",
      input: JSON.stringify({ basedOn: "prod_gaming_headphones", suggested: "prod_gaming_mouse" }),
      output: JSON.stringify({ suggestedItem: "ViperStrike Wireless RGB Mouse", price: 799 }),
      status: "SUCCESS",
      justification: "Affinity rule: 68% of customers buying gaming headphones pair with gaming mouse.",
      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
    {
      id: "evt_105",
      conversationId: "conv_001",
      userId: "user_demo",
      eventType: "CREATE_CHECKOUT",
      toolName: "createCheckout",
      input: JSON.stringify({ cartId: "cart_active", itemsCount: 2 }),
      output: JSON.stringify({ razorpayOrderId: "order_mock_10292", calculatedTotal: 2598 }),
      status: "SUCCESS",
      amount: 2598,
      justification: "Server computed total: (₹1,799 + ₹799) = ₹2,598. Gated authorization passed.",
      createdAt: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    },
    {
      id: "evt_106",
      conversationId: "conv_001",
      userId: "user_demo",
      eventType: "PAYMENT_VERIFICATION",
      toolName: "verifyPayment",
      input: JSON.stringify({ orderId: "SP-10292", razorpayPaymentId: "pay_test_8849" }),
      output: JSON.stringify({ verified: true, status: "PAID" }),
      status: "SUCCESS",
      amount: 2598,
      justification: "Razorpay cryptographic signature verified with secret HMAC.",
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    }
  ];

  // Products
  async getProducts(params?: { category?: string; query?: string; maxPrice?: number }): Promise<MockProduct[]> {
    try {
      const dbProducts = await prisma.product.findMany({
        where: {
          isActive: true,
          ...(params?.category && params.category !== "All" ? { category: { equals: params.category, mode: "insensitive" } } : {}),
          ...(params?.query ? {
            OR: [
              { name: { contains: params.query, mode: "insensitive" } },
              { description: { contains: params.query, mode: "insensitive" } },
            ]
          } : {}),
          ...(params?.maxPrice ? { price: { lte: params.maxPrice } } : {}),
        }
      });
      if (dbProducts && dbProducts.length > 0) {
        return dbProducts.map(p => ({
          id: p.id,
          merchantId: p.merchantId,
          name: p.name,
          description: p.description,
          price: p.price,
          currency: p.currency,
          category: p.category,
          stock: p.stock,
          imageUrl: p.imageUrl || "",
          rating: p.rating,
          isActive: p.isActive,
        }));
      }
    } catch {
      // Prisma not connected, use fallback
    }

    let list = [...this.products];
    if (params?.category && params.category !== "All") {
      list = list.filter(p => p.category.toLowerCase() === params.category!.toLowerCase());
    }
    if (params?.query) {
      const q = params.query.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (params?.maxPrice) {
      list = list.filter(p => p.price <= params.maxPrice!);
    }
    return list;
  }

  async getProductById(id: string): Promise<MockProduct | null> {
    try {
      const p = await prisma.product.findUnique({ where: { id } });
      if (p) {
        return {
          id: p.id,
          merchantId: p.merchantId,
          name: p.name,
          description: p.description,
          price: p.price,
          currency: p.currency,
          category: p.category,
          stock: p.stock,
          imageUrl: p.imageUrl || "",
          rating: p.rating,
          isActive: p.isActive,
        };
      }
    } catch {}
    return this.products.find(p => p.id === id) || null;
  }

  async addProduct(product: Omit<MockProduct, "id">): Promise<MockProduct> {
    const newProd: MockProduct = {
      ...product,
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    try {
      await prisma.product.create({
        data: {
          id: newProd.id,
          merchantId: newProd.merchantId,
          name: newProd.name,
          description: newProd.description,
          price: newProd.price,
          currency: newProd.currency,
          category: newProd.category,
          stock: newProd.stock,
          imageUrl: newProd.imageUrl,
          rating: newProd.rating,
          isActive: newProd.isActive,
        }
      });
    } catch {}
    this.products.unshift(newProd);
    return newProd;
  }

  async updateProduct(id: string, updates: Partial<MockProduct>): Promise<MockProduct | null> {
    try {
      await prisma.product.update({
        where: { id },
        data: updates,
      });
    } catch {}
    const idx = this.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.products[idx] = { ...this.products[idx], ...updates };
      return this.products[idx];
    }
    return null;
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      await prisma.product.delete({ where: { id } });
    } catch {}
    this.products = this.products.filter(p => p.id !== id);
    return true;
  }

  // Cart Management
  getOrCreateCart(cartId: string = "default_cart") {
    if (!this.carts.has(cartId)) {
      this.carts.set(cartId, { id: cartId, items: [] });
    }
    return this.getCartDetails(cartId);
  }

  addToCart(cartId: string, productId: string, quantity: number = 1) {
    const cart = this.carts.get(cartId) || { id: cartId, items: [] };
    const product = this.products.find(p => p.id === productId);
    if (!product) throw new Error("Product not found");

    const existing = cart.items.find(i => i.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      // SECURITY: Price always locked from database product, never from LLM
      cart.items.push({ productId, quantity, price: product.price });
    }
    this.carts.set(cartId, cart);
    return this.getCartDetails(cartId);
  }

  removeFromCart(cartId: string, productId: string) {
    const cart = this.carts.get(cartId);
    if (cart) {
      cart.items = cart.items.filter(i => i.productId !== productId);
      this.carts.set(cartId, cart);
    }
    return this.getCartDetails(cartId);
  }

  clearCart(cartId: string) {
    this.carts.set(cartId, { id: cartId, items: [] });
  }

  getCartDetails(cartId: string) {
    const cart = this.carts.get(cartId) || { id: cartId, items: [] };
    const items = cart.items.map(item => {
      const prod = this.products.find(p => p.id === item.productId);
      return {
        id: `ci_${item.productId}`,
        cartId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        product: prod,
      };
    });

    const subtotal = items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
    const tax = Math.round(subtotal * 0.0); // No hidden tax, transparent INR pricing
    const discount = 0;
    const total = subtotal + tax - discount;

    return {
      id: cartId,
      status: "ACTIVE" as const,
      items,
      subtotal,
      tax,
      discount,
      total,
    };
  }

  // Orders
  getOrders(): Order[] {
    return this.orders;
  }

  getOrderById(id: string): Order | null {
    return this.orders.find(o => o.id === id || o.razorpayOrderId === id) || null;
  }

  createOrder(params: {
    userId?: string;
    items: { productId: string; quantity: number; price: number }[];
    totalAmount: number;
    razorpayOrderId: string;
    isAiAssisted?: boolean;
    isAiUpsold?: boolean;
    customerName?: string;
    customerEmail?: string;
  }): Order {
    const orderId = `SP-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: Order = {
      id: orderId,
      userId: params.userId || "user_guest",
      merchantId: INITIAL_MERCHANT.id,
      totalAmount: params.totalAmount,
      currency: "INR",
      status: "PENDING",
      razorpayOrderId: params.razorpayOrderId,
      isAiAssisted: params.isAiAssisted ?? true,
      isAiUpsold: params.isAiUpsold ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: params.items.map((it, idx) => ({
        id: `oi_${Date.now()}_${idx}`,
        orderId,
        productId: it.productId,
        quantity: it.quantity,
        price: it.price,
        product: this.products.find(p => p.id === it.productId),
      })),
      user: {
        name: params.customerName || "Customer",
        email: params.customerEmail || "customer@example.com",
      }
    };

    this.orders.unshift(newOrder);
    return newOrder;
  }

  updateOrderStatus(orderIdOrRazorpayId: string, status: OrderStatus): Order | null {
    const order = this.orders.find(o => o.id === orderIdOrRazorpayId || o.razorpayOrderId === orderIdOrRazorpayId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      return order;
    }
    return null;
  }

  // Agent Audit Events
  logAgentEvent(event: Omit<AgentEventLog, "id" | "createdAt">): AgentEventLog {
    const newEvent: AgentEventLog = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.agentEvents.unshift(newEvent);

    // Try logging to Prisma asynchronously
    try {
      prisma.agentEvent.create({
        data: {
          id: newEvent.id,
          conversationId: newEvent.conversationId,
          userId: newEvent.userId,
          eventType: newEvent.eventType as any,
          toolName: newEvent.toolName,
          input: newEvent.input,
          output: newEvent.output,
          status: newEvent.status,
          amount: newEvent.amount,
          justification: newEvent.justification,
        }
      }).catch(() => {});
    } catch {}

    return newEvent;
  }

  getAgentEvents(limit: number = 50): AgentEventLog[] {
    return this.agentEvents.slice(0, limit);
  }

  // Analytics Computation
  getAnalytics() {
    const paidOrders = this.orders.filter(o => o.status === "PAID");
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0) + 124500;
    const aiAssistedRevenue = paidOrders.filter(o => o.isAiAssisted).reduce((sum, o) => sum + o.totalAmount, 0) + 38420;
    const aiUpsellRevenue = paidOrders.filter(o => o.isAiUpsold).reduce((sum, o) => sum + (o.totalAmount * 0.35), 0) + 18420;
    const organicRevenue = Math.max(0, totalRevenue - aiAssistedRevenue);

    const totalOrdersCount = this.orders.length + 340;
    const completedOrdersCount = paidOrders.length + 338;
    const aov = Math.round(totalRevenue / (completedOrdersCount || 1));

    return {
      revenue: {
        total: totalRevenue,
        aiAssisted: aiAssistedRevenue,
        aiUpsell: aiUpsellRevenue,
        organic: organicRevenue,
        currency: "INR",
        growthPercent: 24.8,
      },
      orders: {
        total: totalOrdersCount,
        completed: completedOrdersCount,
        pending: this.orders.filter(o => o.status === "PENDING").length,
        cancelled: this.orders.filter(o => o.status === "CANCELLED").length,
      },
      conversionRate: {
        overall: 12.4,
        aiAssisted: 28.6,
        withoutAi: 4.2,
      },
      averageOrderValue: {
        overall: aov,
        aiAssisted: Math.round(aov * 1.34),
        standard: Math.round(aov * 0.88),
      },
      recentEvents: this.agentEvents.slice(0, 10).map(e => ({
        id: e.id,
        time: new Date(e.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        action: e.eventType.replace(/_/g, " "),
        toolName: e.toolName,
        status: e.status,
        detail: e.justification || e.input || "Executed",
      })),
      revenueChart: [
        { date: "Mon", total: 14200, aiRevenue: 4800 },
        { date: "Tue", total: 18900, aiRevenue: 6200 },
        { date: "Wed", total: 22400, aiRevenue: 8900 },
        { date: "Thu", total: 19800, aiRevenue: 7100 },
        { date: "Fri", total: 26500, aiRevenue: 11400 },
        { date: "Sat", total: 31200, aiRevenue: 14800 },
        { date: "Sun", total: 29500, aiRevenue: 13200 },
      ],
    };
  }
}

export const store = new DataStore();
