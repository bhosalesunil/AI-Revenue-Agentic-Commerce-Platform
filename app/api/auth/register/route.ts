import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, email, role } = await request.json();
    const userRole = role === "MERCHANT" ? "MERCHANT" : "CUSTOMER";
    const user = {
      id: `user_${Date.now().toString(36)}`,
      name: name || "Demo User",
      email: email || "user@example.com",
      role: userRole,
    };

    const response = NextResponse.json({ success: true, user });
    response.cookies.set("sellpilot_session", JSON.stringify(user), {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
