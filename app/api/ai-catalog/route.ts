import { NextResponse } from "next/server";
import { store } from "@/lib/data/store";
import { INITIAL_MERCHANT } from "@/lib/data/initialData";

export const dynamic = "force-dynamic";

interface ProductCatalogItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  available: boolean;
  stock: number;
  rating: number;
  image_url: string;
  direct_action_payload: {
    action: "ADD_TO_CART";
    endpoint: string;
    productId: string;
    currency: string;
  };
}

interface AICatalogResponse {
  schema_version: "1.0";
  protocol: string;
  merchant: {
    id: string;
    name: string;
    description: string;
  };
  currency: string;
  capabilities: {
    automated_checkout_supported: boolean;
    realtime_inventory_check: boolean;
    escrow_hold_supported: boolean;
    instant_payment_gateway: string;
    server_verified_pricing: boolean;
  };
  checkout_endpoint: string;
  verification_endpoint: string;
  products: ProductCatalogItem[];
  metadata: {
    generated_at: string;
    count: number;
    currency: string;
    environment: string;
  };
}

// Strict schema validation function to verify shape and ID integrity
function validateCatalogResponse(data: any): { valid: boolean; error?: string } {
  if (data.schema_version !== "1.0") {
    return { valid: false, error: "Invalid schema_version, expected '1.0'" };
  }
  if (!data.merchant?.id || !data.merchant?.name) {
    return { valid: false, error: "Missing required merchant attributes" };
  }
  if (!Array.isArray(data.products)) {
    return { valid: false, error: "Products must be an array" };
  }

  for (let i = 0; i < data.products.length; i++) {
    const p = data.products[i];
    if (!p.id || typeof p.id !== "string") {
      return { valid: false, error: `Product at index ${i} is missing valid id` };
    }
    if (typeof p.price !== "number" || p.price <= 0) {
      return { valid: false, error: `Product ${p.id} has invalid price: ${p.price}` };
    }
    if (!p.direct_action_payload) {
      return { valid: false, error: `Product ${p.id} is missing direct_action_payload` };
    }

    // CRITICAL INTEGRITY CHECK: direct_action_payload.productId MUST ALWAYS equal product.id
    if (p.direct_action_payload.productId !== p.id) {
      return {
        valid: false,
        error: `Integrity violation: product ${p.id} direct_action_payload references mismatching productId ${p.direct_action_payload.productId}`,
      };
    }
  }

  return { valid: true };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const maxPriceParam = searchParams.get("maxPrice");
    let maxPrice: number | undefined = undefined;

    if (maxPriceParam !== null) {
      maxPrice = Number(maxPriceParam);
      if (isNaN(maxPrice) || maxPrice < 0) {
        return NextResponse.json(
          {
            error: {
              code: "INVALID_QUERY_PARAMETER",
              message: "Query parameter 'maxPrice' must be a non-negative number.",
            },
          },
          { status: 400 }
        );
      }
    }

    const products = await store.getProducts({ category, maxPrice });

    // Standards-compliant machine-readable Agentic Commerce JSON Schema v1.0
    const catalogProducts: ProductCatalogItem[] = products.map((p) => {
      // Direct action payload strictly binds to the canonical product ID
      const canonicalId = p.id;

      return {
        id: canonicalId,
        name: p.name,
        description: p.description,
        price: p.price,
        currency: p.currency || "INR",
        category: p.category,
        available: p.stock > 0 && p.isActive,
        stock: p.stock,
        rating: p.rating,
        image_url: p.imageUrl,
        direct_action_payload: {
          action: "ADD_TO_CART",
          endpoint: "/api/cart/add",
          productId: canonicalId, // Strictly equals product.id
          currency: p.currency || "INR",
        },
      };
    });

    const aiCatalogResponse: AICatalogResponse = {
      schema_version: "1.0",
      protocol: "SellPilot Agentic Interoperability Standard",
      merchant: {
        id: INITIAL_MERCHANT.id,
        name: INITIAL_MERCHANT.storeName,
        description: INITIAL_MERCHANT.description,
      },
      currency: "INR",
      capabilities: {
        automated_checkout_supported: true,
        realtime_inventory_check: true,
        escrow_hold_supported: false,
        instant_payment_gateway: "Razorpay",
        server_verified_pricing: true,
      },
      checkout_endpoint: "/api/payments/create",
      verification_endpoint: "/api/payments/verify",
      products: catalogProducts,
      metadata: {
        generated_at: new Date().toISOString(),
        count: catalogProducts.length,
        currency: "INR",
        environment: process.env.NODE_ENV || "development",
      },
    };

    // Strict validation before returning
    const validation = validateCatalogResponse(aiCatalogResponse);
    if (!validation.valid) {
      console.error("[AICatalogError] Internal schema validation failed:", validation.error);
      return NextResponse.json(
        {
          error: {
            code: "INTERNAL_CATALOG_VALIDATION_ERROR",
            message: "Internal catalog schema validation check failed.",
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(aiCatalogResponse, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
      },
    });
  } catch (error: any) {
    console.error("[AICatalogRouteError]:", error);
    return NextResponse.json(
      {
        error: {
          code: "CATALOG_FETCH_FAILED",
          message: error.message || "Failed to retrieve machine-readable AI catalog.",
        },
      },
      { status: 500 }
    );
  }
}
