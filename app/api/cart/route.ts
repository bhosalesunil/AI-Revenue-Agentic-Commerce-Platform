import { NextResponse } from "next/server";
import { store } from "@/lib/data/store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get("cartId") || "default_cart";
    const cart = await store.getCartDetails(cartId);
    return NextResponse.json({ success: true, cart });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get("cartId") || "default_cart";
    store.clearCart(cartId);
    return NextResponse.json({ success: true, message: "Cart cleared" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
