import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, role } = await request.json();
    // Lightweight session token simulation
    const userRole = role === "MERCHANT" ? "MERCHANT" : "CUSTOMER";
    const user = {
      id: userRole === "MERCHANT" ? "user_merchant_01" : "user_cust_01",
      name: userRole === "MERCHANT" ? "Nexus Merchant" : (email?.split("@")[0] || "Shopper"),
      email: email || (userRole === "MERCHANT" ? "merchant@nexusgear.in" : "customer@example.com"),
      role: userRole,
    };

    const response = NextResponse.json({ success: true, user });
    response.cookies.set("sellpilot_session", JSON.stringify(user), {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
