import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("sellpilot_session");

    if (!sessionCookie?.value) {
      return NextResponse.json({
        authenticated: false,
        user: {
          id: "user_guest",
          name: "Guest Shopper",
          email: "guest@example.com",
          role: "CUSTOMER",
        }
      });
    }

    const user = JSON.parse(sessionCookie.value);
    return NextResponse.json({ authenticated: true, user });
  } catch {
    return NextResponse.json({
      authenticated: false,
      user: {
        id: "user_guest",
        name: "Guest Shopper",
        role: "CUSTOMER",
      }
    });
  }
}
