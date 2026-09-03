# SellPilot — Architecture & System Design

**SellPilot** is an autonomous revenue and agentic commerce platform built to unite human shoppers, AI conversational agents, autonomous AI buyers, and merchants.

```
                         ┌──────────────────────┐
                         │      Customer        │
                         │   Web / Mobile UI    │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      Next.js         │
                         │     Frontend         │
                         └──────────┬───────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
                 ▼                  ▼                  ▼
          ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
          │ AI Agent API│    │ Product API │    │  Cart API   │
          └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
                 │                  │                  │
                 ▼                  ▼                  ▼
          ┌──────────────────────────────────────────────────┐
          │              Business Logic Layer                │
          └────────────────────────┬─────────────────────────┘
                                   │
                 ┌─────────────────┼─────────────────┐
                 │                 │                 │
                 ▼                 ▼                 ▼
          ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
          │ PostgreSQL  │   │  AI / LLM   │   │  Razorpay   │
          │   + Prisma  │   │   Provider  │   │  Test APIs  │
          └─────────────┘   └─────────────┘   └─────────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │ Agent Audit Log │
                          └─────────────────┘
```

## Core Modules

1. **Frontend (Next.js 15 App Router)**
   - Marketing landing page, pricing, and architecture visualizer.
   - Customer store catalog with multi-facet filters.
   - Conversational AI shopping assistant widget and full-page chat.
   - Cart drawer and detailed checkout page.
   - Payment result pages (success & failed).
   - Merchant dashboard with revenue analytics and AI activity audit table.

2. **Next.js API Layer**
   - Products, Cart, Orders, Payments, and AI endpoints in TypeScript.
   - Machine-readable `/api/ai-catalog` compliant with Agentic Commerce standards.

3. **Controlled AI Tool Execution & Security Guard**
   - 8 bounded sandbox tools (`searchProducts`, `getProductDetails`, `createCart`, `addToCart`, `removeFromCart`, `calculateCart`, `createCheckout`, `getPaymentStatus`).
   - Prices and taxes are always server-calculated from verified database records.
   - Zero prompt-injection price exploits.

4. **Razorpay Test Integration**
   - Cryptographic HMAC-SHA256 signature verification.
   - Automated order status updates from PENDING to PAID.
