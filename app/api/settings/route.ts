import { NextResponse } from "next/server";
import { store } from "@/lib/data/store";
import { SUPPORTED_CURRENCIES, SupportedCurrency } from "@/types/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await store.getStoreSettings();

    return NextResponse.json({
      success: true,
      settings: {
        brandName: settings.brandName,
        currency: settings.currency,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: error.message || "Failed to retrieve store settings",
        },
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Malformed JSON body",
          },
        },
        { status: 400 }
      );
    }

    const { brandName, currency } = body || {};

    // 1. Validate brandName
    if (typeof brandName !== "string") {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Store brand name is required and must be a string.",
          },
        },
        { status: 400 }
      );
    }

    const trimmedBrandName = brandName.trim();
    if (trimmedBrandName.length < 2) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Store brand name must be at least 2 characters long.",
          },
        },
        { status: 400 }
      );
    }

    if (trimmedBrandName.length > 100) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Store brand name cannot exceed 100 characters.",
          },
        },
        { status: 400 }
      );
    }

    // 2. Validate currency
    if (typeof currency !== "string") {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Currency is required and must be a string.",
          },
        },
        { status: 400 }
      );
    }

    const normalizedCurrency = currency.trim().toUpperCase() as SupportedCurrency;
    if (!SUPPORTED_CURRENCIES.includes(normalizedCurrency)) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: `Unsupported currency '${currency}'. Supported currencies are: ${SUPPORTED_CURRENCIES.join(", ")}.`,
          },
        },
        { status: 400 }
      );
    }

    // 3. Persist to PostgreSQL via Prisma store
    const updated = await store.updateStoreSettings({
      brandName: trimmedBrandName,
      currency: normalizedCurrency,
    });

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
      settings: {
        brandName: updated.brandName,
        currency: updated.currency,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: error.message || "Failed to update store settings",
        },
      },
      { status: 500 }
    );
  }
}
