import { NextResponse } from "next/server";
import { getUpsellForProduct } from "@/lib/ai/recommendations";
import { store } from "@/lib/data/store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (productId) {
      const upsell = await getUpsellForProduct(productId);
      return NextResponse.json({ success: true, recommendation: upsell });
    }

    // Default trending recommendations
    const all = await store.getProducts();
    return NextResponse.json({
      success: true,
      recommendations: all.slice(0, 4).map(p => ({
        product: p,
        reason: "Trending among tech enthusiasts this week",
        source: "AI_UPSELL",
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
