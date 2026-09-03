import { PrismaClient } from "@prisma/client";
import { INITIAL_PRODUCTS } from "../lib/data/initialData";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding SellPilot Database with PostgreSQL / Prisma...");

  // 1. Create or upsert Merchant User
  const merchantUser = await prisma.user.upsert({
    where: { email: "merchant@nexusgear.in" },
    update: {},
    create: {
      id: "user_merchant_01",
      name: "Nexus Merchant Admin",
      email: "merchant@nexusgear.in",
      role: "MERCHANT",
    },
  });

  // 2. Create Merchant Store
  const merchant = await prisma.merchant.upsert({
    where: { userId: merchantUser.id },
    update: {},
    create: {
      id: "merch_nexus_01",
      userId: merchantUser.id,
      storeName: "Nexus Gear & Electronics",
      description: "Official authorized dealer of next-generation gaming, audio, and workspace technology.",
    },
  });

  // 3. Create Customer User
  const customerUser = await prisma.user.upsert({
    where: { email: "rohan@example.com" },
    update: {},
    create: {
      id: "user_cust_01",
      name: "Rohan Sharma",
      email: "rohan@example.com",
      role: "CUSTOMER",
    },
  });

  // 4. Seed Products
  console.log(`📦 Seeding ${INITIAL_PRODUCTS.length} products...`);
  for (const p of INITIAL_PRODUCTS) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        price: p.price,
        stock: p.stock,
        rating: p.rating,
        imageUrl: p.imageUrl,
        isActive: p.isActive,
      },
      create: {
        id: p.id,
        merchantId: merchant.id,
        name: p.name,
        description: p.description,
        price: p.price,
        currency: p.currency,
        category: p.category,
        stock: p.stock,
        imageUrl: p.imageUrl,
        rating: p.rating,
        isActive: p.isActive,
      },
    });
  }

  // 5. Seed an initial AI Assisted Order
  const existingOrder = await prisma.order.findUnique({
    where: { razorpayOrderId: "order_mock_10291" },
  });

  if (!existingOrder) {
    console.log("💳 Seeding sample AI-assisted verified order...");
    const order = await prisma.order.create({
      data: {
        id: "SP-10291",
        userId: customerUser.id,
        merchantId: merchant.id,
        totalAmount: 3798,
        currency: "INR",
        status: "PAID",
        razorpayOrderId: "order_mock_10291",
        isAiAssisted: true,
        isAiUpsold: true,
        items: {
          create: [
            {
              productId: "prod_gaming_headphones",
              quantity: 1,
              price: 1799,
            },
            {
              productId: "prod_smart_watch",
              quantity: 1,
              price: 1999,
            }
          ]
        },
        payment: {
          create: {
            razorpayPaymentId: "pay_test_seeded_01",
            razorpayOrderId: "order_mock_10291",
            amount: 3798,
            currency: "INR",
            status: "CAPTURED",
            method: "upi",
            signature: "sig_verified_seed_01",
          }
        }
      }
    });

    // 6. Seed Agent Audit Events
    await prisma.agentEvent.createMany({
      data: [
        {
          userId: customerUser.id,
          eventType: "SEARCH_PRODUCTS",
          toolName: "searchProducts",
          input: JSON.stringify({ query: "gaming headphones under 3000" }),
          output: JSON.stringify({ matchesFound: 1, topPick: "HyperSonic Pro" }),
          status: "SUCCESS",
          justification: "Customer requested low latency wireless audio under budget constraint.",
        },
        {
          userId: customerUser.id,
          eventType: "ADD_TO_CART",
          toolName: "addToCart",
          input: JSON.stringify({ productId: "prod_gaming_headphones", quantity: 1 }),
          output: JSON.stringify({ cartTotal: 1799 }),
          status: "SUCCESS",
          amount: 1799,
          justification: "Added to active session cart with verified database price ₹1,799.",
        },
        {
          userId: customerUser.id,
          eventType: "UPSELL_PROMPT",
          toolName: "recommendUpsell",
          input: JSON.stringify({ basedOn: "prod_gaming_headphones", suggested: "prod_smart_watch" }),
          output: JSON.stringify({ suggestedItem: "PulseFit Titan Pro", price: 1999 }),
          status: "SUCCESS",
          justification: "Customer accepted AI companion recommendation.",
        },
        {
          userId: customerUser.id,
          eventType: "CREATE_CHECKOUT",
          toolName: "createCheckout",
          input: JSON.stringify({ orderId: order.id, totalAmount: 3798 }),
          output: JSON.stringify({ razorpayOrderId: "order_mock_10291" }),
          status: "SUCCESS",
          amount: 3798,
          justification: "Server computed total: (₹1,799 + ₹1,999) = ₹3,798. Bounded money check passed.",
        },
        {
          userId: customerUser.id,
          eventType: "PAYMENT_VERIFICATION",
          toolName: "verifyPayment",
          input: JSON.stringify({ orderId: order.id, razorpayPaymentId: "pay_test_seeded_01" }),
          output: JSON.stringify({ verified: true, status: "PAID" }),
          status: "SUCCESS",
          amount: 3798,
          justification: "Razorpay cryptographic signature verified with HMAC-SHA256.",
        }
      ]
    });
  }

  console.log("✅ SellPilot Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("⚠️ Prisma seed note (PostgreSQL may be offline, store fallback active):", e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
