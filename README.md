# SellPilot — AI Revenue & Agentic Commerce Platform

> **Track**: AI Growth & Agentic Commerce  
> **Core Flow**: Customer → AI Shopping Agent → Product Discovery → Recommendation → Upsell/Cross-sell → Cart → Razorpay Checkout → Payment Verification → Order → Merchant Analytics

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Test%20Mode-0c2340?style=for-the-badge&logo=razorpay)](https://razorpay.com/)

---

## 🚀 Overview

**SellPilot** is an end-to-end AI Revenue and Agentic Commerce platform designed for modern e-commerce merchants and autonomous AI buyers. It transforms online retail into an interactive, high-converting experience powered by bounded AI tool calling, server-gated money security, Razorpay test payments, and real-time merchant analytics.

---

## 🏗️ System Architecture

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

---

## 🤖 Agentic Commerce & The AI Buyer Standard (`/api/ai-catalog`)

SellPilot implements the **Agentic Commerce Protocol**: external autonomous AI buyers can discover merchant catalogs and initiate checkouts through a machine-readable JSON schema:

```bash
curl http://localhost:3000/api/ai-catalog
```

Response snippet:
```json
{
  "merchant": {
    "name": "Nexus Gear & Electronics"
  },
  "capabilities": {
    "automated_checkout_supported": true
  },
  "products": [
    {
      "id": "prod_gaming_headphones",
      "name": "HyperSonic Pro Wireless Gaming Headphones",
      "price": 1799,
      "currency": "INR",
      "available": true
    }
  ]
}
```

---

## 🛡️ Bounded Money Action Security

> *"Every money action should be explainable, bounded and gated."*

- **Zero LLM Price Tampering**: Cart subtotals, item prices, and discounts are strictly queried from verified database records.
- **HMAC Signature Verification**: Razorpay payment signatures are validated on the backend using `crypto.createHmac('sha256', secret)`.
- **Immutable Audit Logging**: Every agent search, product recommendation, cart addition, and checkout creation is timestamped in the `AgentEvent` audit log.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Glassmorphism design tokens.
- **Backend**: Next.js API Routes, TypeScript, Business Logic Layer.
- **Database & ORM**: PostgreSQL + Prisma ORM.
- **AI Layer**: Autonomous Tool Calling with 8 bounded sandbox tools (`searchProducts`, `getProductDetails`, `createCart`, `addToCart`, `removeFromCart`, `calculateCart`, `createCheckout`, `getPaymentStatus`).
- **Payment Gateway**: Razorpay Test Mode with HMAC verification and sandbox simulation fallback.

---

## 🏁 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/bhosalesunil/AI-Revenue-Agentic-Commerce-Platform.git
cd "AI-Revenue-Agentic-Commerce-Platform"
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 4. Run Development Server
```bash
npm run dev
```

Visit:
- **Customer Storefront**: `http://localhost:3000`
- **Shop Catalog**: `http://localhost:3000/shop`
- **AI Shopping Assistant**: `http://localhost:3000/chat`
- **Merchant Dashboard**: `http://localhost:3000/dashboard`
- **AI Audit Trail**: `http://localhost:3000/dashboard/ai-activity`
- **Machine-Readable Catalog**: `http://localhost:3000/api/ai-catalog`

---

## 📜 License
MIT License. Built for the AI Revenue & Agentic Commerce Platform Track.
