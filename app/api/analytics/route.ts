import { NextResponse } from "next/server";
import { store } from "@/lib/data/store";

export async function GET() {
  try {
    const analytics = await store.getAnalytics();
    return NextResponse.json({ success: true, analytics });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
