import { NextResponse } from "next/server";
import { store } from "@/lib/data/store";

export async function GET() {
  try {
    const orders = store.getOrders();
    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
