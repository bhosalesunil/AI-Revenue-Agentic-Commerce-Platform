import { NextResponse } from "next/server";
import { AGENT_TOOLS } from "@/lib/ai/tools";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cartId = "default_cart", productId } = body;

    if (!productId) {
      return NextResponse.json({ success: false, error: "productId is required" }, { status: 400 });
    }

    const updatedCart = await AGENT_TOOLS.removeFromCart.execute({
      cartId,
      productId,
    });

    return NextResponse.json({ success: true, cart: updatedCart });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
