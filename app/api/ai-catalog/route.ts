import { NextResponse } from "next/server";
import { store } from "@/lib/data/store";
import { INITIAL_MERCHANT } from "@/lib/data/initialData";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || undefined;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;

  const products = await store.getProducts({ category, maxPrice });

  // Standards-compliant machine-readable Agentic Commerce JSON Schema
  const aiCatalogResponse = {
    schema_version: "agentic-commerce/v1.0",
    protocol: "SellPilot Agentic Interoperability Standard",
    merchant: {
      id: INITIAL_MERCHANT.id,
      name: INITIAL_MERCHANT.storeName,
      description: INITIAL_MERCHANT.description,
      currency: "INR",
      checkout_endpoint: "/api/payments/create",
      verification_endpoint: "/api/payments/verify",
    },
    capabilities: {
      automated_checkout_supported: true,
      realtime_inventory_check: true,
      escrow_hold_supported: false,
      instant_payment_gateway: "Razorpay",
    },
    products: products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      currency: p.currency,
      category: p.category,
      available: p.stock > 0,
      stock: p.stock,
      rating: p.rating,
      image_url: p.imageUrl,
      direct_action_payload: {
        action: "ADD_TO_CART",
        endpoint: "/api/cart/add",
        productId: p.id,
        price: p.price,
      }
    })),
    meta: {
      generated_at: new Date().toISOString(),
      count: products.length,
      rate_limit_remaining: 1000,
    }
  };

  return NextResponse.json(aiCatalogResponse, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
    }
  });
}
