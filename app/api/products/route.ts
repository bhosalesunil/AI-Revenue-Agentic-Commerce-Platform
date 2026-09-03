import { NextResponse } from "next/server";
import { store } from "@/lib/data/store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const query = searchParams.get("query") || undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;

    const products = await store.getProducts({ category, query, maxPrice });
    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const product = await store.addProduct({
      merchantId: body.merchantId || "merch_nexus_01",
      name: body.name,
      description: body.description || "",
      price: Number(body.price),
      currency: "INR",
      category: body.category || "General",
      stock: Number(body.stock || 0),
      imageUrl: body.imageUrl || "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
      rating: Number(body.rating || 5.0),
      isActive: true,
    });
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
